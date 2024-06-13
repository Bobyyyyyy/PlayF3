let EloRank = require('elo-rank');
let elo = new EloRank(15);

function calculateElo(whiteRating,blackRating,whiteWon) {
    //Gets expected score for first parameter
    let expectedScoreA = elo.getExpected(whiteRating, blackRating);
    let expectedScoreB = elo.getExpected(blackRating, whiteRating);

    //update score, 1 if won 0 if lost
    let actualW = (whiteWon ? 1 : 0);

    whiteRating = elo.updateRating(expectedScoreA, actualW, whiteRating);
    blackRating = elo.updateRating(expectedScoreB, 1 - actualW, blackRating);

    return {whiteRating: whiteRating, blackRating: blackRating}
}


module.exports = calculateElo;