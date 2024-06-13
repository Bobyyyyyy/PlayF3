import { useState } from "react";
import DifficultySlider from "./DifficultySlider";
import { Link } from "react-router-dom";
import RadioButtons from "./RadioButtons";

function FormLocalGame() {
    
    const timeOptions = [
        { name: "3 m" },
        { name: "5 m" },
        { name: "10 m" },
        { name: "15 m" }
    ];

    const [sliderValue, setSliderValue] = useState(50);
    const [timer, setTimer] = useState(timeOptions[0].name);
    

    const getTimeInSec = () => {
        let time = 0;
        switch (timer) {
            case "3 m":
                time = 3 * 60;
                break
            case "5 m":
                time = 5 * 60;
                break
            case "10 m":
                time = 10 * 60;
                break
            case "15 m":
                time = 15 * 60;
                break
        }
        return time;
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="border border-primary w-full rounded-lg text-2xl p-2">
                GIOCA CON UN AMICO SULLO STESSO DISPOSITIVO
            </div>
            <RadioButtons
                    listOfOptions={timeOptions}
                    nameMod={"TIMER"}
                    setState={setTimer}
                    activeName={timer}
                />
            <DifficultySlider sliderValue={sliderValue} setSliderValue={setSliderValue}/>
            <div className="flex justify-center">
                <Link
                    className={"flex justify-center border border-accent hover:bg-accent hover:border-accent text-accent hover:text-white text-2xl font-bold py-2 w-full rounded bg-background mt-4 "}
                    to={"localGame"}
                    state={{ diff: sliderValue, time: getTimeInSec() }}
                >
                    GIOCA!
                </Link>
            </div>
        </div>
    )
}

export default FormLocalGame;