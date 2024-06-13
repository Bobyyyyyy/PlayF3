import { Link } from "react-router-dom";

function FormRandGame() {

    return (
        <div className={"flex flex-col gap-4"}>
            <div className="border border-primary w-full rounded-lg text-2xl p-2">
                CERCA UN AVVERSARIO ONLINE
            </div>

            <div className="flex justify-center">
                <Link
                    className={"flex justify-center border border-accent hover:bg-accent hover:border-accent text-accent hover:text-white text-2xl font-bold py-2 w-full rounded bg-background mt-4 "}
                    to={"randomMultiPlayer"}
                >
                    GIOCA!
                </Link>
            </div>
        </div>
    )
}

export default FormRandGame;