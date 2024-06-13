function PlayerTag({isPlayerTurn, player}) {

    const playerPrettySeconds = (<>{player.time?.seconds < 10 ? '0' + player.time?.seconds : player.time?.seconds}</>);

    return (
        <span className="ml-4 H3 p-2 Pill-secondary">
            {isPlayerTurn && <span className="animate-ping text-accent align-baseline">•</span>}
            <span className="mr-2">{player.username}</span>
            {player.time && <span className="ml-2">{player.time?.minutes}:{player.time?.seconds === 0 ? "00" : playerPrettySeconds}</span>}
        </span>
    )
}

export default PlayerTag;