//#region Funcções com returns "basicos"

let index = require("./index.js");
const axios = require("axios");
const { Socket } = require("socket.io");

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
let Ipv4 = process.env.Ipv4;

/* Funções que retornam dados */
//Retorna o id do player na lista
async function GetIndexPlayer(Username, SocketClients) {
    return SocketClients.NewPlayer.findIndex(ws => ws.Username == Username);
}

async function GetIndexPlayerById(idPlayer, SocketClients) {
    return SocketClients.NewPlayer.findIndex(ws => ws.id == idPlayer);
}

//Retorna true or false se o lobby existe
async function CheckLobbyExisted(idLobby, SocketClients) {
    return SocketClients.NewGame.findIndex(ws => ws.idGame == idLobby) != -1;
}

//Retorna se o player está em algum lobby
async function CheckIfUserAreOnLobby(Username, SocketClients) {
    var userid = SocketClients.NewPlayer[await GetIndexPlayer(Username, SocketClients)].id;

    await SocketClients.NewGame.forEach(element => {
        if (element.players.includes(userid))
            Username = true;
    });
    if (Username != true)
        return false;
    else
        return true;
}

//Verifica se o jogador é hoster ou não, retorna true or false
async function CheckIfUserAreHoster(idUser, SocketClients) {
    return SocketClients.NewGame.findIndex(ws => ws.players[0] == idUser) != -1;
}

//Retorna o id do player
async function FindSocket(socket, Username, SocketClients) {
    // return -1;
    if (Username != "")
        return SocketClients.NewPlayer.findIndex(ws => ws.connection.request.connection._peername.address == socket.request.connection._peername.address || (ws.Username == Username));
    else
        return SocketClients.NewPlayer.findIndex(ws => ws.connection.request.connection._peername.address == socket.request.connection._peername.address || (ws.Username == Username || ws.connection.id == socket.id));
}


//Cria um lobby e retorna dados do lobby
async function CreateNewLobby(tokenHoster, idHoster, typeLobby) {
    try {
        let request = await axios.post(`http://${Ipv4}:${process.env.API_PORT}/registLobby`, { LobbyCreated: new Date, token: tokenHoster, GameWasStarted: (typeLobby === "Singleplayer" ? true : false), idHoster: idHoster, typeLobby: typeLobby }, { headers: { 'Content-Type': 'application/json' } });
        if (request.status == 200)
            return request.data;
        else
            return -1;
    }
    catch (Ex) {
        console.log(Ex.response.data.Mensagem);
    }
}


async function ReturnIdOfLobby(SocketClients, idLobby) {
    return SocketClients.NewGame.findIndex(ws => ws.idGame == idLobby);
}

// Retorna o lobby onde o jogador está
async function ReturnWhereIsPlayer(indexPlayer, SocketClients) {
    let idPlayer = SocketClients.NewPlayer[indexPlayer].id;
    let whereIsPlayer = SocketClients.NewGame.findIndex(ws => {
        let result = ws.players.includes(idPlayer)
        return result;
    });
    return SocketClients.NewGame[whereIsPlayer].idGame;
}

// Verificar o nome do utilizador
async function CheckNameAreValid(Username, Admin, StatusGame) {
    if (!Admin) {
        var check = !(Username.toLowerCase() == "" || Username.toLowerCase() == undefined || Username.toLowerCase() == "null" || Username.toLowerCase() == null || Username.toLowerCase() == "undefined" || Username.toLowerCase() == " " || Username.toLowerCase() == ` ` || Username.toLowerCase().includes("cpu") || Username.toLowerCase().includes("bot") || Username.toLowerCase().includes("ia") || Username.toLowerCase().includes("npc") || Username.toLowerCase().includes("player") || Username.toLowerCase().includes("jogador") || Username.toLowerCase().includes("teste") || Username.toLowerCase().includes("test") || Username.toLowerCase().includes("admin") || Username.toLowerCase().includes("adm") || Username.toLowerCase().includes("root") || Username.toLowerCase().includes("system") || Username.toLowerCase().includes("servidor") || Username.toLowerCase().includes("server") || Username.toLowerCase().includes("host") || Username.toLowerCase().includes("hospedeiro") || Username.toLowerCase().includes("hospedagem") || Username.toLowerCase().includes("hospedar") || Username.toLowerCase().includes("hospedado") || Username.toLowerCase().includes("administrador") || Username.toLowerCase().includes("administradora"));

        if (StatusGame == "OnGame" && check == false)
            return true;
        else if (StatusGame == "OnGame")
            return false;
        else
            return check;
    }
    else
        return true;
}

