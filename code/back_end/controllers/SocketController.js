const Controller = require("./Controller");
const config = require('../config/playf3')
const MatchController = require("./MatchController");
const jsChessEngine = require('js-chess-engine');
const MatchDto = require("../dto/MatchDto");
const {aiMove, move, Game} = jsChessEngine;

module.exports = class SocketController extends Controller {
    #matchController;

    constructor(isTest = false) {
        super();
        this.#matchController = new MatchController(isTest);
    }

    async joinMatch(socket, matchShadow) {
        let output = this.getDefaultOutput();
        let matchId = this.decrypt(matchShadow);
        if (matchId === '') return;

        matchId = parseInt(matchId);
        socket.join(matchId);
        let ctrlOut = await this.#matchController.updateMatchStatus(matchId, config._MATCH_STATUS_PLAYING);

        if (ctrlOut.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'Error occurred while joining match';
            return output;
        }

        return output;
    }

    /**
     * @param socket
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     */
    async handlePlayerResign(socket) {
        let failOutput = this.getDefaultOutput();

        failOutput['code'] = 400;
        failOutput['msg'] = 'Bad request';

        if(typeof socket.handshake === 'undefined'){
            socket.handshake = {};
            socket.handshake.query = socket.io.engine.opts.query;
        }

        let matchShadow = socket.handshake.query.match_shadow;
        let matchId = this.decrypt(matchShadow);
        matchId = parseInt(matchId);
        if (isNaN(matchId))
            return failOutput;

        let match = await this.#matchController.getSingleMatch(matchId);
        if (match.code !== 200)
            return failOutput;

        match = new MatchDto(match.content);
        if(match.status === config._MATCH_STATUS_ENDED)
            return failOutput;

        let ctrlOut = await this.#matchController.updateMatchStatus(matchId, config._MATCH_STATUS_ENDED);
        if (ctrlOut.code !== 200) {
            return failOutput;
        }

        // bisogna riprendersi il match perchè lo stato è cambiato
        match = await this.#matchController.getSingleMatch(matchId);
        match = new MatchDto(match.content);

        await this.#matchController.updateWonStatus(match, false);
    }

    /**
     * @param socket
     * @return {Promise<void>}
     */
    async handleOpponentLose(socket) {
        let failOutput = this.getDefaultOutput();

        failOutput['code'] = 400;
        failOutput['msg'] = 'Bad request';

        if(typeof socket.handshake === 'undefined'){
            socket.handshake = {};
            socket.handshake.query = socket.io.engine.opts.query;
        }

        let matchShadow = socket.handshake.query.match_shadow;
        let matchId = this.decrypt(matchShadow);
        matchId = parseInt(matchId);
        if (isNaN(matchId))
            return failOutput;

        let match = await this.#matchController.getSingleMatch(matchId);
        if (match.code !== 200)
            return failOutput;

        match = new MatchDto(match.content);

        if(match.status === config._MATCH_STATUS_ENDED)
            return failOutput;

        let ctrlOut = await this.#matchController.updateMatchStatus(matchId, config._MATCH_STATUS_ENDED);
        if (ctrlOut.code !== 200) {
            return failOutput;
        }

        // bisogna riprendersi il match perchè lo stato è cambiato
        match = await this.#matchController.getSingleMatch(matchId);
        match = new MatchDto(match.content);

        await this.#matchController.updateWonStatus(match, true);
    }

    async handleMove(socket, situation) {
        if(typeof socket.handshake === 'undefined'){
            socket.handshake = {};
            socket.handshake.query = socket.io.engine.opts.query;
        }
        let matchShadow = socket.handshake.query.match_shadow;
        let matchId = this.decrypt(matchShadow);
        matchId = parseInt(matchId);
        await this.#matchController.addMove(matchId, situation);
    }

    async handleMatchDraw(socket) {
        let failOutput = this.getDefaultOutput();

        failOutput['code'] = 400;
        failOutput['msg'] = 'Bad request';

        if(typeof socket.handshake === 'undefined'){
            socket.handshake = {};
            socket.handshake.query = socket.io.engine.opts.query;
        }

        let matchShadow = socket.handshake.query.match_shadow;
        let matchId = this.decrypt(matchShadow);
        matchId = parseInt(matchId);
        if (isNaN(matchId))
            return failOutput;

        let ctrlOut = await this.#matchController.updateMatchStatus(matchId, config._MATCH_STATUS_ENDED);
        if (ctrlOut.code !== 200) {
            return failOutput;
        }

        let match = await this.#matchController.getSingleMatch(matchId);
        if (match.code !== 200)
            return failOutput;

        match = new MatchDto(match.content);
        await this.#matchController.updateWonStatus(match, false, true);
    }

    /**
     * @param playerWhite {boolean}
     * @param matchShadow {string}
     * @return {Promise<void>}
     */
    async handlePlayerLose(playerWhite, matchShadow) {
        let failOutput = this.getDefaultOutput();

        failOutput['code'] = 400;
        failOutput['msg'] = 'Bad request';

        let matchId = this.decrypt(matchShadow);
        matchId = parseInt(matchId);
        if (isNaN(matchId))
            return failOutput;

        let match = await this.#matchController.getSingleMatch(matchId);
        if (match.code !== 200)
            return failOutput;

        if(match.content.status === config._MATCH_STATUS_ENDED)
            return failOutput;

        let ctrlOut = await this.#matchController.updateMatchStatus(matchId, config._MATCH_STATUS_ENDED);
        if (ctrlOut.code !== 200) {
            return failOutput;
        }

        match = await this.#matchController.getSingleMatch(matchId);
        match = new MatchDto(match.content);
        await this.#matchController.updateWonStatus(match, !playerWhite);
    }

    /**
     * @param fen {string}
     * @param power {number}
     * @return {object|null}
     * Given a fen situation returns a fen with played move.
     * Void string on error
     */
    getAiMove(fen, power = 0) {
        let suggestedMoves = aiMove(fen, power);
        if (typeof suggestedMoves === 'object') {
            return suggestedMoves;
        }
        return null;
    }

    /**
     * @param fen
     * @param moveFromAi
     * @return {string}
     */
    convertMoveToFen(fen, moveFromAi) {
        let movesKeys = Object.keys(moveFromAi);
        let selectedMoveKey = null;
        if (movesKeys.length > 0) {
            selectedMoveKey = movesKeys[0];
            return move(fen, selectedMoveKey, moveFromAi[selectedMoveKey]);
        }
        return '';
    }


    /**
     * @param fen
     * @return {{mate: boolean, finished: boolean, turn: string, draw: boolean}}
     */
    checkFenPosition(fen) {
        console.log(fen);
        let game = new Game(fen)
        let json = game.exportJson();
        return {
            finished: json.isFinished,
            mate: json.checkMate,
            turn: json.turn,
            draw: Object.keys(json.moves).length === 0
        };
    }


    /**
     * @param diff {number}
     * @return {string}
     */
    getRandomPosition(diff = 0) {
        return this.#matchController.getRandomPosition(diff);
    }


    /**
     * @param {object} session
     * @param {string} shadow
     * @return {Promise<boolean>}
     */
    async blackJoinGame(session, shadow) {
        let user = this.getUserFromSession(session.user);
        return await this.#matchController.connectPlayerToMatch(shadow, user.id);
    }

    /**
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Change the state of the current game playing to paused in DB
     */

    async pauseGame(socket,pgn) {
        if(typeof socket.handshake === 'undefined'){
            socket.handshake = {};
            socket.handshake.query = socket.io.engine.opts.query;
        }

        let output = this.getDefaultOutput();
        let matchShadow = socket.handshake.query.match_shadow;
        let matchId = this.decrypt(matchShadow);
        matchId = parseInt(matchId);
        let ctrlOut = await this.#matchController.updateMatchStatus(matchId, config._MATCH_STATUS_PAUSED,pgn);

        if (ctrlOut.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'Error occurred while pausing the match';
            return output;
        }
        return output;
    }

    deleteWaitingFromDB(match_shadow){
        return this.#matchController.deleteMatchFromDB(match_shadow);
    }


}