function WaitingWindow({ resign }) {
    return (
        <div className="flex flex-col justify-evenly items-center :mt-4 md:mt-8">
            <h1 className="H1 my-8 mx-auto text-center">Multi Player Game</h1>

            <div
                className="flex flex-row border-2 border-primary bg-secondary p-2 rounded-lg min-w-fit gap-4
                        :min-w-fit md:min-w-fit">
                <svg className="animate-spin h-5 w-5 border-4 border-accent rounded-full border-x-transparent">
                </svg>
                <h1 className=" ">
                    Ricerca di un avversario...
                </h1>

            </div>

            <button className="my-4 Empty-btn min-w-fit" onClick={resign}>
                Abbandona
            </button>
        </div>
    )
}

export default WaitingWindow;