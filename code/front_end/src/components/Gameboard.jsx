import React, { useState } from "react";
import { Chessboard } from "react-chessboard";
import PlayerTag from "./PlayerTag";


export default function Gameboard({ game, setGame, player, opponent, playAsWhite = true, rematch,
    reset, undo, canUndo, isGameOver, isPlayerTurn, isFirstMove, timeout, mode, rotation = true, setMoving: setMoving }) {

    const [moveFrom, setMoveFrom] = useState("");
    const [moveTo, setMoveTo] = useState(null);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [rightClickedSquares, setRightClickedSquares] = useState({});
    const [moveSquares, setMoveSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});

    function getMoveOptions(square) {
        const moves = game.moves({
            square,
            verbose: true,
        });
        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares = {};
        moves.map((move) => {
            newSquares[move.to] = {
                background:
                    game.get(move.to) &&
                    game.get(move.to).color !== game.get(square).color
                        ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
                        : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
                borderRadius: "50%",
            };
            return move;
        });
        newSquares[square] = {
            background: "rgba(255, 255, 0, 0.4)",
        };
        setOptionSquares(newSquares);
        return true;
    }

    function onSquareClick(square) {
        setRightClickedSquares({});
        
        // from square
        if (!moveFrom) {
            const hasMoveOptions = getMoveOptions(square);
            if (hasMoveOptions) setMoveFrom(square);
            return;
        }
        
        // to square
        if (!moveTo) {
            // check if valid move before showing dialog
            const moves = game.moves({
                moveFrom,
                verbose: true,
            });
            const foundMove = moves.find(
                (m) => m.from === moveFrom && m.to === square
            );

            // not a valid move
            if (!foundMove) {
                // check if clicked on new piece
                const hasMoveOptions = getMoveOptions(square);
                // if new piece, setMoveFrom, otherwise clear moveFrom
                setMoveFrom(hasMoveOptions ? square : "");
                return;
            }
            
            // valid move
            setMoveTo(square);

            // if promotion move
            if (
                ((foundMove.color === "w" &&
                foundMove.piece === "p" &&
                square[1] === "8") ||
                (foundMove.color === "b" &&
                foundMove.piece === "p" &&
                square[1] === "1"))
                && mode !== "multiplayer"
                ) {
                    setShowPromotionDialog(true);
                return;
            }
            
            // is normal move
            const move = game.move({
                from: moveFrom,
                to: square,
                promotion: "q",
            });

            // if invalid, setMoveFrom and getMoveOptions
            if (move === null) {
                const hasMoveOptions = getMoveOptions(square);
                if (hasMoveOptions) setMoveFrom(square);
                return;
            }

            player.move();
            opponent.move(move);

            setMoveFrom("");
            setMoveTo(null);
            setOptionSquares({});
        }
    }

    function onPromotionPieceSelect(piece) {
        // if no piece passed then user has cancelled dialog, don't make move and reset
        let promotion = piece[1].toLowerCase() ?? "q";
        promotion = (mode === "multiplayer") ? "q" : promotion;
        if (piece) {
            game.move({
                from: moveFrom,
                to: moveTo,
                promotion: promotion,
            });
            opponent.move();
        }

        setMoveFrom("");
        setMoveTo(null);
        if (mode === "multiplayer") {
            setShowPromotionDialog(false);
        }
        setOptionSquares({});
        return true;
    }

    function onSquareRightClick(square) {
        const colour = "rgba(0, 0, 255, 0.4)";
        setRightClickedSquares({
            ...rightClickedSquares,
            [square]:
                rightClickedSquares[square] &&
                rightClickedSquares[square].backgroundColor === colour
                    ? undefined
                    : { backgroundColor: colour },
        });
    }

    const localcBoardOrientation = (rotation ? 'white' : 'black');

    return (
        <div className="w-full md:w-[60vh]">
            <PlayerTag isPlayerTurn={rotation ? !isPlayerTurn() : isPlayerTurn()} player={rotation ? opponent : player} />
            <div className="text-center m-4 w-100">
                {mode !== "multiplayer" ? (
                    <Chessboard
                        id="ClickToMove"
                        animationDuration={200}
                        arePremovesAllowed={false}
                        arePiecesDraggable={false}
                        boardOrientation={mode === 'local' ?  localcBoardOrientation: playAsWhite ? 'white' : 'black'}
                        position={game.fen()}
                        onSquareClick={onSquareClick}
                        onSquareRightClick={onSquareRightClick}
                        onPromotionPieceSelect={onPromotionPieceSelect}
                        // boardOrientation={`${playAsWhite ? 'white' : 'black'}`}
                        customBoardStyle={{
                            borderRadius: "4px",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                        }}
                        customSquareStyles={{
                            ...moveSquares,
                            ...optionSquares,
                            ...rightClickedSquares,
                        }}
                        promotionToSquare={moveTo}
                        showPromotionDialog={showPromotionDialog}
                    />
                ) : (
                    <Chessboard
                        id="ClickToMove"
                        animationDuration={200}
                        arePremovesAllowed={false}
                        arePiecesDraggable={false}
                        boardOrientation={mode === 'local' ?  localcBoardOrientation: playAsWhite ? 'white' : 'black'}
                        position={game.fen()}
                        onSquareClick={onSquareClick}
                        onSquareRightClick={onSquareRightClick}
                        //onPromotionPieceSelect={onSquareClick}
                            // boardOrientation={`${playAsWhite ? 'white' : 'black'}`}
                        customBoardStyle={{
                            borderRadius: "4px",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                        }}
                        customSquareStyles={{
                            ...moveSquares,
                            ...optionSquares,
                            ...rightClickedSquares,
                        }}
                    />
                )}

            </div>
            <PlayerTag isPlayerTurn={rotation ? isPlayerTurn() : !isPlayerTurn()} player={rotation ? player : opponent} />

            {!isGameOver && (
                <div className="mt-2 text-center mx-auto">
                    {reset && <button
                        className="m-2 Full-btn"
                        onClick={() => {
                            reset();
                            setMoveSquares({});
                            setOptionSquares({});
                            setRightClickedSquares({});
                        }}
                    >reset</button>}
                    {undo && <button
                        className={`m-2 ${(canUndo === 2) || mode === 'training' || mode === 'local' ? 'Full-btn' : 'Empty-btn'}`}
                        onClick={() => {
                            undo();
                            setMoveSquares({});
                            setOptionSquares({});
                            setRightClickedSquares({});
                        }}
                    >undo</button>}
                </div>
            )}

            {isGameOver && game.isCheckmate() && <div className="m-4 Pill-secondary text-center"><h2 className="H2">checkmate</h2></div>}
            {(game.isCheck() && !game.isCheckmate()) && <div className="m-4 Pill-secondary text-center"><h2 className="H2">check</h2></div>}
            {isGameOver && game.isStalemate() && <div className="m-4 Pill-secondary text-center"><h2 className="H2">stalemate</h2></div>}
            {isGameOver && game.isDraw() && <div className="m-4 Pill-secondary text-center"><h2 className="H2">draw</h2></div>}
            {isGameOver && timeout === 1 && <div className="m-4 Pill-secondary text-center"><h2 className="H2">player timeout</h2></div>}
            {isGameOver && timeout === -1 && <div className="m-4 Pill-secondary text-center"><h2 className="H2">opponent timeout</h2></div>}
        </div>
    );
}