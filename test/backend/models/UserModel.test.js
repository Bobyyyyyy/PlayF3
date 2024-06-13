import {describe, beforeAll, afterAll, test, expect} from '@jest/globals'
describe('UserModel', () => {
    const UserModel = require("../../../code/back_end/models/UserModel");
    const UserDto = require("../../../code/back_end/dto/UserDto");
    let TestModel= require("../TestModel");

    let testUM = new UserModel();
    let testModel = new TestModel();

    let name = 'usernameModel'
    let invalidName = 'invalid';

    let validID = 1;
    let invalidID = 'invID'

    let credentialTest = new UserDto();
    credentialTest.name = name
    credentialTest.password = 'hashed_password'

    beforeAll(async () => {
        let res = await testUM.insertUser(credentialTest.clone());
        if(res){
            validID = res;
        }
    })

    afterAll(async ()   => {
        await testModel.deleteUser(credentialTest.name)
    })


    test('insert User', async() => {
        let newValid = new UserDto();
        newValid.name = name + 2;
        newValid.password = '1234'
        let res = await testUM.insertUser(newValid.clone());
        expect(res).not.toBe(0);    // return ID > 0 with no error

        await testModel.deleteUser(newValid.name);
    })

    /* User is unique, checked in Controller */
    describe('check user name', () => {


        test('existing name', async () => {
            let res = await testUM.checkUserName(name);
            expect(res).toBeTruthy();
        })

        test('not existing name', async () => {
            let res = await testUM.checkUserName(invalidName);
            expect(res).toBeFalsy();
        })
    })

    describe('check user ID', () => {
        test('valid ID', async () => {
            let res = await testUM.checkUserID(validID);
            expect(res).toBeTruthy();
        })

        test('invalid ID', async () => {
            let res = await testUM.checkUserID(invalidID);
            expect(res).toBeFalsy();
        })
    })

    describe('get user info by ID', () => {
        test('valid ID', async () => {
            let res = await testUM.getUserByID(validID);
            expect(res).not.toBe(null);
        })

        test('invalid ID', async () => {
            let res = await testUM.getUserByID(invalidID);
            expect(res).toBe(null);
        })
    })

    describe('get user info by name', () => {
        test('valid name', async () => {
            let res = await testUM.getUserByName(name);
            expect(res).not.toBe(null);
        })

        test('invalid Name', async () => {
            let res = await testUM.getUserByName(invalidName);
            expect(res).toBe(null);
        })
    })

    describe('update Rating ELO', () => {
        test('valid ID', async () => {
            let res = await testUM.updateRating(validID, 10);
            expect(res).toBe(true);
        })
        test('invalid ID', async () => {
            let res = await testUM.updateRating(invalidID, 10);
            expect(res).toBe(false);
        })
    })
})