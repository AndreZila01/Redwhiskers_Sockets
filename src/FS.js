//#region Funcções com returns "basicos"

const { Socket } = require("socket.io");

/* Funções que retornam dados */
//Retorna o id do player na lista
async function GetIdPlayer(Username, SocketClients) {
    return SocketClients.NewPlayer.findIndex(ws => ws.Username == Username);
}

//Retorna true or false se o lobby existe
async function CheckLobbyExisted(idLobby, SocketClients) {
    return SocketClients.NewGame.findIndex(ws => ws.idGame == idLobby) != -1;
}

//Retorna se o player está em algum lobby
async function CheckIfUserAreOnLobby(Username, SocketClients) {
    var userid = await GetIdPlayer(Username, SocketClients);

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

//Cria um id do lobby
async function NewIdLobby(SocketClients) {
    return SocketClients.NewGame.length != 0 ? SocketClients.NewGame[SocketClients.NewGame.length - 1].idGame + 1 : 0;
}

//Retorna dados do lobby
async function ReturnIdOfLobby(SocketClients, idLobby) {
    return SocketClients.NewGame.findIndex(ws => ws.idGame == idLobby);
}

// Retorna o lobby onde o jogador está
async function ReturnWhereIsPlayer(idPlayer, SocketClients) {
    return SocketClients.NewGame.findIndex(ws => ws.players.includes(idPlayer));
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
        // 70 x 100
        let x = parseInt((Math.random() * 690000000) / 6900000);
        let y = parseInt((Math.random() * 990000000) / 9900000);
        let tipo = parseInt((Math.random() * 300) / 100);

        let index;
        obstaculos.forEach(element => {

            if (tipo == 0)
                tipo = 1;

            if (tipo == 1)
                index = (Math.abs(element.x - x) > 5 && Math.abs(element.y - y) < 5);//obstaculo 1x1
            else if (tipo == 2)
                index = (Math.abs(element.x - x) > 5 && Math.abs(element.y - y) > 10);//obstaculo 1x2
            else if (tipo == 3)
                index = (Math.abs(element.x - x) > 10 && Math.abs(element.y - y) > 5);//obstaculo 2x1
            else
                index = false;

            if (index)
                return index;
        });

        if ((x > -1 && x < 70 && y > -1 && y < 100) && (obstaculos.length == 0 || index)) {
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

    //TODO: fazer um check para ver se o jogador bateu em algum obstaculo!

    switch (obstaculos[0].tipo) {
        case 1:
            if (player.x == obstaculos[0].x && player.y == obstaculos[0].y)
                return false;
            break;
        case 2:
            if ((player.x == obstaculos[0].x && player.y == obstaculos[0].y) || (player.x == obstaculos[0].x && player.y == obstaculos[0].y + 1))
                return false;
            break;
        case 3:
            if ((player.x == obstaculos[0].x && player.y == obstaculos[0].y) || (player.x == obstaculos[0].x + 1 && player.y == obstaculos[0].y))
                return false;
            break;
        default:
            break;
    }

}
//#endregion

//#region  Add Lista 

//Adicona o jogador a lista
async function AddPlayer(player, SocketClients) {
    SocketClients.NewPlayer.push(player);
    await SendMessageToPlayer("Bem vindo " + player.Username, player.connection);
}

//Cria um lobby
async function CreateLobby(Username, SocketClients) {
    var idHoster = await GetIdPlayer(Username, SocketClients);
    var idLobby = await NewIdLobby(SocketClients);
    console.log(idHoster + " " + idLobby);

    if (!await CheckIfUserAreHoster(idHoster, SocketClients)) {
        SocketClients.NewGame.push({ idGame: idLobby, dateTime: new Date, players: [SocketClients.NewPlayer[idHoster].id], active: false, statusGame: { EstadoJogador: [], JogadorReady: [], Obstaculos: [] } });

        await SendMessageToPlayer("Lobby criado com sucesso " + SocketClients.NewPlayer[idHoster].Username, SocketClients.NewPlayer[idHoster].connection);
    }
    else
        await SendMessageToPlayer("Já está em algum lobby", SocketClients.NewPlayer[idHoster].connection);
}

/* Verifica se o Socket já está ligado! */
async function CheckSocketExisted(Username, socket, SocketClients) {
    if (await FindSocket(socket, Username, SocketClients) == -1) {
        //FIX: Wainting to connect to database to use id     
        if (Username.toLowerCase().includes("cpu") || Username.toLowerCase().includes("bot"))
            return [{ id: SocketClients.NewPlayer.length, Username: Username, score: 0, active: false, connection: socket, BotMoves: [] }];
        else
            return [{ id: SocketClients.NewPlayer.length, Username: Username, score: 0, active: false, connection: socket }];
    }
    else
        return [];
}

//Adiciona o jogador ao lobby
async function JoinLobby(Username, idLobby, SocketClients) {

    var idPlayer = await GetIdPlayer(Username, SocketClients);
    if (Username != "" && idLobby != undefined && parseInt(idLobby) > -1) {
        if (!await CheckIfUserAreOnLobby(Username, SocketClients)) {
            var idGame = await ReturnIdOfLobby(SocketClients, idLobby);
            if (idGame != -1) {
                SocketClients.NewGame[idLobby].players.push(idPlayer);
            }
        }
        else
            SendMessageToPlayer("Já estás num lobby... Não podes entrar em mais que dois lobbys ao mesmo tempo!!", SocketClients.NewPlayer[idPlayer].connection);
        // console.log("O user já está em um lobby!");
    }
    else {
        await SendMessageToPlayer("Erro ao entrar no lobby", socket);
        SocketClients.NewPlayer[idPlayer].connection.intentionalDisconnect = "true";
        SocketClients.NewPlayer[idPlayer].connection.disconnect();
    }



    //TODO: Meter um algoritmo para informar que teve sucesso no login ou não!
    //TODO: Meter uma condição que verifica se o player já está em algum lobby não entrar em mais nenhum
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
    //TODO: apagar todos os users e lobbys da lista
}

// Remove um jogador do lobby
async function RemovePlayerFromLobby(idPlayer, idLobby, SocketClients) {
    SocketClients.NewGame[idLobby].players.splice(idPlayer, 1);
}

// Desliga todos os jogadores do lobby e comunicar o sim de sessão!
async function DisconnectAllPlayersOfLobby(lobby, SocketClients) {
    lobby.players.forEach(async element => {
        var player = SocketClients.NewPlayer[element];
        await SendMessageToPlayer("O lobby foi fechado", player.connection);
        player.connection.intentionalDisconnect = "true";
        player.connection.disconnect();
    });
}

//Desliga um user do lobby
async function DisconnectOneUser(socket, SocketClients) {
    var index = await FindSocket(socket, "", SocketClients);
    console.log(`Adeus ${SocketClients.NewPlayer[index].Username}! Até a uma próxima!`);
    if (await CheckIfUserAreHoster(index, SocketClients)) {
        var lobby = SocketClients.NewGame[await ReturnWhereIsPlayer(index, SocketClients)];
        await DisconnectAllPlayersOfLobby(lobby, SocketClients);
        await RemoveLobby(lobby, SocketClients);
        //TODO: Fechar Servidor, Desconnectar todos os users, Guardar na DATABASE, 
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
async function SendMessageToPlayersOnLobby(lobby, mensagem, SocketClients) {
    lobby.players.forEach(async element => {
        var player = SocketClients.NewPlayer[element];
        // if (!CheckNameAreValid(player.Username)) {
        //     // var json = JSON.parse(mensagem);
        //     // if (json.Obstaculos != undefined)
        //     //     mensagem = JSON.stringify(json.Obstaculos);
        //     await SendMessageToPlayer(mensagem, player.connection);
        // } else
        await SendMessageToPlayer(mensagem, player.connection);
    });
}
6
/* Função para informar um user */
async function SendMessageToPlayer(data, socket) {
    socket.emit('status', { content: data });
}

// Função onde o server recebe informações do cliente!
async function PingPongClient(data, SocketClients) {

    var idClient = await GetIdPlayer(data.Username, SocketClients);

    if (idClient != -1) {
        var idLobby = await ReturnWhereIsPlayer(idClient, SocketClients);
        var lobby = await ReturnIdOfLobby(SocketClients, idLobby);

        if (lobby != -1) {
            var player = SocketClients.NewGame[lobby].statusGame.EstadoJogador.find(ws => ws.idPlayer == idClient);

            // Se o bot tiver coordenadas, ele vai adicionar a lista!
            if (data.coordinates != undefined) {
                //TODO: CHECK COM O RICARDO: guardar as coordenadas do bot 
                let idjogador = SocketClients.NewGame[lobby].statusGame.EstadoJogador.findIndex(ws => ws.idPlayer == idClient);
                SocketClients.NewGame[lobby].statusGame.EstadoJogador[idjogador].Query_Bot = [];
                SocketClients.NewGame[lobby].statusGame.EstadoJogador[idjogador].Query_Bot.plush(data.coordinates);

            }

            // A cada 1 segundo o bot vai mover-se uma casa
            if (await CheckNameAreValid(SocketClients.NewPlayer[idClient].Username, true, "OnGame")) {
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
                else if (data.move.toLowerCase() == "right" && player.x < 70)
                    player.x += 1;

                // player.distancia = Math.sqrt(Math.pow(player.x, 2) + Math.pow(player.y, 2));
            }
            player.distancia++;

            var obstaculos = SocketClients.NewGame[lobby].statusGame.Obstaculos;

            if (obstaculos.length == 0) {
                //TODO: criar obstaculos
                //'[{"x":0,"y":0,"tipo":1},{"x":0,"y":10,"tipo":1}]'
                obstaculos = await CriarObstaculos();
                SocketClients.NewGame[lobby].statusGame.Obstaculos = obstaculos;
            }

            var alive = await checkColider(obstaculos, player, SocketClients.NewGame[lobby].statusGame.EstadoJogador);

            if (!alive) {
                player.Alive = false;
                await SendMessageToPlayer("GAME OVER, Você morreu!", SocketClients.NewPlayer[idClient].connection);
                /* TODO: Se o jogador bater em algum obstaculo fazer algo */
            }

            var json = "{\"players\":[";
            SocketClients.NewGame[lobby].statusGame.EstadoJogador.forEach(element => {
                json += `{\"idPlayer\":${element.idPlayer}, \"x\":${element.x}, \"y\":${element.y}, \"distancia\":${element.distancia}, \"personagem\":${element.personagem}, \"powerups\":${element.powerups}, \"Alive\": ${element.Alive}},`;
            });

            json = json.substring(0, json.length - 1) + `],\"Obstaculos\":[${JSON.stringify(obstaculos)}]}`;

            await SendMessageToPlayersOnLobby(SocketClients.NewGame[lobby], json, SocketClients);
        }
    }
    //SocketClients.NewGame[data.idLobby].statusGame.EstadoJogador


    //TODO: Verificar se o player está no lobby
    //TODO: receber o id do lobby
    //TODO: atualizar dados do atual player
    //TOOD: Enviar dados para todos os players do lobby




    //Enviar data de todos os clientes que estão naquele server
}

/* NÃO SEI SE É UTIL OU NÃO!! */
// // Função onde começa o jogo e cria as coisas necessárias
// async function StartGameOnLobby(data, SocketClients) {
//     if (CheckIfUserAreHoster(data.idPlayer, SocketClients)) {
//         var idGame = await ReturnIdOfLobby(SocketClients, data.idLobby);
//         if (idGame != -1) {
//             SocketClients.NewGame[idGame].active = true;

//             //...
//         }
//     }
// }

// Função que diz que os jogadores já estão ready envia para a lista os jogadores que estão ready
async function OkReadyLobby(data, SocketClients, socketclient) {

    var idLobby = await ReturnWhereIsPlayer(await FindSocket(socketclient, "", SocketClients), SocketClients);
    if (idLobby != -1)
        if (await CheckLobbyExisted(idLobby, SocketClients)) {
            var lobby = SocketClients.NewGame[idLobby];
            var idUser = await GetIdPlayer(data.Username, SocketClients);
            if (!lobby.statusGame.JogadorReady.includes(idUser)) {
                if (lobby.players.length == 1) {
                    await SendMessageToPlayer("Para o jogo começar tem de ter pelo menos 1 jogador!", SocketClients.NewPlayer[idUser].connection);
                }
                else {
                    lobby.statusGame.JogadorReady.push({ idPlayer: idUser, ready: true });

                    await SendMessageToPlayer("Você está ready no servidor! A espera de resposta do Admin", socketclient);//TODO: Checkar porque ele não envia a mensagem para o ultimo utilizador ...

                    if (lobby.players.length == lobby.statusGame.JogadorReady.length) {
                        let json = ""
                        SocketClients.NewGame[idLobby].players.forEach(element => {
                            json += `{\"idPlayer\":${element}, \"ready\":true, \"x\":0, \"y\":0, \"distancia\":0.0, \"personagem\":\"[]\", \"powerups\":\"[]\", \"Query_Bot\":\"[]\", \"Alive\":true},`;
                        });
                        SocketClients.NewGame[idLobby].statusGame.EstadoJogador = (JSON.parse("[" + json.substring(0, json.length - 1) + "]"));
                        SocketClients.NewGame[idLobby].statusGame.EstadoJogador.sort((a, b) => parseFloat(a.idPlayer) - parseFloat(b.idPlayer));

                        await SendMessageToPlayersOnLobby(lobby, "Todos os jogadores estão ready! O jogo vai começar!", SocketClients);
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
        lobbys += lobbys + `id: ${element.idGame}, players: ${element.players.length}/8, Playing: ${element.active}`;
    });
    await SendMessageToPlayer(lobbys, socket);
}

//#endregion


// Função onde o server recebe informações do cliente!
async function PingPongClientTeste(data, SocketClients) {

    var idClient = 0;//await GetIdPlayer(data.Username, SocketClients);

    if (idClient != -1) {
        var idLobby = await ReturnWhereIsPlayer(idClient, SocketClients);
        var lobby = await ReturnIdOfLobby(SocketClients, idLobby);

        if (lobby != -1) {
            var player = SocketClients.NewGame[lobby].statusGame.EstadoJogador.find(ws => ws.idPlayer == idClient);

            // Se o bot tiver coordenadas, ele vai adicionar a lista!
            if (data.coordinates != undefined) {
                //TODO: CHECK COM O RICARDO: guardar as coordenadas do bot 
                let idjogador = SocketClients.NewGame[lobby].statusGame.EstadoJogador.findIndex(ws => ws.idPlayer == idClient);
                SocketClients.NewGame[lobby].statusGame.EstadoJogador[idjogador].Query_Bot = [];
                SocketClients.NewGame[lobby].statusGame.EstadoJogador[idjogador].Query_Bot.plush(data.coordinates);

            }

            // A cada 1 segundo o bot vai mover-se uma casa
            if (await CheckNameAreValid(SocketClients.NewPlayer[idClient].Username, true, "OnGame")) {
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

            SocketClients.NewGame[lobby].statusGame.Obstaculos.splice(0, 1);
            if (obstaculos.length == 0) {
                //TODO: criar obstaculos
                //'[{"x":0,"y":0,"tipo":1},{"x":0,"y":10,"tipo":1}]'
                obstaculos = await CriarObstaculos();
            }

            var alive = await checkColider(obstaculos, player, SocketClients.NewGame[lobby].statusGame.EstadoJogador);

            if (!alive) {
                player.Alive = false;
                await SendMessageToPlayer("Você morreu!", SocketClients.NewPlayer[idClient].connection);
                /* TODO: Se o jogador bater em algum obstaculo fazer algo */
            }

            var json = "{\"players\":[";
            SocketClients.NewGame[lobby].statusGame.EstadoJogador.forEach(element => {
                json += `{\"idPlayer\":${element.idPlayer}, \"x\":${element.x}, \"y\":${element.y}, \"distancia\":${element.distancia}, \"personagem\":${element.personagem}, \"powerups\":${element.powerups}, \"Alive\": ${element.Alive}},`;
            });

            json = json.substring(0, json.length - 1) + `],\"Obstaculos\":[${JSON.stringify(obstaculos)}]}`;

            await SendMessageToPlayersOnLobby(SocketClients.NewGame[lobby], json, SocketClients);
        }
    }
    //SocketClients.NewGame[data.idLobby].statusGame.EstadoJogador


    //TODO: Verificar se o player está no lobby
    //TODO: receber o id do lobby
    //TODO: atualizar dados do atual player
    //TOOD: Enviar dados para todos os players do lobby




    //Enviar data de todos os clientes que estão naquele server
}


module.exports = {
    CheckSocketExisted,
    PingPongClient,
    CreateLobby,
    // StartGameOnLobby,
    SendToAllPlayers,
    SendMessageToPlayer,
    JoinLobby,
    GetIdPlayer,
    CheckLobbyExisted,
    OkReadyLobby,
    CheckIfUserAreOnLobby,
    FindSocket,
    NewIdLobby,
    ReturnListOfLobbys,
    AddPlayer,
    RemovePlayer,
    RemoveLobby,
    DisconnectAllUsers,
    DisconnectOneUser,
    CriarObstaculos,
    CheckNameAreValid,
    //Test
    PingPongClientTeste,
};
