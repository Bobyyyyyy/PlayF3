import playIcon from '../../../assets/icons/strategy.png'
import historyIcon from '../../../assets/icons/list.png'
import logoutIcon from '../../../assets/icons/logout.png'
import userIcon from '../../../assets/icons/user.png'
import leaderboardIcon from '../../../assets/icons/podium.png'
import trainingIcon from '../../../assets/icons/learn.png'
import dailyIcon from '../../../assets/icons/24-hours.png'

import React, {useState} from "react";

import ShouldLogPage from '../../../pages/ShouldLogPage.jsx'
import WorkInProgPage from "../../../pages/WorkInProgPage.jsx";

export default function NoLogSidebar() {
    const topOptions = [
        {name: "Gioca", icon: playIcon},
        {name: "Allenamento", icon: trainingIcon},
        {name: "Leaderboard", icon: leaderboardIcon},
        {name: "Daily board", icon: dailyIcon},
        {name: "Storico", icon: historyIcon},
        {name: "Profilo", icon: userIcon}
    ];

    const bottomOptions = [
        {name: "Log out", icon: logoutIcon},
    ];

    const [optionActive, setOptionActive] = useState();
    const [workInProgActive, setWorkInProgActive] = useState(false);
    const [optionForLogged, setOptionForLogged] = useState(false);

    const nonClickableButton = ({name}) => {
        return (name === "Allenamento" || name === "Log out" || name === "Impostazioni");
    }

    const nonLoggedButton = ({name}) => {
        return (name === "Storico" || name === "Leaderboard" || name ==="Daily board" || name === "Profilo");
    }

    const handleClick = ({name}) => {
        if (optionActive === name) {
            setOptionActive(undefined);
            if (nonClickableButton({name})) {
                setWorkInProgActive(false);
            }
            if(nonLoggedButton({name})){
                setOptionForLogged(false);
            }
        } else {
            setOptionActive(name);
            setWorkInProgActive(nonClickableButton({name}));
            setOptionForLogged(nonLoggedButton({name}));
        }
    }


    return (
            <div className={"flex"}>
                {/* SIDEBAR */}
                <div className={"flex flex-col justify-between min-w-fit h-screen bg-background border-r-4 border-primary"}>
                    <div>
                        {topOptions.map((item) => (
                            <div className={`flex p-4 justify-start items-center gap-4 hover:bg-accent ${(optionActive===item.name) && 'bg-accent'}`}
                                 key={item.name}
                                 onClick={() => handleClick({name: item.name})}
                            >
                                <img className={"w-6 h-6"} src={item.icon} alt={item.name} />
                                <span className={"text-xl font-medium"}>
                                    {item.name}
                                </span>
                            </div>

                        ))}
                    </div>
                    <div>
                        {bottomOptions.map((item) => (
                            <div className={`flex p-4 justify-start items-center gap-4 hover:bg-accent ${(optionActive===item.name) && 'bg-accent'}`}
                                 key={item.name}
                                 onClick={() => handleClick({name: item.name})}
                            >
                                <img className="w-6 h-6" src={item.icon} alt={item.name} />
                                <span className="text-xl font-medium">
                                    {item.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            {/* CONTENUTI */}
            <div className="w-full flex justify-around bg-background">
                {workInProgActive && <WorkInProgPage /> }
                {optionForLogged && <ShouldLogPage />}
                </div>
            </div>
    );
}