// Criar obstaculos
async function CriarObstaculos() {
    let obstaculos = [];
    for (let i = 0; i < 20; i++) {
        // 20 x 100
        let x = parseInt((Math.random() * 690000000) / 6900000);
        let y = parseInt((Math.random() * 990000000) / 9900000);
        let tipo = 1;//parseInt((Math.random() * 300) / 100);

        let index;
        obstaculos.forEach(element => {

            // if (tipo == 0)
            //     tipo = 1;

            if (tipo == 1)
                index = (Math.abs(element.x - x) > 2 && Math.abs(element.y - y) > 2);//obstaculo 1x1
            else if (tipo == 2)
                index = (Math.abs(element.x - x) > 2 && Math.abs(element.y - y) > 5);//obstaculo 1x2
            else if (tipo == 3)
                index = (Math.abs(element.x - x) > 5 && Math.abs(element.y - y) > 2);//obstaculo 2x1
            else
                index = false;

            if (index)
                return index;
        });

        if ((x > -1 && x < 20 && y > -1 && y < 100) && (obstaculos.length == 0 || index)) {
            obstaculos.push({ y: y, x: x, tipo: tipo });
        } else
            i--;
    }

    obstaculos.sort((a, b) => parseInt(a.y) - parseInt(b.y));
    return obstaculos;

}

async function checkColider(obstaculos, player, EstadoJogador) {
    //obstaculo 1x1 tipo 1
    //obstaculo 1x2 tipo 2
    //obstaculo 2x1 tipo 3
    if (!player.Alive)
        return false;

    let distx, disty;
    switch (obstaculos[0].tipo) {
        case 1:
            distx = player.x - obstaculos[0].x;
            disty = player.y - obstaculos[0].y;

            if (distx < 2 && disty < 2 && distx > -1 && disty > -1)
                return false;
            else
                return true;
            break;
        case 2:
            distx = player.x - obstaculos[0].x;
            disty = player.y - obstaculos[0].y;

            if (distx < 2 && disty < 3 && distx > -1 && disty > -1)
                return false;
            else
                return true;
            break;
        case 3:
            distx = player.x - obstaculos[0].x;
            disty = player.y - obstaculos[0].y;

            if (distx < 3 && disty < 2 && distx > -1 && disty > -1)
                return false;
            else
                return true;
            break;
        default:
            return true;
            break;
    }

}
//#endregion

//#region  Add Lista 

//Adicona o jogador a lista
async function AddPlayer(player, SocketClients) {
    SocketClients.NewPlayer.push(player);
    if (!player.Username.includes("Bot")) {
        player.connection.Name = player.Username;
        await SendMessageToPlayer("Bem vindo " + player.Username, player.connection, "status");
    }
}

async function AddBot(bot, SocketClients) {
    try {
        request = await axios.post(`http://${Ipv4}:${process.env.API_PORT}/registerbot`, { Botname: bot.botname, type: bot.type }, { headers: { 'Content-Type': 'application/json' } });
        if (request.status == 200)
            return request.data;
        else
            return -1;
    }
    catch (Ex) {
        console.log(Ex.message);
        return Ex.message;
    }
    //TODO: fazer request a api para adicionar um bot
}

