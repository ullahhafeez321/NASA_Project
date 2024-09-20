const {getAllLaunches , scheduledLaunch, abortLaunchById, existLaunchWithId } = require('../../models/launches.model');
const {getPaginated} = require('../../services/query'); 

async function httpGetAllLaunches(req,res){
    const { skip , limit } = getPaginated(req.query);
    return res.status(200).json(await getAllLaunches(skip,limit));
}

// the request from body is adding in model 
async function httpAddNewLaunch(req,res){
    const launch = req.body;

    // Validation 
    if(!launch.mission || !launch.rocket ||  !launch.launchDate || !launch.target){
        return res.status(400).json({
            error: 'launch property is missing'
        });
    }

    launch.launchDate =  new Date(launch.launchDate);
    
    if(isNaN(launch.launchDate)){
        return res.status(400).json({
            error: 'Invalid Date'
        });
    }

    await scheduledLaunch(launch); 
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req,res){
    const launchId = +req.params.id;
    
    const existLaunch = await existLaunchWithId(launchId);
    // if launch doesnt exist
    if(!existLaunch){
        return res.status(404).json({
            error: 'Launch Id Does not Exist'
        })
    }
    // if launch exist
    const aborted = await abortLaunchById(launchId);
    if (!aborted){
        return res.status(400).json({error : 'launch is not aborted'});
    }
    return res.status(200).json({ ok : true});
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
}