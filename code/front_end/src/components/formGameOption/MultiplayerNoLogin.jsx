import React, {useState } from "react";
import FormLocalGame from "./FormLocalGame";

function MultiplayerNoLogin() {

    const [gameOption, setGameOption] = useState("");

    const handleClick = (e) => {
        setGameOption(e.target.value);
    }

    return (
        <div className={"w-full max-w-screen-sm md:max-w-3xl min-w-fit h-fit bg-secondary p-4 rounded-lg drop-shadow-2xl md:mt-8 border-4 border-primary mx-6 md:mx-0"}>
            <div className={"flex flex-col items-center justify-around gap-4"}>
                <div className={"text-4xl font-medium text-center"}>
                    SCEGLI LA MODALITÀ DI GIOCO
                </div>
                <div className="flex flex-col w-full">
                    <button
                        className={`border border-accent hover:bg-accent hover:border-accent text-accent hover:text-white text-2xl font-bold py-2 w-4/5 rounded mx-auto mt-4 ${(gameOption === "Gioca in locale") ? 'bg-accent text-white' : 'bg-background'}`}
                        value={"Gioca in locale"}
                        onClick={handleClick}
                    >
                        Gioca in locale
                    </button>
                    <button
                        className={`border border-accent hover:bg-accent hover:border-accent text-accent hover:text-white text-2xl font-bold py-2 w-4/5 rounded mx-auto mt-4 ${(gameOption === "Invita un amico") ? 'bg-accent text-white' : 'bg-background'}`}
                        value={"Invita un amico"}
                        onClick={handleClick}
                    >
                        Invita un amico
                    </button>
                    <button
                        className={`border border-accent hover:bg-accent hover:border-accent text-accent hover:text-white text-2xl font-bold py-2 w-4/5 rounded mx-auto mt-4 ${(gameOption === "Entra in una partita") ? 'bg-accent text-white' : 'bg-background'}`}
                        value={"Entra in una partita"}
                        onClick={handleClick}
                    >
                        Entra in una partita
                    </button>
                    <button
                        className={`border border-accent hover:bg-accent hover:border-accent text-accent hover:text-white text-2xl font-bold py-2 w-4/5 rounded mx-auto mt-4 ${(gameOption === "Cerca un avversario") ? 'bg-accent text-white' : 'bg-background'}`}
                        value={"Cerca un avversario"}
                        onClick={handleClick}
                    >
                        Cerca un avversario
                    </button>
                </div>
                <div className="w-4/5">
                    {!!gameOption &&
                        <>
                            {gameOption === "Gioca in locale" ? (
                                <FormLocalGame />
                            ) : (
                                <div>Effettua il login per accedere a queste funzionalità</div>
                            )}
                        </>
                    }
                </div>
            </div>
        </div>

    );
}

export default MultiplayerNoLogin;