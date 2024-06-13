export default function CopyLink({copyButton, copyText, gameLink, resign}) {

    return (
        <div className="flex flex-col justify-evenly items-center :mt-4 md:mt-8">
                <h1 className="H1 my-8 mx-auto text-center">Multi Player game</h1>

                <div
                    className="flex flex-col border-2 border-primary bg-secondary p-2 rounded-lg w-full gap-4
                        :w-full md:w-2/3">
                    <h1 className="text-center">
                        Copia e condividi il link!
                    </h1>
                    <div className="flex flex-row">
                        <input
                            className="mx-2 px-2 rounded-lg w-4/5 border-2 bg-background border-primary"
                            disabled
                            value={gameLink}>
                        </input>
                        <button
                            className="mx-2 border-2 border-primary bg-background rounded-lg p-2 overflow-hidden
                                hover:bg-primary hover:text-background  w-1/5"
                            onClick={copyText}
                        >
                            {copyButton}
                        </button>
                    </div>
                </div>

                <button className="my-4 Empty-btn min-w-fit" onClick={resign}>
                    Abbandona
                </button>
            </div>
    )
}