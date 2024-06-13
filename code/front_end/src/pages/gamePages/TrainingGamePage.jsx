import React, { useEffect } from "react";
import { useTimer } from 'react-timer-hook';
import { useTrainingMatch } from '../../misc/gameFunc.js';
import { MatchSocket } from "../../misc/socketFunc.js";
import GamePage from "./GamePage.jsx";


export default function TrainingGamePage() {
    let match = useTrainingMatch();    // ritorna un ogg. con var e funz necessari per la partita
    let socket = MatchSocket(match, 'training');         // ritorna un ogg. con var e funz necessari per la connesione ai socket

    //stati per i timer
    const t = new Date();
    t.setSeconds(t.getSeconds() + match.time);
    const expiryTimestamp = t;
    const {
        seconds: playerTimerSeconds,
        minutes: playerTimerMinutes,
        start: playerTimerStart,
        pause: playerTimerPause,
        resume: playerTimerResume,
        restart: playerTimerRestart,
    } = useTimer({ expiryTimestamp, onExpire: () => playerTimeout() });
    const {
        seconds: opponentTimerSeconds,
        minutes: opponentTimerMinutes,
        start: opponentTimerStart,
        pause: opponentTimerPause,
        resume: opponentTimerResume,
        restart: opponentTimerRestart,
    } = useTimer({ expiryTimestamp, onExpire: () => opponentTimeout() });

    match.playerTimer = {
        start: playerTimerStart,
        pause: playerTimerPause,
        resume: playerTimerResume,
        restart: playerTimerRestart,
    }
    match.opponentTimer = {
        start: opponentTimerStart,
        pause: opponentTimerPause,
        resume: opponentTimerResume,
        restart: opponentTimerRestart,
    }
    match.player = {
        move: () => playerMove(),
        time: {
            seconds: playerTimerSeconds,
            minutes: playerTimerMinutes
        },
        startTimer: playerTimerStart,
        username: "player",
    }
    match.opponent = {
        move: () => opponentMove(),
        time: {
            seconds: opponentTimerSeconds,
            minutes: opponentTimerMinutes,
        },
        username: "computer (" + match.diff + ")",
    }

    //force update
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);


    useEffect(() => {
        const fetchdata = (async () => {
            await socket.createSocket(match);
            socket.setConnected(true)
        })
        fetchdata();

        match.game.clear();
        playerTimerPause();
        opponentTimerPause();

    }, [])

    useEffect(() => {
        match.game.load(match.startingPos);
        forceUpdate();
    }, [match.startingPos])

    useEffect(() => {
        if (match.game.isGameOver()) {
            playerTimerPause();
            opponentTimerPause();
        }
    }, [playerTimerSeconds, opponentTimerSeconds]);

    function playerMove() {
        playerTimerPause();
        if (!match.moved) {
            match.setMoved(true);
        }
        if (match.game.fen() === '' || socket.socket1 === null || typeof socket.socket1 === 'undefined')
            return;
        if (match.game.fen() !== socket.lastSend)
            socket.socket1.emit('playerMove', match.game.fen(), { minutes: playerTimerMinutes, seconds: playerTimerSeconds });
        socket.setLastSend(match.game.fen());
        match.setCanUndo(u => {
            if (u === 0) return 1;
            else if (u === 1) return 2;
            else if (u === 2) return 2
        });
        opponentTimerResume();
    }
    function opponentMove() {
        setTimeout(() => {          // delay se no è troppo OP
            opponentTimerPause();
            socket.socket1.emit('opponentMoveRequest', match.game.fen(), { minutes: opponentTimerMinutes, seconds: opponentTimerSeconds });
            playerTimerResume();
        }, 1000);
    }


    function rematch() {
        window.location.reload(false);
    }
    function reset() {
        match.game.load(match.startingPos);

        const t = new Date();
        t.setSeconds(t.getSeconds() + match.time);
        playerTimerRestart(t);
        opponentTimerRestart(t);
        match.white ? opponentTimerPause() : playerTimerPause();
    }
    function undo() {
        match.game.undo();
        match.game.undo();
    }
    function resign() {
        window.location.href = "./";
    }
    async function playerTimeout() {
        socket.socket1.emit('playerResign', "");
        match.setTimeOut(1);
    }
    function opponentTimeout() {
        socket.socket1.emit('opponentTimeout', "");
        match.setTimeOut(-1);
    }

    const Game = {
        game: match.game,
        setGame: match.setGame,
        player: match.player,
        opponent: match.opponent,
        playAsWhite: match.white,
        isFirstMove: !match.moved,
        isPlayerTurn: match.isPlayerTurn,
        isGameOver: match.isGameOver,
        canUndo: true,
        timeout: match.timeout,
        undo: undo,
        rematch: rematch,
        reset: reset,
        resign: resign,
    }


    if (!socket.connected)
        return (
            <div>connecting</div>
        )
    else
        return (
            <GamePage Game={Game} mode={"training"} />
        )
}