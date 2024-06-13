import React, {useEffect, useState} from "react";
import LoginForm from "../components/login/LoginForm.jsx";
import FormTrainingOption from "../components/formGameOption/FormTrainingOption.jsx";
import ShouldLogPage from "../pages/ShouldLogPage.jsx"

import playIcon from '../assets/icons/strategy.png'
import logoutIcon from '../assets/icons/logout.png'
import userIcon from '../assets/icons/user.png'
import leaderboardIcon from '../assets/icons/podium.png'
import trainingIcon from '../assets/icons/learn.png'
import dailyIcon from '../assets/icons/24-hours.png'
import Leaderboard from "../components/home/leaderboards/Leaderboard.jsx";
import SERVER from "../misc/Server.js";
import IntroCard from "../components/home/IntroCard.jsx";
import Sidebar from "../components/home/sidebars/Sidebar.jsx";
import vsIcon from "../assets/icons/vs.png";
import MobileSidebar from "../components/home/sidebars/MobileSidebar.jsx";
import RankedPreview from "../components/home/RankedPreview.jsx";
import weeklyIcon from "../assets/icons/7-days.png";
import MultiplayerNoLogin from "../components/formGameOption/MultiplayerNoLogin.jsx";


export default function NoLoginPage() {

    const topOptions = [
        {name: "Daily board", icon: dailyIcon},
        {name: "Weekly challenge", icon: weeklyIcon},
        {name: "Ranked", icon: playIcon},
        {name: "Freeplay", icon: trainingIcon},
        {name: "1v1", icon: vsIcon},
        {name: "Leaderboard", icon: leaderboardIcon},
        {name: "Profilo", icon: userIcon}
    ];

    const bottomOptions = [
        {name: "Log in", icon: logoutIcon},
    ];

    const [optionActive, setOptionActive] = useState();
    const [optionOnlyLogged, setOptionOnlyLogged] = useState(false);

    const nonClickableButton = ({name}) => {
        return (name === "Weekly challenge" || name === "Daily board" || name === "Profilo");
    }

    const handleClick = ({name}) => {
        if (optionActive === name) {
            setOptionActive(undefined);
            if (nonClickableButton({name})) {
                setOptionOnlyLogged(false);
            }
        } else {
            setOptionActive(name);
            setOptionOnlyLogged(nonClickableButton({name}));
        }
    }

    useEffect(() => {
        fetch(SERVER.url + '/user/authenticatedUser', {
            mode: 'cors',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            return response.json();
        }).then((response) => {
            if(Object.keys(response).length !== 0){
                //Auth not logged
                window.location.href = '../home';
            }
        });
    }, []);

    const [width, setWidth] = React.useState( window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });

    //<Sidebar topOptions={topOptions} bottomOptions={bottomOptions} optionActive={optionActive} handleClick={handleClick} />
    return (
        <>
            <div className={"flex"}>
                {width>640 ?
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
                <div className={`flex w-full  ${width<=640 && "h-full items-center mt-14"} justify-around bg-background`}>
                    {optionActive === undefined && <IntroCard />}
                    {optionActive === "Ranked" && <RankedPreview />}
                    {optionActive ==="Leaderboard" && <Leaderboard />}
                    {optionActive === "Freeplay" && <FormTrainingOption/>}
                    {optionActive ==="Log in" && <LoginForm />}
                    {optionActive === "1v1" && <MultiplayerNoLogin />}
                    {optionOnlyLogged && <ShouldLogPage /> }
                </div>
            </div>
        </>
    )
}