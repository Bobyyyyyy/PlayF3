export default function LoginForm(){
    const effettuaLogin = () => {
        window.location.replace("/")
    }

    return (
        <div className={"flex flex-col w-full max-w-xl min-w-fit h-fit bg-secondary p-4 rounded-lg drop-shadow-2xl md:mt-8 border-4 border-primary gap-4 mx-6"}>
                <span className="text-4xl font-bold">
                    Vuoi effettuare il login ?
                </span>
                <span className="text-2xl font-semibold">
                    Verrete riportati alla pagina iniziale
                </span>
            <div className="flex w-full justify-center items-center">
                <button
                    onClick={effettuaLogin}
                    className="bg-white text-accent text-2xl rounded-lg font-semibold border-2 border-accent hover:bg-accent hover:text-white w-1/2 py-2"
                >
                    Log In
                </button>
            </div>
        </div>
    );
}