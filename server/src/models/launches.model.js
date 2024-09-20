const launchesDb = require('./launches.mongo');
const planetsDb = require('./planet.mongo');
const { loadPlanetsData } = require('./planets.model');
const axios = require('axios');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
  console.log('Downloading launch data...');
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1
          }
        },
        {
          path: 'payloads',
          select: {
            'customers': 1
          }
        }
      ]
    }
  });

  if (response.status !== 200) {
    console.log('Problem downloading launch data');
    throw new Error('Launch data download failed');
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);

    await saveLaunches(launch);
  }
}




async function loadLaunchesData() {
    const firstLaunch = await findLaunch({
      flightNumber: 1,
      rocket: 'Falcon 1',
      mission: 'FalconSat',
    });
    if (firstLaunch) {
      console.log('Launch data already loaded!');
    } else {
      await populateLaunches();
    }
  }


async function saveLaunches(launch) {
    await launchesDb.findOneAndUpdate(
        { flightNumber: launch.flightNumber },
        { $set: launch }, // Use $set to ensure all fields are updated
        { upsert: true, new: true } // Ensure you return the updated document
    );
};

async function getLatestFlightNumber(){
    const latestLaunch = await launchesDb.findOne().sort('-flightNumber');

    if (!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
};


async function getAllLaunches(skip,limit){
    return await launchesDb.find({}, {'_id': 0, '__v': 0}).sort({ flightNumber: 1}).skip(skip).limit(limit);
};


async function scheduledLaunch(launch){
    const planet = await planetsDb.findOne({ kepler_name: launch.target });

    if (!planet) {
        throw new Error('No matching planet found');
    }

    const latestFlightNum = await getLatestFlightNumber()+1;
    const newLaunch = Object.assign(launch,{
        flightNumber: latestFlightNum,
        upcoming: true,
        success: true,
        customers: ["Zero to Mastery","NASA"],
    });

    await saveLaunches(newLaunch);
};

async function findLaunch(filter){
    return await launchesDb.findOne(filter);
}


async function existLaunchWithId(launchId){
    return await findLaunch({ flightNumber: launchId,});
};

async function abortLaunchById(launchId){
   const aborted = await launchesDb.updateOne({
        flightNumber: launchId,},{
            upcoming: false,
            success: false,
        });

        return aborted.modifiedCount === 1;
};

module.exports = {
    getAllLaunches,
    scheduledLaunch,
    loadLaunchesData,
    abortLaunchById,
    existLaunchWithId
}