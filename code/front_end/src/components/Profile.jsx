import {
    getAttemptsById,
    getEloById,
    getIdFromSession,
    getRank,
    getResultsById,
    getUsernameFromSession
} from "../util/utils.js";
import {useEffect, useState} from "react";
import kingIcon from "../assets/icons/king.png"

const MAX_DAILY_ATTEMPTS = 2;
const MAX_WEEKLY_ATTEMPTS = 7;

export default  function Profile() {

    const id = getIdFromSession();
    const username = getUsernameFromSession();

    const [rank, setRank] = useState(0)
    const [elo, setElo] = useState(0)
    const [dailyAttempts, setDailyAttempts] = useState(0);
    const [weeklyAttempts, setWeeklyAttempts] = useState(0);
    const [dailyResults, setDailyResults] = useState(-1);
    const [weeklyResults, setWeeklyResults] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const fetchData = async () => {
        setIsLoading(true)

        let resRank = await getRank();
        setRank(resRank.elo);

        let resElo = await getEloById(id);
        setElo(resElo.rating);

        let resAttempts = await getAttemptsById(id);
        setDailyAttempts(resAttempts.DailyAttempts)
        setWeeklyAttempts(resAttempts.WeeklyAttempts);

        let resResults = await getResultsById(id);
        setDailyResults(resResults.dailyResult);
        setWeeklyResults(resResults.weeklyResult);

        setIsLoading(false);
    }

    useEffect(() => {
        if (!!id) {
           fetchData()
               .catch(console.error)
        }
    }, []);

    return (
        <div className="flex flex-col h-full w-full gap-8 items-center md:max-w-[32rem] mx-6">
            <div className="flex flex-col w-full justify-center items-center gap-4 md:my-8">
                <img src={kingIcon} alt="king icon" className="w-24 h-24 md:w-32 md:h-32"/>
                <span className={`${username.length > 12 ? "text-4xl" : "text-6xl"} md:text-8xl font-extrabold`}>{username}</span>
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
                <div className="flex flex-col w-full h-full gap-16">
                    <div className="flex justify-between w-full">
                        <div className="flex w-fit justify-between gap-4 text-3xl md:text-5xl font-semibold bg-secondary py-2 px-4 rounded">
                            <span>
                                Rank:
                            </span>
                            <span>
                               {rank}
                            </span>
                        </div>
                        <div className="flex w-fit justify-between gap-4 text-3xl md:text-5xl font-semibold bg-secondary py-2 px-4 rounded">
                            <span>
                                Elo:
                            </span>
                            <span>
                                {elo}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col w-full gap-8 bg-secondary p-4 rounded items-center ">
                        <span className="text-3xl font-semibold md:text-5xl md:font-bold">
                            DAILY
                        </span>
                        <div className="flex flex-col w-full gap-6 justify-center items-center text-2xl md:text-3xl">
                            <div className="flex w-11/12 justify-between">
                                    <span>
                                        tentativi effettuati:
                                    </span>
                                    <span>
                                        {MAX_DAILY_ATTEMPTS-dailyAttempts}/{MAX_DAILY_ATTEMPTS}
                                    </span>
                            </div>
                            {dailyResults !== -1 ? (
                                <div className="flex w-11/12 justify-between">
                                    <span>
                                        risultato migliore:
                                    </span>
                                    <span>
                                        {dailyResults}
                                    </span>
                                </div>
                            ) : (
                                <div className="w-11/12">Non hai ancora vinto!</div>
                            )}
                    </div>
                </div>
                <div className="flex flex-col w-full gap-8 bg-secondary p-4 rounded items-center ">
                    <span className="text-3xl font-semibold md:text-5xl md:font-bold">
                        WEEKLY
                    </span>
                        <div className="flex flex-col w-full gap-6 justify-center items-center text-2xl md:text-3xl">
                            <div className="flex w-11/12 justify-between">
                                <span>
                                    tentativi effettuati:
                                </span>
                                <span>
                                    {MAX_WEEKLY_ATTEMPTS - weeklyAttempts}/{MAX_WEEKLY_ATTEMPTS}
                                </span>
                            </div>
                            {weeklyResults !== -1 ? (
                                <div className="flex w-11/12 justify-between">
                                <span>
                                    risultato migliore:
                                </span>
                                    <span>
                                    {weeklyResults}
                                </span>
                                </div>
                            ) : (
                                <div className="w-11/12">Non hai ancora vinto!</div>
                            )}
                        </div>
                </div>
            </div>
            )}
        </div>
    )
}