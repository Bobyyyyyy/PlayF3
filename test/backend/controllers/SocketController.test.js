import {describe, expect, test, beforeAll, afterAll, beforeEach} from "@jest/globals";
const app = require("../../../code/back_end/index")
import session from "supertest-session";
const { createServer } = require("node:http");
const { Server } = require('socket.io');
import { io } from 'socket.io-client';
const config = require("../../../code/back_end/config/playf3");
const SocketController = require("../../../code/back_end/controllers/SocketController");
const MatchController = require("../../../code/back_end/controllers/MatchController")
const UserController = require('../../../code/back_end/controllers/UserController');
const MatchModel = require("../../../code/back_end/models/MatchModel")
const TestModel = require("../TestModel");
const UserDto = require("../../../code/back_end/dto/UserDto");

const TM = new TestModel();
const UC = new UserController();
const MM = new MatchModel();
const testSC =  new SocketController();

const user1 = {
    name: 'user_socketIO_1',
    password: '1234',
}

const user2 = {
    name: 'user_socketIO_2',
    password: '1234',
}

const URL = `http://localhost:5080`;

function socket(match_shadow, playWithWhite = true){
    return io(URL, {
        query: {
            match_shadow: match_shadow,
            aiPower: 0,
            playWithWhite: playWithWhite
        },
        autoConnect: false,
        transports: ["websocket"]
    });
}

jest.mock('fs');

afterAll(() => app.close())

