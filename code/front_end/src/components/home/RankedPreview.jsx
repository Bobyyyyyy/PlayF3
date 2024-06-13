import {Link} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {getRank, getUsernameFromSession, isGamePaused} from "../../util/utils.js";


export default function RankedPreview () {

    const [pause, setPause] = useState(false);
    const [rank, setRank] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const name = getUsernameFromSession();

    let testo = (
        <>
            <p className="font-bold md:font-extrabold text-xl md:text-3xl text-black min-w-fit text-center uppercase">
                Modalità ranked
            </p>
            <p className="mt-4 text-base font-normal md:text-xl md:font-medium">
                La modalità Ranked di Really Bad Chess è un'opzione competitiva all'interno di questo originale gioco di scacchi.
            </p>
            <p className="mt-4 text-base font-normal md:text-xl md:font-medium">
                Il sistema di classificazione valuta le vittorie e le sconfitte, consentendo ai giocatori di competere e scalare la classifica globale
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
        let resRank = await getRank();
        setRank(resRank.elo);
        let resPause = await isGamePaused("SINGLEPLAYER");
        setPause(resPause)
        setIsLoading(false);
    }


    useEffect(() => {
        if (!!name) {
            fetchData()
                .catch(console.error);
        }
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
                    <>
                        <div className="w-full h-fit text-center bg-secondary p-4 rounded-lg drop-shadow-2xl border-4 border-primary" >
                            <span className="text-xl font-medium">{name ? `${name}, il suo rank è ${rank}` : "Siccome non ha effettuato l'accesso, il suo rank è 0"}</span>
                        </div>
                        <Link
                            className="border-4 border-primary hover:bg-accent hover:border-accent text-black hover:text-white text-xl sm:text-3xl font-semibold md:font-bold py-2 px-3 md:py-4 md:px-6 w-fit rounded bg-secondary"
                            to= "singlePlayerGame"
                        >
                            {pause ?
                                <span>RIPRENDI!</span> :
                                <span>GIOCA!</span>
                            }
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}