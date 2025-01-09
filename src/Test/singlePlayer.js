const { default: axios } = require('axios');
var io = require('socket.io-client');
const prompt = require("prompt-sync")({ sigint: true });
require('dotenv').config();
var socket = io.connect(`http://${process.env.IPV4Test}:${process.env.Port}`);
const crypto = require('crypto');

// Listen for the 'news' event from the server
socket.on('news', function (data) {
    console.log('Received news from server:', data);
});

var username;
socket.on('status', async function (data) {
    console.log('Received news from server1:', data);

    if (data.content == "Todos os jogadores estão ready! O jogo vai começar!" || data.content == "O jogo vai começar! Estás preparado!") {
        let a = 0;

        while (true) {
            if (username == undefined)
                username = socket.username;

            let random = (Math.floor(Math.random() * 5000) / 1000);
            if (random > 0 && random < 0.99)
                socket.emit('Ping', { text: `{\"Username\":\"${username}\", \"x\":0, \"y\":0, \"move\":\"wait\"}` });
            else if (random > 0.98 && random < 1.99)
                socket.emit('Ping', { text: `{\"Username\":\"${username}\", \"x\":0, \"y\":0, \"move\":\"up\"}` });
            else if (random > 1.98 && random < 2.99) 
                socket.emit('Ping', { text: `{\"Username\":\"${username}\", \"x\":0, \"y\":0, \"move\":\"right\"}` });
            else if (random > 2.98 && random < 3.99)
                socket.emit('Ping', { text: `{\"Username\":\"${username}\", \"x\":0, \"y\":0, \"move\":\"down\"}` });
            else
                socket.emit('Ping', { text: `{\"Username\":\"${username}\", \"x\":0, \"y\":0, \"move\":\"left\"}` });

            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Ping" + a);
        }
    }
    else if (data.content.includes("Kick") || data.content.includes("Ban"))
        process.exit();
    else if (data.content.includes("Game Over")) {
        console.log("Game Over");
        process.exit();
    }

});

socket.on('bot1', async function (data) {
    console.log('Received news from server:', data);
});

function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from("93f5e5439e2d4a9c70e51c1a4b78c8a3d2e6a3f4b791c8f12b3e74d9a3f9e2b1", 'hex'), Buffer.from("9a5d4c3f7e8a9c2b3e4f1d6a8b7c9e0f", 'hex'));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Send a 'news' event to the server

async function load() {
    var username = "andre1", token = "123", idUser = 0;
    console.log("Irá ligar-se ao servidor: " + process.env.IPV4Test + ":" + process.env.Port);
    // socket.emit('NewPlayer', { text: '{"Username":"Test1"}' });
    // socket.emit('news', { text: 'Hello from the client!' });
    // await Promise.resolve(setTimeout(() => { }, 1000));
    // socket.emit('CreateLobby', { text: '{"Username":"Test1"}' });

    while (true) {
        console.log(`\n\n-1-Definir um username(atual: ${username}) \n0 - Criar conta! \n1 - Login\n2 - Criar lobby singleplayer\n3 - Cria Lobby multiplayer\n4 - Mostra a lista de lobbys`);

        var option = prompt("Digite o que deseja fazer:");
        switch (option.split(" ")[0]) {
            case "-1":
                username = prompt("Digite o username:");
                break;
            case "0":
                var email = prompt("Digite o seu email: ").replace("\n", "").replace("\r", "").replace("\r\n", "").replace(/ /g, '');
                var password = encrypt(prompt("Digite a senha: ").replace("\n", "").replace("\r", "").replace("\r\n", "").replace(/ /g, ''));
                var request = await axios.post(`http://${process.env.IPV4Test}:666/register`, { username: username, email: email, password: password }, { headers: { 'Content-Type': 'application/json' } });
                if (request.status == 200)
                    console.log("Conta criada com sucesso!");
                else
                    console.log("Erro ao criar conta!");

                await new Promise(resolve => setTimeout(resolve, 1000));
                //token = request.headers.authorization;

                //Validar token para ter o id do user
                break;
            case "1":
                try {
                    var password = encrypt(prompt("Digite a senha: ").replace("\n", "").replace("\r", "").replace("\r\n", "").replace(/ /g, ''));
                    var request = await axios.post(`http://${process.env.IPV4Test}:666/login`, { username: username, password: password }, { headers: { 'Content-Type': 'application/json' } });
                    console.log(request.statusText);
                    token = request.headers.authorization;
                    socket.emit('NewPlayer', { text: `{"Username":"${username}", "token":"${token}"}` });
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                catch (ex) {
                    console.log(ex.message);
                }
                //Validar token para ter o id do user
                break;
            case "2":
                socket.emit('CreateLobby', { text: `{"Username":"${username}", "token":"${token}", "typeLobby":"Singleplayer"}` });
                await new Promise(resolve => setTimeout(resolve, 1000));
                break;
            case "3":
                break;
            case "4":
                socket.emit('ListLobbys', {});
                await new Promise(resolve => setTimeout(resolve, 1000));
                break;
            case "5":
                var idLobby = prompt("Digite o id do lobby:");
                socket.emit('JoinLobby', { text: `{"Username":"${username}", "idLobby":${idLobby}}` });
                await new Promise(resolve => setTimeout(resolve, 1000));
                break;
            case "6":
                socket.emit('OkReadyLobby', { text: `{"Username":"${username}"}` });
                await new Promise(resolve => setTimeout(resolve, 1000));
                return 0;
                break;
            case "7":
                socket.emit('TestObject', { text: `{"Username":"${username}"}` });
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log("TestObject");
                socket.emit('TestJson', { coordinates: `["up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left"]` });
                console.log("TestJson");
                break;
        }
    }
}

load();