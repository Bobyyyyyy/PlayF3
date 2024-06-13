import Gameboard from "../../components/Gameboard.jsx";
import GameSideBar from "../../components/GameSideBar.jsx";

export default function GamePage({Game, mode}) {
    console.log(!Game.isPlayerTurn(), Game.color, Game.game._turn);
    return (
        <div className="md:grid md:grid-cols-3 md:h-screen w-screen md:w-100">
                <div className="md:col-span-2 w-full">
                    {/*<Link to={"/home"} className="mx-6 my-4 float-left px-2 py-1 bg-primary rounded-md font-semibold" >quit</Link>*/}
                    {mode === 'daily' && <h1 className="H1 mt-8 mx-auto text-center">Daily game</h1>}
                    {mode === 'weekly' && <h1 className="H1 mt-8 mx-auto text-center">Weekly game</h1>}
                    {mode === 'training' && <h1 className="H1 mt-8 mx-auto text-center">Training game</h1>}
                    {mode === 'local' && <h1 className="H1 mt-8 mx-auto text-center">1v1 game</h1>}
                    {mode === 'singlePlayer' && <h1 className="H1 mt-8 mx-auto text-center">Ranked game</h1>}
                    {mode === 'multiplayer' && <h1 className="H1 mt-8 mx-auto text-center">1v1 game</h1>}
                    {mode === 'local' && <button className="float-left underline ml-4" onClick={() => Game.setRotation(r => !r)}>rotate</button>}

                    <div className={`mx-auto my-4 md:my-8 p-2 w-full md:w-[60vh] ${(!Game.isPlayerTurn() && mode !=='local') || Game.isGameOver?'pointer-events-none':''}`}>
                        {Game.game && <Gameboard game={Game.game} setGame={Game.setGame} player={Game.player}
                            opponent={Game.opponent} playAsWhite={Game.playAsWhite} isPlayerTurn={Game.isPlayerTurn}
                            undo={Game.undo} isGameOver={Game.isGameOver} canUndo={Game.canUndo} isFirstMove={Game.isFirstMove}
                            timeout={Game?.timeout} reset={Game.reset} rematch={Game?.rematch} mode={mode} rotation={Game.rotation}
                        />}
                    </div>
                </div>

                <div className="mt-4 md:m-0 md:col-span-1 bg-secondary md:pl-4 flex flex-col">
                    <GameSideBar game={Game.game} playAsWhite={Game.playAsWhite} player={Game.player.username} resign={Game.resign}
                        opponent={Game.opponent.username} mode={mode} pause={Game.pause}  isGameOver={Game.isGameOver} rematch={Game?.rematch}/>
                </div>
            </div>
    )
}

