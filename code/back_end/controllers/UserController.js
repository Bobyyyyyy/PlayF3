const Controller = require("./Controller");
const UserModel = require('../models/UserModel');
const config = require('../config/playf3')


module.exports = class UserController extends Controller {

    #userModel

    constructor(isTest = false) {
        super();
        this.#userModel = new UserModel(isTest);
    }


    /**
     * @param {UserDto} credentials
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Create new user
     */
    async createUser(credentials) {
        let output = this.getDefaultOutput();
        let checkResult = await this.checkUserName(credentials.name);

        if (checkResult.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'User Already Exists';
            return output;
        }


        credentials.password = this.encrypt(credentials.password);

        let insertResult = await this.#userModel.insertUser(credentials);

        if (insertResult === 0) {
            output['code'] = 500;
            output['sub_code'] = 2;
            output['msg'] = 'Error occurred when model tried to insert new user';
            return output;
        }


        let getResult = await this.getUserByID(insertResult);
        output.content = getResult.content;
        return output;
    }

    /**
     * @param {number} userID
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Get User information by his ID
     */

    async getUserByID(userID) {
        let output = this.getDefaultOutput();

        let checkResult = await this.checkUserID(userID);

        if (checkResult.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'User does not exists';
            return output;
        }

        let result = await this.#userModel.getUserByID(userID);

        if (result === null) {
            output['code'] = 500;
            output['sub_code'] = 2;
            output['msg'] = 'Internal server error';
            return output;
        }

        output.content = result.getDocument();
        return output;
    }

    /**
     * @param {String} username
     * @return {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Get User information by his username
     */

    async getUserByName(username) {
        let output = this.getDefaultOutput();

        let checkResult = await this.#userModel.checkUserName(username);

        if (!checkResult) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'User does not exists';
            return output;
        }

        let result = await this.#userModel.getUserByName(username);
        if (result === null) {
            output['code'] = 500;
            output['sub_code'] = 2;
            output['msg'] = 'Internal server error';
            return output;
        }

        output.content = result.getDocument();
        return output;
    }


    /**
     * @param {Number} userID
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Check if user exists by his ID. Code is not 200 in case of errors
     */
    async checkUserID(userID) {
        let output = this.getDefaultOutput();

        if (isNaN(userID)) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'Invalid user id';
            return output;
        }

        let checkResult = await this.#userModel.checkUserID(userID);

        if (!checkResult) {
            output['code'] = 400;
            output['sub_code'] = 2;
            output['msg'] = 'User does not exists';
            return output;
        }
        return output;

    }


    /**
     * @param {String} name
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Check if user does not exists, Code is not 200 in case of errors
     */

    async checkUserName(name) {
        let output = this.getDefaultOutput();
        let checkResult = await this.#userModel.checkUserName(name);
        if (checkResult) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'User Already Exists';
            return output;
        }
        return output
    }


    /**
     * @param {UserDto} credentials
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     * Returns user if credentials are correct, code is not 200 in case of errors
     */

    async AuthenticateUser(credentials) {
        let output = this.getDefaultOutput();
        let result = await this.getUserByName(credentials.name);

        if (result.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'User does not exists';
            return output;
        }

        let encryptedPassword = this.encrypt(credentials.password);

        if (encryptedPassword !== result.content.password) {
            output['code'] = 400;
            output['sub_code'] = 2;
            output['msg'] = 'Password does not match';
            return output;
        }

        output.content = result.content;
        return output;
    }


    /**
     *
     * @param userID {Number}
     * @param newRating {Number}
     * @returns {Promise<{msg: string, code: number, sub_code: number, content: {}}>}
     */
    async updateRating(userID, newRating) {

        let output = this.getDefaultOutput();
        let checkResult = await this.checkUserID(userID);

        if(checkResult.code !== 200) {
            output['code'] = 400;
            output['sub_code'] = 1;
            output['msg'] = 'User does not exists';
            return output;
        }

        await this.#userModel.updateRating(userID,newRating);

        return output;
    }

}