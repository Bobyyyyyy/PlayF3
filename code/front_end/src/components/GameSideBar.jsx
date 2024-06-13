import React from "react";
import {getUsernameFromSession} from "../util/utils.js";


export default function GameSideBar({ game, playAsWhite, resign, draw, player, opponent, mode, pause, isGameOver, rematch}) {
    function pieceCap(enemy=true) {
        let capturedPiece = [];
        let color;
        let end = true;
        let pointer = 0;
        let history = [];
        history = game.history({ verbose: true });
        if (enemy) {
            color = (playAsWhite) ? 'b' : 'w';
        } else {
            color = (playAsWhite) ? 'w' : 'b';
        }
        while (end) {
            if (history[pointer] != null) {
                if (history[pointer].color === color) {
                    capturedPiece.push(history[pointer].captured?.toString().toUpperCase(), " ");
                }
                pointer++;
            } else {
                end = false;
            }
        }
        return capturedPiece;
    }

    function gameHistory() {
        let turnNum = 1;
        let end = true;
        let pointer = 0;
        let history = [];
        history = game.history({ verbose: true });
        let slicedHist = [];
        while (end) {
            if (pointer % 2 === 0 && history.length > 0) {
                slicedHist.push("(", turnNum, ") ");
                turnNum++;
            }
            else if (pointer % 2 === 1 && history.length > 0) {
                slicedHist.push(", ");
            }

            if (history[pointer] != null) {
                slicedHist.push(history[pointer].san, pointer % 2 === 0 ? '' : ' ');
                pointer++;
            } else {
                end = false;
            }
        }
        return slicedHist;
    }

    function materialAdvantage(enemy=true) {
        const piecesO = pieceCap(true);
        const piecesP = pieceCap(false);
        let advO = 0;
        let advP = 0;
        piecesO.forEach(p => {
            switch (p) {
                case 'P':
                    advO += 1;
                    break;
                case 'N':
                case 'B':
                    advO += 3;
                    break;
                case 'R':
                    advO += 5;
                    break;
                case 'Q':
                    advO += 9;
                    break;

                default:
                    break;
            }
        })
        piecesP.forEach(p => {
            switch (p) {
                case 'P':
                    advP += 1;
                    break;
                case 'N':
                case 'B':
                    advP += 3;
                    break;
                case 'R':
                    advP += 5;
                    break;
                case 'Q':
                    advP += 9;
                    break;

                default:
                    break;
            }
        })
        
        if(enemy && advO > advP) return(`+${advO-advP}`); 
        else if(!enemy && advP > advO) return(`+${advP-advO}`); 
        else return ('');
    }

    const leave = () => {
        setTimeout(() => {
            window.location.href = "./";
        }, 500);
    }

    const username = getUsernameFromSession();

    return (
        <div className=" ">
            <div className="flex items-center justify-evenly mt-2">
                <h2 className="H1 m-4 text-center">PlayF3</h2>
                <img className="w-32 h-32 rounded-full"
                    src="https://dummyimage.com/300/000000/ffffff&text=PlayF3" alt="PlayF3 logo"></img>
            </div>
            <h3 className="H2 m-4">Really Bad Chess</h3>
            <div className="m-2">
                <h3 className="m-4 text-2xl">Mosse</h3>
                <div className="scroll max-h-24 overflow-auto flex flex-wrap">
                    <p className="history">{gameHistory()}</p>
                </div>
            </div>
            <div className="m-2">
                <h3 className="m-4 text-2xl">Pezzi catturati</h3>
                <div>{opponent}: {pieceCap(true) == ''?'-':pieceCap(true)} {materialAdvantage(true)}</div>
                <div>{player}: {pieceCap(false) == ''?'-':pieceCap(false)} {materialAdvantage(false)}</div>
            </div>
            <div className={`flex flex-col items-center w-1/3 ${!!rematch && isGameOver && "w-full"} mx-auto`}>
                {isGameOver? (
                        <div className="flex w-full gap-8 items-center justify-around px-6">
                            {!!rematch &&
                                <button onClick={rematch} className="mb-4 Empty-btn w-full min-w-fit">
                                Rematch </button>}
                            <button className="mb-4 Empty-btn w-full min-w-fit" onClick={leave}>Esci</button>
                        </div>
                ) : (
                    <>
                    {draw && <button className="m-2 mt-4 Full-btn w-full" onClick={draw}>Patta</button>}
                    <button className="mb-4 Empty-btn w-full min-w-fit" onClick={resign}>Abbandona</button>
                    {(mode==="daily" ||mode==="weekly" || mode==="singlePlayer") && !!username &&
                        <button className="mb-4 Empty-btn w-full min-w-fit" onClick={pause}>Menù</button>}
                    </>
                )}
            </div>
        </div>
    )
}