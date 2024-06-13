/**
 * @type {import('jest').Config}
 */

const config = {
    rootDir:"../",
    roots:["<rootDir>/test", "<rootDir>/code"],
    verbose: true,
    testResultsProcessor: "jest-sonar-reporter",
    collectCoverageFrom: [
        "<rootDir>/code/back_end/**/*.js",
        "!<rootDir>/code/front_end/**/*.{js,jsx}",
        "!<rootDir>/code/front_end/node_modules/*.{js,jsx}",
        "!<rootDir>/code//back_end/node_modules/*.{js,jsx}",
        "!<rootDir>/doc/**",
        "!<rootDir>/database/**",
        "!<rootDir>/code/back_end/utils/TwitterClient.js",
        "!<rootDir>/code/back_end/utils/CreateTwitterPost.js"
    ],
    coverageDirectory:"<rootDir>/test/coverage",
    transform: {
        '\\.[jt]sx?$': 'babel-jest'
    },
    transformIgnorePatterns:["\\./node_modules/(?!node-cron)"],
    moduleNameMapper:{
        "^react($|/.+)": "<rootDir>/code/front_end/node_modules/react$1",
        "\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/test/mocks/img.js"
    },
    testEnvironment: "jsdom",
    testEnvironmentOptions: {
        customExportConditions: [] // don't load "browser" field
    },
    setupFilesAfterEnv: ['<rootDir>/test/fe_setup.js'],
    testPathIgnorePatterns:['<rootDir>/test/test_e2e.test.js']
};

module.exports = config;
