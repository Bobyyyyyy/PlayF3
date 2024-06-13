const SocketController = require("./SocketController");
module.exports = class SocketEvents extends SocketController {

    #multiplayerList;

    constructor(multiplayerList) {
        super();
        this.#multiplayerList = multiplayerList;
    }

    /**
     * Given a socket handshake returns an object that contains normalized data.
     * @param {object} handshake
     * @return {{waiting: *, aiPower: *, matchShadow: *, playWithWhite: *}}
     */
    socketNormalizeHandshake(handshake) {
        let playWithWhite = handshake.query.playWithWhite;
        let aiPower = handshake.query.aiPower;
        let matchShadow = handshake.query.match_shadow;
        let waiting = handshake.query.waiting;

        if (isNaN(aiPower))
            aiPower = 0;
        if (isNaN(waiting))
            waiting = 0;

        return {
            playWithWhite: playWithWhite,
            aiPower: aiPower,
            matchShadow: matchShadow,
            waiting: waiting
        }
    }

    /**
     * This function is used to handle socket connections
     * On Socket connect we bind all events
     */
    onSocketConnection(socket, io) {
        let handshakeParse = this.socketNormalizeHandshake(socket.handshake);

        let waiting = handshakeParse.waiting;

        if (waiting === 0)
            this.socketBindPlayingSocket(socket, handshakeParse);
        else
            this.socketBindWaitingSocket(socket, handshakeParse, io);
    }

    socketBindPlayingSocket(socket, handshakeParse) {

        let matchShadow = handshakeParse.matchShadow;
        let aiPower = handshakeParse.aiPower;
        let playWithWhite = handshakeParse.playWithWhite;

        this.joinMatch(socket, matchShadow);
        if (Object.keys(this.#multiplayerList).includes(matchShadow)) {
            socket.join(matchShadow);
        }

        socket.on('playerResign', async () => {
            if (playWithWhite === 'true')
                await this.handlePlayerResign(socket);
            else
                await this.handlePlayerLose(false, matchShadow);
        });

        socket.on('opponentTimeout', async () => {
            if (playWithWhite === 'true')
                await this.handleOpponentLose(socket);
        });

        socket.on('pause', async (pgn) => {
            await this.pauseGame(socket, pgn);
        });

        socket.on('playerMove', async (arg) => {
            try {
                await this.handleMove(socket, arg);
            } catch (ignored) {
            }

        });

        socket.on('opponentMoveRequest', async (fen, moveObj) => {
            await this.handleOpponentMoveRequest(socket, fen, moveObj, aiPower, matchShadow);
        });

        socket.on('disconnect', async () => {
            let isPlayingWithWhite = socket.handshake.query.playWithWhite;
            if (isPlayingWithWhite === 'true')
                await this.handlePlayerResign(socket);
            else
                await this.handlePlayerLose(false, matchShadow);
            socket.to(matchShadow).emit('OPPONENT_LEAVES');
            await this.deleteWaitingFromDB(matchShadow);
        });
    }

    /**
     * @param socket
     * @param fen
     * @param moveObj
     * @param aiPower
     * @param matchShadow
     * @return {Promise<void>}
     */
    async handleOpponentMoveRequest(socket, fen, moveObj, aiPower, matchShadow) {
        try {
            let analysis = this.checkFenPosition(fen);
            if (Object.keys(this.#multiplayerList).includes(matchShadow) === false) {
                await this.handleOpponentMoveRequestSinglePlayer(socket, fen, moveObj, aiPower, matchShadow, analysis);
            } else {
                await this.handleOpponentMoveRequestMultiPlayer(socket, fen, moveObj, aiPower, matchShadow, analysis);
            }
        } catch (ignored) {
        }
    }

    async handleOpponentMoveRequestSinglePlayer(socket, fen, moveObj, aiPower, matchShadow, analysis) {
        //Singleplayer
        if (analysis.finished === true && analysis.mate) {
            await this.handleOpponentLose(socket);
            return;
        }
        let result = this.getAiMove(fen, aiPower);
        socket.emit('opponentMove', result);
        let newFen = this.convertMoveToFen(fen, result);
        await this.handleMove(socket, newFen);
        analysis = this.checkFenPosition(newFen);
        if (analysis.finished === true && analysis.mate)
            await this.handlePlayerResign(socket);
    }

    async handleOpponentMoveRequestMultiPlayer(socket, fen, moveObj, aiPower, matchShadow, analysis){
        //Multiplayer
        socket.to(matchShadow).emit('opponentMove', moveObj);
        if (analysis.finished) {
            if (analysis.mate) {
                if (analysis.turn === 'black')
                    await this.handlePlayerLose(false, matchShadow);
                else if (analysis.turn === 'white')
                    await this.handlePlayerLose(true, matchShadow);
            } else if (analysis.draw)
                await this.handleMatchDraw(socket);
        }
    }

    socketBindWaitingSocket(socket, handshakeParse, io) {
        let matchShadow = handshakeParse.matchShadow;

        socket.on('whiteJoin', async (diff = 50) => {
            if (typeof socket.request.session.authenticated !== 'undefined' && socket.request.session.authenticated === true &&
                isNaN(parseInt(socket.request.session.user.id)) === false) {
                this.#multiplayerList[matchShadow] = {};
                this.#multiplayerList[matchShadow]["name_white"] = socket.request.session.user.name;
                this.#multiplayerList[matchShadow]["diff"] = diff;
                socket.join(matchShadow);
            }
        });

        socket.on('blackJoin', async () => {
            if (typeof socket.request.session === 'undefined' || typeof socket.request.session.authenticated === 'undefined') {
                socket.emit('GO_AWAY');
                return;
            }

            if (typeof socket.request.session.authenticated !== 'undefined' && socket.request.session.authenticated === true &&
                isNaN(parseInt(socket.request.session.user.id)) === false) {
                socket.join(matchShadow);
                let defaultDiff = 50;

                if(typeof this.#multiplayerList[matchShadow] === 'undefined') {
                    socket.emit('GO_AWAY');
                    return;
                }

                if(typeof this.#multiplayerList[matchShadow]['diff'] !== 'undefined')
                    defaultDiff = this.#multiplayerList[matchShadow]['diff'];
                let fenStart = this.getRandomPosition(defaultDiff);
                if (io.sockets.adapter.rooms.get(matchShadow).size !== 2) {
                    socket.emit('GO_AWAY');
                    return;
                }
                await this.handleMove(socket, fenStart);
                let nameWhite = this.#multiplayerList[matchShadow]["name_white"];
                let nameBlack = socket.request.session.user.name;
                io.to(matchShadow).emit('gameStart', fenStart, nameWhite, nameBlack);
                await this.blackJoinGame(socket.request.session, matchShadow);
                this.#multiplayerList[matchShadow] = {};
            }
        });
    }

}