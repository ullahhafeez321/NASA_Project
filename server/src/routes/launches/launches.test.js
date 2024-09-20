const request = require('supertest');
const app = require('../../app');
const { MongoConnect, MongoDisconnect } = require('../../services/mongo');
const { loadPlanetsData } = require('../../models/planets.model');

// API testing/ Integration testing using jest package 

describe("API Test for Launches", ()=>{
    beforeAll(async () => {
        await MongoConnect();
        await loadPlanetsData();
    });

    afterAll(async ()=>{
        await MongoDisconnect();
    });

    describe("Test Get Request", ()=>{
        test("check response is success", async function (){
            const response =  await request(app).get('/v1/launches').expect(200).expect('Content-Type',/json/);
        })
    });
    
    describe("Test Post Requests", ()=>{
        const completeData = {
            mission: "Kepler Exploration",
            rocket: "Explorer IS1",
            launchDate: '27 December, 2026',
            target: 'Kepler-62 f',
        };
    
        const dataWithoutDate = {
            mission: "Kepler Exploration",
            rocket: "Explorer IS1",
            target: 'Kepler-62 f',
        }
    
    
    
        test("check response with statusCode 201 created", async()=>{
            const response = await request(app).post('/v1/launches').send(completeData).expect(201).expect("Content-Type",/json/);
    
            // for the date 
            const requestDate = new Date(completeData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
    
            // for expecting the same output in response
            expect(response.body).toMatchObject(dataWithoutDate);
        });
    
        test("check error if launch property is missing", async()=>{
            const response = await request(app).post('/v1/launches').send(dataWithoutDate).expect(400).expect("Content-Type",/json/);
            expect(response.body).toStrictEqual({ error: 'launch property is missing'});
        });
    
        test("check error if launchdate is invalid", async()=>{
            const response = await request(app).post('/v1/launches').send({
                mission: "Kepler Exploration",
                rocket: "Explorer IS1",
                launchDate: 'hello',
                target: 'Kepler-62 f',
            }).expect(400).expect("Content-Type",/json/);
    
            expect(response.body).toStrictEqual({error: 'Invalid Date'});
        });
    
    })
})

