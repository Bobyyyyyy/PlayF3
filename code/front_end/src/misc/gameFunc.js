import { Chess } from "chess.js";
import { useState } from "react";
import { useLocation } from "react-router-dom";


export function useSinglePlayerMatch() {
    //stati del gioco
    const [game, setGame] = useState(new Chess());
    const [timeout, setTimeOut] = useState(0);
    const [moved, setMoved] = useState(false);
    const [canUndo, setCanUndo] = useState(1);
    const [startingPos, setStartingPos] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    const white = true;

    const isGameOver = timeout !== 0 || (moved && game.isGameOver());
    const isPlayerTurn = () => game._turn === (white ? 'w' : 'b');


    return {
        game, setGame,
        timeout, setTimeOut,
        moved, setMoved,
        canUndo, setCanUndo,
        startingPos, setStartingPos,
        white,
        isGameOver, isPlayerTurn,
    }
}

export function useMultiPlayerMatch() {
    //stati del gioco
    const [game, setGame] = useState(new Chess());
    const [timeout, setTimeOut] = useState(0);
    const [moved, setMoved] = useState(false);
    const [canUndo, setCanUndo] = useState(1);
    const [startingPos, setStartingPos] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const [whiteHasPlayed, setWhiteHasPlayed] = useState(false);

    const [color, setColor] = useState('w');
    //parametri della partita 

    const diff = 50;
    const [white, setWhite] = useState(true);
    const isGameOver = timeout !== 0 || (moved && game.isGameOver());
    const isPlayerTurn = () => game._turn === color;

    return {
        game, setGame,
        timeout, setTimeOut,
        moved, setMoved,
        canUndo, setCanUndo,
        startingPos, setStartingPos,
        diff, 
        white, setWhite,
        isGameOver, isPlayerTurn,
        whiteHasPlayed, setWhiteHasPlayed,
        color, setColor,
    }
}

export function useDailyMatch() {
    //stati del gioco
    const [game, setGame] = useState(new Chess());
    const [moved, setMoved] = useState(false);
    const [canUndo, setCanUndo] = useState(1);
    const [startingPos, setStartingPos] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    //parametri della partita 
    const location = useLocation();
    const diff = 10;
    const white = true;
    console.log(location.state.mode)
    const mode = location.state.mode ? location.state.mode : 'daily'


    const isGameOver = (moved && game.isGameOver());
    const isPlayerTurn = () => game._turn === (white ? 'w' : 'b');

    return {
        game, setGame,
        moved, setMoved,
        canUndo, setCanUndo,
        startingPos, setStartingPos,
        diff, white, mode,
        isGameOver, isPlayerTurn,
    }
}

export function useTrainingMatch() {
    //stati del gioco
    const [game, setGame] = useState(new Chess());
    const [timeout, setTimeOut] = useState(0);
    const [moved, setMoved] = useState(false);
    const [startingPos, setStartingPos] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const [canUndo, setCanUndo] = useState(1);

    //parametri della partita 
    const location = useLocation();
    const diff = location.state.diff ? location.state.diff : 50;
    const diffBot = location.state.diffBot ? location.state.diffBot : 0;
    const white = location.state.white ? location.state.white : true;
    const time = location.state.time ? location.state.time : 600;

    const isGameOver = timeout !== 0 || (moved && game.isGameOver());
    const isPlayerTurn = () => game._turn === (white ? 'w' : 'b');

    return {
        game, setGame,
        timeout, setTimeOut,
        moved, setMoved,
        canUndo, setCanUndo,
        startingPos, setStartingPos,
        diff, white, diffBot,
        isGameOver, isPlayerTurn,
        time
    }
}

export function useLocalMatch() {
    //stati del gioco
    const [game, setGame] = useState(new Chess());
    const [timeout, setTimeOut] = useState(0);
    const [moved, setMoved] = useState(false);
    const [startingPos, setStartingPos] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const [canUndo, setCanUndo] = useState(1);
    const [rotation, setRotation] = useState(true);

    //parametri della partita 
    const location = useLocation();
    const diff = location.state?.diff ? location.state?.diff : 50;
    const white = true;
    const time = location.state.time ? location.state.time : 600;

    const isGameOver = timeout !== 0 || (moved && game.isGameOver());
    const isPlayerTurn = () => game._turn === (white ? 'w' : 'b');

    return {
        game, setGame,
        timeout, setTimeOut,
        moved, setMoved,
        canUndo, setCanUndo,
        rotation, setRotation,
        startingPos, setStartingPos,
        diff, white,
        isGameOver, isPlayerTurn,
        time
    }
}


////////


export function getMove(m) {
    return { from: Object.keys(m)[0].toLowerCase(), to: m[Object.keys(m)[0]].toLowerCase() };
}