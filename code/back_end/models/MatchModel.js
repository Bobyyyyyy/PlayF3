const Model = require("./Model");
const config = require('../config/playf3')
const MatchDto = require("../dto/MatchDto");

module.exports = class MatchModel extends Model {
    /**
     * @param {boolean} isTest
     */
    constructor(isTest = false) {
        super(isTest);
    }

    /**
     * @param {string} match_type
     * @return {Promise<number>}
     * returns an id if successful, 0 otherwise.
     * Note: There is no id that can be 0
     */
    async insertMatch(match_type) {
        if (match_type !== config._MATCH_TYPE_MULTI && match_type !== config._MATCH_TYPE_SINGLE && match_type !== config._MATCH_TYPE_DAILY && match_type !== config._MATCH_TYPE_TRAINING && match_type !== config._MATCH_TYPE_WEEKLY)
            return 0;

        let conn = await this.getMysqlConnection();
        match_type = conn.escape(match_type);
        let query = `INSERT INTO tbl_matches (type) VALUES (${match_type})`;
        try {
            let result = await conn.promise().query(query);
            return result[0].insertId;
        } catch (ignored) {
            return 0;
        }
    }

    /**
     * @param {number} matchID
     * @return {Promise<boolean>}
     * returns true if match exists, false otherwise
     */
    async checkMatchId (matchID){
        let conn = await this.getMysqlConnection();
        matchID = conn.escape(matchID);
        let query = `SELECT COUNT(tbl_matches.id) as cnt FROM tbl_matches WHERE tbl_matches.id = ${matchID}`;
        try {
            let result = await conn.promise().query(query);
            return result[0][0].cnt === 1;
        } catch (ignored) {
            return false;
        }
    }

    /**
     * @param {number} matchID
     * @param {number} status
     * @param {String} pgn
     * @return {Promise<boolean>}
     * returns true if match exists, false otherwise
     */
    async modifyStatus (matchID, status, pgn) {
        let conn = await this.getMysqlConnection();
        pgn = conn.escape(pgn);
        matchID = conn.escape(matchID);
        status = conn.escape(status);

        let query = `UPDATE tbl_matches SET status = ${status}, PGN = ${pgn} WHERE id = ${matchID}`;
        try {
            await conn.promise().query(query);
            return true;
        } catch (ignored) {
            return false;
        }
    }

    /**
     * @param {number} matchID
     * @return {Promise<number>}
     * return number will represent the next move
     */
    async getMoveNo(matchID){
        let conn = await this.getMysqlConnection();
        matchID = conn.escape(matchID);
        let query = `SELECT IF(ISNULL(MAX(situation_no)), 0, MAX(situation_no)) AS max_situation FROM tbl_matches_situations WHERE match_id = ${matchID}`;
        try {
            let result = await conn.promise().query(query);
            return (result[0][0].max_situation) + 1;
        } catch (ignored) {
            return 1;
        }
    }

    /**
     * @param {number} matchId - checked by MatchController
     * @param {number} moveNo - requested to Model in MatchController
     * @param {string} situation - parsed by frontend, no extreme case
     * @return {Promise<boolean>}
     */
    async registerMove(matchId, moveNo, situation){
        let conn = await this.getMysqlConnection();
        matchId = conn.escape(matchId);
        moveNo = conn.escape(moveNo);
        situation = conn.escape(situation);
        let query = `INSERT INTO tbl_matches_situations (match_id, situation_no, fen_situation) VALUES (${matchId}, ${moveNo}, ${situation});`;
        try {
            let result = await conn.promise().query(query);
            return result[0].affectedRows === 1;
        } catch (ignored) {
            return false;
        }
    }

    /**
     * @param {number} matchID
     * @return {Promise<MatchDto|null>}
     * Returns moves done in a match, null otherwise
     */
    async getMatchMoves(matchID){
        let conn = await this.getMysqlConnection();
        matchID = conn.escape(matchID);
        let query = `SELECT t.id, t.start_timestamp, t.type, t.deleted, t.status, GROUP_CONCAT(ts.fen_situation SEPARATOR ';') as situations
                        FROM tbl_matches as t
                        INNER JOIN tbl_matches_situations as ts ON (ts.match_id = t.id)
                        WHERE t.id = ${matchID}
                        GROUP BY t.id`;
        try {
            let result = await conn.promise().query(query);
            let output = new MatchDto();
            output.id = result[0][0].id;
            output.start_timestamp = result[0][0].start_timestamp;
            output.type = result[0][0].type;
            output.deleted = result[0][0].deleted;
            output.status = result[0][0].status;
            output.situations = result[0][0].situations;
            return output;
        } catch (ignored) {
            return null;
        }
    }


    /**
     * @param {Number} matchID
     * @returns {Promise<Number|null>}
     * Return the status of a match, null otherwise
     */
    async getMatchStatus(matchID) {
        let conn = await this.getMysqlConnection();
        matchID = conn.escape(matchID);
        let query = `SELECT m.status 
                            FROM tbl_matches as m
                            WHERE m.id = ${matchID}`
        try {
            let result = await conn.promise().query(query);
            return result[0][0].status;
        } catch (ignored) {
            return null;
        }
    }

    /**
     * @param day {string}
     * @return {Promise<String>}
     * Given a day returns the daily situation as string if already inserted, "" otherwise.
     */
    async checkDailyMatch(day){
        let conn = await this.getMysqlConnection();
        day = conn.escape(day);
        let query = `SELECT tbl_daily_situations.situation as situation FROM tbl_daily_situations WHERE tbl_daily_situations.day = ${day}`
        try {
            let result = await conn.promise().query(query);
            return result[0][0].situation;
        }
        catch (ignored) {
            return '';
        }
    }

    /**
     * @param {String} day
     * @returns {Promise<*|string>}
     * Given a day returns the weekly situation as string if already inserted, "" otherwise.
     */

    async checkWeeklyMatch(day){
        let conn = await this.getMysqlConnection();
        day = conn.escape(day);
        let query = `SELECT tbl_weekly_situations.situation as situation FROM tbl_weekly_situations WHERE tbl_weekly_situations.start_of_week = ${day}`
        try {
            let result = await conn.promise().query(query);
            return result[0][0].situation;
        }
        catch (ignored) {
            return '';
        }
    }

    /**
     * @param {String} day
     * @param {String} situation
     * @returns {Promise<Boolean>}
     * Returns true if the situation is inserted correctly, false otherwise
     */
    async saveWeeklySituation(day,situation){
        let conn = await this.getMysqlConnection();
        day = conn.escape(day);
        situation = conn.escape(situation);
        let query = `INSERT INTO tbl_weekly_situations (start_of_week, situation) VALUES (${day},${situation})`
        try {
            let result = await conn.promise().query(query);
            return result[0].affectedRows === 1;
        }
        catch (ignored) {
            return false;
        }
    }

    /**
     * @param {String} day
     * @param {String} situation
     * @returns {Promise<Boolean>}
     * Returns true if the situation is inserted correctly, false otherwise
     */
    async saveDailySituation(day,situation){
        let conn = await this.getMysqlConnection();
        day = conn.escape(day);
        situation = conn.escape(situation);
        let query = `INSERT INTO tbl_daily_situations (day, situation) VALUES (${day},${situation})`
        try {
            let result = await conn.promise().query(query);
            return result[0].affectedRows === 1;
        }
        catch (ignored) {
            return false;
        }
    }

    /**
     * @param match_id {number}
     * @return {Promise<boolean>}
     */
    async markWhiteAsWon(match_id){
        let conn = await this.getMysqlConnection();
        match_id = conn.escape(match_id);
        let query = `UPDATE tbl_matches SET winner = 1 WHERE id = ${match_id}`
        try {
            let result = await conn.promise().query(query);
            return result[0].affectedRows === 1;
        }
        catch (ignored) {
            return false;
        }
    }

    /**
     * @param match_id {number}
     * @return {Promise<boolean>}
     */
    async markBlackAsWon(match_id){
        let conn = await this.getMysqlConnection();
        match_id = conn.escape(match_id);
        let query = `UPDATE tbl_matches SET winner = 0 WHERE id = ${match_id}`
        try {
            let result = await conn.promise().query(query);
            return result[0].affectedRows === 1;
        }
        catch (ignored) {
            return false;
        }
    }

    /**
     * @param match_id {number}
     * @return {Promise<boolean>}
     */
    async markDraw(match_id){
        let conn = await this.getMysqlConnection();
        match_id = conn.escape(match_id);
        let query = `UPDATE tbl_matches SET winner = 2 WHERE id = ${match_id}`
        try {
            let result = await conn.promise().query(query);
            return result[0].affectedRows === 1;
        }
        catch (ignored) {
            return false;
        }
    }

    /**
     * @param {String} day
     * @returns {Promise<number|*>}
     */
    async getDailyLeaderboard(day) {
        let conn = await this.getMysqlConnection();
        day = conn.escape(day);
        let query = `
         SELECT name, ROUND((MIN(moves)/2+1)) AS min_moves FROM (SELECT u.name, COUNT(situation_no) as moves
            FROM tbl_daily_results as r
                INNER JOIN tbl_matches as m ON r.match_id = m.id
                INNER JOIN tbl_users as u ON r.user_id = u.id
                INNER JOIN tbl_daily_situations as ds ON r.daily_match = ds.day
                INNER JOIN tbl_matches_situations as ms ON m.id = ms.match_id
            WHERE m.winner = 1
            AND r.daily_match = ${day}
            GROUP BY u.name, r.id
            ) AS a
        GROUP BY a.name`;

        try {
            let result = await conn.promise().query(query);
            return result[0];
        }
        catch (ignored) {
            return 0;
        }

    }

    /**
     * @param {String} day
     * @returns {Promise<number|*>}
     */
    async getWeeklyLeaderboard(day) {
        let conn = await this.getMysqlConnection();
        day = conn.escape(day);
        let query = `
        SELECT name, ROUND(MIN(moves)/2+1) AS min_moves FROM (SELECT u.name, COUNT(situation_no) as moves
            FROM tbl_weekly_results as r
                INNER JOIN tbl_matches as m ON r.match_id = m.id
                INNER JOIN tbl_users as u ON r.user_id = u.id
                INNER JOIN tbl_weekly_situations as ds ON r.weekly_match = ds.start_of_week
                INNER JOIN tbl_matches_situations as ms ON m.id = ms.match_id
            WHERE m.winner = 1
            AND r.weekly_match = ${day}
            GROUP BY u.name, r.id
            ) AS a
        GROUP BY a.name`;

        try {
            let result = await conn.promise().query(query);
            return result[0];
        }
        catch (ignored) {
            return 0;
        }

    }


    /**
     * @param {Number} userID
     * @param {String} day
     * @returns {Promise<number|*>}
     * Get the number of attempts done by a player on a daily match
     */
    async getDailyAttempts(userID,day) {
        let conn = await this.getMysqlConnection();
        day = conn.escape(day);
        let query = `SELECT COUNT(ds.id) as attempts
                             FROM tbl_daily_results as ds INNER JOIN tbl_users as u ON ds.user_id = u.id INNER JOIN tbl_matches as m ON ds.match_id = m.id
                             WHERE m.status = 2 AND ds.daily_match = ${day} AND user_id = ${userID}`;
        try {
            let result = await conn.promise().query(query);
            return result[0][0].attempts;
        }
        catch (ignored) {
            return -1;
        }
    }



    /**
     * @param {Number} userID
     * @param {String} day
     * @returns {Promise<number|*>}
     * Get the number of attempts done by a player on a weekly match
     */
    async getWeeklyAttempts (userID,day) {
        let conn = await this.getMysqlConnection();
        day = conn.escape(day);
        let query = `SELECT COUNT(ws.id) as attempts
                            FROM tbl_weekly_results as ws INNER JOIN tbl_users as u ON ws.user_id = u.id INNER JOIN tbl_matches as m ON ws.match_id = m.id
                            WHERE m.status = 2 AND ws.weekly_match = ${day} AND ws.user_id = ${userID}`;
        try {
            let result = await conn.promise().query(query);
            return result[0][0].attempts;
        }
        catch (ignored) {
            return -1;
        }
    }




    /**
     * @param {Number} userID
     * @param {String} day
     * @param {Number} matchID
     * @returns {Promise<boolean>}
     * Returns true if the result is inserted, false otherwise
     */
    async insertDailyResult(userID,matchID,day) {
        let conn = await this.getMysqlConnection();
        userID = conn.escape(userID);
        day = conn.escape(day);
        matchID = conn.escape(matchID);
        let query = `INSERT INTO tbl_daily_results (daily_match, match_id, user_id) VALUES (${day},${matchID},${userID})`
        try {
            let result = await conn.promise().query(query);
            return result[0].affectedRows === 1;
        }
        catch (ignored) {
            return false;
        }
    }


    /**
     * @param {Number} userID
     * @param {String} day
     * @param {Number} matchID
     * @returns {Promise<boolean>}
     * Returns true if the result is inserted, false otherwise
     */
    async insertWeeklyResult(userID,matchID,day) {
        let conn = await this.getMysqlConnection();
        userID = conn.escape(userID);
        day = conn.escape(day);
        matchID = conn.escape(matchID);
        let query = `INSERT INTO tbl_weekly_results (weekly_match, match_id, user_id) VALUES (${day},${matchID},${userID})`
        try {
            let result = await conn.promise().query(query);
            return result[0].affectedRows === 1;
        }
        catch (ignored) {
            return false;
        }
    }

    /**
     * @param {number} matchId
     * @param {number} playerIdWhite 0 in case is not avail
     * @param {number} playerIdBlack 0 in case is not avail
     * @return {Promise<boolean>}
     */
    async trackPlayingGame(matchId, playerIdWhite, playerIdBlack){
        let conn = await this.getMysqlConnection();
        matchId = conn.escape(matchId);
        if(playerIdWhite !== 0){
            playerIdWhite = conn.escape(playerIdWhite);
        } else
            playerIdWhite = 'NULL';

        if(playerIdBlack !== 0){
            playerIdBlack = conn.escape(playerIdBlack);
        } else
            playerIdBlack = 'NULL';

        let query = `INSERT INTO tbl_matches_played_by_users (match_id, white, black) VALUES (${matchId},${playerIdWhite},${playerIdBlack})`;
        try {
            let result = await conn.promise().query(query);
            return result[0].affectedRows === 1;
        }
        catch (ignored) {
            return false;
        }
    }

    /**
     * @param {number} matchId
     * @param {number} playerId
     * @param {boolean} white
     * @return {Promise<boolean>}
     */
    async connectPlayerToMatch(matchId, playerId, white = true){
        let conn = await this.getMysqlConnection();
        let query;

        matchId = conn.escape(matchId);
        playerId = conn.escape(playerId);

        if(white) query = `UPDATE tbl_matches_played_by_users SET white = ${playerId} WHERE match_id = ${matchId}`;
        else query = `UPDATE tbl_matches_played_by_users SET black = ${playerId} WHERE match_id = ${matchId}`;
        try {
            let result = await conn.promise().query(query);
            return result[0].affectedRows === 1;
        }
        catch (ignored) {
            return false;
        }
    }


    /**
     * @param {Number} userID
     * @param {String} day
     * @returns {Promise<Object>}
     * Returns matchID and last situation of the last paused game, false otherwise
     */
    async getDailyPausedGame(userID,day) {
        let conn = await this.getMysqlConnection();
        userID = conn.escape(userID);
        day = conn.escape(day);
        let query = `SELECT m.id as matchID, ms.fen_situation as situation, m.PGN as pgn
                            FROM tbl_daily_results as dr INNER JOIN tbl_matches as m ON dr.match_id = m.id INNER JOIN tbl_matches_situations as ms ON m.id = ms.match_id
                            WHERE dr.user_id = ${userID} AND m.status = 3 AND dr.daily_match = ${day}
                            ORDER BY ms.match_id DESC, ms.situation_no DESC
                            LIMIT 1`
        try {
            let result = await conn.promise().query(query);
            return {matchID: result[0][0].matchID, situation: result[0][0].situation, pgn: result[0][0].pgn};
        }
        catch (ignored) {
            return false;
        }
    }


    /**
     * @param {Number} userID
     * @param {String} day
     * @returns {Promise<Object>}
     * Returns matchID and last situation of the last paused game, false otherwise
     */
    async getWeeklyPausedGame(userID,day) {
        let conn = await this.getMysqlConnection();
        userID = conn.escape(userID);
        day = conn.escape(day);
        let query = `SELECT m.id as matchID, ms.fen_situation as situation,m.PGN as pgn
                            FROM tbl_weekly_results as wr INNER JOIN tbl_matches as m ON wr.match_id = m.id INNER JOIN tbl_matches_situations as ms ON m.id = ms.match_id
                            WHERE wr.user_id = ${userID} AND m.status = 3 AND wr.weekly_match = ${day}
                            ORDER BY ms.match_id DESC, ms.situation_no DESC
                            LIMIT 1`
        try {
            let result = await conn.promise().query(query);
            return {matchID: result[0][0].matchID, situation: result[0][0].situation,pgn: result[0][0].pgn};
        }
        catch (ignored) {
            return false;
        }
    }

    /**
     * @param {Number} userID
     * @returns {Promise<Object>}
     * Returns matchID and last situation of the last paused game, false otherwise
     */
    async getSinglePausedGame(userID) {
        let conn = await this.getMysqlConnection();
        userID = conn.escape(userID);
        let query = `SELECT mu.match_id as matchID, ms.fen_situation as situation,m.PGN as pgn
                            FROM tbl_matches_played_by_users as mu INNER JOIN tbl_matches as m ON mu.match_id = m.id INNER JOIN tbl_matches_situations as ms ON m.id = ms.match_id
                            WHERE (mu.white = ${userID} OR mu.black = ${userID}) AND m.status = 3
                            ORDER BY ms.match_id DESC, ms.situation_no DESC
                            LIMIT 1`
        try {
            let result = await conn.promise().query(query);
            return {matchID: result[0][0].matchID, situation: result[0][0].situation, pgn: result[0][0].pgn};
        }
        catch (ignored) {
            return false;
        }
    }


    /**
     * @param {Number} matchID
     * @param {Boolean} hasWon
     * @param {Number} elo_amount
     * @returns {Promise<boolean>}
     * Updates the point given by a singleplayer game, returns false in case of errors
     */

    async updateElo(matchID,hasWon,elo_amount) {
        let conn = await this.getMysqlConnection();
        matchID = conn.escape(matchID);
        let eloGained = 0;
        let eloLoss = 0;

        if(hasWon)
            eloGained = elo_amount;
        else
            eloLoss = elo_amount;

        let query = `UPDATE tbl_matches_played_by_users SET elo_gained = ${eloGained}, elo_loss = ${eloLoss} WHERE match_id = ${matchID}`;
        try {
            await conn.promise().query(query);
            return true;
        }
        catch (ignored) {
            return false;
        }
    }


    /**
     * @param {Number} userID
     * @returns {Promise<Number>}
     * Returns a player rank given his ID
     */
    async getPlayerRank(userID) {
        let conn = await this.getMysqlConnection();
        userID = conn.escape(userID);
        let query = `SELECT (SUM(elo_gained) - SUM(elo_loss)) AS elo
                            FROM tbl_matches_played_by_users as mu INNER JOIN tbl_matches as m ON mu.match_id = m.id
                            WHERE (mu.white = ${userID} OR mu.white = ${userID}) AND m.type = 'SINGLEPLAYER'`;
        try {
            let result = await conn.promise().query(query);
            return result[0][0].elo;
        }
        catch (ignored) {
            return -1;
        }
    }


    /**
     * @param {Number} matchID
     * @param {boolean} white
     * @returns {Promise<Number>}
     * Returns the userID of the playing user in a singleplayer match given his ID
     */
    async getPlayerInGame(matchID,white) {
        let conn = await this.getMysqlConnection();
        matchID = conn.escape(matchID);

        let query;

        if (white) {
            query = `SELECT white as player
                     FROM tbl_matches_played_by_users
                     WHERE match_id = ${matchID}`;
        }
        else {
            query = `SELECT black as player
                     FROM tbl_matches_played_by_users
                     WHERE match_id = ${matchID}`;
        }

        try {
            let result = await conn.promise().query(query);
            return result[0][0].player;
        }
        catch (ignored) {
            return null;
        }
    }


    /**
     * @returns {Promise<number|*>}
     * Returns ranked leaderboard, 0 in case of errors
     */
    async getRankedLeaderboard() {
        let conn = await this.getMysqlConnection();
        let query = `SELECT u.name,(SUM(elo_gained) - SUM(elo_loss)) AS elo
                            FROM tbl_matches_played_by_users as mu INNER JOIN tbl_matches as m ON mu.match_id = m.id INNER JOIN tbl_users as u on (mu.black = u.id || mu.white = u.id)
                            WHERE m.type = 'SINGLEPLAYER'
                            GROUP BY u.name
                            ORDER BY elo DESC`;
        try {
            let result = await conn.promise().query(query);
            return result[0];
        }
        catch (ignored) {
            return 0;
        }
    }

    /**
     * @param {string} match_shadow
     * @return {Promise<boolean>}
     */
    async insertRandomMultiplayer(match_shadow){
        let conn = await this.getMysqlConnection();
        match_shadow = conn.escape(match_shadow);
        let query = `INSERT INTO tbl_random_multiplayer (match_shadow) VALUES (${match_shadow})`;
        try {
            await conn.promise().query(query);
            return true;
        }
        catch (ignored) {
            return false;
        }
    }

    /**
     * @return {Promise<string>}
     * Returns a match_shadow if exists. Else empty string
     */
    async getRandomMultiplayer(){
        let conn = await this.getMysqlConnection();

        let query = `SELECT match_shadow FROM tbl_random_multiplayer WHERE deleted = 0 LIMIT 1;`;
        try {
            let result = await conn.promise().query(query);
            if(result[0].length === 0)
                return '';
            let match_shadow = result[0][0]['match_shadow'];
            await this.makeRandomMatchShadowAsDeleted(match_shadow);
            return match_shadow;
        }
        catch (ignored) {
            return '';
        }
    }

    /**
     * @param {string} match_shadow
     * @return {Promise<boolean>}
     */
    async makeRandomMatchShadowAsDeleted(match_shadow){
        let conn = await this.getMysqlConnection();

        match_shadow = conn.escape(match_shadow);
        let query = `UPDATE tbl_random_multiplayer SET deleted = 1 WHERE match_shadow = ${match_shadow}`;
        try {
            await conn.promise().query(query);
            return true;
        }
        catch (ignored) {
            return false;
        }
    }


    /**
     * @param userID
     * @param day
     * @returns {Promise<number|*>}
     * Get user daily result
     */
    async getUserDailyResult(userID,day) {
        let conn = await this.getMysqlConnection();

        userID = conn.escape(userID);
        day = conn.escape(day);

        let query = `SELECT ROUND((MIN(moves)/2+1)) AS min_moves FROM (SELECT u.name, COUNT(situation_no) as moves
            FROM tbl_daily_results as r
                INNER JOIN tbl_matches as m ON r.match_id = m.id
                INNER JOIN tbl_users as u ON r.user_id = u.id
                INNER JOIN tbl_daily_situations as ds ON r.daily_match = ds.day
                INNER JOIN tbl_matches_situations as ms ON m.id = ms.match_id
            WHERE m.winner = 1
            AND r.daily_match = ${day}
            AND u.id = ${userID}
            GROUP BY u.name, r.id
            ) AS a
        GROUP BY a.name`;

        try {
            let result = await conn.promise().query(query);
            if(result[0].length !== 0)
                return result[0][0].min_moves;
            return -1;
        }
        catch(ignored) {
            return -1;
        }
    }


    /**
     * @param userID
     * @param day
     * @returns {Promise<number|*>}
     * Get user weekly result
     */
    async getUserWeeklyResult(userID,day) {
        let conn = await this.getMysqlConnection();

        userID = conn.escape(userID);
        day = conn.escape(day);

        let query = `SELECT name, ROUND(MIN(moves)/2+1) AS min_moves FROM (SELECT u.name, COUNT(situation_no) as moves
            FROM tbl_weekly_results as r
                INNER JOIN tbl_matches as m ON r.match_id = m.id
                INNER JOIN tbl_users as u ON r.user_id = u.id
                INNER JOIN tbl_weekly_situations as ds ON r.weekly_match = ds.start_of_week
                INNER JOIN tbl_matches_situations as ms ON m.id = ms.match_id
            WHERE m.winner = 1
            AND u.id = ${userID}
            AND r.weekly_match = ${day}
            GROUP BY u.name, r.id
            ) AS a
        GROUP BY a.name`;

        try {
            let result = await conn.promise().query(query);
            if(result[0].length !== 0)
                return result[0][0].min_moves;
            return -1;
        }
        catch(ignored) {
            return -1;
        }
    }
}
