const crypto = require("crypto")
const config = require("../config/playf3");
const UserDto = require("../dto/UserDto");
module.exports = class Controller {

    #crypto;

    constructor() {
        this.#crypto = crypto;
    }

    /**
     * @return {{msg: string, code: number, sub_code: number, content: {}}}
     * Standard output used for any api response.
     */
    getDefaultOutput(){
        return {
            code : 200,
            sub_code: 0,
            msg: '',
            content: {}
        };
    }

    /**
     * @param string
     * @return {string}
     */
    encrypt(string){
        try{
            let cipher = crypto.createCipheriv(config._CRYPT_ALG, config._CRYPT_KEY, config._CRYPT_IV);
            let encryptedData = cipher.update(string, "utf-8", "hex");
            encryptedData += cipher.final("hex");
            return encryptedData;
        } catch (e) {
            return "";
        }
    }

    /**
     * @param {string} shadowData
     * @return {string}
     */
    decrypt(shadowData){
        let deCipher = crypto.createDecipheriv(config._CRYPT_ALG, config._CRYPT_KEY, config._CRYPT_IV);
        let decryptedData = deCipher.update(shadowData, "hex", "utf-8");
        decryptedData += deCipher.final("utf8");
        return decryptedData;
    }

    /**
     * @param min {number}
     * @param max {number}
     * @returns {number}
     */
    randomInteger(min, max) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * @return {string}
     */
    getCurrentDay(){
        return new Date().toJSON().slice(0, 10);
    }

    /**
     * @param {object} user
     * @return {UserDto}
     */
    getUserFromSession(user){
        let userDto = new UserDto();
        userDto.name = user.name;
        userDto.id = user.id;
        userDto.password = user.password;
        userDto.registration_timestamp = user.registration_timestamp;
        return userDto;
    }


    getStartOfWeek(day = null) {
        let curr;

        if (day)
            curr = new Date(day);
        else
            curr = new Date();

        const firstDay = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
        return new Date(curr.setDate(firstDay)).toJSON()?.slice(0,10);
    }


}
