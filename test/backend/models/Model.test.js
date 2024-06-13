import {describe, test, expect} from '@jest/globals'
describe("testing Model SQL", () => {
    const Model = require("../../../code/back_end/models/Model");
    let testMd = new Model();

    test('current Timestamp', () => {
        expect(testMd.currentTimestamp()).not.toBeNull();
    })

    test('sample query', async () =>{
        expect(await testMd.executeSampleQuery()).toBeTruthy();
    })
})
