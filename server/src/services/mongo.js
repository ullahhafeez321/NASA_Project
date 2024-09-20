const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;

// checking the connectivity of the mongo database
mongoose.connection.once('open', ()=> console.log('MongoDB is connected'));
mongoose.connection.on('error',(err)=> console.error('mongoose connection error',err));

async function MongoConnect(){
    await mongoose.connect(MONGO_URL);
}

async function MongoDisconnect(){
    await mongoose.disconnect();
}

module.exports = {
    MongoConnect,
    MongoDisconnect
}