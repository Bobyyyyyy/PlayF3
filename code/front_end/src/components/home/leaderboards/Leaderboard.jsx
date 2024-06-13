import {useEffect, useState} from "react";
import SERVER from '../../../misc/Server.js'
import BoardNotUsable from "./BoardNotUsable.jsx";
import Table from "./Table.jsx";

import rightArrow from '../../../assets/icons/right-arrow.png'
import leftArrow from '../../../assets/icons/arrow.png'
import {getBoardConfig, getPeriodicalUsers} from "../../../util/utils.js";

export default function Leaderboard() {

    const [dailyUsers, setDailyUsers] = useState([]);
    const [weeklyUsers, setWeeklyUsers] = useState([]);
    const [rankedUsers, setRankedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dailyBoard, setDailyBoard] = useState();
    const [weeklyBoard, setWeeklyBoard] = useState();
    const [currentLeaderboard, setCurrentLeaderboard] = useState(0);


    const getRankedUsers = async () => {
        try {
            let response = await fetch(SERVER.url +"/match/ranked/leaderboard", {
                mode: 'cors',
            });
            if (response.ok) {
                let usersRes = await response.json();
                setRankedUsers(usersRes.leaderboard.sort((a, b) => (b.elo - a.elo)));
            }
        }
        catch (e) {
            console.log("errore get users leaderboard:", e);
        }
    }

    let allLeaderboards = [
        {
            id: 0,
            titolo: "Giornaliera",
            headings: [
                {name: "Pos."},
                {name: "Nome"},
                {name: "Mosse"}
            ],
            values: dailyUsers
        },
        {
            id: 1,
            titolo: "Settimanale",
            headings: [
                {name: "Pos."},
                {name: "Nome"},
                {name: "Mosse"}
            ],
            values: weeklyUsers
        },
        {
            id: 2,
            titolo: "Ranked globale",
            headings: [
                {name: "Pos."},
                {name: "Nome"},
                {name: "Rank"}
            ],
            values: rankedUsers
        }];


    const handleRightArrowClick = () => {
        setCurrentLeaderboard((currentLeaderboard<2)? currentLeaderboard+1 : 0);
    }

    const handleLeftArrowClick = () => {
        setCurrentLeaderboard((currentLeaderboard===0)? 2 : currentLeaderboard-1);
    }

    const fetchData = async () => {
        setIsLoading(true)
        await getRankedUsers();
        let dailyUserRes = await getPeriodicalUsers("daily");
        setDailyUsers(dailyUserRes);
        let weeklyUserRes = await getPeriodicalUsers("weekly");
        setWeeklyUsers(weeklyUserRes);
        let dailyConfig = await getBoardConfig("daily");
        setDailyBoard(dailyConfig);
        let weeklyConfig = await getBoardConfig("weekly");
        setWeeklyBoard(weeklyConfig);
        setIsLoading(false)
    }

    useEffect(() => {
        fetchData()
            .catch(console.error);
    }, []);


    const arrowRight = (
        <button onClick={handleRightArrowClick} className="p-2 active:bg-secondary active:rounded-full">
            <img src={rightArrow} alt="freccia destra" className="h-12 w-12" />
        </button>
    );

    const arrowLeft = (
        <button  onClick={handleLeftArrowClick} className="p-2 active:bg-secondary active:rounded-full" >
            <img src={leftArrow} alt="freccia sinistra" className="h-12 w-12" />
        </button>
    );

    return (
        <div className="flex flex-col w-full max-w-screen-md justify-between md:justify-center items-center gap-y-4 mx-6">
            <span className="text-2xl md:text-4xl font-bold md:font-extrabold uppercase">
                {allLeaderboards[currentLeaderboard].titolo}
            </span>
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
                    <Table values={allLeaderboards[currentLeaderboard].values} headings={allLeaderboards[currentLeaderboard].headings} />
                    <div className="flex flex-col justify-around items-center w-full pb-4">
                        {currentLeaderboard !== 2 &&
                            <BoardNotUsable position={allLeaderboards[currentLeaderboard].id === 0 ? dailyBoard : weeklyBoard} />
                        }
                        <div className={`flex flex-row justify-between items-center h-full gap-4`}>
                            {arrowLeft}
                            {arrowRight}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}