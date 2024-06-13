import React, { useEffect, useState } from "react";
import Leaderboard from "../components/home/leaderboards/Leaderboard.jsx";
import WorkInProgPage from "./WorkInProgPage.jsx";
import LogoutForm from "../components/login/LogoutForm.jsx";
import FormTrainingOption from "../components/formGameOption/FormTrainingOption.jsx";
import DailyChallenge from "../components/peridiocalChallenges/DailyChallenge.jsx";
import Sidebar from "../components/home/sidebars/Sidebar.jsx";
import FormMultiplayerOption from "../components/formGameOption/FormMultiplayerOption.jsx"

import playIcon from '../assets/icons/strategy.png'
import logoutIcon from '../assets/icons/logout.png'
import userIcon from '../assets/icons/user.png'
import leaderboardIcon from '../assets/icons/podium.png'
import trainingIcon from '../assets/icons/learn.png'
import dailyIcon from '../assets/icons/24-hours.png'
import weeklyIcon from '../assets/icons/7-days.png'
import vsIcon from '../assets/icons/vs.png'

import IntroCard from "../components/home/IntroCard.jsx";
import Server from "../misc/Server.js";
import MobileSidebar from "../components/home/sidebars/MobileSidebar.jsx";
import RankedPreview from "../components/home/RankedPreview.jsx";
import WeeklyChallenge from "../components/peridiocalChallenges/WeeklyChallenge.jsx";
import Profile from "../components/Profile.jsx";


export default function HomePage() {

    const topOptions = [
        { name: "Daily challenge", icon: dailyIcon },
        { name: "Weekly challenge", icon: weeklyIcon },
        { name: "Ranked", icon: playIcon },
        { name: "Freeplay", icon: trainingIcon },
        { name: "1v1", icon: vsIcon },
        { name: "Leaderboard", icon: leaderboardIcon },
        { name: "Profile", icon: userIcon }
    ];

    const bottomOptions = [
        { name: "Log out", icon: logoutIcon },
    ];

    const [optionActive, setOptionActive] = useState();
    const [workInProgActive, setWorkInProgActive] = useState(false);

    const handleClick = ({ name }) => {
        setOptionActive((optionActive === name) ? undefined : name);
    }

    useEffect(() => {
        fetch(Server.url + '/user/authenticatedUser', {
            mode: 'cors',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            return response.json();
        }).then((response) => {
            if (Object.keys(response).length === 0) {
                //Auth not logged
                window.location.href = '../home_no';
            }
        });
    }, []);

    const [width, setWidth] = React.useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });

    return (
        <div className={"flex"}>
            {width > 640 ?
                (
                    <Sidebar
                        topOptions={topOptions}
                        bottomOptions={bottomOptions}
                        optionActive={optionActive}
                        handleClick={handleClick}
                    />
                ) : (
                    <MobileSidebar
                        topOptions={topOptions}
                        bottomOptions={bottomOptions}
                        optionActive={optionActive}
                        handleClick={handleClick}
                    />
                )
            }
            {/* CONTENUTI */}

            <div className={`flex w-full  ${width <= 640 && "h-full items-center mt-14"} justify-around bg-background`}>
                {optionActive === undefined && <IntroCard />}
                {optionActive === "Freeplay" && <FormTrainingOption />}
                {optionActive === "Ranked" && <RankedPreview />}
                {optionActive === "Daily challenge" && <DailyChallenge />}
                {optionActive === "1v1" && <FormMultiplayerOption />}
                {optionActive === "Weekly challenge" && <WeeklyChallenge />}
                {optionActive === "Profile" && <Profile />}
                {optionActive === "Leaderboard" && <Leaderboard />}
                {optionActive === "Log out" && <LogoutForm />}
                {workInProgActive && <WorkInProgPage />}
            </div>


        </div>
    );
}