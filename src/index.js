const FS = require('./FS.js');
const { Server } = require('socket.io');
let Port;

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
Port = parseInt(process.env.Port);
console.log(Port);

const io = new Server(Port, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

/*
DONE: Haver comandos e receber do cliente "Up", "Down", "Left", "Right" e enviar para todos os clientes/bot, não receber coordenadas
TODO: O server só receber as coordenadas do bot, mas o cliente é normal. E caso haja colider com objetos avisa ao bot para parar. E enviar ao bot de x em x tempo os futuros obstaculos
TODO: receber do bot uma query das posições futuras da ia.
*/

let SocketClients = JSON.parse("{\"NewGame\": [], \"NewPlayer\":[]}");
io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('NewPlayer', async function (data) {
        data = JSON.parse(data.text);
        var s = [];
        data.Username = data.Username.replace(/ /g, '');

        if (await FS.CheckNameAreValid(data.Username, data.Admin, "StartGame"))
            s = await FS.CheckSocketExisted(data.Username, socket, SocketClients);

        if (s.length !== 0)
            await FS.AddPlayer(s[0], SocketClients);
        else {
            await FS.SendMessageToPlayer("Já existe um jogador com esse nome ou ip", socket);
            socket.intentionalDisconnect = "false";
            socket.disconnect();
        }
    });

    socket.on('Ping', async function (data) {
        console.log(data);
        await FS.PingPongClient(JSON.parse(data.text), SocketClients);
    });

    socket.on('news', async function (data) {
        await FS.SendToAllPlayers("Estou vivo", SocketClients);
    });

    socket.on('disconnect', async function (data) {
        if (!socket.intentionalDisconnect && SocketClients.NewPlayer.length !== 0)
            await FS.DisconnectOneUser(socket, SocketClients);
    });

    socket.on('CreateLobby', async function (data) {
        data = JSON.parse(data.text);
        await FS.CreateLobby(data.Username, SocketClients);
    });

    socket.on('ListLobbys', async function (data) {
        await FS.ReturnListOfLobbys(SocketClients, socket);
    });

    // Recebe o NomeJogador e o idLobby
    socket.on('JoinLobby', async function (data) {
        data = JSON.parse(data.text);
        await FS.JoinLobby(data.Username, data.idLobby, SocketClients);
    });

    socket.on('OkReadyLobby', async function (data) {
        await FS.OkReadyLobby(JSON.parse(data.text), SocketClients, socket);
    });

    socket.on('PingTest', async function (data) {
        console.log('Hello! ' + data.content);
        console.log('Hello1! ' + data);
        await FS.SendMessageToPlayer("Hello!", socket);

    });
});
