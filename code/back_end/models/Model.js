const dbConn = require("../config/dbConn");

module.exports = class Model {

    #_connection;
    lastTimestampCheck;
    test;

    /**
     * @param {boolean} isTest
     */
    constructor(isTest = false) {
        this.#_connection = null;
        this.lastTimestampCheck = 0;
        this.test = isTest
    }

    async executeSampleQuery(){
        let query = `SELECT 1`;
        let conn = await this.getMysqlConnection();
        try {
            await conn.promise().query(query);
        }
        catch (ignore) {
            return false;
        }
        return true;
    }

    /**
     * returns mysql connection, if is dead, create new one and returns it.
     */
    async getMysqlConnection(){
        return await dbConn(this.currentTimestamp(), this.test);
    }

    /**
     * @return {number}
     */
    currentTimestamp() {
        return Math.floor(Date.now() / 1000);
    }

}
