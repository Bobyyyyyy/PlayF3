import SERVER from '../../misc/Server.js';
import {clearSession} from "../../util/utils.js";

export default function LogoutForm(){

    const effettuaLogout = () => {
        clearSession();
        fetch(SERVER.url + "/user/logout", {
            mode: 'cors',
            method: 'POST',
            credentials: 'include'
        })
            .then(()=>{
                window.location.replace("/")
            })
    };

    return (
        <div className={"flex flex-col w-full max-w-xl min-w-fit h-fit bg-secondary p-4 rounded-lg drop-shadow-2xl md:mt-8 border-4 border-primary gap-4 mx-6"}>
                <span className="text-xl md:text-4xl font-bold">
                    Siete sicuri di effetturare il log out ?
                </span>
                <span className="text-base md:text-2xl font-semibold">
                    Una volta usciti verrete riportati alla pagina iniziale
                </span>
            <div className="flex w-full justify-center items-center">
                <button
                    onClick={effettuaLogout}
                    className="bg-white text-red-700 text-2xl rounded-lg font-semibold border-2 border-red-700 hover:bg-red-700 hover:text-white w-1/2 hover:border-white py-2"
                >
                    Log out
                </button>
            </div>
        </div>
    );
}