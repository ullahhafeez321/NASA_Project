const express = require('express');
const api = express.Router();

planetsRouter = require('./planets/planets.router');
launchesRouter = require('./launches/launches.router');

api.use('/launches',launchesRouter);
api.use('/planets',planetsRouter);

module.exports = api;