import React from "react";

export default function IntroCard() {
    return (
        <div className="flex flex-col max-w-6xl w-4/5 h-fit bg-secondary p-4 rounded-lg drop-shadow-2xl md:mt-8">
            <h1 className="self-center text-6xl font-bold">PLAYF3</h1>
            <p className="text-xl mt-8">
                Really Bad Chess è una variante degli scacchi che
                rompe le regole tradizionali, infatti ad ogni giocatore è dato un re e
                altri 15 pezzi selezionati casualmente in base allo sbilanciamento scelto.
            </p>
            <p className="text-xl mt-4">
                È un gioco adatto a tutti i livelli, dove non serve essere esperti
                per divertirsi.
            </p>
            <p className="text-xl mt-8">
                Realizzato da Alessandro Ravveduto, Alessandro Tomaiuolo, Daniele Romanella, Francesco Testa, Mattia Lodi, Saverio Govoni
            </p>
        </div>
    );
}