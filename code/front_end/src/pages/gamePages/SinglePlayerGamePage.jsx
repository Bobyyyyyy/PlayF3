import React, { useEffect, useState, useCallback } from "react";
import { useSinglePlayerMatch } from '../../misc/gameFunc.js';
import { MatchSocket } from "../../misc/socketFunc.js";
import GamePage from "./GamePage.jsx";


export default function SinglePlayerGamePage() {
    let match = useSinglePlayerMatch();    // ritorna un ogg. con var e funz necessari per la partita
    let socket = MatchSocket(match, 'singleplayer');         // ritorna un ogg. con var e funz necessari per la connesione ai socket

    match.player = {
        move: () => playerMove(),
        username: "player",
    }
    match.opponent = {
        move: () => opponentMove(),
        username: "computer",
    }

    //force update
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);


    useEffect(() => {
        const fetchdata = (async () => {
            await socket.createSocket(match);
            socket.setConnected(true)
        })
        fetchdata();
        match.game.clear();
    }, [])

    useEffect(() => {
        match.game.load(match.startingPos);
        forceUpdate();
    }, [match.startingPos])


    function playerMove() {

        if (!match.moved) {
            match.setMoved(true);
        }
        if (match.game.fen() === '' || socket.socket1 === null || typeof socket.socket1 === 'undefined')
            return;
        if (match.game.fen() !== socket.lastSend)
            socket.socket1.emit('playerMove', match.game.fen());
        socket.setLastSend(match.game.fen());
        match.setCanUndo(u => {
            if (u === 0) return 1;
            else if (u === 1) return 2;
            else if (u === 2) return 2
        });
    }
    function opponentMove() {
        setTimeout(() => {          // delay se no è troppo OP
            socket.socket1.emit('opponentMoveRequest', match.game.fen());
        }, 1000)
    }


    function rematch() {
        window.location.reload();
    }

    function undo() {
        if (match.canUndo === 2 && match.isPlayerTurn()) {
            match.setCanUndo(0);
            match.game.undo();
            match.game.undo();
        }
    }
    async function resign() {
        socket.socket1.emit('playerResign', "");
        setTimeout(() => {
            window.location.href = "./";
        }, 500);
    }

    function pauseGame() {
        socket.socket1.emit('pause', match.game.pgn());
        setTimeout(() => {
            window.location.href = "./";
        }, 1000)
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
        canUndo: match.canUndo,
        pause: pauseGame,
        undo: undo,
        rematch: rematch,
        resign: resign,
    }


    if (!socket.connected)
        return (
            <div>connecting</div>
        )
    else
        return (
            <GamePage Game={Game} mode={"singlePlayer"} />
        )
}