//Cria um lobby
async function CreateLobby(data, SocketClients) {
    console.log(data);
    var index = await GetIndexPlayer(data.Username, SocketClients);
    var newLobby = await CreateNewLobby(data.token, SocketClients.NewPlayer[index].id, data.typeLobby)

    if (newLobby !== -1 && newLobby !== undefined) {
        console.log(newLobby);
        console.log(index + " " + newLobby.GameLobbyid);

        if (data.typeLobby == "Singleplayer") {
            SocketClients.NewGame.push({ idGame: newLobby.GameLobbyid, dateTime: newLobby.LobbyCreated, players: [SocketClients.NewPlayer[index].id], GameWasStarted: true, statusGame: { EstadoJogador: [], JogadorReady: [{ index }], Obstaculos: [] } });

            let json = ""
            SocketClients.NewGame[newLobby.GameLobbyid - 1].players.forEach(element => {
                json += `{\"idPlayer\":${element}, \"ready\":true, \"x\":0, \"y\":0, \"distancia\":0.0, \"personagem\":\"[]\", \"powerups\":\"[]\", \"Query_Bot\":\"[]\", \"Alive\":true},`;
            });
            SocketClients.NewGame[newLobby.GameLobbyid - 1].statusGame.EstadoJogador = (JSON.parse("[" + json.substring(0, json.length - 1) + "]"));


            await SendMessageToPlayer("O jogo vai começar! Estás preparado!", SocketClients.NewPlayer[index].connection, "status");

        } else
            if (!await CheckIfUserAreHoster(index, SocketClients) && !await CheckIfUserAreOnLobby(data.Username, SocketClients)) {
                SocketClients.NewGame.push({ idGame: newLobby.GameLobbyid - 1, dateTime: new Date, players: [SocketClients.NewPlayer[index].id], GameWasStarted: false, statusGame: { EstadoJogador: [], JogadorReady: [], Obstaculos: [] } });

                var request = -1;

                await SendMessageToPlayer("Lobby criado com sucesso " + SocketClients.NewPlayer[index].Username, SocketClients.NewPlayer[index].connection, "status");
            }
            else
                await SendMessageToPlayer("Já está em algum lobby", SocketClients.NewPlayer[index].connection, "status");
    }
    else
        await SendMessageToPlayer("Erro ao criar lobby", SocketClients.NewPlayer[index].connection, "status");
}

/* Verifica se o Socket já está ligado! */
async function CheckSocketExisted(Username, token, admin, socket, SocketClients) {
    if (await FindSocket(socket, Username, SocketClients) == -1) {

        var request = -1;
        try {
            request = await axios.post(`http://${Ipv4}:${process.env.API_PORT}/check-token`, { username: Username }, { headers: { 'Content-Type': 'application/json', token: token } });
        }
        catch (Ex) {
            console.log(Ex);
        }

        if (request.status == 200)
            if (request.data.UserId != -1 && request.data.Mensagem == "Token válido!")
                if (await CheckNameAreValid(Username, admin, "StartGame"))
                    return [{ id: request.data.UserId, Username: Username, score: 0, GameWasStarted: false, connection: socket, BotMoves: [] }];
                else
                    return [{ id: request.data.UserId, Username: Username, score: 0, GameWasStarted: false, connection: socket }];
    }
    else
        return [];
}

//Adiciona o jogador ao lobby
async function JoinLobby(Username, idLobby, SocketClients) {
    try {
        console.log("Username: " + Username + " idLobby: " + idLobby);
        var idPlayer = SocketClients.NewPlayer[await GetIndexPlayer(Username, SocketClients)].id;
        console.log("IdPlayer: " + idPlayer + " idLobby: " + idLobby);
        if (Username != "" && idLobby != undefined && parseInt(idLobby) > -1) {
            if (!await CheckIfUserAreOnLobby(Username, SocketClients)) {
                var idGame = await ReturnIdOfLobby(SocketClients, idLobby);
                if (idGame != -1) {
                    SocketClients.NewGame[idLobby].players.push(idPlayer);
                }
            }
            else
                SendMessageToPlayer("Já estás num lobby... Não podes entrar em mais que dois lobbys ao mesmo tempo!!", SocketClients.NewPlayer[idPlayer].connection, "status");
            // console.log("O user já está em um lobby!");
        }
        else {
            await SendMessageToPlayer("Erro ao entrar no lobby", socket, "status");
            SocketClients.NewPlayer[idPlayer].c3
            onnection.intentionalDisconnect = "true";
            SocketClients.NewPlayer[idPlayer].connection.disconnect();
        }
    } catch (Ex) {
        console.log(Ex);
    }

    //TODO: Checkar se lobby existe, se é privado ou não e se está cheio
}

//#endregion

//#region  Remove Lista

