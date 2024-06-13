const fs = require('fs');
const express = require('express');
const backEndRouter = express();
const config = require('./config/playf3')
const cors = require('cors');
const apiDriver = require('./drivers/apiDriver');
const cookieParser = require("cookie-parser");
const http = require('http').createServer(backEndRouter);
const SocketEvents = require('./controllers/SocketEvents');

// Certificate
const privateKey = fs.readFileSync('../../ssl/privkey.pem', 'utf8');
const certificate = fs.readFileSync('../../ssl/cert.pem', 'utf8');
const ca = fs.readFileSync('../../ssl/chain.pem', 'utf8');

const sslCredentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

const https = require('https').createServer(sslCredentials, backEndRouter);

const {Server} = require('socket.io');
const SocketController = require("./controllers/SocketController");
const {json} = require("body-parser");
const Model = require('./models/Model');

const ioHttp = new Server(http, {
    cors: {
        origin: '*'
    },
    pingTimeout: 60 * 1000,
    pingInterval: 1000
});
const ioHttps = new Server(https, {
    cors: {
        origin: '*'
    },
    pingTimeout: 60 * 1000,
    pingInterval: 1000
});

const socketController = new SocketController();

const IOs = [ioHttp, ioHttps];

const cron = require('node-cron');

const session = require('express-session');
const {tweet} = require("./utils/CreateTwitterPost");
const MySQLStore = require('express-mysql-session')(session);

const oneDay = 1000 * 60 * 60 * 24;

const options = {
    host: config._DATABASE_HOST,
    port: config._DATABASE_PORT,
    user: config._DATABASE_USER,
    password: config._DATABASE_PSWD,
    database: config._DATABASE_NAME,
    clearExpired: true,
    clearExpirationInterval: 40000,
    createDatabaseTable: true,
    schema: {
        tableName: 'tbl_sessions',
        columnNames: {
            session_id: 'id',
            expires: 'expires',
            data: 'data',
        }
    }
};

let sessionStore = new MySQLStore(options);

const sessionMiddleWare = session({
    key: 'super_secret_key', //da cambiare
    secret: 'super_secret_secret', //da cambiare
    store: sessionStore,
    saveUninitialized: true,
    cookie: {
        maxAge: oneDay,
        httpOnly: false,
        secure: false,
    },
    httpOnly: false,
    secure: false,
    resave: false
})

backEndRouter.use(sessionMiddleWare);


//Allow CORS
backEndRouter.use(cors({
    origin: ['http://localhost:3000', 'https://localhost:5043', 'http://localhost:5080'],
    credentials: true
}));

// cookie parser middleware
backEndRouter.use(cookieParser());

//parse JSON
backEndRouter.use(json());

let multiplayerList = {};
const socketHandler = new SocketEvents(multiplayerList);

ioHttp.engine.use(sessionMiddleWare);
ioHttps.engine.use(sessionMiddleWare);

for (const iO of IOs) {
    iO.on('connection', (socket) => {
        socketHandler.onSocketConnection(socket, iO);
    });

}

backEndRouter.use('/api', apiDriver);

function handleViewRequest(req, res) {
    const path = require("path")
    const reactDir = path.join(__dirname, '../front_end/dist/');
    backEndRouter.use(express.static(reactDir));
    res.sendFile(path.join(reactDir, '/index.html'));
}

backEndRouter.get('/', (req, res) => {
    handleViewRequest(req, res);
});

backEndRouter.get('/home/', (req, res) => {
    handleViewRequest(req, res);
});

backEndRouter.get('/home/*', (req, res) => {
    handleViewRequest(req, res);
});

backEndRouter.get('/home_no/', (req, res) => {
    handleViewRequest(req, res);
});

backEndRouter.get('/home_no/*', (req, res) => {
    handleViewRequest(req, res);
});


cron.schedule('* * * * *', async () => {
    let model = new Model();
    await model.executeSampleQuery();
});

cron.schedule('5 0 * * *', async () => {
    await tweet("daily");
    console.log("post giornaliero creato")
});

cron.schedule('5 0 * * MON', async () => {
    await tweet("weekly");
    console.log("post settimanale creato")
});

const serverHttp = http.listen(5080, () => {
    console.log(`HTTP  server started on port 5080`);
});

const serverHttps = https.listen(5043, () => {
    console.log(`HTTPS server started on port 5043`);
});

/* TESTING */
function close() {
    serverHttp.close();
    serverHttps.close();
}

module.exports = {backEndRouter, close, socketController};