const FS = require('./FS.js');
const { Server } = require('socket.io');
let Port;

const path = require('path');
const e = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });
Port = parseInt(process.env.Port);
console.log(`localhost:${Port}`);

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
let IASocket = undefined;
io.on('connection', function (socket) {
    console.log('Bem vindo novo utilizador!');

    socket.on('IaApiConnection', async function (data) {
        if (data.IaSocket == "123456789987654321" && IASocket == undefined) {
            IASocket = socket;
            console.log("Coneção estabelecida com sucesso com a IA");
            //socket.emit('JsonMoves', "Coneção estabelecida com sucesso");
        }
    });


    socket.on('NewPlayer', async function (data) {
        data = JSON.parse(data.text);
        var s = [];
        data.Username = data.Username.replace(/ /g, '').toLowerCase();

        if (await FS.CheckNameAreValid(data.Username, data.Admin, "StartGame"))
            s = await FS.CheckSocketExisted(data.Username, data.token, false, socket, SocketClients);
        else {
            await FS.SendMessageToPlayer("Nome de jogador inválido", socket, "status");
            socket.intentionalDisconnect = "false";
            socket.disconnect();
        }

        if (s.length !== 0)
            await FS.AddPlayer(s[0], SocketClients);
        else {
            await FS.SendMessageToPlayer("Já existe um jogador com esse nome ou ip", socket, "status");
            socket.intentionalDisconnect = "false";
            socket.disconnect();
        }
    });

    socket.on('NewBot', async function (data) {
        data = JSON.parse(data.text);
        data.botname = data.botname.replace(/ /g, '');

        var result = await FS.AddBot(data, SocketClients);
        if (result != "read ECONNRESET" && result != -1) {
            await FS.AddPlayer({ id: result.botid, Username: result.botname, score: 0, GameWasStarted: false, connection: IASocket, BotMoves: [], typeBot: data.type, token: result.token }, SocketClients );

            //** **/
            await FS.JoinLobby(result.botname, data.idLobby, SocketClients);

            await FS.OkReadyLobby({ Username: result.botname, idLobby: data.idLobby }, SocketClients, socket, IASocket); // IASocket == undefined ? socket : IASocket
        }
        else {
            await FS.SendMessageToPlayer("Problemas a criar o bot tente novamente!", socket, "status");
            console.log("Problemas a criar o bot tente novamente!");
        }
    });

    socket.on('JsonMoves', async function (data) {
        // Vou receber moves a partir daqui! Ricardo
		console.log("JsonMoves: " + data);
		await FS.JsonMoves(data.text, SocketClients);
    })

    socket.on('Ping', async function (data) {
        if (SocketClients.NewGame.length != 0 || SocketClients.NewPlayer.length != 0)
            await FS.PingPongClient(data.text, SocketClients);
        else {
            socket.disconnect();
        }
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
        await FS.CreateLobby(JSON.parse(data.text), SocketClients);
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
        await FS.OkReadyLobby(JSON.parse(data.text), SocketClients, socket, IASocket);//IASocket
    });


    socket.on('TestObject', async function (data) {
        SocketClients.NewPlayer.push({ id: 0, Username: "BotM1", score: 0, active: false, connection: socket });
        SocketClients.NewGame.push({ idGame: 0, dateTime: new Date, players: [0], active: false, statusGame: { EstadoJogador: [{ idPlayer: 0, x: 0, y: 0, distancia: 0, personagem: [], powerups: [], Alive: true }], JogadorReady: [], Obstaculos: await FS.CriarObstaculos() } });
        console.log(`{\"data\":[{\"UserBot\":\"${SocketClients.NewPlayer[0].Username}\",\"Obstaculos\":${JSON.stringify(SocketClients.NewGame[0].statusGame.Obstaculos)}}]}`);
        IASocket.emit('bot1', `{\"data\":[{\"UserBot\":\"${SocketClients.NewPlayer[0].Username}\",\"Obstaculos\":${JSON.stringify(SocketClients.NewGame[0].statusGame.Obstaculos)}}]}`);
        console.log("TestObject");
    });

    socket.on('test', async function (data) {
        console.log("" + new Date());
    });
    socket.on('TestJson', async function (data) {

        // for (let a = 0; a < 20; a++)
        //     await FS.PingPongClientTeste(data, SocketClients);
        /*.split("\",").forEach(async element => {
            var s = await FS.PingPongClientTeste(element.replace("[\"").replace(/\"/g, ''), SocketClients);
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (s == "Estado: false") {
                await SendMessageToPlayer("Colisão", socket);
                return 0;
            }
        });*/

    });
})

