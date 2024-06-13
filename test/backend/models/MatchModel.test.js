import {describe, beforeAll, afterAll, test, expect} from '@jest/globals'

const MatchModel = require("../../../code/back_end/models/MatchModel");
const TestModel = require("../TestModel");
const UserModel = require("../../../code/back_end/models/UserModel");
const UserDto = require("../../../code/back_end/dto/UserDto");

const config = require('../../../code/back_end/config/playf3')
let testMM = new MatchModel();
let testModel = new TestModel();
let um = new UserModel();
const randomStartingPosition = require("../../../code/back_end/utils/randomPosition")
let match_id_test = -1;

let testDailyDay = new Date(0).toJSON().slice(0,10);
let startDayTest = () => {
    let date = new Date(1000000000);
    let diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).toJSON().slice(0,10);
}
let testWeeklyDay = startDayTest();

let userID_white = -1;

let credentialTestWhite = new UserDto();
credentialTestWhite.name = 'match_model_test_user_white';
credentialTestWhite.password = 'hashed_password';

describe("testing Match Model SQL",() => {

    beforeAll(async ()=> {
        match_id_test = await testMM.insertMatch(config._MATCH_TYPE_SINGLE);
        let res_white = await um.insertUser(credentialTestWhite.clone());
        if(res_white){
            userID_white = res_white;
        }
    })

    afterAll(async () => {

        await testModel.deleteDailyResult(userID_white,match_id_test,testDailyDay);
        await testModel.deleteDailySituation(testDailyDay);
        await testModel.deleteMatchSituations(match_id_test);
        await testModel.deleteMatch(match_id_test);

        await testModel.deleteWeeklySituation(testWeeklyDay);

        await testModel.deleteUser(credentialTestWhite.name);
    })

    describe('insert Match in DB', () => {
        test('insert Match SinglePlayer', async () => {
            let matchType = config._MATCH_TYPE_SINGLE;
            let res = await testMM.insertMatch(matchType);
            expect(res).not.toBe(0);
            await testModel.deleteMatch(res);
        });

        test('insert Match Multiplayer', async () => {
            let matchType = config._MATCH_TYPE_MULTI;
            let res = await testMM.insertMatch(matchType);
            expect(res).not.toBe(0);
            await testModel.deleteMatch(res);
        });

        test('insert match with wrong matchType', async () => {
            let matchType = ' ';
            let res = await testMM.insertMatch(matchType)
            expect(res).toBe(0);
        })
    })

    describe ('check Match ID in DB',  () => {
        test('valid ID', async () => {
            let res = await testMM.checkMatchId(match_id_test);
            expect(res).toBeTruthy();
        })
        test('invalid ID', async () => {
            let res = await testMM.checkMatchId(-1);
            expect(res).toBeFalsy();
        })
    })

    describe (' modify status game in DB', () => {
        /* Valid or invalid ID is equal */
        test('status Match not started test', async () => {
            let res = await testMM.modifyStatus(match_id_test, config._MATCH_STATUS_NOT_STARTED);
            expect(res).toBeTruthy();
        });
        test('status Match is playing test', async () => {
            let res = await testMM.modifyStatus(match_id_test, config._MATCH_STATUS_PLAYING);
            expect(res).toBeTruthy();
        })
        test('status Match is ended test', async () => {
            let res = await testMM.modifyStatus(match_id_test, config._MATCH_STATUS_ENDED);
            expect(res).toBeTruthy();
        })
        test('invalid type match id', async () => {
            let res = await testMM.modifyStatus('match_id_test', config._MATCH_STATUS_ENDED);
            expect(res).toBeFalsy();
        })
    })

    describe('get status game', () => {
        test('valid id', async () => {
            let res = await testMM.getMatchStatus(match_id_test);
            expect(res).not.toBe(null);
        })
        test('invalid id', async () => {
            let res = await testMM.getMatchStatus(-1);
            expect(res).toBe(null);
        })
    })

    describe('match moves', () => {
        describe('register moves', () => {
            test(' valid match', async () => {
                let res = await testMM.registerMove(match_id_test,0,randomStartingPosition(0,true));
                expect(res).toBe(true);

                res = await testMM.getMoveNo(match_id_test);
                expect(res).toBe(1);

                res = await testMM.getMatchMoves(match_id_test);
                expect(res).not.toBe(null);
            })
            test(' invalid match', async () => {
                let res = await testMM.registerMove(-1,0,randomStartingPosition(0,true));
                expect(res).toBeFalsy();
            })
            test(' invalid type match id', async () => {
                let res = await testMM.registerMove('match_id',0,randomStartingPosition(0,true));
                expect(res).toBeFalsy();
            })
        })
        describe('get moves',() => {
            test('valid id', async () => {
                let res = await testMM.getMatchMoves(match_id_test);
                expect(res).not.toBe(null);
            })
            test('invalid id', async () => {
                let res = await testMM.getMatchMoves(-1);
                expect(res).toBe(null);
            })
        })
    })

    describe('mark win to white', () => {
        test('valid id', async () => {
            let res = await testMM.markWhiteAsWon(match_id_test);
            expect(res).toBeTruthy();
        })
        test('invalid id', async () => {
            let res = await testMM.markWhiteAsWon(-1);
            expect(res).toBeFalsy();
        })
        test('invalid type id', async () => {
            let res = await testMM.markWhiteAsWon('match_id');
            expect(res).toBeFalsy();
        })
    })

    describe('mark black to white', () => {
        test('valid id', async () => {
            let res = await testMM.markBlackAsWon(match_id_test);
            expect(res).toBeTruthy();
        })
        test('invalid id', async () => {
            let res = await testMM.markBlackAsWon(-1);
            expect(res).toBeFalsy();
        })
        test('invalid type id', async () => {
            let res = await testMM.markBlackAsWon('match_id');
            expect(res).toBeFalsy();
        })
    })
    describe('mark draw', () => {
        test('valid id', async () => {
            let res = await testMM.markDraw(match_id_test);
            expect(res).toBeTruthy();
        })
        test('invalid id', async () => {
            let res = await testMM.markDraw(-1);
            expect(res).toBeFalsy();
        })

        test('invalid type id', async () => {
            let res = await testMM.markDraw('match_id');
            expect(res).toBeFalsy();
        })
    })

/*___________________________ DAILY MATCH ______________________________________________*/

    describe('daily match', () => {
        describe("insert situation", () => {
            let situation = randomStartingPosition(0,true)
            test('save - valid day', async () => {
                let res = await testMM.saveDailySituation(testDailyDay,situation);
                expect(res).toBeTruthy();
            })
            test('save - invalid day', async () => {
                let res = await testMM.saveDailySituation("-1",situation);
                expect(res).toBeFalsy();
            })
        })

        describe('check', () => {
            test('valid Day', async () => {
                let res = await testMM.checkDailyMatch(testDailyDay);
                expect(res).not.toEqual('');
            })
            test('invalid Day',async  () => {
                let res = await testMM.checkDailyMatch("-1");
                expect(res).toEqual('');
            })
        })

        describe('leaderboard', () => {
            test('get - valid Day', async () => {
                let res = await testMM.getDailyLeaderboard(testDailyDay);
                expect(res).not.toEqual(0);
            })
            test('get - invalid Day', async () => {
                let res = await testMM.getDailyLeaderboard('-1');
                expect(res).toEqual(0);
            })
        })

        describe('get daily Attempts',() => {
            let match_id_daily_attempt = -1;

            afterAll(async () => {

                await testModel.deleteDailyResult(userID_white,match_id_daily_attempt,testDailyDay);
                await testModel.deleteMatchSituations(match_id_daily_attempt);
                await testModel.deleteMatch(match_id_daily_attempt);

            })
            beforeAll(async () => {
                match_id_daily_attempt = await testMM.insertMatch(config._MATCH_TYPE_DAILY);
                let res = await testMM.insertDailyResult(userID_white,match_id_daily_attempt, testDailyDay);
                expect(res).toBe(true)
                await testMM.modifyStatus(match_id_daily_attempt,config._MATCH_STATUS_ENDED, null);
            })

            test('valid user id - valid day', async () => {
                let res = await testMM.getDailyAttempts(userID_white, testDailyDay);
                expect(res).not.toBeNaN();
                expect(res).toBeGreaterThan(0);
            })
            test('valid user id - invalid day', async () => {
                let res = await testMM.getDailyAttempts(userID_white, '-1');
                expect(res).toBe(-1);
            })
        })
        describe('paused daily game', () => {
            let match_id_daily_paused = -1;

            beforeAll(async () => {
                match_id_daily_paused = await testMM.insertMatch(config._MATCH_TYPE_DAILY);
                let res = await testMM.insertDailyResult(userID_white,match_id_daily_paused, testDailyDay);
                expect(res).toBe(true)
                await testMM.registerMove(match_id_daily_paused,1,'pippo');
                await testMM.modifyStatus(match_id_daily_paused,config._MATCH_STATUS_PAUSED, null);
            })

            afterAll(async () => {
                await testModel.deleteDailyResult(userID_white,match_id_daily_paused,testDailyDay);
                await testModel.deleteMatchSituations(match_id_daily_paused);
                await testModel.deleteMatch(match_id_daily_paused);
            })

            test('get - valid user', async () => {
                let res = await testMM.getDailyPausedGame(userID_white, testDailyDay);
                expect(res).toBeTruthy();
                expect(res.situation).toEqual('pippo');
                expect(res.matchID).toBe(match_id_daily_paused);
            })

            test('get - invalid user', async () => {
                let res = await testMM.getDailyPausedGame(-1, testDailyDay);
                expect(res).toBe(false);
            })
        })
        describe('get user daily results', () => {
            let match_id_daily_attempt = -1;
            beforeAll(async () => {
                await testMM.saveDailySituation(testDailyDay,'pippoStart');
                match_id_daily_attempt = await testMM.insertMatch(config._MATCH_TYPE_DAILY);
                let res = await testMM.insertDailyResult(userID_white,match_id_daily_attempt, testDailyDay);
                expect(res).toBe(true)
                await testMM.registerMove(match_id_daily_attempt, 1, 'pippo');
                await testMM.modifyStatus(match_id_daily_attempt,config._MATCH_STATUS_ENDED, null);
                await testMM.markWhiteAsWon(match_id_daily_attempt);
            })

            afterAll(async () => {
                await testModel.deleteDailyResult(userID_white,match_id_daily_attempt,testDailyDay);
                await testModel.deleteMatchSituations(match_id_daily_attempt);
                await testModel.deleteMatch(match_id_daily_attempt);
                await testModel.deleteDailySituation(testDailyDay);
            })

            test('valid inputs', async () => {
                let res = await testMM.getUserDailyResult(userID_white, testDailyDay);
                expect(Number(res)).toBeGreaterThan(-1);
            })

            test('invalid user', async () => {
                let res = await testMM.getUserDailyResult('-1', testDailyDay);
                expect(res).toBe(-1);
            })
            test('invalid day', async () => {
                let res = await testMM.getUserDailyResult(userID_white, 'testDailyDay');
                expect(res).toBe(-1);
            })
        })
    })

/*___________________________ WEEKLY MATCH ______________________________________________*/

    describe('weekly match', () => {
        describe("insert situation", () => {
            let situation = randomStartingPosition(0,true)
            test('save - valid day', async () => {
                let res = await testMM.saveWeeklySituation(testWeeklyDay,situation);
                expect(res).toBeTruthy();
            })
            test('save - invalid day', async () => {
                let res = await testMM.saveWeeklySituation("-1",situation);
                expect(res).toBeFalsy();
            })
        })

        describe('check', () => {
            test('valid Day', async () => {
                let res = await testMM.checkWeeklyMatch(testWeeklyDay);
                expect(res).not.toEqual('');
            })
            test('invalid Day',async  () => {
                let res = await testMM.checkWeeklyMatch("-1");
                expect(res).toEqual('');
            })
        })

        describe('leaderboard', () => {
            test('get - valid Day', async () => {
                let res = await testMM.getWeeklyLeaderboard(testWeeklyDay);
                expect(res).not.toEqual(0);
            })
            test('get - invalid Day', async () => {
                let res = await testMM.getWeeklyLeaderboard('-1');
                expect(res).toEqual(0);
            })
        })
        describe('get Weekly Attempts',() => {
            let match_id_weekly_attempt = -1;

            afterAll(async () => {

                await testModel.deleteWeeklyResult(userID_white,match_id_weekly_attempt,testWeeklyDay);
                await testModel.deleteMatchSituations(match_id_weekly_attempt);
                await testModel.deleteMatch(match_id_weekly_attempt);

            })
            beforeAll(async () => {
                match_id_weekly_attempt = await testMM.insertMatch(config._MATCH_TYPE_WEEKLY);
                let res = await testMM.insertWeeklyResult(userID_white,match_id_weekly_attempt, testWeeklyDay);
                expect(res).toBe(true)
                await testMM.modifyStatus(match_id_weekly_attempt,config._MATCH_STATUS_ENDED);
            })

            test('valid user id - valid day', async () => {
                let res = await testMM.getWeeklyAttempts(userID_white, testWeeklyDay);
                expect(res).not.toBeNaN();
                expect(res).toBeGreaterThan(0);
            })
            test('valid user id - invalid day', async () => {
                let res = await testMM.getWeeklyAttempts(userID_white, '-1');
                expect(res).toBe(-1);
            })
        })
        describe('paused weekly game', () => {
            let match_id_weekly_paused = -1;

            beforeAll(async () => {
                match_id_weekly_paused = await testMM.insertMatch(config._MATCH_TYPE_WEEKLY);
                let res = await testMM.insertWeeklyResult(userID_white,match_id_weekly_paused, testWeeklyDay);
                expect(res).toBe(true);
                await testMM.registerMove(match_id_weekly_paused,1,'pippo');
                await testMM.modifyStatus(match_id_weekly_paused,config._MATCH_STATUS_PAUSED, null);
            })

            afterAll(async () => {
                await testModel.deleteWeeklyResult(userID_white,match_id_weekly_paused,testWeeklyDay);
                await testModel.deleteMatchSituations(match_id_weekly_paused);
                await testModel.deleteMatch(match_id_weekly_paused);
            })

            test('get - valid user', async () => {
                let res = await testMM.getWeeklyPausedGame(userID_white, testWeeklyDay);
                expect(res).toBeTruthy();
                expect(res.situation).toEqual('pippo');
                expect(res.matchID).toBe(match_id_weekly_paused);
            })

            test('get - invalid user', async () => {
                let res = await testMM.getWeeklyPausedGame(-1, testWeeklyDay);
                expect(res).toBe(false);
            })
        })
    })

    let credentialTestBlack = new UserDto();
    credentialTestBlack.name = 'match_model_test_user_black';
    credentialTestBlack.password = 'hashed_password';

    describe('connect player match', () => {

        let matchID_test = -1;
        let userID_black = -1;
        beforeAll(async ()=> {
            matchID_test = await testMM.insertMatch(config._MATCH_TYPE_MULTI);
            await testMM.trackPlayingGame(matchID_test,0,0);
            userID_black = await um.insertUser(credentialTestBlack.clone());
        })

        afterAll(async () => {
            await testModel.deleteMatch(matchID_test);
            await testModel.deleteUser(credentialTestBlack.name);
        })

        test('connect white', async () => {
            let res = await testMM.connectPlayerToMatch(matchID_test, userID_white);
            expect(res).toBe(true);
        })
        test('connect black', async () => {
            let res = await testMM.connectPlayerToMatch(matchID_test,userID_black, false);
            expect(res).toBe(true);
        })

        test('invalid match id type', async () => {
            let res = await testMM.connectPlayerToMatch('matchID_test',userID_black, false);
            expect(res).toBeFalsy();
        })

        describe('get player in match', () => {
            let match_id_single = -1;
            beforeAll(async () => {
                match_id_single = await testMM.insertMatch(config._MATCH_TYPE_SINGLE);
                await testMM.trackPlayingGame(match_id_single,0,0);
                await testMM.connectPlayerToMatch(match_id_single,userID_black, false);
            })
            afterAll(async () => {
                await testModel.deleteMatchPlayedByUsers(match_id_single);
                await testModel.deleteMatch(match_id_single)
            })

            test('black playing', async() => {
                let res = await testMM.getPlayerInGame(match_id_single);
                expect(res).toBe(userID_black);
            })
            test('invalid match id', async () => {
                let res = await testMM.getPlayerInGame(-1);
                expect(res).toBe(null);
            })
        })
        describe('get single paused game', () => {
            let match_id_single_paused = -1;

            beforeAll(async () => {
                match_id_single_paused = await testMM.insertMatch(config._MATCH_TYPE_SINGLE);
                await testMM.trackPlayingGame(match_id_single_paused, userID_white, 0);
                await testMM.registerMove(match_id_single_paused,1,'pippo');
                await testMM.modifyStatus(match_id_single_paused,config._MATCH_STATUS_PAUSED, null);
            })

            afterAll(async () => {
                await testModel.deleteMatchSituations(match_id_single_paused);
                await testModel.deleteMatch(match_id_single_paused);
            })

            test('valid user id', async () => {
                let res = await testMM.getSinglePausedGame(userID_white);
                expect(res).toBeTruthy();
                expect(res.situation).toEqual('pippo');
                expect(res.matchID).toEqual(match_id_single_paused);
            })
            test('invalid user id', async () => {
                let res = await testMM.getSinglePausedGame(-1);
                expect(res).toBeFalsy();
            })
        })
    })

    describe('rank', () => {
        let eloWon = 15;
        let eloLoss = 10;
        let match_id_single_rank = -1;
        beforeAll(async () => {
            match_id_single_rank = await testMM.insertMatch(config._MATCH_TYPE_SINGLE);
            await testMM.trackPlayingGame(match_id_single_rank,userID_white,0);
        })

        afterAll(async () => {
            await testModel.deleteMatchPlayedByUsers(match_id_single_rank);
            await testModel.deleteMatch(match_id_single_rank)
        })

        test('elo loss', async () => {
            let res = await testMM.updateElo(match_id_single_rank,false,eloLoss);
            expect(res).toBe(true);
        })

        test('elo gain', async () => {
            let res = await testMM.updateElo(match_id_single_rank,true,eloWon);
            expect(res).toBe(true);
        })

        test('invalid type match_id', async () => {
            let res = await testMM.updateElo('match_id_single_rank',true,eloWon);
            expect(res).toBe(false);
        })

        test('get elo player', async () => {
            let res = await testMM.getPlayerRank(userID_white);
            //SOVRASCRITTURA NEL TEST, se non va bene così inserirne un altro;
            expect(res).toBe(eloWon.toString());
        })

        test('update elo - invalid match', async () => {
            let res = await testMM.updateElo(-1,true,eloWon);
            expect(res).toBe(true);
        })
        test('ranked Leaderboard', async () => {
            let res = await testMM.getRankedLeaderboard();
            expect(res).not.toBe(0);
        })
    })

    describe('Multiplayer Random', () => {
        let match_shadow = 'pippo42'

        afterAll(async () => {
            await testModel.deleteRandomMulti(match_shadow);
        })
        test('insert', async () => {
            let res = await testMM.insertRandomMultiplayer(match_shadow);
            expect(res).toBe(true);
        })

        test('search game - waiting player', async () => {
            let res =  await testMM.getRandomMultiplayer();
            expect(res).toEqual(match_shadow);
        })

        test('search game - no waiting player', async () => {
            let res = await testMM.getRandomMultiplayer();
            expect(res).toEqual('')
        })

        test('make Random Match Shadow as Deleted - wrong match_shadow', async () =>{
            let res = await testMM.makeRandomMatchShadowAsDeleted(-1);
            expect(res).toBeFalsy();
        })
    })
    describe('get user weekly results', () => {
        let match_id_weekly_attempt = -1;
        beforeAll(async () => {
            await testMM.saveWeeklySituation(testDailyDay,'pippoStart');
            match_id_weekly_attempt = await testMM.insertMatch(config._MATCH_TYPE_WEEKLY);
            let res = await testMM.insertWeeklyResult(userID_white,match_id_weekly_attempt, testDailyDay);
            expect(res).toBe(true)
            await testMM.registerMove(match_id_weekly_attempt, 1, 'pippo');
            await testMM.modifyStatus(match_id_weekly_attempt,config._MATCH_STATUS_ENDED, null);
            await testMM.markWhiteAsWon(match_id_weekly_attempt);
        })

        afterAll(async () => {
            await testModel.deleteWeeklyResult(userID_white,match_id_weekly_attempt,testDailyDay);
            await testModel.deleteMatchSituations(match_id_weekly_attempt);
            await testModel.deleteMatch(match_id_weekly_attempt);
            await testModel.deleteWeeklySituation(testDailyDay);
        })

        test('valid inputs', async () => {
            let res = await testMM.getUserWeeklyResult(userID_white, testDailyDay);
            expect(Number(res)).toBeGreaterThan(-1);
        })

        test('invalid user', async () => {
            let res = await testMM.getUserWeeklyResult('-1', testDailyDay);
            expect(res).toBe(-1);
        })
        test('invalid day', async () => {
            let res = await testMM.getUserWeeklyResult(userID_white, 'testDailyDay');
            expect(res).toBe(-1);
        })
    })
})