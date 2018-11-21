module.exports.lists = {
    gameList: [],
    lobbyList: [],
    playList: []
}

const lists = require('./Game').lists;
module.exports.Game = class Game{
    constructor(sock){
        this.playerOne = sock;
        this.lobby = true;
        this.rival = null;
        this.gLInstance = lists.gameList.push(this);
        this.lLInstance = lists.lobbyList.push(this);
        console.log(this.playerOne._socket.remoteAddress + " is looking for match.");
    }
    join(rival){
        if(this.lobby) {
            lists.lobbyList.splice(this.lLInstance-1, 1);
            this.pLInstance = lists.playList.push(this);
            this.playerTwo = rival;
            this.lobby = false;
            this.start();
            console.log(this.playerTwo._socket.remoteAddress + " joined player "+ this.playerOne._socket.remoteAddress);
        }
    }
    move(player, piece, x, y){
        if(player == 1){
            this.playerTwo.send(JSON.stringify({move: true, piece: piece, x: x, y: y}));
        } else {
            this.playerOne.send(JSON.stringify({move: true, piece: piece, x: x, y: y}));
        }
    }

    start(){
        this.playerOne.send(JSON.stringify({matchmaked: true, yourTurn: true, playerblack: false}));
        this.playerTwo.send(JSON.stringify({matchmaked: true, yourTurn: false, playerblack: true}));
    }
    stop(player){
        if(player == 1){
            if(this.playerTwo && this.playerTwo.readyState == this.playerTwo.OPEN)
                this.playerTwo.send(JSON.stringify({closed: true}));
        } else if(player == 2){
            if(this.playerOne.readyState == this.playerOne.OPEN)
                this.playerOne.send(JSON.stringify({closed: true}));
        } else {
            if(this.playerOne.readyState == this.playerOne.OPEN)
                this.playerOne.send(JSON.stringify({closed: true}));
            if(this.playerTwo && this.playerTwo.readyState == this.playerTwo.OPEN)
                this.playerTwo.send(JSON.stringify({closed: true}));
        }
        if(this.playerOne.readyState != this.playerOne.CLOSED)
            this.playerOne.close();
        if(this.playerTwo && this.playerTwo.readyState != this.playerTwo.CLOSED)
            this.playerTwo.close();
        lists.gameList.splice(this.gLInstance-1, 1);
        if(this.lobby){
            lists.lobbyList.splice(this.lLInstance-1, 1);
        } else {
            lists.playList.splice(this.pLInstance - 1, 1);
        }
    }
}