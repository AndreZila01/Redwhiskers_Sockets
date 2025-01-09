var io = require('socket.io-client');
require('dotenv').config();
var socket = io.connect(`http://10.36.243.29:3000`);

// Listen for the 'news' event from the server
socket.on('news', function (data) {
    console.log('Received news from server:', data);
});

socket.on('status', function (data) {
    console.log('Received news from server1:', data);
});

// Send a 'news' event to the server

async function load()
{
    //socket.emit('NewPlayer', { text: '{"Username":"Test2"}' });
    // socket.emit('news', { text: 'Hello from the client!' });
    console.log('Received news from server2:');
    // while(true){
    //     socket.emit('test', { text: '{"Username":"Test2", "idLobby":0}' });        
    //     await Promise.resolve(setTimeout(() => { }, 1000/3));
    // }
    setInterval(() => {
        socket.emit('test', { text: '{"Username":"Test2", "idLobby":0}' });
    }, 1000/4);
}

load();