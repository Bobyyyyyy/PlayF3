import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : `http://${window.location.hostname}:5080`;

export function socket(match_shadow, aiPower = 0, playWithWhite = true) {
    return io(URL, {
        query: {
            match_shadow: match_shadow,
            aiPower: aiPower,
            playWithWhite: playWithWhite
        },
        autoConnect: false,
        transports: ["websocket"]
    });
}

export function waitingPlayerSocket(match_shadow) {
    return io(URL, {
        query: {match_shadow: match_shadow, waiting: 1},
        autoConnect: false,
        transports: ["websocket"]
    });
}
