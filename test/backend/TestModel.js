const Model = require("../../code/back_end/models/Model");
module.exports = class TestModel extends Model {
    constructor(isTestDb = false){
        super(isTestDb);
    }

    /**
     *
     * @param {String} username
     * @return {Promise<boolean>}
     */
    async deleteUser(username){
        let conn = await this.getMysqlConnection();
        username = conn.escape(username);
        let query = `DELETE FROM tbl_users WHERE name=${username}`;
        try {
            await conn.promise().query(query);
            return true;
        } catch (ignored) {
            return false;
        }
    }

    /**
     *
     * @param {Number} matchID
     * @return {Promise<void>}
     */
    async deleteMatch(matchID){
        let conn = await this.getMysqlConnection();
        matchID = conn.escape(matchID);
        let query = `DELETE FROM tbl_matches WHERE id=${matchID}`;
        try {
            await conn.promise().query(query);
            return true;
        } catch (ignored) {
            return false;
        }
    }

    /**
     *
     * @param {Number} matchID
     * @return {Promise<boolean>}
     */
    async deleteMatchSituations(matchID){
        let conn = await this.getMysqlConnection();
        matchID = conn.escape(matchID);
        let query = `DELETE FROM tbl_matches_situations WHERE match_id=${matchID}`;
        try {
            await conn.promise().query(query);
            return true;
        } catch (ignored) {
            return false;
        }
    }

    /**
     *
     * @param {Date} day
     * @return {Promise<boolean>}
     */
    async deleteDailySituation(day){
        let conn = await this.getMysqlConnection();
        day = conn.escape(day)
        let query = `DELETE FROM tbl_daily_situations WHERE day=${day}`;
        try {
            await conn.promise().query(query);
            return true;
        } catch (ignored) {
            return false;
        }
    }

    /**
     *
     * @param {Number} userID
     * @param {Number} matchID
     * @param {Date} day
     * @return {Promise<boolean>}
     */
    async deleteDailyResult(userID, matchID, day){
        let conn = await this.getMysqlConnection();
        userID = conn.escape(userID)
        matchID = conn.escape(matchID)
        day = conn.escape(day)
        let query = `DELETE FROM tbl_daily_results WHERE user_id=${userID} AND match_id=${matchID} AND daily_match=${day}`;
        try {
            await conn.promise().query(query);
            return true;
        } catch (ignored) {
            return false;
        }
    }


    /* DA CONTROLLARE @POPI*/

    /**
     *
     * @param {Date} day
     * @return {Promise<boolean>}
     */
    async deleteWeeklySituation(day){
        let conn = await this.getMysqlConnection();
        day = conn.escape(day)
        let query = `DELETE FROM tbl_weekly_situations WHERE start_of_week=${day}`;
        try {
            await conn.promise().query(query);
            return true;
        } catch (ignored) {
            return false;
        }
    }

    /**
     *
     * @param {Number} userID
     * @param {Number} matchID
     * @param {Date} day
     * @return {Promise<boolean>}
     */
    async deleteWeeklyResult(userID, matchID, day){
        let conn = await this.getMysqlConnection();
        userID = conn.escape(userID)
        matchID = conn.escape(matchID)
        day = conn.escape(day)
        let query = `DELETE FROM tbl_weekly_results WHERE user_id=${userID} AND match_id=${matchID} AND weekly_match=${day}`;
        try {
            await conn.promise().query(query);
            return true;
        } catch (ignored) {
            return false;
        }
    }

    /**
     *
     * @param matchID
     * @return {Promise<boolean>}
     */
    async deleteMatchPlayedByUsers(matchID){
        let conn = await this.getMysqlConnection();
        matchID = conn.escape(matchID)
        let query = `DELETE FROM tbl_matches_played_by_users WHERE match_id=${matchID}`;
        try {
            await conn.promise().query(query);
            return true;
        } catch (ignored) {
            return false;
        }
    }

    /**
     *
     * @param {Number} userID
     * @return {Promise<void>}
     */
    async deleteDailyAttempts(userID){
        let conn = await this.getMysqlConnection();
        userID = conn.escape(userID)
        let query = `DELETE FROM tbl_daily_results WHERE user_id=${userID}`;
        try {
            await conn.promise().query(query);
            return true;
        } catch (ignored) {
            return false;
        }
    }

    async deleteRandomMulti(match_shadow){
        let conn = await this.getMysqlConnection();
        match_shadow = conn.escape(match_shadow)
        let query = `DELETE FROM tbl_random_multiplayer WHERE match_shadow=${match_shadow}`;
        try {
            await conn.promise().query(query);
            return true;
        } catch (ignored) {
            return false;
        }
    }
}