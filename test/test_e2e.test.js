import fs from "fs";

const {By, Builder, Key} = require('selenium-webdriver');
const TestModel = require('./backend/TestModel');
const SocketController = require('../code/back_end/controllers/SocketController');
const UserController = require("../code/back_end/controllers/UserController");
import {afterAll, beforeAll, describe, expect, test} from "@jest/globals";
import {Chess} from 'chess.js';
import {query} from "express";

const TM = new TestModel();
const SC = new SocketController(null);
const UC = new UserController();

const TIMEOP = 500;
const TIMELOAD = 1500;

const user_not_registered = {
    name: 'e2e_test',
    password:'pass',
}

const user_registered = {
    name: 'e2e_test_2',
    password: 'pass'
}


async function getFenBoardFromHTML(driver, startPosition = true) {
    let rows = await driver.findElements(By.xpath("//div[@data-boardid='ClickToMove']/div"));

    let board = [];

    for (let i = 0; i < rows.length; i++) {
        let cells = await rows[i].findElements(By.xpath(`./div`));
        let tmpRow = [];
        for (let cell of cells) {
            let piece;

            let divPieces = await cell.findElements(By.xpath("./div/div[@data-piece]"));
            if(divPieces.length === 0) piece='1';
            else piece = await driver.executeScript("return arguments[0].getAttribute('data-piece');", divPieces[0]);

            tmpRow.push(piece);
        }
        board.push(tmpRow);
    }


    board = board.map((row) => row.map(piece => piece !== '1' ?
        (piece.startsWith('b') ? piece.substring(1).toLowerCase() : piece.substring(1).toUpperCase())
            : '1').join(''));

    if(startPosition){
        let fen = [];

        for (let i = 0; i < 8; i++) {
            switch (i){
                case 0: case 1: case 6: case 7:{
                    fen.push(board[i]);
                    break;
                }
                default:{
                    fen.push('8')
                    break;
                }
            }
        }
        return fen.join('/').concat(" w KQkq - 0 1");
    }

    else {
        board = board.map(row => row.split(/([a-zA-Z])/).filter(el => el !== '').map(boardPart => {
            if (!isNaN(boardPart)) return boardPart.split('').length;
            else return boardPart;
        }).join(''));

        return board.join('/');
    };
}

function getMoveFE(newBoard, chess){
    let oldBoard = chess.fen().split(' ')[0];
    let newFenPositions = (chess.moves({verbose: true})).map(movee => {return {
        move: {
            from: movee.from,
            to: movee.to
        },
        fen: movee.after.split(' ')[0]
    }});

    return newFenPositions.find(pos => pos.fen === newBoard)
}

async function logout(driver){
    await driver.findElement(By.xpath("//div//span[text() = 'Log out']")).click()

    await new Promise(r => setTimeout(r,TIMEOP));

    await driver.findElement(By.xpath("//button[text()='Log out']")).click();

    await new Promise(r => setTimeout(r,TIMEOP));
}

async function login(driver, credentials){
    await driver.findElement(By.xpath("//input[@placeholder = 'username']")).sendKeys(credentials.name);

    await new Promise(r => setTimeout(r,TIMEOP));

    await driver.findElement(By.xpath("//input[@placeholder = 'password']")).sendKeys(credentials.password);

    await new Promise(r => setTimeout(r,TIMEOP));

    await driver.findElement(By.xpath("//button[text()='Login']" )).click();

    await new Promise(r => setTimeout(r,TIMELOAD));
}


