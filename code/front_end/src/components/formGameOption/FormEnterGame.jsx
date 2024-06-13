import { useState } from "react";
import { Link } from "react-router-dom";

function FormEnterGame() {
    const [inviteUri, setInviteUri] = useState("");

    return (

        <div className="flex flex-col gap-4">
            <div className="w-full p-2 bg-secondary border border-primary rounded-md flex justify-evenly">
                <label className="mx-1 text-2xl  font-medium">
                    URI:
                </label>
                <input type="text" value={inviteUri} onChange={e => setInviteUri(e.target.value)}
                    className="w-full bg-background rounded-sm" />
            </div>
            <div className="flex justify-center">
                <Link
                    className="flex justify-center border border-accent hover:bg-accent hover:border-accent text-accent hover:text-white text-2xl font-bold py-2 w-full rounded bg-background mt-4 "
                    to={inviteUri} target="_blank" >
                    GIOCA!
                </Link>
            </div>
        </div>
    )
}

export default FormEnterGame;