//Remove o jogador do lobby, com idClient
async function RemovePlayer(idClient, SocketClients) {
    SocketClients.NewPlayer[idClient].connection.intentionalDisconnect = "true";
    SocketClients.NewPlayer[idClient].connection.disconnect();
    SocketClients.NewPlayer.splice(idClient, 1);
}

//Fecha o lobby pelo idLobby
async function RemoveLobby(idlobby, SocketClients) {
    SocketClients.NewGame.splice(idlobby, 1);
}

//Desliga todos os users dos lobbys
async function DisconnectAllUsers(SocketClients) {
    SocketClients.NewPlayer.forEach(element => {
        element.connection.intentionalDisconnect = "true";
        element.connection.disconnect();
    });
}

// Remove um jogador do lobby
async function RemovePlayerFromLobby(idPlayer, idLobby, SocketClients) {
    SocketClients.NewGame[idLobby].players.splice(idPlayer, 1);
}

// Desliga todos os jogadores do lobby e comunicar o sim de sessão!
async function DisconnectAllPlayersOfLobby(lobby, SocketClients) {
    lobby.players.forEach(async element => {
        var player = SocketClients.NewPlayer[element];
        await SendMessageToPlayer("O lobby foi fechado", player.connection, "status");
        player.connection.intentionalDisconnect = "true";
        player.connection.disconnect();
    });
}

//Desliga um user do lobby
async function DisconnectOneUser(socket, SocketClients) {
    var index = SocketClients.NewPlayer[await FindSocket(socket, "", SocketClients)].id;
    console.log(`Adeus ${SocketClients.NewPlayer[index].Username}! Até a uma próxima!`);
    if (await CheckIfUserAreHoster(index, SocketClients)) {
        var lobby = SocketClients.NewGame[await ReturnWhereIsPlayer(index, SocketClients)];
        await DisconnectAllPlayersOfLobby(lobby, SocketClients);
        await RemoveLobby(lobby, SocketClients);
    }
    else {
        //TODO: Tirar o user do lobby, desligar o user, guardar na DATABASE
        var idLobby = await ReturnWhereIsPlayer(index, SocketClients);
        if (idLobby != -1)
            await RemovePlayerFromLobby(index, idLobby, SocketClients);
    }

    await RemovePlayer(index, SocketClients);
}
//#endregion

//#region Funções de envio e receber dados do cliente
/* Função para informar todos os users */
async function SendToAllPlayers(data, SocketClients) {
    SocketClients.NewPlayer.forEach(element => {
        //if (!(player.Username.toLowerCase().includes("bot") || player.Username.toLowerCase().includes("cpu")))
        element.connection.emit('status', { content: data });
    });
}

// Envia Mensagem a todos os jogadores do lobby!
async function SendMessageToPlayersOnLobby(lobby, mensagem, SocketClients, EventMitter) {
    lobby.players.forEach(async element => {
        var player = SocketClients.NewPlayer[SocketClients.NewPlayer.findIndex(ws => ws.id == element)];
        // if (!CheckNameAreValid(player.Username)) {
        //     // var json = JSON.parse(mensagem);
        //     // if (json.Obstaculos != undefined)
        //     //     mensagem = JSON.stringify(json.Obstaculos);
        //     await SendMessageToPlayer(mensagem, player.connection);
        // } else
        if (!player.Username.includes("Bot"))
            await SendMessageToPlayer(mensagem, player.connection, EventMitter);
    });
}
6
/* Função para informar um user */
async function SendMessageToPlayer(data, socket, EventMitter) {
    socket.emit(EventMitter, { content: data });
}

async function JsonMoves(databot, SocketClients) {
    console.log("Message back: " + JSON.stringify(databot));
    databot = JSON.parse(databot);
    var lobby = await ReturnWhereIsPlayer(await GetIndexPlayerById(databot.idBot, SocketClients), SocketClients);
    // Se o bot tiver coordenadas, ele vai adicionar a lista!
    if (databot.moves != undefined) {
        //TODO: CHECK COM O RICARDO: guardar as coordenadas do bot
        let idjogador = SocketClients.NewGame[lobby].statusGame.EstadoJogador.findIndex(ws => ws.idPlayer == databot.idBot);
        SocketClients.NewGame[lobby].statusGame.EstadoJogador[idjogador].Query_Bot = JSON.stringify(databot.moves);
    }
}

