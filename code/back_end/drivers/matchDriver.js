const express = require('express');
const matchDriver = express();
const MatchController = require('../controllers/MatchController');
const config = require('../config/playf3')
let matchController = new MatchController();

matchDriver.post('/', async function (req, res) {
    //TRAINING MATCH

    let imbalance = (typeof req.body.diff !== 'undefined' ? parseInt(req.body.diff) : NaN);
    let playWhite = (typeof req.body.white !== 'undefined' ? req.body.white : true);
    if (playWhite)
        playWhite = true;
    else
        playWhite = false;

    let controllerOutput = await matchController.insertTrainingMatch(imbalance, playWhite);
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
});

matchDriver.post('/daily', async function (req, res) {

    if(typeof req.session.authenticated === 'undefined') {
       res.status(400).send('Bad Request');
        return;
    }

    if(typeof req.session.user === 'undefined'){
        res.status(400).send('Bad Request');
        return;
    }


    let userID = (typeof req.session.user !== 'undefined' ? parseInt(req.session.user.id) : NaN);
    let checkPausedOutput = await matchController.checkForPausedGame(config._MATCH_TYPE_DAILY,userID);
    if(checkPausedOutput.code === 200) {
        res.status(200).send(checkPausedOutput.content);
        return;
    }
    let controllerOutput = await matchController.createDailyMatchAttempt(userID);
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
});

matchDriver.get('/daily/config', async function (req, res) {
    //DAILY MATCH
    let controllerOutput = await matchController.getDailyMatch();
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
});

matchDriver.get('/weekly/config', async function (req, res) {
    let controllerOutput = await matchController.getWeeklyMatch();
    if(controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
});

matchDriver.post('/singleplayer', async function (req, res) {

    let imbalance = (typeof req.body.diff !== 'undefined' ? parseInt(req.body.diff) : NaN);
    let white = (typeof req.body.white !== 'undefined' ? req.body.white : null);

    let userID;
    if (typeof req.session.authenticated === 'undefined' || typeof req.session.user === 'undefined')
        userID = -1;
    else
        userID = parseInt(req.session.user.id);


    let checkPausedOutput = await matchController.checkForPausedGame(config._MATCH_TYPE_SINGLE,userID);
    if(checkPausedOutput.code === 200) {
        res.status(200).send(checkPausedOutput.content);
        return;
    }

    let controllerOutput = await matchController.insertSinglePlayerMatch(imbalance, white, userID);
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
});

matchDriver.post('/multiplayer', async function (req, res) {
    if (typeof req.session.authenticated === 'undefined' || typeof req.session.user === 'undefined') {
        res.status(400).send('Bad Request');
        return;
    }

    let userID = parseInt(req.session.user.id);
    let acceptAny = (req.body.acceptAny ? req.body.acceptAny : false)

    if(acceptAny !== true)
        acceptAny = false;

    let controllerOutput = await matchController.insertMultiPlayerMatch(userID, acceptAny);
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
});


matchDriver.get('/multiplayer/random', async function (req, res) {
    if (typeof req.session.authenticated === 'undefined' || typeof req.session.user === 'undefined') {
        res.status(400).send('Bad Request');
        return;
    }

    let controllerOutput = await matchController.getMultiPlayerRandomMatch();
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
});


matchDriver.get('/:id', async function (req, res) {
    let id = req.params.id;
    let controllerOutput = await matchController.getSingleMatch(id);
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
});


matchDriver.get('/daily/leaderboard/:day',async function (req,res) {
    let day = req.params.day;
    let controllerOutput = await matchController.getDailyLeaderboard(day);
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
})

matchDriver.get('/weekly/leaderboard/:day',async function (req,res) {
    let day = req.params.day;
    let controllerOutput = await matchController.getWeeklyLeaderboard(day);
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
})

matchDriver.get('/startingPosition/:diff',async function (req,res) {
    let diff = req.params.diff
    let controllerOutput = await matchController.returnFen(parseInt(diff));
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
})


matchDriver.post('/weekly', async function (req,res){

    if (typeof req.session.authenticated === 'undefined') {
        res.status(400).send('Bad Request');
        return;
    }


    let userID = (typeof req.session.user !== 'undefined' ? parseInt(req.session.user.id) : NaN);

    let checkPausedOutput = await matchController.checkForPausedGame(config._MATCH_TYPE_WEEKLY,userID);
    if(checkPausedOutput.code === 200) {
        res.status(200).send(checkPausedOutput.content);
        return;
    }

    let controllerOutput = await matchController.createWeeklyMatchAttempt(userID);
    if(controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
});

matchDriver.get('/pausedGame/:type',async function (req,res) {
    if (typeof req.session.authenticated === 'undefined') {
        res.status(400).send('Bad Request');
        return;
    }
    let userID = (typeof req.session.user !== 'undefined' ? parseInt(req.session.user.id) : NaN);
    let type = req.params.type;
    let controllerOutput = await matchController.checkForPausedGame(type.trim(),userID);
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
})


matchDriver.get('/ranked/leaderboard',async function (req,res){
    let controllerOutput = await matchController.getRankedLeaderboard();
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
})

module.exports = matchDriver;
