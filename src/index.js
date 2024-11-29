const FS = require('./FS.js');
const { Server } = require('socket.io');
let Port;
let IASocket;

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

    if (socket.IaSocket != "IASuuperMegaFixeUasah")
        IASocket = socket;

    socket.on('NewPlayer', async function (data) {
        data = JSON.parse(data.text);
        var s = [];
        data.Username = data.Username.replace(/ /g, '');

        if (await FS.CheckNameAreValid(data.Username, data.Admin, "StartGame"))
            s = await FS.CheckSocketExisted(data.Username, socket, SocketClients);
        else {
            await FS.SendMessageToPlayer("Nome de jogador inválido", socket);
            socket.intentionalDisconnect = "false";
            socket.disconnect();
        }

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
        try {
            if (!socket.intentionalDisconnect && SocketClients.NewPlayer.length !== 0)
                await FS.DisconnectOneUser(socket, SocketClients);
        } catch {
            console.log("Erro no disconnect");
        }
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


    socket.on('TestObject', async function (data) {
        SocketClients.NewPlayer.push({ id: 0, Username: "BotM1", score: 0, active: false, connection: socket });
        SocketClients.NewGame.push({ idGame: 0, dateTime: new Date, players: [0], active: false, statusGame: { EstadoJogador: [{ idPlayer: 0, x: 0, y: 0, distancia: 0, personagem: [], powerups: [], Alive: true }], JogadorReady: [], Obstaculos: await FS.CriarObstaculos() } });
        console.log(`{\"data\":[{\"UserBot\":\"${SocketClients.NewPlayer[0].Username}\",\"Obstaculos\":${JSON.stringify(SocketClients.NewGame[0].statusGame.Obstaculos)}}]}`);
        IASocket.emit('bot1', `{\"data\":[{\"UserBot\":\"${SocketClients.NewPlayer[0].Username}\",\"Obstaculos\":${JSON.stringify(SocketClients.NewGame[0].statusGame.Obstaculos)}}]}`);
        console.log("TestObject");
    });

    socket.on('TestJson', async function (data) {

        for (let a = 0; a < 20; a++)
            await FS.PingPongClientTeste(data, SocketClients);
        /*.split("\",").forEach(async element => {
            var s = await FS.PingPongClientTeste(element.replace("[\"").replace(/\"/g, ''), SocketClients);
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (s == "Estado: false") {
                await SendMessageToPlayer("Colisão", socket);
                return 0;
            }
        });*/

    });
});
