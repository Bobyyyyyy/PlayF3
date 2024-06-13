const scanner = require("sonarqube-scanner");
scanner(
    {
        serverUrl: "https://aminsep.disi.unibo.it/sonarqube",
        options: {
            "sonar.sources": "./code",
            "sonar.tests": "./test",
            "sonar.javascript.lcov.reportPaths": "./test/coverage/lcov.info",
            "sonar.testExecutionReportPaths": "./test/test-report.xml",
            "sonar.exclusions" : ["**/node_modules/**", "**/playf3.js", "**/TwitterClient.js", '**/CreateTwitterPost.js', '**/Dockerfile'],
            "sonar.coverage.exclusions" : ['**/front_end/**']
        },
    },
    () => process.exit()
);