// Função onde o server recebe informações do cliente!
async function PingPongClient(data, SocketClients) {

    console.log("Message back: " + JSON.stringify(data));
    var index = await GetIndexPlayer(data.Username, SocketClients);
    var idClient = SocketClients.NewPlayer[index].id;

    if (idClient != -1) {
        var idLobby = await ReturnWhereIsPlayer(index, SocketClients);
        var lobby = await ReturnIdOfLobby(SocketClients, idLobby);

        if (lobby !== -1) {
            var player = SocketClients.NewGame[lobby].statusGame.EstadoJogador.find(ws => ws.idPlayer == idClient);

            if (player.Alive && player !== undefined) {
                // Se o bot tiver coordenadas, ele vai adicionar a lista!
                if (data.coordinates !== undefined) {
                    //TODO: CHECK COM O RICARDO: guardar as coordenadas do bot 
                    let idjogador = SocketClients.NewGame[lobby].statusGame.EstadoJogador.findIndex(ws => ws.idPlayer == idClient);
                    SocketClients.NewGame[lobby].statusGame.EstadoJogador[idjogador].Query_Bot = JSON.parse(data.coordinates);
                }

                // A cada 1 segundo o bot vai mover-se uma casa
                if (await CheckNameAreValid(SocketClients.NewPlayer[index].Username, false, "OnGame")) {
                    let idjogador = SocketClients.NewGame[lobby].statusGame.EstadoJogador.findIndex(ws => ws.idPlayer == idClient);
                    data.move = SocketClients.NewGame[lobby].statusGame.EstadoJogador[idjogador].Query_Bot[0];
                    SocketClients.NewGame[lobby].statusGame.EstadoJogador[idjogador].Query_Bot.splice(0, 1);
                }

                if (data.move != undefined || data.move != "" || data.move.toLowerCase() != "wait") {

                    data.move = "" + data.move;

                    console.log(`Player: ${player.idPlayer} Move: ${data.move}`);
                    if (data.move.toLowerCase() == "up" && player.y < 100)
                        player.y += 1;
                    else if (data.move.toLowerCase() == "down" && player.y >= 1)
                        player.y -= 1;
                    else if (data.move.toLowerCase() == "left" && player.x >= 1)
                        player.x -= 1;
                    else if (data.move.toLowerCase() == "right" && player.x < 20)
                        player.x += 1;

                    // player.distancia = Math.sqrt(Math.pow(player.x, 2) + Math.pow(player.y, 2));
                }
                player.distancia++;

                var obstaculos = SocketClients.NewGame[lobby].statusGame.Obstaculos;

                if (obstaculos.length == 0) {
                    //'[{"x":0,"y":0,"tipo":1},{"x":0,"y":10,"tipo":1}]'
                    obstaculos = await CriarObstaculos();
                    SocketClients.NewGame[lobby].statusGame.Obstaculos = obstaculos;
                }else if ((player.distancia > 100 ? player.distancia % 100 : player.distancia) >= obstaculos[0].y)
                    SocketClients.NewGame[lobby].statusGame.Obstaculos.splice(0, 1);


                else


                var alive = await checkColider(obstaculos, player, SocketClients.NewGame[lobby].statusGame.EstadoJogador);

                if (!alive) {
                    player.Alive = false;
                    await SendMessageToPlayer("GAME OVER, Você morreu!", SocketClients.NewPlayer[idClient].connection, "status");
                    console.log(`O jogador ${player.idPlayer} morreu!`);
                }

                if (await CheckIfUserAreHoster(idClient, SocketClients)) {
                    SocketClients.NewGame[lobby].players.forEach(async element => {
                        var player = SocketClients.NewPlayer.find(ws => ws.id == element);
                        if (await CheckNameAreValid((player.Username), false, "OnGame")) {

                            // let idbot = SocketClients.NewGame[lobby].statusGame.EstadoJogador.findIndex(ws => ws.idPlayer == idClient);
                            let IndexEstado = SocketClients.NewGame[lobby].statusGame.EstadoJogador.findIndex(ws => ws.idPlayer == element);
                            let databot = JSON.parse(SocketClients.NewGame[lobby].statusGame.EstadoJogador[IndexEstado].Query_Bot)[0];
                            SocketClients.NewGame[lobby].statusGame.EstadoJogador[IndexEstado].Query_Bot = JSON.stringify(JSON.parse(SocketClients.NewGame[lobby].statusGame.EstadoJogador[IndexEstado].Query_Bot)).splice(0, 1);

                            //#region

                            if (databot.move != undefined && databot.move != "" && databot.move.toLowerCase() != "wait") {

                                databot.move = "" + databot.move;

                                console.log(`Player: ${player.idPlayer} Move: ${databot.move}`);
                                if (databot.move.toLowerCase() == "up" && player.y < 100)
                                    SocketClients.NewGame[lobby].statusGame.EstadoJogador[element].y += 1;
                                else if (databot.move.toLowerCase() == "down" && player.y >= 1)
                                    SocketClients.NewGame[lobby].statusGame.EstadoJogador[element].y -= 1;
                                else if (databot.move.toLowerCase() == "left" && player.x >= 1)
                                    SocketClients.NewGame[lobby].statusGame.EstadoJogador[element].x -= 1;
                                else if (databot.move.toLowerCase() == "right" && player.x < 20)
                                    SocketClients.NewGame[lobby].statusGame.EstadoJogador[element].x += 1;

                            }
                            SocketClients.NewGame[lobby].statusGame.EstadoJogador[element].distancia++;

                            var obstaculos = SocketClients.NewGame[lobby].statusGame.Obstaculos;

                            var alive = await checkColider(obstaculos, player, SocketClients.NewGame[lobby].statusGame.EstadoJogador);
                            if (!alive) {
                                player.Alive = false;//TODO: Fazer alguma coisa quando os bots morrerem!
                                await SendMessageToPlayer("GAME OVER, Você morreu!", SocketClients.NewPlayer[idClient].connection);
                                console.log(`O jogador ${player.idPlayer} morreu!`);
                            }

                        }
                        //#endregion

                    });
                }

                let json = {players: [], Obstaculos: []};

                SocketClients.NewGame[lobby].statusGame.EstadoJogador.forEach(element => {
                    json.players.push({idPlayer:element.idPlayer, x:element.x, y:element.y, distancia:element.distancia, personagem:element.personagem, powerups:element.powerups, Alive: element.Alive});
                });

                json.Obstaculos = obstaculos;

                if (SocketClients.NewPlayer[index].Username.includes("Bot"))
                    await SendMessageToPlayer({ idBot: idClient, typeBot: SocketClients.NewPlayer[index].typeBot, token: SocketClients.NewPlayer[index].token, obstaculos: SocketClients.NewGame[lobby].statusGame.Obstaculos, x: player.x, y: player.y }, SocketClients.IaApiConnection, "JsonMoves");
                else
                    await SendMessageToPlayersOnLobby(SocketClients.NewGame[lobby], json, SocketClients, "status");


            }
            else
                console.log("O jogador não está em nenhum lobby!");
        }
        else
            console.log("O lobby não existe!");

    }
    else
        console.log("O jogador não existe!");
    //SocketClients.NewGame[data.idLobby].statusGame.EstadoJogador
    //Enviar data de todos os clientes que estão naquele server
}

