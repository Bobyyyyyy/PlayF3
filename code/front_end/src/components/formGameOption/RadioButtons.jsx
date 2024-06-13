
export default function RadioButtons ({listOfOptions, nameMod, setState, activeName}) {
    const handleState = ({name}) => {
        if (!nonClickableButton({name}))
            setState(name);
    }

    const nonClickableButton = ({name}) => {
        return (name === "Umano" || name === "Nero");
    }

    return (
        <div className="flex flex-row justify-start border border-primary bg-secondary items-center p-2 rounded-lg " >
            <span className="text-2xl font-medium">
                {nameMod}:
            </span>
                <div className={"flex flex-wrap flex-row w-full justify-center items-center ml-2 gap-2"}>
                    {listOfOptions.map((item)=> (
                        <button
                            className={`${nameMod === "COLORE" ? "w-24" : "w-28"} md:w-32 border border-accent hover:bg-accent hover:border-accent text-accent hover:text-white text-lg sm:text-xl font-normal sm:font-bold py-2 px-4 rounded ${(activeName===item.name)? 'bg-accent text-white' : 'bg-background'} `}
                            key={item.name}
                            onClick={() => handleState({name: item.name})}
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
        </div>
    );

}