describe('Socket controller ', () => {
    let clientSocket2 , authSession1, authSession2, session_id1, session_id2;
    let fenSituation = "nbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";

    let request;

    beforeAll(async () => {
        request = session(app.backEndRouter);

        await UC.createUser(new UserDto(user1));
        await UC.createUser(new UserDto(user2));

        authSession1 = session(app.backEndRouter, {
            before: (req) => {
                req.set('mode', 'CORS');
                req.set('credentials', 'include')
            }
        });

        authSession2 = session(app.backEndRouter, {
            before: (req) => {
                req.set('mode', 'CORS');
                req.set('credentials', 'include')
            }
        });

        let res1 = await authSession1.post("/api/user/login").send({user: user1});
        let res2 = await authSession2.post("/api/user/login").send({user: user2});

        session_id1 = res1.body.session_id;
        session_id2 = res2.body.session_id;
    })

    afterAll(async () => {
        await TM.deleteUser(user1.name);
        await TM.deleteUser(user2.name);
    })

    describe('handle Player Resign', () => {
        let clientSocket1;
        test('valid socket - freeplay', async () => {
            request.post('/api/match').send({diff: 0}).end((err,res) => {
                expect(res.statusCode).toBe(200);
                clientSocket1 = socket(res.body.match_shadow,true);
                clientSocket1.connect();
                clientSocket1.on('connect', async () => {
                    expect(clientSocket1.connected).toBeTruthy();
                    let res = await testSC.handlePlayerResign(clientSocket1);
                    expect(res.code).not.toBe(200);
                })
                clientSocket1.on('connect_error', () => {
                    expect(clientSocket1.connected).toBeTruthy();     //FAIL
                })
            })
        })

        test('valid socket - match ended',  (done) => {
            let playWhite = true;
            authSession1.post('/api/match/singleplayer')
                .send({diff: 0, white: playWhite})
                .end((err,res) => {
                    expect(res.statusCode).toBe(200);
                    let match_id = (res.body.match_id);
                    clientSocket1 = socket(res.body.match_shadow,playWhite);
                    clientSocket1.connect();
                    clientSocket1.on('connect', async () => {
                        expect(clientSocket1.connected).toBeTruthy();
                        await MM.registerMove(match_id,1, 'pippo');
                        await MM.modifyStatus(match_id, config._MATCH_STATUS_ENDED);
                        let res = await testSC.handlePlayerResign(clientSocket1);
                        expect(res.code).not.toBe(200);
                        done();
                    })
                    clientSocket1.on('connect_error', () => {
                        expect(clientSocket1.connected).toBeTruthy();     //FAIL
                        done()
                    })
            })
        })

        test('valid socket - match not ended',  (done) => {
            let playWhite = true;
            authSession1.post('/api/match/singleplayer')
                .send({diff: 0, white: playWhite})
                .end((err,res) => {
                    expect(res.statusCode).toBe(200);
                    let match_id = (res.body.match_id);
                    clientSocket1 = socket(res.body.match_shadow,playWhite);
                    clientSocket1.connect();
                    clientSocket1.on('connect', async () => {
                        expect(clientSocket1.connected).toBeTruthy();
                        await testSC.handleMove(clientSocket1, 'pippo');
                        let res = await testSC.handlePlayerResign(clientSocket1);
                        expect(res).toBe(undefined);
                        done();
                    })
                    clientSocket1.on('connect_error', () => {
                        expect(clientSocket1.connected).toBeTruthy();     //FAIL
                        done()
                    })
                })
        }, 15000)
    })

    describe('handle Opponent Lose', () => {
        let clientSocket1;
        test('valid socket - freeplay', async () => {
            request.post('/api/match').send({diff: 0}).end((err,res) => {
                expect(res.statusCode).toBe(200);
                clientSocket1 = socket(res.body.match_shadow,true);
                clientSocket1.connect();
                clientSocket1.on('connect', async () => {
                    expect(clientSocket1.connected).toBeTruthy();
                    let res = await testSC.handleOpponentLose(clientSocket1);
                    expect(res.code).not.toBe(200);
                })
                clientSocket1.on('connect_error', () => {
                    expect(clientSocket1.connected).toBeTruthy();     //FAIL
                })
            })
        })

        test('valid socket - match ended',  (done) => {
            let playWhite = true;
            authSession1.post('/api/match/singleplayer')
                .send({diff: 0, white: playWhite})
                .end((err,res) => {
                    expect(res.statusCode).toBe(200);
                    let match_id = (res.body.match_id);
                    clientSocket1 = socket(res.body.match_shadow,playWhite);
                    clientSocket1.connect();
                    clientSocket1.on('connect', async () => {
                        expect(clientSocket1.connected).toBeTruthy();
                        await MM.registerMove(match_id,1, 'pippo');
                        await MM.modifyStatus(match_id, config._MATCH_STATUS_ENDED);
                        let res = await testSC.handleOpponentLose(clientSocket1);
                        expect(res.code).not.toBe(200);
                        done();
                    })
                    clientSocket1.on('connect_error', () => {
                        expect(clientSocket1.connected).toBeTruthy();     //FAIL
                        done()
                    })
                })
        })

        test('valid socket - match not ended',  (done) => {
            let playWhite = true;
            authSession1.post('/api/match/singleplayer')
                .send({diff: 0, white: playWhite})
                .end((err,res) => {
                    expect(res.statusCode).toBe(200);
                    let match_id = (res.body.match_id);
                    clientSocket1 = socket(res.body.match_shadow,playWhite);
                    clientSocket1.connect();
                    clientSocket1.on('connect', async () => {
                        expect(clientSocket1.connected).toBeTruthy();
                        await MM.registerMove(match_id,1, 'pippo');
                        let res = await testSC.handleOpponentLose(clientSocket1);
                        expect(res).toBe(undefined);
                        done();
                    })
                    clientSocket1.on('connect_error', () => {
                        expect(clientSocket1.connected).toBeTruthy();     //FAIL
                        done()
                    })
                })
        }, 10000)
    })

    describe('handle Match Draw', () => {
        let clientSocket1;
        test('valid socket - freeplay', async () => {
            request.post('/api/match').send({diff: 0}).end((err,res) => {
                expect(res.statusCode).toBe(200);
                clientSocket1 = socket(res.body.match_shadow,true);
                clientSocket1.connect();
                clientSocket1.on('connect', async () => {
                    expect(clientSocket1.connected).toBeTruthy();
                    let res = await testSC.handleMatchDraw(clientSocket1);
                    expect(res.code).not.toBe(200);
                })
                clientSocket1.on('connect_error', () => {
                    expect(clientSocket1.connected).toBeTruthy();     //FAIL
                })
            })
        })

        test('valid socket - match not ended',  (done) => {
            let playWhite = true;
            authSession1.post('/api/match/singleplayer')
                .send({diff: 0, white: playWhite})
                .end((err,res) => {
                    expect(res.statusCode).toBe(200);
                    let match_id = (res.body.match_id);
                    clientSocket1 = socket(res.body.match_shadow,playWhite);
                    clientSocket1.connect();
                    clientSocket1.on('connect', async () => {
                        expect(clientSocket1.connected).toBeTruthy();
                        await MM.registerMove(match_id,1, 'pippo');
                        let res = await testSC.handleMatchDraw(clientSocket1);
                        expect(res).toBe(undefined);
                        done();
                    })
                    clientSocket1.on('connect_error', () => {
                        expect(clientSocket1.connected).toBeTruthy();     //FAIL
                        done()
                    })
                })
        }, 10000)
    })

    describe('handle Player lose', () => {
        let clientSocket1;
        test('valid socket - freeplay', async () => {
            request.post('/api/match').send({diff: 0}).end((err,res) => {
                expect(res.statusCode).toBe(200);
                let match_shadow = res.body.match_shadow;
                clientSocket1 = socket(res.body.match_shadow,true);
                clientSocket1.connect();
                clientSocket1.on('connect', async () => {
                    expect(clientSocket1.connected).toBeTruthy();
                    let res = await testSC.handlePlayerLose(true, match_shadow);
                    expect(res.code).not.toBe(200);
                })
                clientSocket1.on('connect_error', () => {
                    expect(clientSocket1.connected).toBeTruthy();     //FAIL
                })
            })
        })

        test('valid socket - match not ended',  (done) => {
            let playWhite = true;
            authSession1.post('/api/match/singleplayer')
                .send({diff: 0, white: playWhite})
                .end((err,res) => {
                    expect(res.statusCode).toBe(200);
                    let match_shadow = res.body.match_shadow;
                    let match_id = (res.body.match_id);
                    clientSocket1 = socket(match_shadow,playWhite);
                    clientSocket1.connect();
                    clientSocket1.on('connect', async () => {
                        expect(clientSocket1.connected).toBeTruthy();
                        await MM.registerMove(match_id,1, 'pippo');
                        let res = await testSC.handlePlayerLose(true, match_shadow);
                        expect(res).toBe(undefined);
                        done();
                    })
                    clientSocket1.on('connect_error', () => {
                        expect(clientSocket1.connected).toBeTruthy();     //FAIL
                        done()
                    })
                })
        }, 10000)
    })

    describe('pause game', () => {
        let clientSocket1;
        test('valid socket - match not ended',  (done) => {
            let playWhite = true;
            authSession1.post('/api/match/singleplayer')
                .send({diff: 0, white: playWhite})
                .end((err,res) => {
                    expect(res.statusCode).toBe(200);
                    let match_id = (res.body.match_id);
                    clientSocket1 = socket(res.body.match_shadow,playWhite);
                    clientSocket1.connect();
                    clientSocket1.on('connect', async () => {
                        expect(clientSocket1.connected).toBeTruthy();
                        await MM.registerMove(match_id,1, 'pippo');
                        let res = await testSC.pauseGame(clientSocket1, null);
                        console.log(res);
                        expect(res.code).toBe(200);
                        done();
                    })
                    clientSocket1.on('connect_error', () => {
                        expect(clientSocket1.connected).toBeTruthy();     //FAIL
                        done()
                    })
                })
        }, 10000)
    })

    test("AI move", () => {
        let res = testSC.getAiMove(fenSituation)
        expect(res).not.toEqual('');
    })
    test('check fen', () => {
        let res = testSC.checkFenPosition(fenSituation);
        expect(res.finished).toBeFalsy();
    })

    test('random position', () => {
        expect(testSC.getRandomPosition()).not.toBe(null);
        expect(testSC.getRandomPosition(20)).not.toBe(null);
    })

    describe('convert move to fen', () => {
        let startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        let fenE4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR';
        test('valid moves', async () => {
            let move = {'E2': 'E4'}
            let res = testSC.convertMoveToFen(startFen, move);
            expect(res.split(' ')[0]).toEqual(fenE4);
        })
        test('valid moves', async () => {
            let move = {'E2': 'E4'}
            let res = testSC.convertMoveToFen(startFen, {});
            expect(res).toEqual('');
        })
    })
})