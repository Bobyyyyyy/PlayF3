import { useState, useCallback } from "react";
import { socket } from "./socket.js";
import Server from './Server.js';
import { getMove } from './gameFunc.js';
import {getIdFromSession, getRank} from "../util/utils.js";


export function MatchSocket(match, mode) {
    //stati per i socket
    const [socket1, setSocket1] = useState(socket(""));
    const [connected, setConnected] = useState(false);
    const [lastSend, setLastSend] = useState("");

    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);


    function connectSocket(shadow, playWhite = true) {
        let socket2 = socket(shadow, 0, playWhite);
        socket2.connect();
        setSocket1(socket2);
        socket2.on('opponentMove', m => {
            if (playWhite === false)
                setWhiteHasPlayed(true);
            let move = getMove(m);
            move.promotion = "q";
            //console.log("move ai:",move,"m",m)
            match.game.move(move);
            forceUpdate();
        });
    }

    async function createSinglePlayerSocket(match) {
        let diff = 0;
        if (!!getIdFromSession()) { //se l'utente è loggato allora lo sbilanciamento dipende dal rank
            const rank = await getRank();
            diff = (parseInt(rank.elo) > 100) ? 100 : parseInt(rank.elo);
        }
        fetch(Server.url + `/match/singleplayer`, {
            mode: 'cors',
            method: 'POST',
            body: JSON.stringify({
                diff: diff,
                white: match.white,
                time: match.time
            }),
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            if (response.ok)
                return response.json();
        }).then((json) => {
            if (Object.keys(json).length !== 0) {
                connectSocket(json.match_shadow);
                match.setStartingPos(json.start_situation);
                //match.setStartingPos("b1pr4/1b1nkn2/4n3/3b2r1/N6P/6q1/5K2/B5P1 w - - 0 14"); // quasi checkmate per testing
                //match.setStartingPos("8/6K1/1P1P1P1P/8/8/p1p1p1p1/3k4/8 w - - 0 1"); // quasi promozione per testing

                //match.white ? match.playerTimer.resume() : match.opponentTimer.resume();
            }
        });
    }
    async function createPeriodicalSocket(match) {
        fetch(Server.url + `/match/${match.mode}`, {
            mode: 'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            if (response.ok)
                return response.json();
            if (response.status === 400) {
                alert(`Hai terminato il numero di tentativi della ${match.mode}, aspetta ${match.mode === "daily" ? "mezzanotte" : "la fine della settimana"} per giocare ancora`);
                window.location.replace("/home");
            }
        }).then((json) => {
            if (Object.keys(json).length !== 0) {
                connectSocket(json.match_shadow);
                match.setStartingPos(json.start_situation);
                //match.white ? match.playerTimer?.resume() : match.opponentTimer.resume();
            }
        });
    }


    async function createTrainingSocket(match) {
        fetch(Server.url + `/match`, {
            mode: 'cors',
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({
                diff: match.diff,
                white: match.white
            }),
        }).then((response) => {
            if (response.ok)
                return response.json();
        }).then((json) => {
            if (Object.keys(json).length !== 0) {
                connectSocket(json.match_shadow, match.diffBot);
                match.setStartingPos(json.start_situation);
            }
        });
    }

    const modeSocket = mode === 'daily' ? createPeriodicalSocket : createTrainingSocket;

    return {
        socket1, setSocket1,
        connected, setConnected,
        lastSend, setLastSend,
        createSocket: mode === 'singleplayer' ? createSinglePlayerSocket : modeSocket,
    }
}

export function MatchSocketMultiplayer(match, mode) {
    //stati per i socket
    const [socket1, setSocket1] = useState(socket(""));
    const [connected, setConnected] = useState(false);
    const [lastSend, setLastSend] = useState("");

    return {
        socket1, setSocket1,
        connected, setConnected,
        lastSend, setLastSend,
        createSocket: createMultiPlayerSocket,
    }
}
