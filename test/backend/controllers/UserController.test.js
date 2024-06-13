
import {describe, beforeAll, afterAll, test, expect} from '@jest/globals'
describe('User Controller', ()=> {

    const UserController = require("../../../code/back_end/controllers/UserController");
    const UserModel = require("../../../code/back_end/models/UserModel")
    const UserDto = require("../../../code/back_end/dto/UserDto");
    const TestModel= require("../TestModel");

    let testUC = new UserController();
    let testModel = new TestModel();

    let name = 'usernameController'
    let invalidName = 'invalid';

    let validID ;
    let invalidID = -1

    let credentialTest = new UserDto();
    credentialTest.name = name
    credentialTest.password = '1234'

    beforeAll(async () => {
        await testUC.createUser(credentialTest.clone());
        let user = await testUC.getUserByName(credentialTest.name);
        validID = user.content.id;
    })

    afterAll(async ()   => {
        await testModel.deleteUser(credentialTest.name);
    })

    describe('create user', () => {
        test('insert user', async () => {
            let newValid = new UserDto();
            newValid.name = name + 2;
            newValid.password = '1234'
            let res = await testUC.createUser(newValid.clone());
            expect(res.code).toBe(200);
            await testModel.deleteUser(newValid.name);

        })
        test('already existent user', async () => {
            let res = await testUC.createUser(credentialTest.clone());
            expect(res.code).not.toEqual(200);
            expect(res.sub_code).toBe(1);
        })
    })

    describe('get user by ID', () => {
        test('valid ID', async () => {
            let res = await testUC.getUserByID(validID);
            expect(res.code).toBe(200);
            expect(res.content).not.toBe(null);
        })
        test('invalid ID', async () => {
            let res = await testUC.getUserByID(invalidID);
            expect(res.code).not.toBe(200);
        })
    })

    describe('get user by name', () => {
        test('valid name', async () => {
            let res = await testUC.getUserByName(name);
            expect(res.code).toBe(200);
            expect(res.content).not.toBe(null);
        })
        test('invalid name', async () => {
            let res = await testUC.getUserByName(invalidName);
            expect(res.code).not.toBe(200);
        })
    })

    describe('check User ID', () => {
        test('valid ID', async () => {
            let res = await testUC.checkUserID(validID);
            expect(res.code).toBe(200);
        })
        test('invalid ID', async () => {
            let res = await testUC.checkUserID(invalidID);
            expect(res.code).not.toBe(200);
        })
        test('string as ID', async () => {
            let res = await testUC.checkUserID('NaN');
            expect(res.code).not.toBe(200);
        })
    })

    describe('check User Name', () => {
        test('existing name in db', async () => {
            let res = await testUC.checkUserName(name);
            expect(res.code).toBe(400);
            expect(res.sub_code).toBe(1);
        })
        test('not existing name in db', async () => {
            let res = await testUC.checkUserName(invalidName);
            expect(res.code).toBe(200);
        })
    })

    describe('authenticate user', ()=> {
        test('right credentials', async () => {
            let res = await testUC.AuthenticateUser(credentialTest.clone());
            expect(res.code).toBe(200);
            expect(res.content).not.toBe(null);
            expect(res.content.name).toEqual(credentialTest.name);
        })
        test('wrong username', async () => {
            let wrongNameCredentials = new UserDto();
            wrongNameCredentials.name = invalidName;
            wrongNameCredentials.password = 'useless';
            let res = await testUC.AuthenticateUser(wrongNameCredentials);
            expect(res.code).not.toBe(200);
            expect(res.sub_code).toBe(1);
        })
        test('wrong password', async () => {
            let wrongPswdCredentials = new UserDto();
            wrongPswdCredentials.name = name;
            wrongPswdCredentials.password = 'wrong password';
            let res = await testUC.AuthenticateUser(wrongPswdCredentials);
            expect(res.code).not.toBe(200);
            expect(res.sub_code).toBe(2);

        })
    })

    describe('updateRating', () => {
        test('valid inputs',async () => {
            let res = await testUC.updateRating(validID, 10);
            expect(res.code).toBe(200);
        })
        test('invalid id', async () => {
            let res = await testUC.updateRating(invalidID, 10);
            expect(res.code).not.toBe(200);
        })
    })
})