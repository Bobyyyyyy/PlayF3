import React, { useEffect, useRef, useState } from "react";
import { useTimer } from 'react-timer-hook';
import { Chess } from "chess.js";
import { socket, waitingPlayerSocket } from "../../misc/socket.js";
import Server from '../../misc/Server.js';
import { getMove, useMultiPlayerMatch } from '../../misc/gameFunc.js';
import GameSideBar from "../../components/GameSideBar.jsx";
import Gameboard from "../../components/Gameboard.jsx";
import { getUsernameFromSession } from "../../util/utils.js";
import WaitingWindow from "../../components/multiplayer/WaitingWindow.jsx";

let black_match_shadow = '';


export default function RandomMultiGamePage() {
    let match = useMultiPlayerMatch();    // ritorna un ogg. con var e funz necessari per la partita

    //stati del gioco
    const [game,] = useState(new Chess());
    const [moved, setMoved] = useState(false);
    const [playerName, setPlayerName] = useState(getUsernameFromSession());
    const [opponentName, setOpponentName] = useState("opponent");

    //stati per i timer

    const _INITIAL_TIME_ = 600;
    const timePlayer = useRef(_INITIAL_TIME_);
    const timeOpponent = useRef(_INITIAL_TIME_);
    const timeLastMoveMilliseconds = useRef(Date.now())

    const [expiryTimestampPlayer,] = useState(() => {
        let timePlayerRemain = new Date();
        timePlayerRemain.setSeconds(timePlayer.current + timePlayerRemain.getSeconds());
        return timePlayerRemain;
    })

    const [expiryTimestampOpponent,] = useState(() => {
        let timeOpponentRemain = new Date();
        timeOpponentRemain.setSeconds(timeOpponent.current + timeOpponentRemain.getSeconds());
        return timeOpponentRemain;
    })


    const {
        seconds: playerTimerSeconds,
        minutes: playerTimerMinutes,
        start: playerTimerStart,
        pause: playerTimerPause,
        resume: playerTimerResume,
        restart: playerTimerRestart,
    } = useTimer({ expiryTimestamp: expiryTimestampPlayer, onExpire: () => playerHasRunOutOfTime() });

    const {
        seconds: opponentTimerSeconds,
        minutes: opponentTimerMinutes,
        start: opponentTimerStart,
        pause: opponentTimerPause,
        resume: opponentTimerResume,
        restart: opponentTimerRestart,
    } = useTimer({ expiryTimestamp: expiryTimestampOpponent, onExpire: () => opponentHasRunOutOfTime() });

    match.playerTimer = {
        start: playerTimerStart,
        pause: playerTimerPause,
        resume: playerTimerResume,
        restart: playerTimerRestart,
        seconds: playerTimerSeconds,
        minutes: playerTimerMinutes
    }
    match.opponentTimer = {
        start: opponentTimerStart,
        pause: opponentTimerPause,
        resume: opponentTimerResume,
        restart: opponentTimerRestart,
        seconds: opponentTimerSeconds,
        minutes: opponentTimerMinutes
    }

    match.player = {
        move: () => playerMove(),
        username: playerName,
        time: match.playerTimer
    }
    match.opponent = {
        move: (m) => opponentMove(m),
        username: opponentName,
        time: match.opponentTimer
    }

    //stati per i socket
    const socket1 = useRef(socket(""));
    const [opponentConnected, setOpponentConnected] = useState(false);

    //force update
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
    const [lastSend, setLastSend] = useState("");


    function closeQuickView() {
        if(socket1.current.connected) {
            socket1.current.disconnect(true);
            window.location.href = './';
        }

    }

    useEffect(() => {
        // Add a fake history event so that the back button does nothing if pressed once
        window.history.pushState('fake-route', document.title, window.location.href);

        addEventListener('popstate', closeQuickView);

        // Here is the cleanup when this component unmounts
        return () => {
            removeEventListener('popstate', closeQuickView);
            // If we left without using the back button, aka by using a button on the page, we need to clear out that fake history event
            if (window.history.state === 'fake-route') {
                window.history.back();
            }
        };
    }, []);

    const Game = {
        game: match.game,
        setGame: match.setGame,
        player: match.player,
        opponent: match.opponent,
        playAsWhite: match.white,
        isFirstMove: !match.moved,
        isPlayerTurn: match.isPlayerTurn,
        isGameOver: match.isGameOver,
        timeout: match.timeout,
        rematch: rematch,
        resign: resign,
    }



    function playerMove() {
        const currentTimeMilliseconds = Date.now();
        timePlayer.current = timePlayer.current - (currentTimeMilliseconds - timeLastMoveMilliseconds.current) / 1000;
        timeLastMoveMilliseconds.current = currentTimeMilliseconds;

        let newTimeDatePlayer = new Date();
        newTimeDatePlayer.setSeconds(timePlayer.current + newTimeDatePlayer.getSeconds());

        let newTimeDateOpponent = new Date();
        newTimeDateOpponent.setSeconds(timeOpponent.current + newTimeDateOpponent.getSeconds());

        match.playerTimer.pause();
        match.opponentTimer.resume();

        if (!moved) {
            setMoved(true);
        }
        if (game.fen() === '' || socket1.current === null || typeof socket1.current === 'undefined')
            return;
        if (game.fen() !== lastSend) {
            socket1.current.emit('playerMove', match.game.fen());
        }
        setLastSend(match.game.fen());
        match.setCanUndo(u => {
            if (u === 0) return 1;
            else if (u === 1) return 2;
            else if (u === 2) return 2
        });
    }

    function opponentMove(m) {
        let moveToSend = {};
        moveToSend[m.from.toUpperCase()] = m.to.toUpperCase();
        moveToSend.promotion = "q";
        // mossa giocatore fatta, richiesta mossa avversario
        socket1.current.emit('opponentMoveRequest', match.game.fen(), moveToSend);
    }

    async function getMatchShadowRandomStarted() {
        console.log("getMatchShadowRS");
        let response = fetch(Server.url + `/match/multiplayer/random`, {
            mode: 'cors',
            credentials: 'include',
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
        })
        response = await response;
        if (response.ok) {
            let json = await response.json();
            return json.match_shadow;
        }
        return '';
    }

    function createWaitingSocketWhite() {
        console.log("createWaitingSW");
        fetch(Server.url + `/match/multiplayer`, {
            mode: 'cors',
            credentials: 'include',
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                acceptAny: true
            })
        }).then((response) => {
            if (response.ok)
                return response.json();
        }).then((json) => {
            if (Object.keys(json).length !== 0) {
                connectWaitingSocketWhite(json.match_shadow);
            }
        });
    }

    function connectWaitingSocketWhite(shadow) {
        let socketWaiting = waitingPlayerSocket(shadow);
        socketWaiting.connect();
        socketWaiting.emit('whiteJoin', 'WHITE');
        socketWaiting.on('gameStart', (fen, nameWhite, nameBlack) => {
            //Se sei il bianco
            console.log("connectWaitSW");
            setPlayerName(nameWhite);
            setOpponentName(nameBlack)
            match.setStartingPos(fen);

            match.playerTimer.resume();
            match.opponentTimer.pause();

            connectSocket(shadow, true);
            socketWaiting.close();
        });
    }

    function createWaitingSocketBlack(match_shadow) {
        match.setColor('b');
        let socketWaiting = waitingPlayerSocket(match_shadow);
        socketWaiting.connect();
        socketWaiting.emit('blackJoin', 'BLACK');

        socketWaiting.on('GO_AWAY', () => {
            window.location.reload();
        });
        socketWaiting.on('gameStart', (fen, nameWhite, nameBlack) => {
            //Se sei il nero
            console.log("createWaitingSB");
            match.setWhite(false);
            setPlayerName(nameBlack);
            setOpponentName(nameWhite);
            match.setStartingPos(fen);

            match.playerTimer.pause();
            match.opponentTimer.resume();

            connectSocket(match_shadow, false);
            socketWaiting.close();
        });
    }

    function connectSocket(shadow, playWhite = true) {
        setOpponentConnected(true);
        let socket2 = socket(shadow, 0, playWhite);
        socket2.connect();
        socket1.current = socket2;
        timeLastMoveMilliseconds.current = Date.now();

        // eseguito quando l'avversario fa la mossa
        socket2.on('opponentMove', m => {
            if (playWhite === false)
                match.setWhiteHasPlayed(true);
            console.log("connectSocket");

            const currentTimeMilliseconds = Date.now();
            timeOpponent.current = timeOpponent.current - (currentTimeMilliseconds - timeLastMoveMilliseconds.current) / 1000;
            timeLastMoveMilliseconds.current = currentTimeMilliseconds;

            let newTimeDatePlayer = new Date();
            newTimeDatePlayer.setSeconds(timePlayer.current + newTimeDatePlayer.getSeconds());

            let newTimeDateOpponent = new Date();
            newTimeDateOpponent.setSeconds(timeOpponent.current + newTimeDateOpponent.getSeconds());

            match.playerTimer.pause();
            match.playerTimer.restart(newTimeDatePlayer);
            match.opponentTimer.pause();

            const move = getMove(m);
            move.promotion = "q";
            match.game.move(move);

            forceUpdate();
        });

        socket2.on('OPPONENT_LEAVES', () => {
            alert('L\'avversario ha lasciato la stanza.');
            window.location.href = "./";
        });
    }

    function rematch() {
        window.location.reload(false);
    }

    async function resign() {
        socket1.current.emit('playerResign', "");
        setTimeout(() => {
            window.location.href = "./";
        }, 1500);
    }

    async function playerHasRunOutOfTime() {
        console.log("player fineshed time")
        socket1.current.emit('playerResign', "");
        match.setTimeOut(1);
    }

    function opponentHasRunOutOfTime() {
        console.log("opponent fineshed time")
        socket1.current.emit('opponentTimeout', "");
        match.setTimeOut(-1);
    }

    useEffect(() => {
        match.game.load(match.startingPos);
        forceUpdate();
    }, [match.startingPos]);

    useEffect(() => {
        match.game.clear();
        match.playerTimer.pause();
        match.opponentTimer.pause();

        const fetchdata = (async () => {
            black_match_shadow = await getMatchShadowRandomStarted();
            if (black_match_shadow === '') {
                Game.playAsWhite = true;
                createWaitingSocketWhite();
            } else {
                Game.playAsWhite = false;
                createWaitingSocketBlack(black_match_shadow);
                match.white = false;
                match.setColor('b');
            }
        })
        fetchdata();
    }, [])

    useEffect(() => {
        if (match.game.isGameOver()) {
            match.playerTimer.pause();
            match.opponentTimer.pause();
        }
    }, [playerTimerSeconds, opponentTimerSeconds]);


    return (
        <>
            {!opponentConnected ? (
                <WaitingWindow resign={Game.resign} />
            ) : (
                <div className="md:grid md:grid-cols-3 md:h-screen w-screen md:w-100">
                    <div className="md:col-span-2 w-full md:max-h-screen">
                        <h1 className="H1 mt-8 mx-auto text-center">Multi Player game</h1>
                        <div
                            className={`mx-auto my-4 md:my-8 p-2 w-full md:w-[60vh] ${!Game.isPlayerTurn() || Game.isGameOver? 'pointer-events-none' : ''}`}>
                            <Gameboard game={Game.game} setGame={Game.setGame} player={Game.player}
                                       opponent={Game.opponent} playAsWhite={black_match_shadow === ''}
                                       isPlayerTurn={Game.isPlayerTurn}
                                       undo={Game.undo} isGameOver={() => (match.game.isGameOver() || match.timeout !== 0)} canUndo={Game.canUndo}
                                       isFirstMove={Game.isFirstMove}
                                       timeout={Game?.timeout} reset={Game.reset} rematch={Game?.rematch}
                                       mode={"multiplayer"} rotation={Game.rotation}
                            />
                        </div>
                    </div>
                    <div className="mt-4 md:m-0 md:col-span-1 bg-secondary md:pl-4 flex flex-col">
                        <GameSideBar game={Game.game} playAsWhite={Game.playAsWhite} player={Game.player.username} resign={Game.resign}
                                     opponent={Game.opponent.username} mode={'multiplayer'} pause={Game.pause} isGameOver={match.game.isGameOver() || match.timeout !==0} />
                    </div>
                </div>
            )}
        </>
    );
}