const express = require('express');
const app = express();

const lab03App = require('../lab-03/server');
const lab01App = require('../lab-01/server');

// Mount Lab 1 under /lab-01 namespace
app.use('/lab-01', lab01App);

// Mount Lab 3 under /lab-03 namespace as well
app.use('/lab-03', lab03App);

// Main root application is Lab 3 (REST API, Query Parameters, SQLite)
app.use('/', lab03App);

module.exports = app;
