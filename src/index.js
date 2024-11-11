var express = require('express');
const { Socket } = require('socket.io');
var app = express();
require('dotenv').config();
var http = require('http').createServer(app);
var io = require('socket.io')(http); // Initialize Socket.io
console.log(process.env.Port);
const Port = parseInt(process.env.Port);
const FS = require('./FS.js');

/*
DONE: Haver comandos e receber do cliente "Up", "Down", "Left", "Right" e enviar para todos os clientes/bot, não receber coordenadas
TODO: O server só receber as coordenadas do bot, mas o cliente é normal. E caso haja colider com objetos avisa ao bot para parar. E enviar ao bot de x em x tempo os futuros obstaculos
TODO: receber do bot uma query das posições futuras da ia.
*/

http.listen(Port, function () {

    // var s = (require('./class.js'));
    console.log(`listening on *:${Port}`);
    SocketClients = JSON.parse("{\"NewGame\": [], \"NewPlayer\":[]}");
});

app.get('/', async function (req, res) {
    await FS.SendToAllPlayers("Hello World", SocketClients);
});

app.get('/startGame', async function (req, res) {
    await FS.SendToAllPlayers("startGame", SocketClients);
});

let SocketClients = [];
//SocketClients.NewGame.push({idGame: 1, dateTime: new Date, players: [], active: false});
io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('NewPlayer', async function (data) {
        data = JSON.parse(data.text);
        var s = await FS.CheckSocketExisted(data.Username, socket, SocketClients);

        if (s.length != 0)
            await FS.AddPlayer(s[0], SocketClients);
        else {
            await FS.SendMessageToPlayer("Já existe um jogador com esse nome ou ip", socket);
            socket.intentionalDisconnect = "false";
            socket.disconnect();
        }
    });

    socket.on('Ping', async function (data) {
        console.log(data);
        var s = await FS.PingPongClient(JSON.parse(data.text), SocketClients);
    });

    socket.on('news', async function (data) {
        await FS.SendToAllPlayers("Estou vivo", SocketClients);
    });

    socket.on('disconnect', async function (data) {
        //console.log(`${socket.intentionalDisconnect} - ${SocketClients.NewPlayer.length}`);
        //SocketClients.NewPlayer.length != 0 && socket.intentionalDisconnect=="false"
        if (!socket.intentionalDisconnect && SocketClients.NewPlayer.length != 0)
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
        console.log('Hello!');
        await FS.SendMessageToPlayer("Hello!", socket);

    });
});
