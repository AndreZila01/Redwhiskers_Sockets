//#region Funcções com returns "basicos"

/* Funções que retornam dados */
//Retorna o id do player
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
    return SocketClients.NewGame.findIndex(ws => ws.players[0] == idPlayer);
}

//Verifica se o jogador é hoster ou não, retorna true or false
async function CheckIfUserAreHoster(idUser, SocketClients) {
    return SocketClients.NewGame.findIndex(ws => ws.players[0] == idPlayer) != -1;
}

//Retorna o id do player
async function FindSocket(socket, Username, SocketClients) {
    return SocketClients.NewPlayer.findIndex(ws => ws.connection.request.connection._peername.address == socket.request.connection._peername.address || ws.name == Username);
}

//Cria um id do lobby
async function NewIdLobby(SocketClients) {
    return SocketClients.NewGame.length != 0 ? SocketClients.NewGame[SocketClients.NewGame.length - 1].idGame + 1 : 0;
}

//Retorna dados do lobby
async function ReturnIdOfLobby(SocketClients, idLobby) {
    return SocketClients.NewGame.findIndex(ws => ws.idGame == idLobby);
}

//#endregion

//#region  Add Lista 

//Aidicona jogador
async function AddPlayer(player, SocketClients) {
    SocketClients.NewPlayer.push(player);
}

//Cria um lobby
async function CreateLobby(Username, SocketClients) {
    var idHoster = await GetIdPlayer(Username, SocketClients);
    var idLobby = await NewIdLobby(SocketClients);

    //TODO: Meter uma condição que verifica se o hoster já está em algum lobby

    SocketClients.NewGame.push({ idGame: idLobby, dateTime: new Date, players: [SocketClients.NewPlayer[idHoster].id], active: false, statusGame: [] });

}

//Adiciona um jogador ao lobby
async function JoinLobby(Username, idLobby, SocketClients) {

    var idGame = await ReturnIdOfLobby(SocketClients, idLobby);
    if (idGame != -1) {
        var idPlayer = await GetIdPlayer(Username, SocketClients);
        SocketClients.NewGame[idLobby].players.push(idPlayer);
    }

    //TODO: Meter um algoritmo para informar que teve sucesso no login ou não!
    //TODO: Meter uma condição que verifica se o player já está em algum lobby não entrar em mais nenhum
    //TODO: Checkar se lobby existe, se é privado ou não e se está cheio
}

//#endregion

//#region  Remove Lista

//Remove um jogador do lobby, com nome ou com idClient
async function RemovePlayer(player, idClient, SocketClients) {
    if (player != "")
        SocketClients.NewPlayer.splice(GetId(player.name, SocketClients), 1);
    else
        SocketClients.NewPlayer.splice(idClient, 1);
}

//Fecha o lobby
async function RemoveLobby(lobby, idClient, SocketClients) {
    SocketClients.NewGame.splice(SocketClients.NewGame.findIndex(ws => ws.idGame == lobby.idGame), 1);
}

//Desliga todos os users dos lobbys
async function DisconnectAllUsers(SocketClients) {
    SocketClients.NewPlayer.forEach(element => {
        element.connection.disconnect();
    });
    //TODO: apagar todos os users e lobbys da lista
}

async function DisconnectAllPlayersOfLobby(ClientesOnLobby) {
    ClientesOnLobby.forEach(element => {
        element.connection
    });
}

//Desliga um user do lobby
async function DisconnectOneUser(socket, SocketClients) {
    var index = await FindSocket(socket, "", SocketClients);
    if (CheckIfUserAreHoster(index, SocketClients)) {
        var lobby = await ReturnDataOfLobbyWherePlayerAreHost(index, SocketClients)
        await DisconnectAllPlayersOfLobby(lobby)
        //TODO: Fechar Servidor, Desconnectar todos os users, Guardar na DATABASE, 
    }
    else {
        //TODO: Tirar o user do lobby, desligar o user, guardar na DATABASE
        await RemovePlayer("", index, SocketClients);
    }

    socket.connection.disconnect();
    //TODO: apagar o user da lista
}
//#endregion

//#region Funções void

/* Funcções que enviam variaveis e verifica dados! */
async function addSocket(Username, socket, SocketClients) {
    var s = FindSocket(socket, Username, SocketClients);
    if (s != -1)
        return [{ id: SocketClients.NewPlayer.length, name: Username, score: 0, active: false, connection: socket }];
    else
        return "Already have a user with that name or ip";
}
//#endregion

/* Função para informar todos os users */
async function SendToAllPlayers(data, SocketClients) {
    SocketClients.NewPlayer.forEach(element => {
        element.connection.emit('news', { content: data });
    });
}

/* Função para informar um user */
async function SendMessageToPlayer(data, socket) {
    socket.connection.emit('news', { content: data });
}

async function Ping(data) {
    //Enviar data de todos os clientes que estão naquele server
}

//#endregion


module.exports = {
    addSocket,
    Ping,
    CreateLobby,
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
