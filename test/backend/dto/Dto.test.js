
const MatchDto = require("../../../code/back_end/dto/MatchDto");
const UserDto = require("../../../code/back_end/dto/UserDto");
const {expect} = require("@jest/globals");

// ONLY CASES NOT COVERED YET

describe('DTO', () => {
    test('match', () => {
        let document = {
            id: 0,
                start_timestamp: 0,
            type: 0,
            deleted: 0,
            status: 0,
            situations: 0
        }

        let matchDto = new MatchDto(document);
        expect(matchDto.getDocument()).toEqual(document)
        expect(matchDto.type).toEqual(document.type)
        expect(matchDto.start_timestamp).toEqual(document.start_timestamp)
        expect(matchDto.id).toEqual(document.id)
        expect(matchDto.deleted).toEqual(document.deleted)
        expect(matchDto.status).toEqual(document.status)
        expect(matchDto.situations).toEqual(document.situations)
    })

    test('user', () => {
        let userDto = new UserDto()
        expect(userDto.id).toBe(null);
        expect(userDto.registration_timestamp).toBe(null);
    })
})