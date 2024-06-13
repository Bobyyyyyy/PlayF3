const pieces = 'qrnbp';
const values = '95331';
const backPieces = 'qrnbp';
const frontPieces = 'rnnnnnbbbbbppppp';
const positionToGenerate = 1000;

// return a starting position with variable difficulty and starting player
function randomStartingPosition(diff, whiteStarts) {
    const embalance = (2 * diff) - 100;

    const p = getTargetPositions(embalance, positionToGenerate);
    const white = p[0];
    const black = p[1];

    const pos = black + '/8/8/8/8/' + white + ` ${whiteStarts ? 'w' : 'b'} KQkq - 0 1`;
    return pos;
}
// randomize num positions and choses the most fitting for the required difficulty
function getTargetPositions(target, num) {
    let white = [];
    let black = [];
    let embalance = [];
    for (let i = 0; i < num; i++) {
        white[i] = randomPlayerStart(true);
        black[i] = randomPlayerStart(false);
        embalance[i] = evaluatePosition(white[i], black[i]);
    }

    let b = 0;
    let bestEmbalance = 0;
    let closestDistance = 100;
    for (let i = 0; i < num; i++) {
        if (Math.abs(target - embalance[i]) < closestDistance) {
            b = i;
            closestDistance = Math.abs(target - embalance[i]);
            bestEmbalance = embalance[i];
        }
    }

    // console.log('slider:'+ sliderValue)
    // console.log(embalance)
    // console.log(bestEmbalance)

    return [white[b], black[b]];
}
function evaluatePosition(white, black) {
    let whiteMaterial = 0;
    let blackMaterial = 0;

    for (let i = 0; i < 17; i++) {
        switch (white.charAt(i)) {
            case 'Q':
                whiteMaterial += 9;
                break;
            case 'R':
                whiteMaterial += 5;
                break;
            case 'B':
                whiteMaterial += 3;
                break;
            case 'N':
                whiteMaterial += 3;
                break;
            case 'P':
                whiteMaterial += 1;
                break;
            default:
                break;
        }
        switch (black.charAt(i)) {
            case 'q':
                blackMaterial += 9;
                break;
            case 'r':
                blackMaterial += 5;
                break;
            case 'b':
                blackMaterial += 3;
                break;
            case 'n':
                blackMaterial += 3;
                break;
            case 'p':
                blackMaterial += 1;
                break;
            default:
                break;
        }
    }

    return blackMaterial - whiteMaterial;
}
function randomPlayerStart(white = true) {
    let pos = '';
    if (white) {
        pos = '00000000/0000k000';
        for (let i = 0; i < 8; i++) {
            pos = setCharAt(pos, i, frontPieces.charAt(Math.floor(Math.random() * frontPieces.length)))
        }
        for (let i = 9; i < 17; i++) {
            if (i === 13) continue
            pos = setCharAt(pos, i, backPieces.charAt(Math.floor(Math.random() * backPieces.length)))
        }
        pos = pos.toUpperCase();
    }
    else {
        pos = '0000k000/00000000';
        for (let i = 0; i < 8; i++) {
            if (i === 4) continue
            pos = setCharAt(pos, i, backPieces.charAt(Math.floor(Math.random() * backPieces.length)))
        }
        for (let i = 9; i < 17; i++) {
            pos = setCharAt(pos, i, frontPieces.charAt(Math.floor(Math.random() * frontPieces.length)))
        }
    }
    return pos
}
function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}

module.exports = randomStartingPosition;