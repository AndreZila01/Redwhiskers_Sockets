const { default: axios } = require('axios');
var io = require('socket.io-client');
const prompt = require("prompt-sync")({ sigint: true });
require('dotenv').config();
var socket = io.connect(`http://${process.env.Ipv4}:${process.env.Port}`);
const crypto = require('crypto');

// Listen for the 'news' event from the server
socket.on('news', function (data) {
    console.log('Received news from server:', data);
});

var username;
socket.on('status', async function (data) {
    console.log('Received news from server1:', data);

    if (data.content == "Todos os jogadores estão ready! O jogo vai começar!") {
        let a = 0;
        while (true) {
            if (username == undefined)
                username = socket.username;

            socket.emit('Ping', { text: `{\"Username\":\"${username}\", \"x\":0, \"y\":0, \"move\":\"up\"}` });
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Ping" + a);
        }
    }
    else if (data.content.includes("Kick") || data.content.includes("Ban"))
        process.exit();

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
    username = "andre1";
    token = "123";
    // socket.emit('NewPlayer', { text: '{"Username":"Test1"}' });
    // socket.emit('news', { text: 'Hello from the client!' });
    // await Promise.resolve(setTimeout(() => { }, 1000));
    // socket.emit('CreateLobby', { text: '{"Username":"Test1"}' });

    while (true) {
        console.log(`\n\n-1-Definir um username(atual: ${username}) \n0 - Login\n1-Ligar-se ao servidor\n2-Criar lobby\n3-Lista Lobbys\n4-Ligar-se ao Lobby\n5-Dizer que está ready ou unready\n6- Teste Python\n`);

        var option = prompt("Digite o que deseja fazer:");
        switch (option.split(" ")[0]) {
            case "-1":
                var username = prompt("Digite o username:");
                break;
            case "0":
                var password = encrypt(prompt("Digite a senha:").replace("\n", "").replace("\r", "").replace("\r\n", "").replace(/ /g, ''));
                var request = await axios.post(`http://${process.env.Ipv4}:666/login`, { username: username, password: password }, { headers: { 'Content-Type': 'application/json' } });
                var token = request.headers.authorization;
                break;
            case "1":
                socket.username = username;
                socket.emit('NewPlayer', { text: `{"Username":"${username}", "token":"${token}"}` });
                await new Promise(resolve => setTimeout(resolve, 1000));
                break;
            case "2":
                socket.emit('CreateLobby', { text: `{"Username":"${username}"}` });
                await new Promise(resolve => setTimeout(resolve, 1000));
                break;
            case "3":
                socket.emit('ListLobbys', {});
                await new Promise(resolve => setTimeout(resolve, 1000));
                break;
            case "4":
                var idLobby = prompt("Digite o id do lobby:");
                socket.emit('JoinLobby', { text: `{"Username":"${username}", "idLobby":${idLobby}}` });
                await new Promise(resolve => setTimeout(resolve, 1000));
                break;
            case "5":
                socket.emit('OkReadyLobby', { text: `{"Username":"${username}"}` });
                await new Promise(resolve => setTimeout(resolve, 1000));
                return 0;
                break;
            case "6":
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