const express = require('express');
const userDriver = express();
const UserController = require('../controllers/UserController');
const MatchController = require('../controllers/MatchController');
let controller = new UserController();
let matchController = new MatchController();
const UserDto = require("../dto/UserDto");

userDriver.post('/', async function (req, res) {
    if (typeof req.body === 'undefined' || typeof req.body.user === 'undefined') {
        res.status(400).send('Bad Request');
    } else {
        let input = req.body.user;
        let credentials = new UserDto();
        credentials.name = input.name;
        credentials.password = input.password;

        let controllerOutput = await controller.createUser(credentials);

        if (controllerOutput.code === 200)
            res.status(200).send(controllerOutput.content);
        else
            res.status(controllerOutput.code).send(controllerOutput);
    }

});

userDriver.get('/authenticatedUser', (req, res) => {
    if (req.session.authenticated) {
        res.status(200).send({user: req.session.user.name});
    } else {
        res.status(200).send({});
    }
});

userDriver.get('/ranked/rank', async function (req, res) {
      if (typeof req.session.authenticated === 'undefined') {
          res.status(400).send('Bad Request');
          return;
      }

    let userID = (typeof req.session.user !== 'undefined' ? parseInt(req.session.user.id) : NaN);
    let controllerOutput = await matchController.getPlayerRank(userID);
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
});


userDriver.get('/:id', async function (req, res) {
    let id = req.params.id;
    let controllerOutput = await controller.getUserByID(id);
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
});


userDriver.post('/login', async function (req, res) {
    if (typeof req.body === 'undefined' || typeof req.body.user === 'undefined') {
        res.status(400).send('Bad Request');
    } else {
        let input = req.body.user;
        let credentials = new UserDto();
        credentials.name = input.name;
        credentials.password = input.password;

        let controllerOutput = await controller.AuthenticateUser(credentials);

        if (controllerOutput.code === 200) {
            req.session.authenticated = true;
            req.session.user = controllerOutput.content;
            req.session.save();
            controllerOutput.content.session_id = req.session.id;
            res.status(200).send(controllerOutput.content);
        } else
            res.status(controllerOutput.code).send(controllerOutput);
    }
})

userDriver.post('/logout', (req, res) => {
    if (req.session.authenticated) {
        req.session.destroy();
        res.status(200).send('Logout effettuato')
    } else {
        res.status(400).send('You are not logged in');
    }
});


userDriver.get('/:id/attempts',async (req,res) => {
    let userID = parseInt(req.params.id);
    let controllerOutput = await matchController.getUserAttempts(userID);
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);
});

userDriver.get('/:id/results',async(req,res) => {
    let userID = parseInt(req.params.id);
    let controllerOutput = await matchController.getUserResults(userID);
    if (controllerOutput.code === 200)
        res.status(200).send(controllerOutput.content);
    else
        res.status(controllerOutput.code).send(controllerOutput);


})

module.exports = userDriver;