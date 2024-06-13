import { Chessboard } from "react-chessboard";

export default function BoardNotUsable({ position }) {

    return (
        <div
            className="h-72 w-72 md:h-[32rem] md:w-[32rem] drop-shadow-2xl pr-5"
        >
            <Chessboard
                position={position}
                //position={game.fen()}
                arePiecesDraggable={false}
            />
        </div>
    );
}