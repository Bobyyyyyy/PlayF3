import {describe, beforeAll, afterAll, test, expect} from '@jest/globals'
describe('controller Test',()=>{
    const Controller = require("../../../code/back_end/controllers/Controller")
    let testController = new Controller();

    function getfirstDay(day = null) {
        let curr;
        if (day) curr = new Date(day)
        else curr = new Date();

        let first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
        return new Date(curr.setDate(first)).toJSON().slice(0,10)
    }

    jest.useFakeTimers();

    test('default Output',()=>{
        expect (testController.getDefaultOutput()).toEqual({
            code : 200,
            sub_code: 0,
            msg: '',
            content: {}
        })
    })


    test ('Encrypt Decrypt test',() => {
        let testString = 'Lorem Ipsum test';
        let middleString = testController.encrypt(testString);
        expect(middleString).not.toEqual("");
        let finalString = testController.decrypt(middleString);
        expect(finalString).toEqual(testString);
    })

    test ('Encrypt Decrypt test, empty string',() => {
        let testString = '';
        let middleString = testController.encrypt(testString);
        expect(middleString).not.toEqual("");
        let finalString = testController.decrypt(middleString);
        expect(finalString).toEqual(testString);
    })

    test('get today', () => {
        let today = new Date().toJSON().slice(0,10);
        expect(testController.getCurrentDay()).toEqual(today);
    })

    test('getUserFromSession', () => {
        let user = {
            name:'pippo',
            id:'-1',
            password: 'password',
            registration_timestamp: 0
        }
        let userDto = testController.getUserFromSession(user);
        expect(userDto.name).toEqual(user.name);
        expect(userDto.id).toEqual(user.id)
    })

    test('get start of week - default day', () => {
        expect(testController.getStartOfWeek()).toEqual(getfirstDay());
    })

    test('get start of week - day', () => {
        expect(testController.getStartOfWeek('2010-12-25')).toEqual(getfirstDay('2010-12-25'));
    })

})