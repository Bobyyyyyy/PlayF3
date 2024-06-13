export default function Table ({headings, values}) {
    let pos = 0;
    return (
        <>
        {values.length === 0 ?
                (
                    <div className={"flex flex-col justify-center items-center w-full mt-4 border-4 border-primary bg-secondary rounded-md"}>
                        <span className="text-lg md:text-xl font-semibold p-4" >Nessuno ha ancora giocato a questa modalità!</span>
                        <span className="text-xl md:text-2xl font-bold p-4 uppercase" >inizia tu per primo!</span>
                    </div>
                ) : (
                    <table className="w-full border-4 border-primary">
                        <thead className="bg-secondary flex w-full p-4 border-b-4 border-primary ">
                            <tr className="flex w-full justify-between">
                                {headings.map((title)=> (
                                    <th className="uppercase font-bold text-xl md:text-3xl" key={title.name}>
                                        {title.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="flex flex-col items-center justify-between overflow-y-scroll w-full h-fit max-h-[14rem] md:max-h-[22rem] ">
                        {values.map((utente) => {
                            pos += 1;
                            return (
                                    <tr
                                        className="flex w-full mb-4 items-center justify-between font-medium md:font-semibold text-xl md:text-2xl"
                                        key={pos}
                                    >
                                        <td className="ml-8 w-fit">
                                            {pos}
                                        </td>
                                        <td className="text-center w-full">
                                            {utente.name}
                                        </td>
                                        <td className="mr-8 w-4 text-black">
                                            {utente.min_moves}
                                            {(utente.elo < 0) ? 0 : utente.elo }
                                        </td>
                                    </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )
        }
        </>
    );
}