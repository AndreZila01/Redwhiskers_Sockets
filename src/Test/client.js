var io = require('socket.io-client');
const prompt = require("prompt-sync")({ sigint: true });
require('dotenv').config();
var socket = io.connect(`http://${process.env.Ipv4}:${process.env.Port}`);

// Listen for the 'news' event from the server
socket.on('news', function (data) {
    console.log('Received news from server:', data);
});

socket.on('status', function (data) {
    console.log('Received news from server1:', data);

    if (data.text == "gamewasstarted") {
        let a = 0;
        while (true) {
            socket.emit('Ping', { text: `{\"Username\":\"${username}\", \"x\":0, \"y\":0}` });
            new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Ping" + a);
        }
    }
});

// Send a 'news' event to the server
var username = "Test1";

async function load() {

    // socket.emit('NewPlayer', { text: '{"Username":"Test1"}' });
    // socket.emit('news', { text: 'Hello from the client!' });
    // await Promise.resolve(setTimeout(() => { }, 1000));
    // socket.emit('CreateLobby', { text: '{"Username":"Test1"}' });

    while (true) {
        console.log(`\n\n0-Definir um username(atual: ${username}) \n1-Ligar-se ao servidor\n2-Criar lobby\n3-Lista Lobbys\n4-Ligar-se ao Lobby\n5-Dizer que está ready ou unready\n`);

        var option = prompt("Digite o que deseja fazer:");
        switch (option.split(" ")[0]) {
            case "0":
                var username = prompt("Digite o username:");
                break;
            case "1":
                socket.emit('NewPlayer', { text: `{"Username":"${username}"}` });
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
        }
    }
}

load();