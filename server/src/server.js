const http = require('http');
const app = require('./app');

require('dotenv').config();

const { MongoConnect } = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

async function startServer(){
    await MongoConnect();
    await loadPlanetsData();
    await loadLaunchesData();

    server.listen(PORT,()=> console.log(`Server is Listening on Port ${PORT}`));
}

startServer();
