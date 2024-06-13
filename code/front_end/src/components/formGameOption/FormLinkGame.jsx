import { Link } from "react-router-dom";

function FormLinkGame() {
    return (
        <div className={"flex flex-col gap-4"}>
            <div className="border border-primary w-full rounded-lg text-2xl p-2">
                CREA UN LINK DA INVIARE A CHI VUOI
            </div>
            <div className="flex justify-center">
                <Link
                    className={"flex justify-center border border-accent hover:bg-accent hover:border-accent text-accent hover:text-white text-2xl font-bold py-2 w-full rounded bg-background mt-4 "}
                    to={"multiPlayerGame"}
                >
                    GIOCA!
                </Link>
            </div>
        </div>
    )
}

export default FormLinkGame;