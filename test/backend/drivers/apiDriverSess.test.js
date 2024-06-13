import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, test} from "@jest/globals";
const app = require('../../../code/back_end/index');
import session from "supertest-session";
import request from "supertest";

const config = require("../../../code/back_end/config/playf3")
const TestModel = require("../TestModel");
const MatchModel = require("../../../code/back_end/models/MatchModel")
const UserController = require("../../../code/back_end/controllers/UserController")
const MatchController = require("../../../code/back_end/controllers/MatchController")
const UserDto = require("../../../code/back_end/dto/UserDto");
const UC = new UserController();
const TM = new TestModel();
const MM = new MatchModel();
const MC = new MatchController();

jest.mock('fs');

const today = new Date().toJSON().slice(0,10);

const user_session = {
    name: "endpoint_test_session",
    password: "1234"
}

const user_not_auth = {
    name:"user_not_auth",
    password: "1234"
}


afterAll(async () => {
    app.close()
})


describe("API - session", () => {

    let notAuthSession;
    let authSession;
    let session_id;
    let authUserId;

    beforeAll(async () => {
        authSession = session(app.backEndRouter, {
            before: (req) => {
                req.set('mode', 'CORS');
                req.set('credentials', 'include')
            }
        });
        notAuthSession = session(app.backEndRouter);

        await UC.createUser(new UserDto(user_session));
        await UC.createUser(new UserDto(user_not_auth));

        let res = await authSession.post("/api/user/login")
            .send({user: user_session})
            .expect(200);

        authUserId = res.body.id

        session_id = res.body.session_id;
    })

    afterAll(async () => {
        await TM.deleteUser(user_session.name);
        await TM.deleteUser(user_not_auth.name);
    })

    test("GET /authenticatedUser",   async () => {
        let res = await authSession.get("/api/user/authenticatedUser")
            .set('Session.id', session_id)
            .expect(200)
        expect(res.body.user).toEqual(user_session.name);
    })

    describe('/api/user', () => {
        describe('GET /ranked/rank', () => {
            const endpoint = "/api/user/ranked/rank";
            test('not authenticated user', async () => {
                let res = await notAuthSession.get(endpoint);
                expect(res.statusCode).not.toBe(200);
            })

            test('authenticated user', async () => {
                let res = await authSession.get(endpoint);
                expect(res.statusCode).toBe(200);
            })
        })
    })

    describe('/api/match', () => {
        describe('POST /daily', () => {
            const endpoint = '/api/match/daily'
            test('not authenticated user', async () => {
                let res = await notAuthSession.post(endpoint);
                expect(res.statusCode).not.toBe(200);
            })
            test('authenticated user - no paused game', async () => {
                let res = await authSession.post(endpoint);
                expect(res.statusCode).toBe(200);
                await TM.deleteDailyResult(authUserId, res.body.match_id,today);
                await TM.deleteMatch( res.body.match_id);
            })
            test('authenticated user - paused game', async () => {
                let match_id_daily_paused = await MM.insertMatch(config._MATCH_TYPE_DAILY);
                let insertCompleted = await MM.insertDailyResult(authUserId,match_id_daily_paused, today);
                expect(insertCompleted).toBe(true)
                await MM.registerMove(match_id_daily_paused,1,'pippo');
                await MM.modifyStatus(match_id_daily_paused,config._MATCH_STATUS_PAUSED, null);

                let res = await authSession.post(endpoint);
                expect(res.statusCode).toBe(200);

                await TM.deleteDailyResult(authUserId, match_id_daily_paused, today);
                await TM.deleteMatchSituations(match_id_daily_paused);
                await TM.deleteMatch(match_id_daily_paused);
            })
        })

        describe('POST /singleplayer', () => {
            const endpoint = "/api/match/singleplayer"
            describe('not authenticated user', () => {
                test('body Undefined', async () => {
                    const res = request(app.backEndRouter).post(endpoint)
                        .send(undefined)
                    expect(res).not.toBe(200);
                })

                test('imbalance Nan', async() => {
                    const res = await request(app.backEndRouter).post(endpoint)
                        .send({diff: 'pippo'})
                    expect(res.statusCode).not.toBe(200);
                })

                test('imbalance not passed', async() => {
                    const res = await request(app.backEndRouter).post(endpoint)
                        .send({})
                    expect(res.statusCode).not.toBe(200);
                })
            })
            describe('authenticated user', () => {
                test('imbalance 0 - white true - NO paused', async () => {
                    let res = await authSession.post(endpoint)
                        .send({
                            diff: 0,
                            white: true
                        })
                    expect(res.statusCode).toBe(200);
                })
                test('imbalance 0 - white true - paused', async () => {
                    let match_id_single_paused = await MM.insertMatch(config._MATCH_TYPE_SINGLE);
                    await MM.trackPlayingGame(match_id_single_paused,authUserId, null);
                    await MM.registerMove(match_id_single_paused,1,'pippo');
                    await MM.modifyStatus(match_id_single_paused,config._MATCH_STATUS_PAUSED, null);


                    let res = await authSession.post(endpoint)
                        .send({
                            diff: 0,
                            white: true
                        })
                    expect(res.statusCode).toBe(200);

                    await TM.deleteMatchPlayedByUsers(match_id_single_paused);
                    await TM.deleteMatchSituations(match_id_single_paused);
                    await TM.deleteMatch(match_id_single_paused);
                })
            })

        })
        describe('POST /multiplayer', () => {
            const endpoint = "/api/match/multiplayer";
            test('not authenticated user', async () => {
                let res = await notAuthSession.post(endpoint)
                expect(res.statusCode).not.toBe(200);
            })
            test('authenticated user', async () => {
                let res = await authSession.post(endpoint)
                expect(res.statusCode).toBe(200)
            })
        })

        describe('POST /weekly', () => {
            const endpoint = "/api/match/weekly";
            test('not authenticated user', async () => {
                let res = await notAuthSession.post(endpoint)
                expect(res.statusCode).not.toBe(200);
            })

            test('authenticated user - no paused game', async () => {
                let res = await authSession.post(endpoint);
                expect(res.statusCode).toBe(200);
                await TM.deleteWeeklyResult(authUserId, res.body.match_id, MC.getStartOfWeek());
                await TM.deleteMatch(res.body.match_id);
            })

            test('authenticated user- paused game', async () => {
                let match_id_weekly_paused = await MM.insertMatch(config._MATCH_TYPE_WEEKLY);
                let insertCompleted = await MM.insertWeeklyResult(authUserId,match_id_weekly_paused, MC.getStartOfWeek());
                expect(insertCompleted).toBe(true)
                await MM.registerMove(match_id_weekly_paused,1,'pippo');
                await MM.modifyStatus(match_id_weekly_paused,config._MATCH_STATUS_PAUSED, null);

                let res = await authSession.post(endpoint);
                expect(res.statusCode).toBe(200)

                await TM.deleteWeeklyResult(authUserId, match_id_weekly_paused,MC.getStartOfWeek());
                await TM.deleteMatchSituations(match_id_weekly_paused);
                await TM.deleteMatch(match_id_weekly_paused);
            })
        })

        describe('GET /pausedGame/:type', () => {
            const endpoint = "/api/match/pausedGame";
            test('not authenticated user', async () => {
                let res = await notAuthSession.get(`${endpoint}/${config._MATCH_TYPE_SINGLE }`);
                expect(res.statusCode).not.toBe(200);
            })
            test('authenticated user - single type', async () => {
                let match_id_single_paused = await MM.insertMatch(config._MATCH_TYPE_SINGLE);
                await MM.trackPlayingGame(match_id_single_paused,authUserId, null);
                await MM.registerMove(match_id_single_paused,1,'pippo');
                await MM.modifyStatus(match_id_single_paused,config._MATCH_STATUS_PAUSED, null);

                let res = await authSession.get(`${endpoint}/${config._MATCH_TYPE_SINGLE}`);
                expect(res.statusCode).toBe(200);

                await TM.deleteMatchPlayedByUsers(match_id_single_paused);
                await TM.deleteMatchSituations(match_id_single_paused);
                await TM.deleteMatch(match_id_single_paused);
            })
        })
    })

    test("POST /logout",  async () => {
        const res = await authSession.post("/api/user/logout")
            .set('Session.id', session_id);
        expect(res.statusCode).toBe(200);
    })
})