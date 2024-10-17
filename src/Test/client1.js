var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');

// Listen for the 'news' event from the server
socket.on('news', function (data) {
    console.log('Received news from server:', data);
});

socket.on('status', async function (data) {
    if(data.content == "startGame")
    {
        let a = 0;
        while(true)
        {
            await socket.emit('Ping', { text: `{""}` });
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Ping"+a);
        }
    }
    console.log('Received news from server1:', data);
});

// Send a 'news' event to the server
async function load() {

    socket.emit('NewPlayer', { text: '{"Username":"Test2"}' });
    socket.emit('news', { text: 'Hello from the client!' });
    await Promise.resolve(setTimeout(() => { }, 1000));
    socket.emit('JoinLobby', { text: '{"Username":"Test2", "idLobby":0}' });
}

load();