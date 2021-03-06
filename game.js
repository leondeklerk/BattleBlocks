/** game module**/
var game = function (gameID) { //takes a id for this game
    this.player1 = null; //player 1 of this game
    this.player2 = null; //player 2 of this game
    this.id = gameID; //id
    this.gameState = "0 PLAYERS"; //state the game is currently in, 0 players joint by default
};

/** function of the game object that indicated if 2 players have joined the game**/
game.prototype.hasTwoConnectedPlayers = function () {
    return (this.gameState === "2 PLAYERS"); //return true if the state of the game is at 2 player joined.
};

/** function of the game object to add a player, named p**/
game.prototype.addPlayer = function (p) {

    // console.assert(p instanceof Object, "%s: Expecting an object (WebSocket), got a %s", arguments.callee.name, typeof p);
    //
    // if (this.gameState !== "0 PLAYERS" && this.gameState !== "1 PLAYER") {
    //     return new Error("Invalid call to addPlayer, current state is %s", this.gameState);
    // }

    /*
     * revise the game state
     */
    // var error = this.setStatus("1 PLAYER");
    // if(error instanceof Error){
    //     this.setStatus("2 PLAYERS");
    // }

    if (this.player1 == null) { //if there is no player 1 this will become player 1
        this.player1 = p; //set player one with name p
        this.gameState = "1 PLAYER"; //update the game state to 1 player joined
        return "1"; //return the type of player (either player 1 or player 2)
    }
    else { //if there already is a player 1 this will be player 2
        this.player2 = p; //set player two with name p
        this.gameState = "2 PLAYERS"; //update the state of the game to two players
        return "2"; //return the type of layer (either player 1 or player 2)
    }
};

module.exports = game;

// game.prototype.transitionStates = {};
// game.prototype.transitionStates["0 PLAYERS"] = 0;
// game.prototype.transitionStates["1 PLAYER"] = 1;
// game.prototype.transitionStates["2 PLAYERS"] = 2;
// game.prototype.transitionStates["FIRED"] = 3;
// game.prototype.transitionStates["1"] = 4; //1 won
// game.prototype.transitionStates["2"] = 5; //2 won
// game.prototype.transitionStates["ENDED"] = 6;
//
// /*
//  * Not all game states can be transformed into each other;
//  * the matrix contains the valid transitions.
//  * They are checked each time a state change is attempted.
//  */
// game.prototype.transitionMatrix = [
//     [0, 1, 0, 0, 0, 0, 0],   //0 JOINT
//     [1, 0, 1, 0, 0, 0, 0],   //1 JOINT
//     [0, 0, 0, 1, 0, 0, 1],   //2 JOINT (note: once we have two players, there is no way back!)
//     [0, 0, 0, 1, 1, 1, 1],   //FIRED
//     [0, 0, 0, 0, 0, 0, 0],   //A WON
//     [0, 0, 0, 0, 0, 0, 0],   //B WON
//     [0, 0, 0, 0, 0, 0, 0]    //ABORTED
// ];
//
// game.prototype.isValidTransition = function (from, to) {
//
//     console.assert(typeof from == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof from);
//     console.assert(typeof to == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof to);
//     console.assert( from in game.prototype.transitionStates == true, "%s: Expecting %s to be a valid transition state", arguments.callee.name, from);
//     console.assert( to in game.prototype.transitionStates == true, "%s: Expecting %s to be a valid transition state", arguments.callee.name, to);
//
//
//     let i, j;
//     if (! (from in game.prototype.transitionStates)) {
//         return false;
//     }
//     else {
//         i = game.prototype.transitionStates[from];
//     }
//
//     if (!(to in game.prototype.transitionStates)) {
//         return false;
//     }
//     else {
//         j = game.prototype.transitionStates[to];
//     }
//
//     return (game.prototype.transitionMatrix[i][j] > 0);
// };
//
// game.prototype.isValidState = function (s) {
//     return (s in game.prototype.transitionStates);
// };
//
// game.prototype.setStatus = function (w) {
//
//     console.assert(typeof w == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof w);
//
//     if (game.prototype.isValidState(w) && game.prototype.isValidTransition(this.gameState, w)) {
//         this.gameState = w;
//         console.log("[STATUS] %s", this.gameState);
//     }
//     else {
//         return new Error("Impossible status change from %s to %s", this.gameState, w);
//     }
// };

