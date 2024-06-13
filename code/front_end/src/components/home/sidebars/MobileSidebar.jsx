import React, {useEffect, useState} from "react";

export default function MobileSidebar({topOptions, bottomOptions, optionActive, handleClick}) {
    const [showSidebar, setShowSidebar] = useState(false);
    const handleMenuToggle = () => {
        setShowSidebar(!showSidebar)
    }

    useEffect(() => {
        handleMenuToggle();
    }, [optionActive]);

    return (
        <>
            <button onClick={handleMenuToggle}
                    className="fixed right-10 top-0 z-50 flex flex-col justify-center items-center h-12 bg-background px-1 border-2 border-primary  rounded-md"
            > <label>

                <span className={`bg-primary block transition-all duration-300 ease-out 
                                h-1.5 w-12 rounded-sm ${showSidebar ?
                    'rotate-45 translate-y-2.5' : '-translate-y-0.5'
                }`} >
                </span>
                <span className={`bg-primary block transition-all duration-300 ease-out 
                    h-1.5 w-12 rounded-sm my-1 
                    ${showSidebar ? 'opacity-0' : 'opacity-100'}`}
                >
                </span>
                <span className={`bg-primary block transition-all duration-300 ease-out
                                h-1.5 w-12 rounded-sm 
                                ${showSidebar ? '-rotate-45 -translate-y-2.5' : 'translate-y-0.5'}`}
                >
                </span>
            </label>
            </button>

            <div className={`top-0 left-0 fixed h-full flex flex-col justify-between min-w-fit bg-primary border-r-4 border-black 
                ease-in-out duration-300 z-10 ${showSidebar ? "translate-x-0 bg-opacity-100" : "-translate-x-full" }`}
            >
                <div>
                    {topOptions.map((item) => (
                        <div className={`flex p-4 justify-start items-center gap-4 hover:bg-accent ${(optionActive===item.name) && 'bg-accent text-white '}`}
                             key={item.name}
                             onClick={() => handleClick({name: item.name})}
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
                        <div className={`flex p-4 justify-start items-center gap-4 hover:bg-accent ${(optionActive===item.name) && 'bg-accent text-white'}`}
                             key={item.name}
                             onClick={() => handleClick({name: item.name})}
                        >
                            <img className="w-9 h-9" src={item.icon} alt={item.name} />
                            <span className="text-xl font-medium md:text-2xl">
                                    {item.name}
                                </span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}