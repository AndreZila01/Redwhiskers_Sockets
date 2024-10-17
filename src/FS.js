//#region Funcções com returns "basicos"

/* Funções que retornam dados */
//Retorna o id do player na lista
async function GetIdPlayer(Username, SocketClients) {
    return SocketClients.NewPlayer.findIndex(ws => ws.name == Username);
}

//Retorna true or false se o lobby existe
async function CheckLobbyExisted(idLobby, SocketClients) {
    return SocketClients.NewGame.findIndex(ws => ws.idGame == idLobby) != -1;
}

//Retorna se o player está em algum lobby
async function CheckIfUserAreOnLobby(Username, SocketClients) {
    return SocketClients.NewGame.findIndex(ws => ws.players.includes(GetId(Username, SocketClients))) != -1;
}


//Verifica se o utilizador com o numero x é dono de algum lobby, retorna os dados!
async function ReturnDataOfLobbyWherePlayerAreHost(IdPlayer, SocketClients) {
    return SocketClients.NewGame.findIndex(ws => ws.players[0] == IdPlayer);
}

//Verifica se o jogador é hoster ou não, retorna true or false
async function CheckIfUserAreHoster(idUser, SocketClients) {
    return SocketClients.NewGame.findIndex(ws => ws.players[0] == idUser) != -1;
}

//Retorna o id do player
async function FindSocket(socket, Username, SocketClients) {
    return -1;
    // if (Username != "")
    //     return SocketClients.NewPlayer.findIndex(ws => ws.connection.request.connection._peername.address == socket.request.connection._peername.address || (ws.name == Username));
    // else
    //     return SocketClients.NewPlayer.findIndex(ws => ws.connection.request.connection._peername.address == socket.request.connection._peername.address || (ws.name == Username || ws.connection.id == socket.id));
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
//#endregion

//#region  Add Lista 

//Adicona o jogador a lista
async function AddPlayer(player, SocketClients) {
    SocketClients.NewPlayer.push(player);
    SendMessageToPlayer("Bem vindo " + player.name, player.connection);
}

//Cria um lobby
async function CreateLobby(Username, SocketClients) {
    var idHoster = await GetIdPlayer(Username, SocketClients);
    var idLobby = await NewIdLobby(SocketClients);
    console.log(idHoster + " " + idLobby);

    //TODO: Meter uma condição que verifica se o hoster já está em algum lobby

    SocketClients.NewGame.push({ idGame: idLobby, dateTime: new Date, players: [SocketClients.NewPlayer[idHoster].id], active: false, statusGame: { EstadoJogador: [], JogadorReady: [] } });
}

/* Verifica se o Socket já está ligado! */
async function CheckSocketExisted(Username, socket, SocketClients) {
    if (await FindSocket(socket, Username, SocketClients) == -1)
        return [{ id: SocketClients.NewPlayer.length, name: Username, score: 0, active: false, connection: socket }];
    else
        return [];
}

//Adiciona o jogador ao lobby
async function JoinLobby(Username, idLobby, SocketClients) {

    var idPlayer = await GetIdPlayer(Username, SocketClients);
    if (Username != "" && idLobby != undefined && parseInt(idLobby) > -1) {
        var idGame = await ReturnIdOfLobby(SocketClients, idLobby);
        if (idGame != -1) {
            SocketClients.NewGame[idLobby].players.push(idPlayer);
        }
    }
    else {
        await SendMessageToPlayer("Erro ao entrar no lobby", socket);
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
    SocketClients.NewPlayer.splice(idClient, 1);
}

//Fecha o lobby pelo idLobby
async function RemoveLobby(idlobby, SocketClients) {
    SocketClients.NewGame.splice(idlobby, 1);
}

//Desliga todos os users dos lobbys
async function DisconnectAllUsers(SocketClients) {
    SocketClients.NewPlayer.forEach(element => {
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
        player.connection.disconnect();
    });
}

//Desliga um user do lobby
async function DisconnectOneUser(socket, SocketClients) {
    var index = await FindSocket(socket, "", SocketClients);
    if (await CheckIfUserAreHoster(index, SocketClients)) {
        var lobby = await ReturnDataOfLobbyWherePlayerAreHost(index, SocketClients);
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
    //TODO: apagar o user da lista
}
//#endregion

//#region Funções void

//#region Funções de envio e receber dados do cliente
/* Função para informar todos os users */
async function SendToAllPlayers(data, SocketClients) {
    SocketClients.NewPlayer.forEach(element => {
        element.connection.emit('status', { content: data });
    });
}

// Envia Mensagem a todos os jogadores do lobby!
async function SendMessageToPlayersOnLobby(lobby, mensagem, SocketClients) {
    lobby.players.forEach(async element => {
        var player = SocketClients.NewPlayer[element];
        await SendMessageToPlayer(mensagem, player.connection);
    });
}

/* Função para informar um user */
async function SendMessageToPlayer(data, socket) {
    socket.emit('status', { content: data });
}

// Função onde o server recebe informações do cliente!
async function PingPongClient(data, SocketClients) {
    SocketClients.NewGame[data.idLobby].statusGame
    //Enviar data de todos os clientes que estão naquele server
}

// Função onde começa o jogo e cria as coisas necessárias
async function StartGameOnLobby(data, SocketClients) {
    if (CheckIfUserAreHoster(data.idPlayer, SocketClients)) {
        var idGame = await ReturnIdOfLobby(SocketClients, data.idLobby);
        if (idGame != -1) {
            SocketClients.NewGame[idGame].active = true;

            //...
        }
    }
}

// Função que diz que os jogadores já estão ready envia para a lista os jogadores que estão ready
async function OkReadyLobby(data, SocketClients, socketclient) {

    if (await CheckLobbyExisted(data.idLobby, SocketClients)) {
        var lobby = SocketClients.NewGame[data.idLobby];
        var idUser = await GetIdPlayer(data.Username, SocketClients);
        if (!lobby.players.includes(idUser)) {
            lobby.statusGame.push({ idPlayer: idUser, ready: true });

            if (lobby.player.length == lobby.statusGame.length)
                SocketClients.NewGame[data.idLobby].players.forEach(element => {
                    SocketClients.NewGame[data.idLobby].statusGame.EstadoJogador.plus({});
                });
        }
        else{
            if(lobby.statusGame.includes(idUser)){
                lobby.statusGame[idUser].ready ==true? lobby.statusGame[idUser].ready = false : lobby.statusGame[idUser].ready = true;
            }
        }

    }
}

//#endregion


module.exports = {
    CheckSocketExisted,
    PingPongClient,
    CreateLobby,
    StartGameOnLobby,
    SendToAllPlayers,
    SendMessageToPlayer,
    JoinLobby,
    GetIdPlayer,
    CheckLobbyExisted,
    CheckIfUserAreOnLobby,
    FindSocket,
    NewIdLobby,
    AddPlayer,
    RemovePlayer,
    RemoveLobby,
    DisconnectAllUsers,
    DisconnectOneUser
};
