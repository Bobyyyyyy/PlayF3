const randomStartingPosition = require("../../../code/back_end/utils/randomPosition")

const request = require('supertest');
const app = require('../../../code/back_end/index');
const TestModel = require("../TestModel");
const UserModel = require('../../../code/back_end/models/UserModel');
const MatchModel = require("../../../code/back_end/models/MatchModel");
const UserDto = require('../../../code/back_end/dto/UserDto');
import {describe, afterAll, test, expect, beforeEach, beforeAll} from '@jest/globals'
const TM = new TestModel();
const UM = new UserModel();
const MM = new MatchModel();
require('dotenv').config();

const user_noSession = {
    name: "endpoint_test_noSession",
    password: "1234"
}

const today = new Date().toJSON().slice(0,10);

jest.mock('fs');

afterAll(() => app.close())

describe('API - no session', () => {

    describe('/api/user', () => {
        afterAll(async () => {
            await TM.deleteUser(user_noSession.name);
        })

        describe('POST /user', () => {
            const endpoint = "/api/user";
            test('should create user', async () => {
                await request(app.backEndRouter)
                    .post(endpoint)
                    .send({user: user_noSession})
                    .expect(200)
            })
            test('body undefined', async () => {
                await request(app.backEndRouter)
                    .post(endpoint)
                    .send({undefined})
                    .expect(400)
            })
            test('user undefined', async () => {
                await request(app.backEndRouter)
                    .post(endpoint)
                    .send({user: undefined})
                    .expect(400)
            })
            test('extreme case - number as user', async () => {
                let res = await request(app.backEndRouter)
                    .post(endpoint)
                    .send({user: 10})
                expect(res).not.toBe(200)
            })
        })

        describe(' POST /login', () => {
            const endpoint = "/api/user/login";
            test('body undefined', async () => {
                await request(app.backEndRouter)
                    .post(endpoint)
                    .send({undefined})
                    .expect(400)
            })
            test('user undefined', async () => {
                await request(app.backEndRouter)
                    .post(endpoint)
                    .send({user: undefined})
                    .expect(400)
            })
            test('right credentials', async () => {
                await request(app.backEndRouter)
                    .post(endpoint)
                    .send({user:user_noSession})
                    .expect(200)
            })
            test('wrong credentials', async () => {
                let res = await request(app.backEndRouter)
                    .post(endpoint)
                    .send({user: {
                            name:user_noSession.name,
                            password: 'wrong_password'
                        }})
                expect(res).not.toBe(200);
            })
        })

        describe('GET /authenticatedUser', () => {
            const endpoint = "/api/user/authenticatedUser";

            test("session not active", async () => {
                let res = await request(app.backEndRouter)
                    .get(endpoint)
                    .expect(200)

                expect(res.body).toEqual({})
            })
        })

        describe('POST /logout', () => {
            const endpoint = "/api/user/logout";

            test('not logged', async () => {
                await request(app.backEndRouter)
                    .post(endpoint)
                    .send({})
                    .expect(400)
            })
        })

        describe('/:id', () => {
            let id;

            let user_get_info = new UserDto();
            user_get_info.name = 'user_info'
            user_get_info.password = 'hashed_password'

            afterAll(async() =>{
                await TM.deleteUser('user_info');
            } )

            beforeAll(async () => {
                id = await UM.insertUser(user_get_info);
            })
            const endpoint = "/api/user/"

            describe('GET', () => {
                test('valid id', async () => {
                    await request(app.backEndRouter)
                        .get(`${endpoint}${id}`)
                        .expect(200)
                })
                test('invalid id', async () => {
                    const res = await request(app.backEndRouter).get(`${endpoint}-1`)
                    expect(res.statusCode).not.toBe(200);
                })

            })

            describe('GET /attempts', () => {

                test('valid user id', async () => {
                    let res = await request(app.backEndRouter).get(`${endpoint}${id}/attempts`).expect(200);
                })
                test('invalid user id', async () => {
                    let res = await request(app.backEndRouter).get(`${endpoint}pippo/attempts`);
                    expect(res.body.code).not.toBe(200);
                })
            })

            describe('GET /results', () => {

                test('valid user id', async () => {
                    await request(app.backEndRouter).get(`${endpoint}${id}/results`).expect(200);
                })
                test('invalid user id', async () => {
                    let res = await request(app.backEndRouter).get(`${endpoint}pippo/results`);
                    expect(res.body.code).not.toBe(200);
                })
            })

        })
    })

    describe('/api/match', () => {

        describe('POST /', () => {
            const endpoint = "/api/match"
            test('body Undefined', async () => {
                const res = request(app.backEndRouter).post(endpoint)
                    .send(undefined)
                expect(res).not.toBe(200);
            })
            test('white - imbalance Nan', async() => {
                const res = await request(app.backEndRouter).post(endpoint)
                    .send({diff: 'pippo', white: true})
                expect(res.statusCode).not.toBe(200);
            })

            test('white - imbalance 0', async() => {
                const res = await request(app.backEndRouter).post(endpoint)
                    .send({diff: 0})
                expect(res.statusCode).toBe(200);
                expect(res.body.match_id).not.toBeNaN();
                await TM.deleteMatch(res.match_id);
            })
            test('black - imbalance 0', async() => {
                const res = await request(app.backEndRouter).post(endpoint)
                    .send({diff: 0, white: false})
                expect(res.statusCode).toBe(200);
                expect(res.body.match_id).not.toBeNaN();
                await TM.deleteMatch(res.match_id);
            })
            test('black - imbalance nan', async() => {
                const res = await request(app.backEndRouter).post(endpoint)
                    .send({white: false})
                expect(res.statusCode).not.toBe(200);
            })
        })

        test('GET /daily/config', async () => {
            const res = await request(app.backEndRouter).get("/api/match/daily/config")
            expect(res.statusCode).toBe(200);
        })
        test('GET /weekly/config', async () => {
            const res = await request(app.backEndRouter).get("/api/match/weekly/config");

            expect(res.statusCode).toBe(200);
        })

        describe('GET /daily/leaderboard', () => {
            const endpoint = '/api/match/daily/leaderboard'
            test('valid day', async () => {
                let res = await request(app.backEndRouter).get(`${endpoint}/${today}`);
                expect(res.statusCode).toBe(200);
            })

            test('invalid day', async () => {
                let res = await request(app.backEndRouter).get(`${endpoint}/${-1}`);
                expect(res.statusCode).not.toBe(200);
            })
        })

        describe('GET /weekly/leaderboard', () => {
            const endpoint = '/api/match/weekly/leaderboard'
            test('valid day', async () => {
                let res = await request(app.backEndRouter).get(`${endpoint}/${today}`);
                expect(res.statusCode).toBe(200);
            })

            test('invalid day', async () => {
                let res = await request(app.backEndRouter).get(`${endpoint}/pippo`);
                expect(res.statusCode).not.toBe(200);
            })
        })

        test('GET /ranked/leaderboard', async () => {
            let res = await request(app.backEndRouter).get("/api/match/ranked/leaderboard");
            expect(res.statusCode).toBe(200);
        })


        test('GET /startingPosition/',async () => {
            let res = await request(app.backEndRouter).get(`/api/match/startingPosition/0`);
            expect(res.statusCode).toBe(200);
        })

        describe('GET /:id', () => {
            const endpoint = "/api/match"
            let matchID;
            beforeAll(async ()=> {
                matchID = (await request(app.backEndRouter).post("/api/match").send({diff: 0})).body.match_id;
            })

            afterAll(async () => {
                await TM.deleteMatch(matchID);
            })

            test('existing match - no moves', async () => {
                const res = await request(app.backEndRouter).get(`${endpoint}/${matchID}`)
                expect(res.statusCode).not.toBe(200);
            })

            test('existing match - moves', async () => {
                await MM.registerMove(matchID,0,randomStartingPosition(0,true));
                const res = await request(app.backEndRouter).get(`${endpoint}/${matchID}`);
                expect(res.statusCode).toBe(200);
                expect(res.body.situtations).not.toBe(null);
            })

            test('not existing match', async () => {
                const res = await request(app.backEndRouter).get(endpoint + '-1')
                expect(res.statusCode).not.toBe(200);
            })
        })


    })
})
