//Mysql configuration
const {createConnection} = require("mysql2");
const config = require("./playf3");
let _connection;
let lastTimestampCheck;
async function getMysqlConnection(timestamp, test){
    if(_connection !== null && _connection !== undefined){
        if(timestamp - lastTimestampCheck < 60){
            return _connection;
        }
        _connection.close();
    }
    _connection = createConnection({
        host: config._DATABASE_HOST,
        user: test ? config._DATABASE_TEST_USER : config._DATABASE_USER,
        port: config._DATABASE_PORT,
        database: test ? config._DATABASE_TEST_NAME : config._DATABASE_NAME,
        password: test ? config._DATABASE_TEST_PSWD : config._DATABASE_PSWD
    });
    _connection.connect();
    lastTimestampCheck = timestamp;
    return _connection;
}

module.exports = getMysqlConnection;