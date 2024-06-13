const express = require('express');
const apiDriver = express();
const matchDriver = require('./matchDriver');
const userDriver = require('./userDriver');

apiDriver.use('/match', matchDriver);
apiDriver.use('/user', userDriver);


module.exports = apiDriver;
