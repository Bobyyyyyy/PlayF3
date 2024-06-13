import { useEffect, useState } from "react";
// import '../components/formGameOption/styleFormGame.css'


export default function DifficultySlider({sliderValue, setSliderValue, setPosition, whiteStarts }) {

    return (
        <div className="flex flex-col md:flex-row justify-between border border-primary items-start p-2 rounded-lg" >
            <span className={"text-2xl font-medium"}>
                SBILANCIAMENTO:
            </span>
            <div className={"flex justify-evenly w-full"}>
                <span className={"text-xl font-normal w-1/6"}>
                    {sliderValue}
                </span>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue} onChange={e => setSliderValue(e.target.value)}
                />
            </div>
        </div>
    )
}