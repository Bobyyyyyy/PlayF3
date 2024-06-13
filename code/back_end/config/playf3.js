//Mysql configuration
let config = {
    _DATABASE_HOST : '80.211.120.49',
    _DATABASE_PORT : 5006,
    _DATABASE_USER : 'playf3_server',
    _DATABASE_PSWD : '4Rmwsg04njcdals9T7ENtkw3gFYF1IKp8eTauiZRcrq22a36z2eq6IRfqIhKAe6U',
    _DATABASE_NAME : 'play_f3_production',

    _DATABASE_TEST_USER : 'francesco',
    _DATABASE_TEST_PSWD : '5MkdU4tM8vo821wV',
    _DATABASE_TEST_NAME : 'play_f3_test',

    //Type of matched
    _MATCH_TYPE_SINGLE : "SINGLEPLAYER",
    _MATCH_TYPE_MULTI : "MULTIPLAYER",
    _MATCH_TYPE_DAILY : "DAILY",
    _MATCH_TYPE_TRAINING : "TRAINING",
    _MATCH_TYPE_WEEKLY: "WEEKLY",

    //Match status
    _MATCH_STATUS_NOT_STARTED: 0,
    _MATCH_STATUS_PLAYING: 1,
    _MATCH_STATUS_ENDED: 2,
    _MATCH_STATUS_PAUSED: 3,

    //Timed configurations attempts
    _DAILY_ATTEMPTS_MAX: 2,
    _WEEKLY_ATTEMPTS_MAX: 7,

    //Match Utilities
    _MATCH_ELO_GAINS: 2,

    //crypto
    _CRYPT_IV: new Buffer.alloc(16, [
        248,
        193,
        9,
        178,
        61,
        191,
        62,
        69,
        190,
        112,
        20,
        25,
        216,
        98,
        219,
        116
    ]),
    _CRYPT_KEY: new Buffer.alloc(32, [
            168,
            69,
            65,
            242,
            196,
            38,
            3,
            115,
            224,
            16,
            161,
            248,
            143,
            237,
            120,
            245,
            204,
            240,
            234,
            153,
            136,
            80,
            207,
            161,
            13,
            100,
            164,
            4,
            104,
            225,
            184,
            146
        ]),
    _CRYPT_ALG: 'aes-256-cbc'
}

module.exports = config;