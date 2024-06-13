import React, { useEffect, useState, useCallback } from "react";
import { useTimer } from 'react-timer-hook';
import { useLocalMatch } from '../../misc/gameFunc.js';
import GamePage from "./GamePage.jsx";
import Server from "../../misc/Server.js";


export default function LocalGamePage() {
    let match = useLocalMatch();    // ritorna un ogg. con var e funz necessari per la partita

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
        username: "player1",
        white: true,
        time: {
            seconds: playerTimerSeconds,
            minutes: playerTimerMinutes
        }
    }
    match.opponent = {
        move: () => playerMove(),
        username: "player2",
        white: false,
        time: {
            seconds: opponentTimerSeconds,
            minutes: opponentTimerMinutes
        }
    }


    //force update
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);


    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(Server.url + `/match/startingPosition/${match.diff}`, {
                mode: 'cors',
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                }
            })
            const r = await res.json();
            match.setStartingPos(r.situation);
        }
        fetchData();

        playerTimerPause();
        opponentTimerPause();

    }, []);

    useEffect(() => {
        match.game.load(match.startingPos);
        forceUpdate();
    }, [match.startingPos]);

    useEffect(() => {
        if (match.game.isGameOver()) {
            playerTimerPause();
            opponentTimerPause();
        }
    }, [playerTimerSeconds, opponentTimerSeconds]);

    function playerMove() {
        match.isPlayerTurn() ? opponentTimerPause() : playerTimerPause();

        if (!match.moved) {
            match.setMoved(true);
        }
        if (match.game.fen() === '')
            return;

        match.setCanUndo(u => {
            if (u === 0) return 1;
            else if (u === 1) return 2;
            else if (u === 2) return 2
        });

        match.isPlayerTurn() ? playerTimerResume() : opponentTimerResume();

        forceUpdate();
    }

    function rematch() {
        window.location.reload(false);
    }
    function reset() {
        match.game.load(match.startingPos);
        forceUpdate();

        const t = new Date();
        t.setSeconds(t.getSeconds() + match.time);
        playerTimerRestart(t);
        opponentTimerRestart(t);
        opponentTimerPause();
        playerTimerPause();
    }
    function undo() {
        match.isPlayerTurn() ? playerTimerPause() : opponentTimerPause();
        match.game.undo();
        match.isPlayerTurn() ? playerTimerResume() : opponentTimerResume();
        forceUpdate();
    }
    function resign() {
        window.location.href = "./";
    }

    async function playerTimeout() {
        match.setTimeOut(1);
    }
    function opponentTimeout() {
        match.setTimeOut(-1);
    }

    const Game = {
        game: match.game,
        setGame: match.setGame,
        player: match.player,
        opponent: match.opponent,
        playAsWhite: match.white,
        rotation: match.rotation,
        setRotation: match.setRotation,
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


    return (
        <GamePage Game={Game} mode={"local"} />
    )
}