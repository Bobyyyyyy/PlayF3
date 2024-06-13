const Model = require("./Model");
const UserDto = require("../dto/UserDto");


module.exports = class UserModel extends Model {


    /**
     * @param {boolean} isTest
     */
    constructor(isTest = false) {
        super(isTest);
    }


    /**
     * @param {UserDto} credentials
     * @returns {Promise<number>}
     * Return user id if inserted, 0 otherwise
     */

    async insertUser (credentials){
        let conn = await this.getMysqlConnection();
        credentials.name = conn.escape(credentials.name);
        credentials.password = conn.escape(credentials.password);

        let query = `INSERT INTO tbl_users (name,password) VALUES (${credentials.name},${credentials.password})`;

        try {
            let result = await conn.promise().query(query);
            return result[0].insertId
        }
        catch (ignored) {
            return 0;
        }
    }



    /**
     * @param {String} name
     * @returns {Promise<boolean>}
     * Returns true if user exists, null otherwise
     */

    async checkUserName(name) {
        let conn = await this.getMysqlConnection();
        name = conn.escape(name);
        let query = `SELECT COUNT(tbl_users.id) as cnt FROM tbl_users WHERE tbl_users.name = ${name}`
        try {
            let result = await conn.promise().query(query);
            return result[0][0].cnt === 1;
        }
        catch (ignored) {
            return false;
        }

    }

    /**
     * @param {Number} userID
     * @returns {Promise<boolean>}
     * Return true if userID exists, false otherwise
     */

    async checkUserID(userID) {
        let conn = await this.getMysqlConnection();
        userID = conn.escape(userID);
        let query = `SELECT COUNT(tbl_users.id) as cnt FROM tbl_users WHERE tbl_users.id = ${userID}`
        try {
            let result = await conn.promise().query(query);
            return result[0][0].cnt === 1;
        }
        catch (ignored) {
            return false;
        }
    }


    /**
     * @param {Number} userID
     * @returns {Promise<UserDto>}
     * Returns user info, null otherwise
     */
    async getUserByID(userID) {
        let conn = await this.getMysqlConnection();

        userID = conn.escape(userID);

        let query = `SELECT * FROM tbl_users WHERE tbl_users.id = ${userID}`;

        try {
            let result = await conn.promise().query(query);
            let output = new UserDto();
            output.id = result[0][0].id;
            output.name = result[0][0].name;
            output.password = result[0][0].password;
            output.registration_timestamp = result[0][0].registration_timestamp;
            output.Rating = result[0][0].Rating;
            return output;
        }
        catch (ignore) {
            return null;
        }
    }


    /**
     * @param {String} username
     * @returns {Promise<UserDto>}
     * Returns user info, null otherwise
     */
    async getUserByName(username) {
        let conn = await this.getMysqlConnection();

        username = conn.escape(username);

        let query = `SELECT * FROM tbl_users WHERE tbl_users.name = ${username}`;

        try {
            let result = await conn.promise().query(query);
            let output = new UserDto();
            output.id = result[0][0].id;
            output.name = result[0][0].name;
            output.password = result[0][0].password;
            output.Rating = result[0][0].Rating;
            return output;
        }
        catch (ignore) {
            return null;
        }
    }


    /**
     * @param userID
     * @param newRating
     * @returns {Promise<boolean>}
     */

    async updateRating(userID, newRating){
        let conn = await this.getMysqlConnection();
        userID = conn.escape(userID);
        newRating = conn.escape(newRating);

        let query = `UPDATE tbl_users SET Rating = ${newRating} WHERE id = ${userID}`;

        try {
            await conn.promise().query(query);
            return true
        }
        catch (ignore) {
            return false;
        }
    }


}