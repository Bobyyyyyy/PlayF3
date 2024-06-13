import React from "react";


export default function Sidebar({ topOptions, bottomOptions, optionActive, handleClick }) {

    return (
        <>        
        <div className={"fixed flex flex-col justify-between min-w-fit h-screen bg-primary "}>
            <div>
                {topOptions.map((item) => (
                    <div className={`flex p-4 justify-start items-center gap-4 hover:bg-accent hover:text-white ${(optionActive === item.name) && 'bg-accent text-white'}`}
                        key={item.name}
                        onClick={() => handleClick({ name: item.name })}
                    >
                        <img className={"w-9 h-9"} src={item.icon} alt={item.name} />
                        <span className={"text-xl font-medium md:text-2xl"}>
                            {item.name}
                        </span>
                    </div>
                ))}
            </div>
            <div>
                {bottomOptions.map((item) => (
                    <div className={`flex p-4 justify-start items-center gap-4 hover:bg-accent hover:text-white ${(optionActive === item.name) && 'bg-accent text-white'}`}
                        key={item.name}
                        onClick={() => handleClick({ name: item.name })}
                    >
                        <img className="w-9 h-9" src={item.icon} alt={item.name} />
                        <span className="text-xl font-medium md:text-2xl">
                            {item.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        <div className="w-[420px] h-screen"></div>

        </>
    );
}