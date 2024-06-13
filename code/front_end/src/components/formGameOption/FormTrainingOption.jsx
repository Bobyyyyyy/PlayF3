import RadioButtons from "./RadioButtons";
import DifficultySlider from "./DifficultySlider.jsx";
import { Link } from "react-router-dom";
import React, { useState } from "react";


export default function FormTrainingOption() {

    const timeOptions = [
        { name: "3 m" },
        { name: "5 m" },
        { name: "10 m" },
        { name: "15 m" }
    ];

    const [sliderValue, setSliderValue] = useState(50);
    const [color, setColor] = useState("Bianco");
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
        <div className="w-full max-w-screen-sm md:max-w-3xl h-fit bg-secondary p-4 rounded-lg drop-shadow-2xl  mx-6 md:mx-0 md:mt-8 border-4 border-primary">
            <div className={"flex flex-col gap-4"}>
                <RadioButtons
                    listOfOptions={timeOptions}
                    nameMod={"TIMER"}
                    setState={setTimer}
                    activeName={timer}
                />

                <DifficultySlider setSliderValue={setSliderValue} sliderValue={sliderValue} />

            </div>
            <div className="flex justify-center">
                <Link
                    className={"flex justify-center border border-accent hover:bg-accent hover:border-accent text-accent hover:text-white text-2xl font-bold py-2 w-full rounded bg-background mt-4 "}
                    to={"trainingGame"}
                    state={{ diff: sliderValue, white: true, time: getTimeInSec() }}
                >
                    GIOCA!
                </Link>
            </div>
        </div>
    );
}