/* NÃO SEI SE É UTIL OU NÃO!! */
// // Função onde começa o jogo e cria as coisas necessárias
// async function StartGameOnLobby(data, SocketClients) {
//     if (CheckIfUserAreHoster(data.idPlayer, SocketClients)) {
//         var idGame = await ReturnIdOfLobby(SocketClients, data.idLobby);
//         if (idGame != -1) {
//             SocketClients.NewGame[idGame].GameWasStarted = true;

//             //...
//         }
//     }
// }

// Função que diz que os jogadores já estão ready envia para a lista os jogadores que estão ready
async function OkReadyLobby(data, SocketClients, socketclient, IaApiConnection) {

    var idLobby = await ReturnWhereIsPlayer(await FindSocket(socketclient, "", SocketClients), SocketClients);
    if (idLobby == -1)
        idLobby = await ReturnWhereIsPlayer(await FindSocket(socketclient, "", SocketClients), SocketClients);

    console.log("IdLobby: " + idLobby);

    if (idLobby != -1)
        if (await CheckLobbyExisted(idLobby, SocketClients)) {
            var lobby = SocketClients.NewGame[idLobby];
            var indexuser = await GetIndexPlayer(data.Username, SocketClients);
            var idUser = SocketClients.NewPlayer[indexuser].id;
            if (!lobby.statusGame.JogadorReady.includes(idUser)) {
                if (lobby.statusGame.JogadorReady == 0) {
                    lobby.statusGame.JogadorReady.push({ idPlayer: idUser, ready: true });
                    if (SocketClients.NewPlayer[indexuser].connection != undefined)
                        await SendMessageToPlayer("Para o jogo começar tem de ter pelo menos 1 jogador!", SocketClients.NewPlayer[indexuser].connection, "status");
                }
                else {
                    lobby.statusGame.JogadorReady.push({ idPlayer: idUser, ready: true });

                    await SendMessageToPlayer("Você está ready no servidor! A espera de resposta do Admin", socketclient, "status");//TODO: Checkar porque ele não envia a mensagem para o ultimo utilizador ...

                    if (lobby.players.length == lobby.statusGame.JogadorReady.length) {
                        let json = ""
                        SocketClients.NewGame[idLobby].players.forEach(element => {
                            json += `{\"idPlayer\":${element}, \"ready\":true, \"x\":10, \"y\":0, \"distancia\":0.0, \"personagem\":\"[]\", \"powerups\":\"[]\", \"Query_Bot\":\"[]\", \"Alive\":true},`;
                        });
                        SocketClients.NewGame[idLobby].statusGame.EstadoJogador = (JSON.parse("[" + json.substring(0, json.length - 1) + "]"));
                        SocketClients.NewGame[idLobby].statusGame.EstadoJogador.sort((a, b) => parseFloat(a.idPlayer) - parseFloat(b.idPlayer));

                        SocketClients.NewGame[idLobby].statusGame.Obstaculos = await CriarObstaculos();

                        await SendMessageToPlayersOnLobby(lobby, "Todos os jogadores estão ready! O jogo vai começar!", SocketClients, "status");

                        for (let i = 0; i < SocketClients.NewGame[idLobby].players.length; i++)

                            var idUser = SocketClients.NewGame[idLobby].players[i];
                        var user = SocketClients.NewPlayer[SocketClients.NewPlayer.findIndex(ws => ws.id == idUser)];

                        if (user.Username.includes("Bot"))
                            await SendMessageToPlayer({ idBot: idUser, typeBot: user.typeBot, token: user.token, obstaculos: SocketClients.NewGame[idLobby].statusGame.Obstaculos, x: 10, y: 0 }, IaApiConnection, "JsonMoves");
                    }
                }
            }
            else {
                if (lobby.statusGame.JogadorReady.includes(idUser)) {
                    var index = lobby.statusGame.JogadorReady.findIndex(ws => ws.idPlayer == idUser);
                    lobby.statusGame[index].JogadorReady.ready == true ? lobby.statusGame[index].ready = false : lobby.statusGame[index].ready = true;
                }
            }

        }
}

