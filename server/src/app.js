const express = require('express');
const morgan = require('morgan');  // used to show logs
const cors = require('cors');
const path = require('path');
const app = express();

// Import
const api = require('./routes/api');

// Middlewares
app.use(cors({origin: "http://localhost:3000"}));  // Cross Origin Resource Sharing 
app.use(morgan('combined'));    // used to show the logs
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/v1',api);

// Routes 
app.get('/*', (req,res) =>{
    res.sendFile(path.join(__dirname,'..','public','index.html'));
});

module.exports = app;