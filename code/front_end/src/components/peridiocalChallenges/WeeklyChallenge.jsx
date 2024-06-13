import BoardNotUsable from "../home/leaderboards/BoardNotUsable.jsx";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {getBoardConfig, isGamePaused} from "../../util/utils.js";

export default function WeeklyChallenge() {
    const [pause, setPause] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [weeklyBoard, setWeeklyBoard] = useState();

    let testo = (
        <>
            <h1 className="text-2xl font-bold md:text-4xl md:font-extrabold uppercase text-center mb-4">Weekly challenge</h1>
            <span className="font-bold md:font-extrabold text-xl md:text-3xl text-black min-w-fit ">
                Chi non ama una sfida quotidiana ?
            </span>
            <p className="mt-4 text-base font-normal md:text-xl md:font-medium">
                Ogni <b>settimana</b> ti aspetta un setup completamente nuovo sulla scacchiera,
                rendendo ogni partita fresca ed eccitante.
            </p>
            <p className="hidden sm:block mt-2 text-base font-normal md:text-xl md:font-medium">
                Ma la vera emozione arriva nel
                vedere come ti confronti con gli altri giocatori, i risultati saranno
                disponibili sulla Leaderboard
            </p>
        </>
    );

    const fetchData = async () => {
        setIsLoading(true);
        let resPause = await isGamePaused("WEEKLY");
        if (!!resPause) {
            setPause(true);
            setWeeklyBoard(resPause);
        } else {
            let weeklyConfigRes = await getBoardConfig("weekly");
            setWeeklyBoard(weeklyConfigRes);
            setPause(false);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        fetchData()
            .catch(console.error)
    }, []);

    return (
        <div className="flex flex-col w-full h-full justify-start items-center max-h-screen mx-6 " >
            <div className="flex flex-col justify-start w-fit items-center h-full md:mt-8 gap-8">
                <div className="w-fit h-fit bg-secondary p-4 rounded-lg drop-shadow-2xl border-4 border-primary" >
                    {testo}
                </div>
                {isLoading ? (
                    <div
                        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status">
                    <span
                        className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                    >Loading...</span>
                    </div>
                ) : (
                    <div className="flex flex-col justify-evenly items-center min-h-fit h-full gap-y-10">
                        <BoardNotUsable position={weeklyBoard} />
                        <Link
                            className="border-4 border-primary hover:bg-accent hover:border-accent text-black hover:text-white
                                text-xl sm:text-3xl font-semibold md:font-bold py-2 px-3 md:py-4 md:px-6 w-fit rounded bg-secondary
                                mb-8"
                            to="dailyGame"
                            state={{mode:'weekly'}}
                        >
                            {pause ?
                                <span>RIPRENDI!</span> :
                                <span>GIOCA!</span>
                            }
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}