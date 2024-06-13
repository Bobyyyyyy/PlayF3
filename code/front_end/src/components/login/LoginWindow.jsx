import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Server from "../../misc/Server.js"
import {setIdInSession, setUsernameInSession} from "../../util/utils.js";

export default function LoginWindow() {
    const [logOrSign, setLogOrSign] = useState(true);
    const [errorCredential, setErrorCredential] = useState(false);
    const [isTooLong, setIsTooLong] = useState(false)

    const inviaDati = async (isLogin, name, password) => {
        try {
            let hasLogged;
            let path = `/user${isLogin ? "/login" : ""}`;
            let response = await fetch(Server.url + path, {
                mode: 'cors',
                credentials: 'include',
                method: 'POST',
                body: JSON.stringify({ user: { name: name, password: password } }),
                headers: {
                    "Content-Type": "application/json",
                }
            })
            if (response.ok) {
                let user = await response.json();
                if (!isLogin)
                    await inviaDati(true, name, password);
                setUsernameInSession(user.name);
                setIdInSession(user.id);
                hasLogged = true;
            }
            else {
                hasLogged = false;
            }
            return hasLogged;
        } catch (e) {
            console.log("errore invio dati:", e);
        }
    }

    const switchHandler = () => {
        if (logOrSign) {
            setLogOrSign(false);
        } else {
            setLogOrSign(true);
        }
    };

    function handleSubmit(e) {
        // Prevent the browser from reloading the page
        e.preventDefault();

        // Read the form data
        const form = e.target;
        const formData = new FormData(form);
        const formJson = Object.fromEntries(formData.entries());
        const name = formJson.name.trim();
        const password = formJson.password;

        if (name.length >= 18) {
            setIsTooLong(true);
            setErrorCredential(true);
        } else {
            inviaDati(logOrSign, name, password)
                .then((hasLogged) => {
                    if (hasLogged) {
                        window.location.replace("/home");
                    } else {
                        setErrorCredential(true);
                    }
                })
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setErrorCredential(false);
            setIsTooLong(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, [errorCredential]);

    return (
            <div className="flex flex-col w-full rounded-xl h-fit justify-around items-center p-4 bg-secondary">
                <h2 className="H1 p-2 text-center mb-8">
                    {(logOrSign) ? "Login" : "Sign in"}
                </h2>
                <form className="flex flex-col justify-start items-start h-[14rem]" method="post" onSubmit={handleSubmit}>
                    <label className="text-sm text-text ml-2">
                        username
                    </label>
                    <input type="text"
                        className="bg-background w-fit mx-2 px-2 py-1 rounded-md text-text"
                        name="name" placeholder="username" required={true} />
                    <label className="flex mt-2 text-sm text-text ml-2">
                        password
                    </label>
                    <input type="password"
                        className="bg-background w-fit mx-2 px-2 py-1 rounded-md text-text"
                        name="password" placeholder="password" required={true} />
                    <button type="submit" className="my-4 px-2 mx-auto w-fit Full-btn font-semibold">
                        {(logOrSign) ? "Login" : "Sign in"}
                    </button>
                    <div className={`px-2 text-lg md:text-xl w-full text-red-600`}>
                        {errorCredential && logOrSign && !isTooLong && <h1>Errore nelle credenziali inserite</h1>}
                        {errorCredential && !logOrSign && !isTooLong && <h1>Questo utente già esiste</h1>}
                        {errorCredential && isTooLong && <h1>Username troppo lungo</h1>}
                    </div>
                </form>
                <div className="flex flex-col items-center justify-evenly h-fit w-full py-4 gap-4 border-t-2 border-primary">
                    <div className="text-center">
                        {(logOrSign) ? "Non sei ancora registrato?" : "Hai già un account?"}
                    </div>
                    <button className="px-2 w-fit Empty-btn font-semibold"
                        onClick={switchHandler}>
                        {(logOrSign) ? "Sign in" : "Login"}
                    </button>
                    <div className="text-center hover:text-[#20150dc3]">oppure</div>
                    <Link to={"/home_no"} className=" underline block">gioca senza registrarti</Link>
                </div>
            </div>
    );
}
