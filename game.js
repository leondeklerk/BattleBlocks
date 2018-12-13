var game = function (gameID) {
    this.player1 = null;
    this.player2 = null;
    this.id = gameID;
    this.gameState = null;
};

game.prototype.hasTwoConnectedPlayers = function () {
    return (this.gameState == "2 PLAYERS");
};

game.prototype.addPlayer = function(player) {
    if (this.player1 == null){
        this.player1 = player;
        return "player1";
    } else {
        this.player2 == player;
        return "player2";
    }
};

module.exports = game;