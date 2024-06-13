const Controller = require("./Controller");
const MatchModel = require("../models/MatchModel");
const config = require('../config/playf3')
const randomPosition = require('../utils/randomPosition');
const userController = require('./UserController');
const {defaultConfiguration} = require("express/lib/application");
const calculateElo = require('../utils/eloCalculation');
module.exports = class MatchController extends Controller {

    #matchModel
    #userController

    constructor(isTest = false) {
        super();
        this.#matchModel = new MatchModel(isTest);
        this.#userController = new userController(isTest);
    }

    /**
     *
     * @param {number} imbalance
     * @param {boolean} playWhite
     * Create a single player match
     *
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     */
    async insertTrainingMatch(imbalance, playWhite) {
        let output = this.getDefaultOutput();
        if(isNaN(imbalance)){
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'Error parsing imbalance';
            return output;
        }

        output = await this.insertGenericMatch(config._MATCH_TYPE_TRAINING);
        if (output.code !== 200)
            return output;

        output.content.start_situation = randomPosition(imbalance, playWhite);

        return output;
    }

    /**
     *
     * @param {number} imbalance
     * @param {boolean} playWhite
     * @param {number} userId
     * Create a single player match
     *
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     */
    async insertSinglePlayerMatch(imbalance, playWhite, userId) {
        let output = this.getDefaultOutput();
        if (playWhite === null) {
            output.code = 400;
            output.msg = 'Invalid color';
            output.sub_code = 1;
            return output;
        }

        output = this.getDefaultOutput();
        if(isNaN(imbalance)){
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'Error parsing imbalance';
            return output;
        }

        output = await this.insertGenericMatch(config._MATCH_TYPE_SINGLE);
        if (output.code !== 200)
            return output;

        output.content.start_situation = randomPosition(imbalance, playWhite);

        if (userId < 0)
            //We don't need to track the player into match. Exiting
            return output;
        //If we are here we MUST track the player into database, because they are authenticated -

        let matchID = this.decrypt(output.content.match_shadow);
        matchID = parseInt(matchID);

        let insertResult;
        if (playWhite) {
            insertResult = await this.#matchModel.trackPlayingGame(matchID, userId, 0);
        } else {
            insertResult = await this.#matchModel.trackPlayingGame(matchID, 0, userId);
        }

        if (!insertResult) {
            output.code = 500;
            output.msg = 'Internal server error';
            output.sub_code = 2;
            return output;
        }

        return output;
    }

    /**
     *
     * @param {number} userID
     * @param {boolean} acceptAny
     * Create a multi player match
     *
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     */
    async insertMultiPlayerMatch(userID, acceptAny = false) {
        let output = await this.insertGenericMatch(config._MATCH_TYPE_MULTI);
        if (output.code !== 200)
            return output;

        let matchID = parseInt(this.decrypt(output.content.match_shadow));
        let insertResult = await this.#matchModel.trackPlayingGame(matchID, userID, 0);

        if(acceptAny)
            await this.#matchModel.insertRandomMultiplayer(output.content.match_shadow);

        if (insertResult === false) {
            output['code'] = 500;
            output['msg'] = 'Internal server error.';
            return output;
        }

        return output;
    }

    /**
     * @return {Promise<string>}
     */
    async getMultiPlayerRandomMatch(){
        //MMM no controls to do here... Only get the match shadow and delete from database.
        let output = this.getDefaultOutput();

        let match_shadow = await this.#matchModel.getRandomMultiplayer();
        if(match_shadow === ''){
            output['code'] = 404;
            output['msg'] = 'Not found';
            return output;
        }
        output.content.match_shadow = match_shadow;
        return output;
    }

    /**
     * Create a daily match
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     */

    async insertDailyMatch() {
        let result = await this.insertGenericMatch(config._MATCH_TYPE_DAILY);
        if (result.code !== 200) {
            return result;
        }

        return result;
    }

    /**
     * Creates a weekly match
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     */

    async insertWeeklyMatch() {
        let result = await this.insertGenericMatch(config._MATCH_TYPE_WEEKLY);
        if (result.code !== 200) {
            return result;
        }
        return result;
    }


    /**
     * Create a match of the requested type
     * @param {string} type
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     */
    async insertGenericMatch(type) {
        let output = this.getDefaultOutput();
        let insertResult = await this.#matchModel.insertMatch(type);
        if (insertResult === 0) {
            output['code'] = 500;
            output['sub_code'] = 1;
            output['msg'] = 'Error occurred when model tried to insert new match';
            return output;
        }
        let result = this.encrypt(insertResult.toString());
        if (result === '') {
            output['code'] = 500;
            output['sub_code'] = 2;
            output['msg'] = 'Error occurred when model tried to insert new match';
            return output;
        }
        output.content.match_shadow = result;
        output.content.match_id = insertResult;
        return output;
    }

    /**
     * @param {Number} userID
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Returns the situation of the day and creates a match
     */
    async createDailyMatchAttempt(userID) {
        let output = this.getDefaultOutput();
        let day = this.getCurrentDay();
        let dailySituation = await this.#matchModel.checkDailyMatch(day);

        let userCheck = await this.#userController.checkUserID(userID);
        if (userCheck.code !== 200) {
            output['code'] = 500;
            output['sub_code'] = 1;
            output['msg'] = 'User not found';
            return output;
        }

        let attempts = await this.#matchModel.getDailyAttempts(userID, day);
        if (attempts >= config._DAILY_ATTEMPTS_MAX) {
            output['code'] = 400;
            output['sub_code'] = 2;
            output['msg'] = 'User has reached max attempts';
            return output;
        }

        if (dailySituation.trim() === '') {
            let randomDiff = this.randomInteger(0, 5);
            dailySituation = randomPosition(randomDiff, true);
            let saveResult = await this.#matchModel.saveDailySituation(day, dailySituation);
            if (!saveResult) {
                output['code'] = 500;
                output['sub_code'] = 2;
                output['msg'] = 'Internal server error';
                return output;
            }
        }

        let insertResult = await this.insertDailyMatch();
        if (insertResult.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 3;
            output['msg'] = 'Error while inserting the match';
            return output;
        }

        let matchID = this.decrypt(insertResult.content.match_shadow);
        let insertDaily = await this.insertDailyResult(userID, parseInt(matchID), day);
        if (insertDaily.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 4;
            output['msg'] = 'Error while inserting the result';
            return output;
        }

        output.content.match_shadow = insertResult.content.match_shadow;
        output.content.start_situation = dailySituation;
        output.content.match_id = matchID;
        return output;
    }

    /**
     * @param {Number} userID
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Returns the situation of the week and creates a match
     */
    async createWeeklyMatchAttempt(userID) {
        let output = this.getDefaultOutput();
        let day = this.getStartOfWeek();

        let weeklySituation = await this.#matchModel.checkWeeklyMatch(day);

        let userCheck = await this.#userController.checkUserID(userID);
        if (userCheck.code !== 200) {
            output['code'] = 500;
            output['sub_code'] = 1;
            output['msg'] = 'User not found';
            return output;
        }

        let attempts = await this.#matchModel.getWeeklyAttempts(userID, day);
        if (attempts >= config._WEEKLY_ATTEMPTS_MAX) {
            output['code'] = 400;
            output['sub_code'] = 2;
            output['msg'] = 'User has reached max attempts';
            return output;
        }

        if (weeklySituation.trim() === '') {
            let randomDiff = this.randomInteger(0, 5);
            weeklySituation = randomPosition(randomDiff, true);
            let saveResult = await this.#matchModel.saveWeeklySituation(day, weeklySituation);
            if (!saveResult) {
                output['code'] = 500;
                output['sub_code'] = 3;
                output['msg'] = 'Internal server error';
                return output;
            }
        }

        let insertResult = await this.insertWeeklyMatch();
        if (insertResult.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 4;
            output['msg'] = 'Error while inserting the match';
            return output;
        }

        let matchID = this.decrypt(insertResult.content.match_shadow);
        let insertWeekly = await this.insertWeeklyResult(userID, parseInt(matchID), day);
        if (insertWeekly.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 5;
            output['msg'] = 'Error while inserting the result';
            return output;
        }

        output.content.match_shadow = insertResult.content.match_shadow;
        output.content.start_situation = weeklySituation;
        output.content.match_id = matchID;
        return output;
    }


    /**
     * @param {String|null} day
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Returns the situation of the day
     * By @romanellas copied from AleT
     */
    async getDailyMatch(day = null) {
        let output = this.getDefaultOutput();
        if (!day)
            day = this.getCurrentDay();

        let dailySituation = await this.#matchModel.checkDailyMatch(day);

        if (dailySituation.trim() === '') {
            let randomDiff = this.randomInteger(15, 30);
            dailySituation = randomPosition(randomDiff, true);
            let saveResult = await this.#matchModel.saveDailySituation(day, dailySituation);
            if (!saveResult) {
                output['code'] = 500;
                output['sub_code'] = 2;
                output['msg'] = 'Internal server error';
                return output;
            }
        }

        output.content.start_situation = dailySituation;
        return output;
    }


    /**
     * @param {String | null} day
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Returns the situation of the week
     */
    async getWeeklyMatch(day = null) {
        let output = this.getDefaultOutput();

        if (!day)
            day = this.getStartOfWeek();

        let weeklySituation = await this.#matchModel.checkWeeklyMatch(day);

        if (weeklySituation.trim() === '') {
            let randomDiff = this.randomInteger(40, 55);
            weeklySituation = randomPosition(randomDiff, true);
            let saveResult = await this.#matchModel.saveWeeklySituation(day, weeklySituation);
            if (!saveResult) {
                output['code'] = 500;
                output['sub_code'] = 2;
                output['msg'] = 'Internal server error';
                return output;
            }
        }

        output.content.start_situation = weeklySituation;
        return output;
    }


    /**
     * @param {Number} userID
     * @param {Number} matchID
     * @param {String} day
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Insert new result in daily result table
     */
    async insertDailyResult(userID, matchID, day) {
        let output = this.getDefaultOutput();
        let match = await this.checkMatchID(matchID);
        if (match.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'Error while finding the match';
            return output;
        }

        let checkInsertResults = await this.#matchModel.insertDailyResult(userID, matchID, day);
        if (!checkInsertResults) {
            output['code'] = 400;
            output['sub_code'] = 2;
            output['msg'] = 'Internal Server Error';
            return output;
        }

        return output;
    }


    /**
     * @param {Number} userID
     * @param {Number} matchID
     * @param {String} day
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Insert new result in weekly result table
     */
    async insertWeeklyResult(userID, matchID, day) {
        let output = this.getDefaultOutput();
        let match = await this.checkMatchID(matchID);
        if (match.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'Error while finding the match';
            return output;
        }

        let checkInsertResults = await this.#matchModel.insertWeeklyResult(userID, matchID, day);
        if (!checkInsertResults) {
            output['code'] = 400;
            output['sub_code'] = 2;
            output['msg'] = 'Internal Server Error';
            return output;
        }

        return output;
    }


    /**
     * @param day {string}
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Returns the leaderboard of a day, if the daily situation exists, code is not 200 in case of errors
     */

    async getDailyLeaderboard(day) {
        let output = this.getDefaultOutput();
        await this.getDailyMatch(day);
        let checkResult = await this.#matchModel.checkDailyMatch(day.trim());
        if (checkResult.trim() === '') {
            output['code'] = 500;
            output['sub_code'] = 1;
            output['msg'] = 'Daily situation does not exists';
            return output;
        }

        let getResult = await this.#matchModel.getDailyLeaderboard(day.trim());
        if (getResult === 0) {
            output['code'] = 500;
            output['sub_code'] = 2;
            output['msg'] = 'Internal Server Error';
            return output;
        }

        output.content.leaderboard = getResult;
        return output;
    }


    /**
     * @param day {string}
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Returns the leaderboard of a week challenge given a day, if the weekly situation exists, code is not 200 in case of errors
     */
    async getWeeklyLeaderboard(day) {
        let output = this.getDefaultOutput();
        day = this.getStartOfWeek(day.trim());
        if (!day){
            output['code'] = 404;
            output['sub_code'] = 1;
            output['msg'] = 'Day not valid';
            return output;
        }
        await this.getWeeklyMatch(day.trim());
        let checkResult = await this.#matchModel.checkWeeklyMatch(day.trim());
        if (checkResult.trim() === '') {
            output['code'] = 500;
            output['sub_code'] = 1;
            output['msg'] = 'Daily situation does not exists';
            return output;
        }

        let getResult = await this.#matchModel.getWeeklyLeaderboard(day.trim());
        if (getResult === 0) {
            output['code'] = 500;
            output['sub_code'] = 2;
            output['msg'] = 'Internal Server Error';
            return output;
        }

        output.content.leaderboard = getResult;
        return output;
    }


    /**
     * @param diff {number}
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     */
    async returnFen(diff = 0) {
        if (isNaN(diff))
            diff = 0;
        let output = this.getDefaultOutput();
        output.content.situation = randomPosition(diff, true);
        return output;
    }


    /**
     * @param {number} matchID
     * @param {number} newStatus
     * @param {String} pgn
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Updates the match status. Code is not 200 in case of errors. Only codes in the config file are allowed
     */
    async updateMatchStatus(matchID, newStatus, pgn = null) {
        let output = this.getDefaultOutput();
        if (newStatus !== config._MATCH_STATUS_NOT_STARTED && newStatus !== config._MATCH_STATUS_PLAYING && newStatus !== config._MATCH_STATUS_ENDED && newStatus !== config._MATCH_STATUS_PAUSED) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'Invalid match status';
            return output;
        }
        let checkResult = await this.checkMatchID(matchID);

        if (checkResult.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 2;
            output['msg'] = 'Match does not exists';
            return output;
        }

        if (newStatus === config._MATCH_STATUS_ENDED) {
            let checkOutput = await this.#matchModel.getMatchStatus(matchID);

            if (checkOutput === null) {
                output['code'] = 500;
                output['sub_code'] = 3;
                output['msg'] = 'Error while getting match status';
                return output;
            }
            if (checkOutput === config._MATCH_STATUS_PAUSED)
                return output;
        }


        checkResult = await this.#matchModel.modifyStatus(matchID, newStatus, pgn);

        if (!checkResult) {
            output['code'] = 400;
            output['sub_code'] = 4;
            output['msg'] = 'Error occurred while updating the match status';
            return output;
        }

        return output;

    }

    /**
     * @param {number} matchID
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Check if the match ID exists. Code is not 200 in case of errors.
     */
    async checkMatchID(matchID) {
        let output = this.getDefaultOutput();
        if (isNaN(matchID)) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'Invalid match id';
            return output;
        }

        let checkResult = await this.#matchModel.checkMatchId(matchID);

        if (!checkResult) {
            output['code'] = 400;
            output['sub_code'] = 2;
            output['msg'] = 'Match does not exists';
            return output;
        }
        return output;
    }


    /**
     * @param {number} matchId
     * @param {string} situation
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Add move to an ongoing match. Code is not 200 in case of errors.
     */
    async addMove(matchId, situation) {
        let output = this.getDefaultOutput();

        let matchOut = await this.checkMatchID(matchId)
        if (matchOut.code !== 200) {
            output['code'] = 404;
            output['msg'] = 'invalid match';
            return output;
        }


        let move_no = await this.#matchModel.getMoveNo(matchId);
        let result = await this.#matchModel.registerMove(matchId, move_no, situation);
        if (result === false) {
            output['code'] = 500;
            output['msg'] = 'Internal server error';
            return output;
        }

        return output;
    }


    /**
     * @param {number} matchId
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Return moves done in a match if it exists. Code is not 200 in case of errors
     */
    async getSingleMatch(matchId) {
        let output = this.getDefaultOutput();

        let checkResult = await this.checkMatchID(matchId);
        if (checkResult.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'Match does not exists';
            return output;
        }
        let result = await this.#matchModel.getMatchMoves(matchId);
        if (result === null) {
            output['code'] = 500;
            output['sub_code'] = 2;
            output['msg'] = 'Internal server error';
            return output;
        }
        output.content = result.getDocument();
        return output;
    }

    /**
     * @param match {MatchDto}
     * @param hasWhiteWon {boolean}
     * @param draw {boolean}
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Update the database tracking who won in the match, code is not 200 in case of errors
     */
    async updateWonStatus(match, hasWhiteWon, draw = false) {
        let output = this.getDefaultOutput();
        let result = true;
        let whiteWon = hasWhiteWon;

        if (match.status !== config._MATCH_STATUS_ENDED)
            return output;

        if (draw === false) {
            if (whiteWon) {
                result = await this.#matchModel.markWhiteAsWon(match.id);
                if (match.type === config._MATCH_TYPE_SINGLE) {
                    let whiteID = await this.#matchModel.getPlayerInGame(match.id, true);
                    if (whiteID === null) {
                        output['code'] = 500;
                        output['sub_code'] = 1;
                        output['msg'] = 'Internal server error';
                        return output;
                    }

                    let getEloResult = await this.#matchModel.getPlayerRank(whiteID);
                    if (getEloResult === -1) {
                        output['code'] = 500;
                        output['sub_code'] = 2;
                        output['msg'] = 'Internal server error';
                        return output;
                    }
                    if (getEloResult === null)
                        getEloResult = 0;
                    let elo_amount = getEloResult < 0 ? -(getEloResult) + config._MATCH_ELO_GAINS : config._MATCH_ELO_GAINS;
                    await this.#matchModel.updateElo(match.id, true, parseInt(elo_amount));
                }
            } else {
                result = await this.#matchModel.markBlackAsWon(match.id);
                if (match.type === config._MATCH_TYPE_SINGLE)
                    await this.#matchModel.updateElo(match.id, false, parseInt(config._MATCH_ELO_GAINS));
            }
        } else
            result = await this.#matchModel.markDraw(match.id);


        if (match.type === config._MATCH_TYPE_MULTI) {
            let whiteID = await this.#matchModel.getPlayerInGame(match.id, true);
            if (whiteID === null) {
                output['code'] = 500;
                output['sub_code'] = 1;
                output['msg'] = 'Internal server error';
                return output;
            }

            let whiteRating = await this.#userController.getUserByID(whiteID);
            if (whiteRating.code !== 200) {
                output['code'] = 500;
                output['sub_code'] = 4;
                output['msg'] = 'Internal server error';
                return output;
            }

            let blackID = await this.#matchModel.getPlayerInGame(match.id, false);
            if (blackID === null) {
                output['code'] = 500;
                output['sub_code'] = 3;
                output['msg'] = 'Internal server error';
                return output;
            }

            let blackRating = await this.#userController.getUserByID(blackID);
            if (blackRating.code !== 200) {
                output['code'] = 500;
                output['sub_code'] = 4;
                output['msg'] = 'Internal server error';
                return output;
            }

            whiteRating = whiteRating.content.rating;
            blackRating = blackRating.content.rating;
            let newRatings = calculateElo(whiteRating, blackRating, whiteWon);
            await this.#userController.updateRating(whiteID, newRatings.whiteRating);
            await this.#userController.updateRating(blackID, newRatings.blackRating);
        }

        if (result === false) {
            output['code'] = 500;
            output['sub_code'] = 3;
            output['msg'] = 'Internal server error';
            return output;
        }
        return output;
    }


    /**
     * @param randomDiff
     * @return {string}
     */
    getRandomPosition(randomDiff = 0) {
        return randomPosition(randomDiff, true);
    }

    /**
     * @param {string} match_shadow
     * @param {number} playerId
     * @return {Promise<boolean>}
     */
    async connectPlayerToMatch(match_shadow, playerId) {
        //No controls to do here.
        let matchId = parseInt(this.decrypt(match_shadow));
        this.#matchModel.connectPlayerToMatch(matchId, playerId, false);
    }


    /**
     * @param {String} matchType
     * @param {Number} userID
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Check if there is a paused game of the given type, code is not 200 in case of errors
     */
    async checkForPausedGame(matchType, userID) {
        let output = this.getDefaultOutput();

        if (matchType !== config._MATCH_TYPE_SINGLE && matchType !== config._MATCH_TYPE_DAILY && matchType !== config._MATCH_TYPE_WEEKLY) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'Wrong match type';
            return output;
        }

        let checkUser = await this.#userController.checkUserID(userID);
        if (checkUser.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 2;
            output['msg'] = 'Player not found';
            return output;
        }

        let getResult;
        let day;
        switch (matchType) {
            case config._MATCH_TYPE_DAILY:
                day = this.getCurrentDay();
                getResult = await this.#matchModel.getDailyPausedGame(userID, day);
                break;
            case config._MATCH_TYPE_WEEKLY:
                day = this.getStartOfWeek();
                getResult = await this.#matchModel.getWeeklyPausedGame(userID, day);
                break;
            case config._MATCH_TYPE_SINGLE:
                getResult = await this.#matchModel.getSinglePausedGame(userID);
                break;
        }

        if (!getResult) {
            output['code'] = 404;
            output['sub_code'] = 3;
            output['msg'] = 'Paused match not found';
            return output;
        }

        output.content.match_shadow = this.encrypt(getResult.matchID.toString());
        output.content.start_situation = getResult.situation;
        output.content.pgn = getResult.pgn;

        return output;
    }


    /**
     * @param {Number} userID
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Given a userID it returns his elo, if it's below 0 it returns 0, code is not 200 in case of errors
     */

    async getPlayerRank(userID) {
        let output = this.getDefaultOutput();
        let checkResult = await this.#userController.checkUserID(userID);
        if (checkResult.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'Invalid User ID';
            return output;
        }

        let getEloResult = await this.#matchModel.getPlayerRank(userID)
        if (getEloResult === -1) {
            output['code'] = 500;
            output['sub_code'] = 2;
            output['msg'] = 'Internal server error';
            return output;
        }

        output.content.elo = getEloResult < 0 || getEloResult === null ? 0 : getEloResult;
        return output;
    }


    /**
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     */
    async getRankedLeaderboard() {
        let output = this.getDefaultOutput();

        let getResult = await this.#matchModel.getRankedLeaderboard();

        if (getResult === 0) {
            output['code'] = 500;
            output['sub_code'] = 1;
            output['msg'] = 'Internal server error';
            return output;
        }
        output.content.leaderboard = getResult;
        return output;
    }


    /**
     * @param userID
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}|*|number|{msg: string, code: number, sub_code: number, content: {}}>}
     * Returns remaining attempts for daily match
     */
    async getUserAttempts(userID) {
        let output = this.getDefaultOutput();
        let dailyDay = this.getCurrentDay();
        await this.getDailyMatch(dailyDay.trim());
        let weeklyDay = this.getStartOfWeek();
        await this.getWeeklyMatch(weeklyDay.trim());

        let checkResult = await this.#userController.checkUserID(userID);

        if(checkResult.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'User does not exists';
            return output;
        }

        let DailyAttempts = await this.#matchModel.getDailyAttempts(userID, dailyDay);
        let WeeklyAttempts = await this.#matchModel.getWeeklyAttempts(userID, weeklyDay);

        if(DailyAttempts === -1 || WeeklyAttempts === -1) {
            output['code'] = 500;
            output['sub_code'] = 2;
            output['msg'] = 'Internal server error';
            return output;
        }

        output.content.DailyAttempts = config._DAILY_ATTEMPTS_MAX - DailyAttempts;
        output.content.WeeklyAttempts = config._WEEKLY_ATTEMPTS_MAX - WeeklyAttempts;
        return output;

    }


    /**
     * @param userID
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     */
    async getUserResults(userID) {
        let output = this.getDefaultOutput();

        let checkResult = await this.#userController.checkUserID(userID);
        if(checkResult.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'User does not exists';
            return output;
        }

        output.content.dailyResult  = await this.#matchModel.getUserDailyResult(userID,this.getCurrentDay().trim());
        output.content.weeklyResult = await this.#matchModel.getUserWeeklyResult(userID,this.getStartOfWeek().trim());

        return output;
    }

    async deleteMatchFromDB(match_shadow){
        await this.#matchModel.makeRandomMatchShadowAsDeleted(match_shadow);
    }

}
