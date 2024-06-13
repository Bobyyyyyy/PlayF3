import Server from "../misc/Server.js";
import SERVER from "../misc/Server.js";

function getUsernameFromSession () {
    return sessionStorage.getItem("username");
}

function setUsernameInSession(name) {
    sessionStorage.clear();
    sessionStorage.setItem("username", name);
}

function clearSession() {
    sessionStorage.clear();
}

function setIdInSession(id) {
    sessionStorage.setItem("id", id);
}

function getIdFromSession () {
    return sessionStorage.getItem("id");
}

async function getRank() {
    let res = await fetch(Server.url + "/user/ranked/rank",{
        mode: 'cors',
        credentials: 'include'
    })
    return await res.json();
}

async function getEloById(id) {
    let res = await fetch(Server.url + `/user/${id}`, {
        mode: 'cors',
        credentials: 'include'
    })
    return await res.json()
}

async function getAttemptsById(id) {
    let res = await fetch(Server.url + `/user/${id}/attempts`,{
        mode: 'cors',
        credentials: 'include'
    })
    return await res.json();
}

async function getResultsById(id) {
    let res = await fetch(Server.url + `/user/${id}/results`,{
        mode: 'cors',
        credentials: 'include'
    })
    return await res.json();
}

async function isGamePaused(type) {
    let res = await fetch(Server.url + `/match/pausedGame/${type}`,{
        mode: 'cors',
        credentials: 'include'
    })
    let gamePosition = null;
    if (res.status !== 404) {
        gamePosition = await res.json()
        gamePosition = gamePosition.start_situation;
    }
    return gamePosition;
}

function getDay() {
    let today = new Date();
    // Get the day of the month
    let dd = today.getDate();
    // Get the month (adding 1 because months are zero-based)
    let mm = today.getMonth() + 1;
    // Get the year
    let yyyy = today.getFullYear();
    // Add leading zero if the day is less than 10
    if (dd < 10) {
        dd = '0' + dd;
    }
    // Add leading zero if the month is less than 10
    if (mm < 10) {
        mm = '0' + mm;
    }
    // Format the date as mm-dd-yyyy and log it
    today = yyyy + '-' + mm + '-' + dd;
    return today;
}

async function getPeriodicalUsers(type){
    try {
        const dayFormatted = getDay();
        let response = await fetch(SERVER.url + `/match/${type}/leaderboard/${dayFormatted}`, {
            mode: 'cors',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            }
        });
        if (response.ok) {
            let usersRes = await response.json();
            return usersRes.leaderboard.sort((a, b) => (a.min_moves - b.min_moves));
        }
    }
    catch (e) {
        console.log(`errore get ${type} users leaderboard:`, e);
    }
}

async function getBoardConfig (type){
    try {
        let response = await fetch(SERVER.url + `/match/${type}/config`,{
            mode: 'cors',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            }});
        if (response.ok) {
            let res = await response.json();
            return res.start_situation;
        }
    }
    catch (e) {
        console.log(`errore get ${type} confing:`, e);
    }
}

export {
    getUsernameFromSession,
    setUsernameInSession,
    clearSession,
    setIdInSession,
    getIdFromSession,
    getRank,
    getEloById,
    getAttemptsById,
    getResultsById,
    isGamePaused,
    getDay,
    getPeriodicalUsers,
    getBoardConfig
}