import {describe, beforeAll, afterAll, test, expect} from '@jest/globals'

const MatchController = require("../../../code/back_end/controllers/MatchController")
const UserController = require("../../../code/back_end/controllers/UserController")
const MatchModel = require("../../../code/back_end/models/MatchModel")
const UserModel = require("../../../code/back_end/models/UserModel")
const TestModel = require("../TestModel");

const config = require('../../../code/back_end/config/playf3');
const UserDto = require("../../../code/back_end/dto/UserDto");

let testModel = new TestModel();
let testMC = new MatchController();
let MM = new MatchModel();
let UM = new UserModel()
let UC = new UserController();

let startDayTest = () => {
    let date = new Date(1000000000);
    let diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).toJSON().slice(0,10);
}

let testWeeklyDay = startDayTest();

let matchID = 1;
let invalidMatchID = -1;

let userID = -1;
let invalidUserID = -1;

let stringID = 'extreme Test';
let imbalance = 0;

let credentialTest = new UserDto();
credentialTest.name = 'match_controller_user';
credentialTest.password = 'hashed_password';


describe("Match Controller Test",() => {

    beforeAll(async ()=> {
        matchID = await MM.insertMatch(config._MATCH_TYPE_SINGLE);

        await UC.createUser(credentialTest.clone());
        let user = await UC.getUserByName(credentialTest.name);
        userID = user.content.id;
    })

    afterAll(async ()=> {
        await testModel.deleteMatchSituations(matchID);
        await testModel.deleteMatch(matchID);

        await testModel.deleteUser(credentialTest.name);
    })

    describe('insert match', () => {
        describe('Training Match', () => {
            test('play white', async () =>{
                let res = await testMC.insertTrainingMatch(imbalance, true);
                expect(res.code).toBe(200);
                await testModel.deleteMatch(res.content.match_id);
            })
            test('play black', async () =>{
                let res = await testMC.insertTrainingMatch(imbalance, false);
                expect(res.code).toBe(200);
                await testModel.deleteMatch(res.content.match_id);
            })
            test('imbalance nan', async () => {
                let res = await testMC.insertTrainingMatch('pippo', true);
            })
        })
        describe('Multiplayer Match', () =>{
            test('valid user', async () =>{
                let res = await testMC.insertMultiPlayerMatch(userID);
                expect(res.code).toBe(200)
            })
            test('invalid user', async () =>{
                let res = await testMC.insertMultiPlayerMatch(-1);
                expect(res.code).not.toBe(200)
            })
        })
        describe('Singleplayer Match', () => {
            test('play white', async () =>{
                let res = await testMC.insertSinglePlayerMatch(imbalance, true, userID);
                expect(res.code).toBe(200);
                await testModel.deleteMatch(res.content.match_id);
            })
            test('play black', async () =>{
                let res = await testMC.insertSinglePlayerMatch(imbalance, false, userID);
                expect(res.code).toBe(200);
                await testModel.deleteMatch(res.content.match_id);
            })
            test('Imbalance Nan', async () =>{
                let res = await testMC.insertSinglePlayerMatch('pippo', false, userID);
                expect(res.code).not.toBe(200);
            })
            /*
            test('Invalid user', async () =>{
                let res = await testMC.insertSinglePlayerMatch(imbalance, false, -1);
                expect(res.code).not.toBe(200);
                //TODO: aggiungere controllo USERID nel controller
            })

             */
            test('playwhite not defined', async () => {
                let res = await testMC.insertSinglePlayerMatch(imbalance,null , -1);
                expect(res.code).not.toBe(200);
            })
        })

        test('daily match', async () => {
            let res = await testMC.insertDailyMatch();
            expect(res.code).toBe(200);
            await testModel.deleteMatch(res.content.match_id);
        })
        test('weekly match', async () => {
            let res = await testMC.insertWeeklyMatch();
            expect(res.code).toBe(200);
            await testModel.deleteMatch(res.content.match_id);
        })

        describe('generic match', () => {
            test('valid type', async () => {
                let res = await testMC.insertGenericMatch(config._MATCH_TYPE_SINGLE);
                expect(res.code).toBe(200);
                await testModel.deleteMatch(res.content.match_id);
            });
            test('invalid type', async () => {
                let res = await testMC.insertGenericMatch(-1);
                expect(res.code).not.toBe(200);
            });
        })
    })

    /* _______________________ DAILY MATCH __________________________________________________*/

    describe('daily Match', () => {
        describe('create attempt', () => {
            test('not existing user', async () => {
                let res = await testMC.createDailyMatchAttempt(invalidUserID);
                expect(res.code).not.toBe(200);
                expect(res['sub_code']).toBe(1);
            })

            test('existing user', async () => {
                let res = await testMC.createDailyMatchAttempt(userID);
                console.log(res)
                expect(res.code).toBe(200);
                await testModel.deleteDailyResult(userID,res.content.match_id,testMC.getCurrentDay());
                await testModel.deleteMatch(res.content.match_id);
            })
        })
        describe('Daily Result', () => {
            //user id already checked
            test('valid match id - valid day', async () => {
                let res = await testMC.insertDailyResult(userID,matchID,testMC.getCurrentDay());
                expect(res.code).toBe(200);
                await testModel.deleteDailyResult(userID,matchID,testMC.getCurrentDay());

            })
            test('invalid match id - valid day', async () => {
                let res = await testMC.insertDailyResult(userID,invalidMatchID,testMC.getCurrentDay());
                expect(res.code).not.toBe(200);
            })
            test('valid match id - invalid day', async () => {
                let res = await testMC.insertDailyResult(userID,matchID,'-1');
                expect(res.code).not.toBe(200);
            })
            test('invalid match id - invalid day', async () => {
                let res = await testMC.insertDailyResult(userID,invalidMatchID,'-1');
                expect(res.code).not.toBe(200);
            })

            test('too many attempts', async () => {
                let attempts_match_id = [];
                for(let i = 0; i < config._DAILY_ATTEMPTS_MAX; i++){
                    let tmp_match_id = await MM.insertMatch(config._MATCH_TYPE_DAILY);
                    await MM.modifyStatus(tmp_match_id,config._MATCH_STATUS_ENDED,null)
                    let res = await testMC.insertDailyResult(userID,tmp_match_id,testMC.getCurrentDay());
                    expect(res.code).toBe(200);
                    attempts_match_id.push(tmp_match_id);
                }

                let res = await testMC.createDailyMatchAttempt(userID);
                expect(res.code).not.toBe(200);
                expect(res.sub_code).toEqual(2);

                for (const attemptsMatchIdElement of attempts_match_id) {
                    await testModel.deleteDailyResult(userID,attemptsMatchIdElement, testMC.getCurrentDay());
                    await testModel.deleteMatch(attemptsMatchIdElement);
                }
            }, 15000)

            describe('leaderboard', () => {
                describe('get', () => {
                    test('valid day', async() => {
                        let res = await testMC.getDailyLeaderboard(testMC.getCurrentDay());
                        expect(res.code).toBe(200);
                    })
                    test('invalid day', async() => {
                        let res = await testMC.getDailyLeaderboard('pippo');
                        expect(res.code).not.toBe(200);
                    })
                })
                test('get daily match ', async () => {
                    let res = await testMC.getDailyMatch();
                    expect(res.code).toBe(200);
                })
            })
        })
    })
    /* _______________________ WEEKLY MATCH __________________________________________________*/
    describe('weekly match', () => {
        describe('attempt', () => {
            test('not existing user', async () => {
                let res = await testMC.createWeeklyMatchAttempt(invalidUserID);
                expect(res.code).not.toBe(200);
                expect(res['sub_code']).toBe(1);
            })

            test('existing user', async () => {
                let res = await testMC.createWeeklyMatchAttempt(userID);
                expect(res.code).toBe(200);

                await testModel.deleteWeeklyResult(userID,res.content.match_id,testMC.getStartOfWeek(null));
                await testModel.deleteMatch(res.content.match_id);
            })
        })
        describe('weekly Result', () => {

            test('valid match id - valid day', async () => {
                let res = await testMC.insertWeeklyResult(userID,matchID,testMC.getStartOfWeek(null));
                expect(res.code).toBe(200);
                await testModel.deleteWeeklyResult(userID,matchID,testMC.getStartOfWeek(null));

            })
            test('invalid match id - valid day', async () => {
                let res = await testMC.insertWeeklyResult(userID,invalidMatchID,testMC.getStartOfWeek(null));
                expect(res.code).not.toBe(200);
            })
            test('valid match id - invalid day', async () => {
                let res = await testMC.insertWeeklyResult(userID,matchID,'-1');
                expect(res.code).not.toBe(200);
            })
            test('invalid match id - invalid day', async () => {
                let res = await testMC.insertWeeklyResult(userID,invalidMatchID,'-1');
                expect(res.code).not.toBe(200);
            })

            test('too many attempts', async () => {
                let attempts_match_id = [];
                for(let i = 0; i < config._WEEKLY_ATTEMPTS_MAX; i++){
                    let tmp_match_id = await MM.insertMatch(config._MATCH_TYPE_WEEKLY);
                    attempts_match_id.push(tmp_match_id);
                    await MM.modifyStatus(tmp_match_id,config._MATCH_STATUS_ENDED,null)
                    let res = await testMC.insertWeeklyResult(userID,tmp_match_id,testMC.getStartOfWeek(null));
                    expect(res.code).toBe(200);
                }

                let res = await testMC.createWeeklyMatchAttempt(userID);
                expect(res.code).not.toBe(200);
                expect(res.sub_code).toEqual(2);

                for (const attemptsMatchIdElement of attempts_match_id) {
                    await testModel.deleteWeeklyResult(userID,attemptsMatchIdElement, testMC.getStartOfWeek(null));
                    await testModel.deleteMatch(attemptsMatchIdElement);
                }
            }, 10000)
            describe('leaderboard', () => {
                describe('get', () => {
                    test('valid day', async() => {
                        let res = await testMC.getWeeklyLeaderboard(testMC.getStartOfWeek(null));
                        expect(res.code).toBe(200);
                    })

                    test('invalid day - syntax', async() => {
                        let res = await testMC.getWeeklyLeaderboard('pippo');
                        expect(res.code).not.toBe(200);
                    })
                })
                test('get weekly match ', async () => {
                    let res = await testMC.getWeeklyMatch();
                    expect(res.code).toBe(200);
                })

                test('get weekly match - not inserted Before ', async () => {
                    let res = await testMC.getWeeklyMatch(testWeeklyDay);
                    expect(res.code).toBe(200);
                    await testModel.deleteWeeklySituation(testWeeklyDay);
                })
            })
        })
    })

/*________________________________________________________________________________________________*/
    describe("update match status ", () => {

        describe('use valid ID', () => {
            test('matchID - match not started', async () => {
                let res = await testMC.updateMatchStatus(matchID,config._MATCH_STATUS_NOT_STARTED);
                expect(res.code).toBe(200);
            })

            test('matchID - match is playing', async () => {
                let res = await testMC.updateMatchStatus(matchID,config._MATCH_STATUS_PLAYING);
                expect(res.code).toBe(200);
            })

            test('matchID - match ended', async () => {
                let res = await testMC.updateMatchStatus(matchID,config._MATCH_STATUS_ENDED);
                expect(res.code).toBe(200);
            })

            test('matchID - match ended from pause', async () => {
                let matchtest = await MM.insertMatch(config._MATCH_TYPE_SINGLE)
                await testMC.updateMatchStatus(matchtest,config._MATCH_STATUS_PAUSED);
                let res = await testMC.updateMatchStatus(matchtest,config._MATCH_STATUS_ENDED);
                expect(res.code).toBe(200);
                await testModel.deleteMatch(matchtest);
            })
        })

        describe('use an invalid ID',() => {
            test('invalidID - match not started', async () => {
                let res = await testMC.updateMatchStatus(invalidMatchID,config._MATCH_STATUS_NOT_STARTED);
                expect(res.code).not.toBe(200);
            })

            test('invalidID - match is playing', async () => {
                let res = await testMC.updateMatchStatus(invalidMatchID,config._MATCH_STATUS_PLAYING);
                expect(res.code).not.toBe(200);
            })

            test('invalidID - match ended', async () => {
                let res = await testMC.updateMatchStatus(invalidMatchID,config._MATCH_STATUS_ENDED);
                expect(res.code).not.toBe(200);
            })
        })

        describe('use string as ID', () => {
            test('stringID - match not started', async () => {
                let res = await testMC.updateMatchStatus(stringID,config._MATCH_STATUS_NOT_STARTED);
                expect(res.code).not.toBe(200);
            })

            test('stringID - match is playing', async () => {
                let res = await testMC.updateMatchStatus(stringID,config._MATCH_STATUS_PLAYING);
                expect(res.code).not.toBe(200);
            })

            test('stringID - match ended', async () => {
                let res = await testMC.updateMatchStatus(stringID,config._MATCH_STATUS_ENDED);
                expect(res.code).not.toBe(200);
            })
        })

        describe('invalid status', () => {
            test('matchID - invalid status', async () => {
                let res = await testMC.updateMatchStatus(matchID,-1);
                expect(res.code).not.toBe(200);
            })

            test('invalidID - invalid status', async () => {
                let res = await testMC.updateMatchStatus(invalidMatchID,-1);
                expect(res.code).not.toBe(200);
            })

            test('stringID - invalid status', async () => {
                let res = await testMC.updateMatchStatus(stringID,-1);
                expect(res.code).not.toBe(200);
            })
        })
    })

    describe('check Match ID test', () => {
        test('valid ID', async () => {
            let res = await testMC.checkMatchID(matchID);
            expect(res.code).toBe(200);
        })
        test('invalid ID', async () => {
            let res = await testMC.checkMatchID(invalidMatchID);
            expect(res.code).toBe(400);
        })
    })

    describe('add move in DB', () => {
        let fenSituation = "nbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
        test('invalid ID', async () => {
            let res = await testMC.addMove(invalidMatchID, fenSituation);
            expect(res.code).toBe(404);
        })

        test('valid ID', async () => {
            let res = await testMC.addMove(matchID, fenSituation);
            expect(res.code).toBe(200);
        })
    })

    describe('get Single Match', () => {
        test('invalid ID', async () => {
            let res = await testMC.getSingleMatch(invalidMatchID);
            expect(res.code).not.toBe(200);
        })

        test('valid ID', async () => {
            let res = await testMC.getSingleMatch(matchID);
            expect(res.code).toBe(200);
        })
    })

    describe('return fen', () => {
        test('diff invalid', async () => {
            let res = await testMC.returnFen('pippo')
            expect(res.code).toBe(200);
        })
        test('diff != 0 ', async () => {
            let res = await testMC.returnFen(10)
            expect(res.code).toBe(200);
        })
    })


    describe('update Won status', () => {
        const MatchDto = require('../../../code/back_end/dto/MatchDto');


        describe('Single', () => {

            test('no user associated', async () => {
                let matchDTO_single_noUser = new MatchDto()

                matchDTO_single_noUser.id = await MM.insertMatch(config._MATCH_TYPE_SINGLE);
                matchDTO_single_noUser.status = config._MATCH_STATUS_ENDED;
                matchDTO_single_noUser.type = config._MATCH_TYPE_SINGLE;


                let res = await testMC.updateWonStatus(matchDTO_single_noUser, true, false);

                expect(res.code).not.toBe(200);

                await testModel.deleteMatch(matchDTO_single_noUser.id);
            })

            test('white won - user valid', async () => {

                let matchDTO_single = new MatchDto()

                matchDTO_single.id = await MM.insertMatch(config._MATCH_TYPE_SINGLE);
                matchDTO_single.status = config._MATCH_STATUS_ENDED;
                matchDTO_single.type = config._MATCH_TYPE_SINGLE;

                await MM.trackPlayingGame(matchDTO_single.id,userID);

                let res = await testMC.updateWonStatus(matchDTO_single, true, false);

                expect(res.code).toBe(200);

                await testModel.deleteMatch(matchDTO_single.id);
            })

            test('black won - user valid', async () => {
                let matchDTO_single = new MatchDto()

                matchDTO_single.id = await MM.insertMatch(config._MATCH_TYPE_SINGLE);
                matchDTO_single.status = config._MATCH_STATUS_ENDED;
                matchDTO_single.type = config._MATCH_TYPE_SINGLE;

                let res = await testMC.updateWonStatus(matchDTO_single, false, false);

                expect(res.code).toBe(200);

                await testModel.deleteMatch(matchDTO_single.id);
            })

            test('invalid match id', async () => {

                let res = await testMC.updateWonStatus(new MatchDto({
                    id: 'pippo',
                    status: config._MATCH_STATUS_ENDED,
                    type: config._MATCH_TYPE_SINGLE
                }), false, false);

                expect(res.code).not.toBe(200);

            })
        })


        describe('multi - elo update', () => {
            let match_multi = new MatchDto();
            let credentialTest_black;
            let userID_black = -1;


            let match_multi_error_noWhite;
            let match_multi_error_noBlack;

            beforeAll(async () => {

                match_multi.status = config._MATCH_STATUS_ENDED;
                match_multi.type = config._MATCH_TYPE_MULTI;
                match_multi.id = await MM.insertMatch(config._MATCH_TYPE_MULTI);



                match_multi_error_noWhite = new MatchDto();
                match_multi_error_noWhite.status = config._MATCH_STATUS_ENDED;
                match_multi_error_noWhite.type = config._MATCH_TYPE_MULTI;
                match_multi_error_noWhite.id = await MM.insertMatch(config._MATCH_TYPE_MULTI);

                match_multi_error_noBlack = new MatchDto();
                match_multi_error_noBlack.status = config._MATCH_STATUS_ENDED;
                match_multi_error_noBlack.type = config._MATCH_TYPE_MULTI;
                match_multi_error_noBlack.id = await MM.insertMatch(config._MATCH_TYPE_MULTI);


                credentialTest_black = new UserDto();
                credentialTest_black.name = 'match_controller_user_black';
                credentialTest_black.password = 'hashed_password';

                userID_black = await UM.insertUser(credentialTest_black.clone());


                await MM.trackPlayingGame(match_multi.id, userID, 0);
                await MM.connectPlayerToMatch(match_multi.id, userID_black, false)
                await MM.trackPlayingGame(match_multi_error_noWhite.id, 0, userID_black);
                await MM.trackPlayingGame(match_multi_error_noBlack.id, userID, 0);
            })

            afterAll(async () => {

                await testModel.deleteMatchPlayedByUsers(match_multi.id);
                await testModel.deleteMatch(match_multi.id);
                await testModel.deleteUser(credentialTest_black.name);
            })

            test('valid inputs - white won', async() => {
                let res = await testMC.updateWonStatus(match_multi,true,false);
                expect(res.code).toBe(200);
            })

            test('valid inputs - draw', async() => {
                let res = await testMC.updateWonStatus(match_multi,false,true);
                expect(res.code).toBe(200);
            })

            test('invalid input - no white', async () => {
                let res = await testMC.updateWonStatus(match_multi_error_noWhite,true,false);
                expect(res.code).not.toBe(200);
            })

            test('invalid input - no black', async () => {
                let res = await testMC.updateWonStatus(match_multi_error_noBlack,false,false);
                expect(res.code).not.toBe(200);
            })

        })

        test('match not ended', async () => {
            let res = await testMC.updateWonStatus(new MatchDto({status: config._MATCH_STATUS_PLAYING}));
            expect(res.code).toBe(200);
        })

    })

    test('get random position', async () => {
        let res = await testMC.getRandomPosition(10);
        expect(res).toBeTruthy();
    })

    describe('check paused game ', () => {
        test('match not found', async () => {
            let newUser = {
                name:'user_nopause',
                password:'1234',
            }
            let user_new_id = await UM.insertUser(new UserDto(newUser));

            let res = await testMC.checkForPausedGame(config._MATCH_TYPE_SINGLE, user_new_id);
            expect(res.code).not.toBe(200);

            await testModel.deleteUser(newUser.name);
        })

        test('wrong matchtype', async () => {
            let res = await testMC.checkForPausedGame(config._MATCH_TYPE_MULTI);
            expect(res).not.toBe(200);
        })

        test('invalid user', async () => {
            let res = await testMC.checkForPausedGame(config._MATCH_TYPE_SINGLE, -1)
            expect(res.code).not.toBe(200)
        })

        describe('valid input', () => {
            let match_id_daily_paused = -1;
            let match_id_weekly_paused = -1;
            let match_id_single_paused = -2;

            beforeAll(async () => {
                match_id_daily_paused = await MM.insertMatch(config._MATCH_TYPE_DAILY);
                let res = await MM.insertDailyResult(userID,match_id_daily_paused, testMC.getCurrentDay());
                expect(res).toBe(true)
                await MM.registerMove(match_id_daily_paused,1,'pippo');
                await MM.modifyStatus(match_id_daily_paused,config._MATCH_STATUS_PAUSED, null);

                match_id_weekly_paused = await MM.insertMatch(config._MATCH_TYPE_WEEKLY);
                res = await MM.insertWeeklyResult(userID,match_id_weekly_paused, testMC.getStartOfWeek());
                expect(res).toBe(true)
                await MM.registerMove(match_id_weekly_paused,1,'pippo');
                await MM.modifyStatus(match_id_weekly_paused,config._MATCH_STATUS_PAUSED, null);

                match_id_single_paused = await MM.insertMatch(config._MATCH_TYPE_SINGLE);
                await MM.trackPlayingGame(match_id_single_paused,userID,null);
                await MM.registerMove(match_id_single_paused,1,'pippo');
                await MM.modifyStatus(match_id_single_paused,config._MATCH_STATUS_PAUSED, null);
            })

            afterAll(async () => {
                await testModel.deleteDailyResult(userID, match_id_daily_paused,testMC.getCurrentDay());
                await testModel.deleteMatchSituations(match_id_daily_paused);
                await testModel.deleteMatch(match_id_daily_paused);

                await testModel.deleteWeeklyResult(userID, match_id_weekly_paused,testMC.getStartOfWeek());
                await testModel.deleteMatchSituations(match_id_weekly_paused);
                await testModel.deleteMatch(match_id_weekly_paused);

                await testModel.deleteMatchPlayedByUsers(match_id_single_paused);
                await testModel.deleteMatchSituations(match_id_single_paused);
                await testModel.deleteMatch(match_id_single_paused);
            })

            test('daily', async () => {
                let res = await testMC.checkForPausedGame(config._MATCH_TYPE_DAILY,userID);

                expect(res.code).toBe(200)
                expect(res.content.start_situation).toBeTruthy();
            })

            test('weekly', async () => {
                let res = await testMC.checkForPausedGame(config._MATCH_TYPE_WEEKLY,userID);
                expect(res.code).toBe(200)
                expect(res.content.start_situation).toBeTruthy();
            })
            test('single', async () => {
                let res = await testMC.checkForPausedGame(config._MATCH_TYPE_SINGLE, userID)
                expect(res.code).toBe(200)
                expect(res.content.start_situation).toBeTruthy();
            })
        })
    })

    test('ranked leaderboard', async () => {
        let res = await testMC.getRankedLeaderboard();
        expect(res.code).toBe(200);
    })

    describe('get user info', () => {
        describe('attempts - weekly&daily', () => {
            test('valid user id', async () => {
                let res = await testMC.getUserAttempts(userID);
                expect(res.code).toBe(200);
                expect(res.content.DailyAttempts).toBeGreaterThanOrEqual(0)
            })

            test('invalid user id', async () => {
                let res = await testMC.getUserAttempts(-1);
                expect(res.code).not.toBe(200);
            })
        })
        describe('results - weekly&daily', () => {
            test('valid user id', async () => {
                let res = await testMC.getUserResults(userID);
                expect(res.code).toBe(200);
                expect(res.content.dailyResult).toBeTruthy()
            })

            test('invalid user id', async () => {
                let res = await testMC.getUserResults(-1);
                expect(res.code).not.toBe(200);
            })
        })
        describe('rank', () => {
            test('invalid user ID', async () => {
                let res = await testMC.getPlayerRank(-1);
                expect(res.code).not.toBe(200);
            })

            test('valid user ID', async () => {
                let res = await testMC.getPlayerRank(userID);
                console.log(res);
                expect(res.code).toBe(200);
                expect(res.content.elo).not.toBeNaN();
            })
        })
    })

    describe('multiplayer', () => {

        test('no match_shadow ', async ()  => {
            let res = await testMC.getMultiPlayerRandomMatch();
            expect(res.code).not.toBe(200);
        })

        test('get random match multi - connect - delete', async () => {
            await testMC.insertMultiPlayerMatch(userID,true);
            let res = await testMC.getMultiPlayerRandomMatch();

            expect(res.code).toBe(200);

            let match_shadow = res.content.match_shadow;
            await testMC.connectPlayerToMatch(match_shadow,userID);
            await testMC.connectPlayerToMatch(match_shadow);
        })
    })
})