describe('test end2end', () => {

    beforeAll(async () => {
        await TM.deleteUser(user_not_registered.name)
        await TM.deleteUser(user_registered.name)
    })

    afterAll(async () => {
        let user_id = (await UC.getUserByName(user_registered.name)).content.id;
        await TM.deleteDailyAttempts(user_id);
        await TM.deleteUser(user_not_registered.name)
        await TM.deleteUser(user_registered.name)
    });

    /**
     * @return {Promise<!ThenableWebDriver>}
     */
    async function getDriver(){
        let driver = await new Builder().forBrowser('chrome').build();
        await driver.get('https://playf3.serveirc.com');
        //await driver.get('http://localhost:3000');
        let title = await driver.getTitle();
        expect(title).toEqual('PlayF3');
        return driver;
    }

    async function signin_profile_login () {
        let driver = await getDriver();

        /* SIGN IN */

        await new Promise(r => setTimeout(r,2000));

        await driver.findElement(By.xpath("//button[text()='Sign in']" )).click();

        await new Promise(r => setTimeout(r,1000));

        await driver.findElement(By.xpath("//input[@placeholder = 'username']")).sendKeys(user_not_registered.name);

        await new Promise(r => setTimeout(r,1000));

        await driver.findElement(By.xpath("//input[@placeholder = 'password']")).sendKeys(user_not_registered.password);

        await new Promise(r => setTimeout(r,1000));

        await driver.findElement(By.xpath("//button[text()='Sign in']" )).click();

        await new Promise(r => setTimeout(r,2000));


        /* vai nel profilo */

        await driver.findElement(By.xpath("//div//span[text() = 'Profile']")).click()

        await new Promise(r => setTimeout(r,2000));

        //expect qualcosa


        /* LOGOUT */

        await logout(driver);


        /* LOGIN */

        await login(driver, user_not_registered);

        /* LOGOUT */

        await logout(driver);

        /* QUIT */
        await driver.quit();
    }

    async function game_1v1_local() {
        let driver = await getDriver();

        await new Promise(r => setTimeout(r,TIMELOAD));

        /* SIGN IN */

        await new Promise(r => setTimeout(r,TIMELOAD));

        await driver.findElement(By.xpath("//button[text()='Sign in']" )).click();

        await new Promise(r => setTimeout(r,TIMEOP));

        await driver.findElement(By.xpath("//input[@placeholder = 'username']")).sendKeys(user_registered.name);

        await new Promise(r => setTimeout(r,TIMEOP));

        await driver.findElement(By.xpath("//input[@placeholder = 'password']")).sendKeys(user_registered.password);

        await new Promise(r => setTimeout(r,TIMEOP));

        await driver.findElement(By.xpath("//button[text()='Sign in']" )).click();

        await new Promise(r => setTimeout(r,TIMELOAD));

        /* vai in 1v1 */

        await driver.findElement(By.xpath("//div//span[text() = '1v1']")).click()

        await new Promise(r => setTimeout(r,TIMEOP));

        /* VAI NELLA MODALITA' */

        await driver.findElement(By.xpath("//button[text()='Gioca in locale']")).click()

        await new Promise(r => setTimeout(r,TIMEOP));

        let slider = await driver.findElement(By.xpath("//input[@type= 'range']"));

        for (let i = 0; i < 50; i++) {
            await slider.sendKeys(Key.ARROW_LEFT);
        }

        await new Promise(r => setTimeout(r,TIMEOP));

        await driver.findElement(By.xpath("//a[text() = 'GIOCA!']")).click();

        await new Promise(r => setTimeout(r,5000));

        let startPosition = await getFenBoardFromHTML(driver);

        await new Promise(r => setTimeout(r,TIMELOAD));

        let chess = new Chess(startPosition);

        let playWhite = true;

        while(!chess.isGameOver()){
            let move = playWhite ? SC.getAiMove(chess.fen(),2) : SC.getAiMove(chess.fen(),0);
            let from = (Object.keys(move))[0].toLowerCase();
            let to = (Object.values(move))[0].toLowerCase();

            await driver.findElement(By.xpath(`//div[@data-square='${from}']`)).click();
            await driver.findElement(By.xpath(`//div[@data-square='${to}']`)).click();

            chess.move({from: from, to: to});

            playWhite = !playWhite;

            await new Promise(r => setTimeout(r,TIMEOP));
        }

        await new Promise(r => setTimeout(r,TIMEOP));

        let elementsH2 =  await driver.findElements(By.xpath('//h2[text() = "checkmate"]'));
        expect(elementsH2.length).toBe(1);

        await driver.findElement(By.xpath('//button[text() = "Esci"]')).click();

        await new Promise(r => setTimeout(r,TIMELOAD));

        await logout(driver);

        await new Promise(r => setTimeout(r,TIMEOP));


        /* QUIT */
        await driver.quit();
    }

    async function daily_win_leaderboard(){
        let driver = await getDriver();

        await new Promise(r => setTimeout(r,TIMELOAD));


        await login(driver,user_registered);

        await driver.findElement(By.xpath("//div//span[text() = 'Daily challenge']")).click()

        await new Promise(r => setTimeout(r,TIMEOP));

        await driver.findElement(By.xpath("//a/span[text()='GIOCA!']")).click();

        await new Promise(r => setTimeout(r,TIMELOAD));

        let startPosition = await getFenBoardFromHTML(driver);

        await new Promise(r => setTimeout(r,TIMEOP));

        let chess = new Chess(startPosition);

        let currentBoardFen = '';

        while(!chess.isGameOver()){
            let move = SC.getAiMove(chess.fen(),2);
            let from = (Object.keys(move))[0].toLowerCase();
            let to = (Object.values(move))[0].toLowerCase();

            await driver.findElement(By.xpath(`//div[@data-square='${from}']`)).click();
            await driver.findElement(By.xpath(`//div[@data-square='${to}']`)).click();

            chess.move({from: from, to: to});

            await new Promise(r => setTimeout(r,TIMELOAD));

            if(!chess.isGameOver()){

                await new Promise(r => setTimeout(r,TIMELOAD));

                /* AGGIORNA MOSSA FATTA NEL FE DA AVVERSARIO */
                currentBoardFen = await getFenBoardFromHTML(driver, false);

                let moveOpp = getMoveFE(currentBoardFen, chess);

                chess.move(moveOpp.move);

                await new Promise(r => setTimeout(r,TIMEOP));
            }
        }

        await driver.findElement(By.xpath("//button[text() = 'Esci']")).click();

        await new Promise(r => setTimeout(r,TIMELOAD));

        await driver.findElement(By.xpath("//div//span[text() = 'Leaderboard']")).click();

        await new Promise(r => setTimeout(r,TIMELOAD));

        let userInLeaderBoard = await driver.findElement(By.xpath(`//td[text() ='${user_registered.name}']`));

        expect(userInLeaderBoard).toBeTruthy();

        await new Promise(r => setTimeout(r,TIMELOAD));

        await logout(driver);

        await new Promise(r => setTimeout(r,TIMEOP));

        /* QUIT */
        await driver.quit();
    }

    test('Come utente mi registro, visualizzo il mio profilo, faccio logout e login',async () => {
        await signin_profile_login()
    }, 60000000)

    test('come utente registrato, voglio giocare una 1v1 in locale', async () =>{
        await game_1v1_local();

    }, 60000000)

    test('Come utente registrato, voglio entrare, giocare una partita daily e visualizzarmi in leaderboard', async () =>{
        await daily_win_leaderboard();
    }, 60000000);
})



