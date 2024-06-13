import React, { useEffect, useState, useCallback } from "react";
import { useDailyMatch } from '../../misc/gameFunc.js';
import { MatchSocket } from "../../misc/socketFunc.js";
import GamePage from "./GamePage.jsx";


export default function PeriodicalGamePage() {
    let match = useDailyMatch();    // ritorna un ogg. con var e funz necessari per la partita
    let socket = MatchSocket(match, 'daily');         // ritorna un ogg. con var e funz necessari per la connesione ai socket

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
            try {
                await socket.createSocket(match);
                socket.setConnected(true)
            } catch (e) {
                console.log("errore", e.target);
                alert(e.target.values);
            }
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

    function pauseGame() {
        socket.socket1.emit('pause', match.game.pgn());
        setTimeout(() => {
            window.location.href = "./";
        }, 1000)
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
        resign: resign,
    }

    if (!socket.connected)
        return (
            <div>connecting</div>
        )
    else
        return (
            <GamePage Game={Game} mode={match.mode} />
        )
}

