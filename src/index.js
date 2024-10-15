var express = require('express');
const { Socket } = require('socket.io');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http); // Initialize Socket.io
const Port = 3000;
const FS = require('./FS.js');

http.listen(Port, function () {

    // var s = (require('./class.js'));
    console.log('listening on *:3000');
    SocketClients = JSON.parse("{\"NewGame\": [], \"NewPlayer\":[]}");
});

app.get('/', function (req, res) {

});

let SocketClients = [];
//SocketClients.NewGame.push({idGame: 1, dateTime: new Date, players: [], active: false});
io.on('connection', function (socket) {
    console.log('a user connected');


    socket.on('addSocket', async function (data) {
        data = JSON.parse(data.text);
        var s = await FS.addSocket(data.Username, socket, SocketClients);

        if (s.length != 0)
            await FS.AddPlayer(s[0], SocketClients);
        else
            await FS.SendMessageToPlayer("Já existe um jogador com esse nome ou ip", socket);
    });

    socket.on('Ping', async function (data) {
        //Enviar data de todos os clientes que estão naquele server
    });

    socket.on('news', async function (data) {
        await FS.SendToAllPlayers("Estou vivo", SocketClients);
    });

    socket.on('disconnect', async function () {
        await FS.DisconnectOneUser(socket, SocketClients);
    });

    socket.on('CreateLobby', async function (data) {
        data = JSON.parse(data.text);
        await FS.CreateLobby(data.Username, SocketClients);
    });

    // Recebe o NomeJogador e o idLobby
    socket.on('JoinLobby', async function (data) {
        data = JSON.parse(data.text);
        await FS.JoinLobby(data.Username, data.idLobby, SocketClients);

    });
});

/***
 * var express = require('express');
const { Socket } = require('socket.io');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http); // Initialize Socket.io
const Port = 3000;

http.listen(Port, function () {

    // var s = (require('./class.js'));
    console.log('listening on *:3000');
    SocketClients = JSON.parse("{\"NewGame\": [], \"NewPlayer\":[]}");
});

app.get('/', function (req, res) {

});

let SocketClients = [];
//SocketClients.NewGame.push({idGame: 1, dateTime: new Date, players: [], active: false});
io.on('connection', function (socket) {
    console.log('a user connected');


    socket.on('addSocket', function (data) {
        data = JSON.parse(data.text);
        var s = SocketClients.NewPlayer.findIndex(ws => ws.connection.request.connection._peername.address == socket.request.connection._peername.address || ws.name == data.Username);
        // if (s != -1)
        // SocketClients.push({ socket: socket });

        SocketClients.NewPlayer.push({ id: SocketClients.NewPlayer.length, name: data.Username, score: 0, active: false, connection: socket });
        // else
        //     console.log('socket already exists');
    });

    socket.on('Ping', function (data) {
        //Enviar data de todos os clientes que estão naquele server
    });

    socket.on('news', function (data) {
        console.log('news received:', data);
        

        SocketClients.NewPlayer.forEach(element => {
            element.connection.emit('news', { content: data.text });
        });
    });

    socket.on('disconnect', function () {
        var s = SocketClients.NewPlayer.findIndex(ws => ws.connection.request.connection._peername.address == socket.request.connection._peername.address || ws.name == data.Username);

        SocketClients.NewPlayer.splice(s, 1);
        //SocketClients.splice(SocketClients.indexOf(socket), 1);
        console.log('user disconnected');
    });

    socket.on('CreateLobby', function (data) {
        data = JSON.parse(data.text);
        var idHoster = SocketClients.NewPlayer.findIndex(ws => ws.name == data.Username);
        var idLobby = 0;
        if(SocketClients.NewGame.length!=0)
            idLobby = SocketClients.NewGame[SocketClients.NewGame.length-1].idGame + 1;

        //TODO: Meter uma condição que verifica se o hoster já está em algum lobby

        SocketClients.NewGame.push({ idGame: idLobby, dateTime: new Date, players: [SocketClients.NewPlayer[idHoster].id], active: false });
    });

    // Recebe o NomeJogador e o idLobby
    socket.on('JoinLobby', function (data) {
        data = JSON.parse(data.text);
        //var idGame = SocketClients.NewGame.findIndex(ws => ws.idGame == data.idGame);
        var idPlayer = SocketClients.NewPlayer.findIndex(ws => ws.name == data.Username);
        SocketClients.NewGame[data.idLobby].players.push(idPlayer);

        //TODO: Meter uma condição que verifica se o player já está em algum lobby não entrar em mais nenhum
        //TODO: Checkar se lobby existe, se é privado ou não e se está cheio
    });

    // Recebe o idLobby, idJogador
    socket.on('DisconnectLobby', function (data) {
        data = JSON.parse(data.text);
        var idGame = SocketClients.NewGame.findIndex(ws => ws.idGame == data.idGame);
        var idPlayer = SocketClients.NewPlayer.findIndex(ws => ws.id == data.idPlayer);
        SocketClients.NewGame[idGame].players.splice(SocketClients.NewGame[idGame].players.indexOf(idPlayer), 1);
    }); 
});


 * 
 *  ****/