// Função que retorna a lista de lobbys
async function ReturnListOfLobbys(SocketClients, socket) {

    var lobbys = "";
    SocketClients.NewGame.forEach(element => {
        lobbys += lobbys + `id: ${element.idGame}, players: ${element.players.length}/8, Playing: ${element.GameWasStarted}`;
    });
    await SendMessageToPlayer(lobbys, socket, "status");
}

//#endregion


// Função onde o server recebe informações do cliente!
async function PingPongClientTeste(data, SocketClients) {

    var idClient = 0;//await GetIndexPlayer(data.Username, SocketClients);

    if (idClient != -1) {
        var idLobby = await ReturnWhereIsPlayer(idClient, SocketClients);
        var lobby = await ReturnIdOfLobby(SocketClients, idLobby);

        if (lobby != -1) {
            var player = SocketClients.NewGame[lobby].statusGame.EstadoJogador.find(ws => ws.idPlayer == idClient);

            if (player.Alive) {
                // Se o bot tiver coordenadas, ele vai adicionar a lista!
                if (data.coordinates != undefined) {
                    //TODO: CHECK COM O RICARDO: guardar as coordenadas do bot 
                    let idjogador = SocketClients.NewGame[lobby].statusGame.EstadoJogador.findIndex(ws => ws.idPlayer == idClient);
                    SocketClients.NewGame[lobby].statusGame.EstadoJogador[idjogador].Query_Bot = JSON.parse(data.coordinates);
                    // SocketClients.NewGame[lobby].statusGame.EstadoJogador[idjogador].Query_Bot.plush(JSON.parse(data.coordinates));

                }

                // A cada 1 segundo o bot vai mover-se uma casa
                if (await CheckNameAreValid(SocketClients.NewPlayer[idClient].Username, false, "OnGame")) {
                    let idjogador = SocketClients.NewGame[lobby].statusGame.EstadoJogador.findIndex(ws => ws.idPlayer == idClient);
                    data.move = SocketClients.NewGame[lobby].statusGame.EstadoJogador[idjogador].Query_Bot[0];
                    SocketClients.NewGame[lobby].statusGame.EstadoJogador[idjogador].Query_Bot.splice(0, 1);
                }

                if (data.move != undefined || data.move != "" || data.move.toLowerCase() != "wait") {

                    data.move = "" + data.move;

                    if (data.move.toLowerCase() == "up" && player.y < 100)
                        player.y += 1;
                    else if (data.move.toLowerCase() == "down" && player.y >= 0)
                        player.y -= 1;
                    else if (data.move.toLowerCase() == "left" && player.x >= 0)
                        player.x -= 1;
                    else if (data.move.toLowerCase() == "right" && player.x < 100)
                        player.x += 1;

                    // player.distancia = Math.sqrt(Math.pow(player.x, 2) + Math.pow(player.y, 2));
                }
                player.distancia++;

                var obstaculos = SocketClients.NewGame[lobby].statusGame.Obstaculos;

                if ((player.distancia > 99 ? player.distancia / 100 : player.distancia) > obstaculos[0].y)
                    SocketClients.NewGame[lobby].statusGame.Obstaculos.splice(0, 1);

                if (obstaculos.length == 0) {
                    //'[{"x":0,"y":0,"tipo":1},{"x":0,"y":10,"tipo":1}]'
                    obstaculos = await CriarObstaculos();
                }

                var alive = await checkColider(obstaculos, player, SocketClients.NewGame[lobby].statusGame.EstadoJogador);

                if (!alive) {
                    player.Alive = false;
                    await SendMessageToPlayer("Você morreu!", SocketClients.NewPlayer[idClient].connection, "JsonMoves");
                    console.log(`O jogador ${player.idPlayer} morreu!`);
                }
                else {

                    var json = "{\"players\":[";
                    SocketClients.NewGame[lobby].statusGame.EstadoJogador.forEach(element => {
                        json += `{\"idPlayer\":${element.idPlayer}, \"x\":${element.x}, \"y\":${element.y}, \"distancia\":${element.distancia}, \"personagem\":${element.personagem}, \"powerups\":${element.powerups}, \"Alive\": ${element.Alive}},`;
                    });

                    json = json.substring(0, json.length - 1) + `],\"Obstaculos\":[${JSON.stringify(obstaculos)}]}`;

                    console.log("\n" + json);
                }

                //await SendMessageToPlayersOnLobby(SocketClients.NewGame[lobby], json, SocketClients);
            }
        } else
            console.log("O jogador já morreu ... Não vale a pena continuar!")
    }
    //SocketClients.NewGame[data.idLobby].statusGame.EstadoJogador
}


module.exports = {
    CheckSocketExisted,
    PingPongClient,
    JsonMoves,
    CreateLobby,
    // StartGameOnLobby,
    SendToAllPlayers,
    SendMessageToPlayer,
    JoinLobby,
    GetIndexPlayer,
    CheckLobbyExisted,
    OkReadyLobby,
    CheckIfUserAreOnLobby,
    FindSocket,
    ReturnListOfLobbys,
    AddPlayer,
    AddBot,
    RemovePlayer,
    RemoveLobby,
    DisconnectAllUsers,
    DisconnectOneUser,
    CriarObstaculos,
    CheckNameAreValid,
    //Test
    PingPongClientTeste,
};
