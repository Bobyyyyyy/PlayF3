const MatchController = require('../controllers/MatchController');
const rwClient = require("./TwitterClient");
const {EUploadMimeType} = require("twitter-api-v2");
let matchController = new MatchController();

async function tweet(type){
    try {
        const image = await getFen2Image(type);
        const buffer = await image.arrayBuffer();
        const nodeBuffer = Buffer.from(buffer);
        const mediaId = await rwClient.v1.uploadMedia(nodeBuffer, { mimeType: EUploadMimeType.Png });
        const text = chooseText(type);
        await rwClient.v2.tweet( {
            text: text,
            media: {
                media_ids: [mediaId]
            }
        });
    } catch (error) {
        console.log(error)
    }
}

async function getFen2Image(type) {
    const controllerOutput = (type === 'daily') ? await matchController.getDailyMatch() : await matchController.getWeeklyMatch();
    const fen = controllerOutput.content.start_situation;
    try {
        let res = await fetch(`https://fen2png.com/api/?fen=${fen}&raw=true`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            }
        })
        if (res.ok) {
            return await res.blob();
        }
    } catch (error) {
        throw new Error("non e' stato possibile ottenere l'immagine dalla fen");
    }
}

function chooseText(type) {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    today = dd + '-' + mm + '-' + yyyy;
    let text = '';
    const numMes = getRandomIntInclusive(0, 4);
    if (type === 'daily') {
        switch (numMes) {
            case 0:
                text = `♟️ La sfida scacchistica di oggi ti aspetta!\nTuffati nel mondo dinamico di PlayF3 con una nuova scacchiera giornaliera. \n Abbraccia l'imprevedibilità, adatta la tua strategia e conquista la scacchiera! 🏆\n   \n  Oggi: ${today}\n #SfidaPlayF3 #InnovazioneNegliScacchi`
                break;
            case 1:
                text = `⚔️ Oggi è il giorno della sfida su PlayF3!\n Partecipa alla variante giornaliera e mostra le tue abilità strategiche.\n Ogni mossa conta, ogni giorno. 🌟\n   \n  Oggi: ${today} \n #SfidaGiornalieraPlayF3 #TatticheScacchi  `
                break;
            case 2:
                text = `♟️ La scacchiera di oggi su PlayF3 è pronta per te! Affronta la sfida giornaliera, sperimenta la varietà e metti alla prova la tua abilità strategica. 🏆\n   \n  Oggi: ${today} \n #GiornataScacchisticaPlayF3 #PlayF3  `
                break;
            case 3:
                text = `🎲 Svela la tua mossa vincente nella sfida giornaliera di PlayF3!\n Con un nuovo layout ogni giorno, l'avventura scacchistica non finisce mai. 🚀\n   \n  Oggi: ${today} \n #SfidaDelGiorno #PlayF3Adventure  `
                break;
            case 4:
                text = `🗓️ Oggi è l'inizio di una nuova avventura su PlayF3!\n Entra nella sfida giornaliera, dove la scacchiera cambia, ma l'emozione è sempre presente. 🌐\n   \n  Oggi: ${today} \n #AvventuraGiornalieraPlayF3 #SfidaScacchi  `
                break;
        }
    } else {
        switch (numMes) {
            case 0:
                text = `♟️ La scacchiera settimanale di PlayF3 è ora attiva! \n Inizia la tua settimana con una sfida strategica unica.\n Affina la tua tattica e conquista la scacchiera! 🏆\n   \n  Oggi: ${today} \n #PlayF3 #ScacchiSettimanali  `
                break;
            case 1:
                text = `⚔️ Preparati per una settimana di giochi intriganti su PlayF3! \nLa sfida settimanale è live, quindi affina le tue abilità e supera gli avversari. 🌟\n   \n  Oggi: ${today} \n #SfidaSettimanalePlayF3 #EccellenzaNegliScacchi  `
                break;
            case 2:
                text = `♟️ La tua settimana inizia con la variante settimanale di PlayF3!\n Adatta la tua strategia a una nuova disposizione e conquista la scacchiera con astuzia. 🚀\n   \n  Oggi: ${today} \n #VarianteSettimanalePlayF3 #PlayF3Challenge  `
                break;
            case 3:
                text = `🎲 La scacchiera settimanale di PlayF3 ti attende!\n Ogni mossa è una nuova opportunità strategica.\n Unisciti alla sfida settimanale e mostra il tuo talento scacchistico. 🚀\n   \n  Oggi: ${today} \n #SettimanaScacchisticaPlayF3 #SfidaTattica  `
                break;
            case 4:
                text = `🗓️ Inizia la tua settimana con una nuova prospettiva su PlayF3! \nPartecipa alla sfida settimanale, sperimenta il cambiamento e sfida te stesso strategicamente. 🌐\n   \n  Oggi: ${today} \n #InizioSettimanaPlayF3 #SfidaScacchiSettimanale  `
                break;
        }
    }
    return text;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

module.exports = {
    tweet,
}