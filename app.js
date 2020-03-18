var express = require('express'); //add the express module
var http = require("http"); //add the http module
var WebSocket = require('ws'); //add the websocket module
var favicon = require("serve-favicon"); //add the favicon module

var routes = require("./routes/routes"); //add routes module for routing

var port = process.argv[2]; //specify the port of the server based on a startup argument
var app = express(); //bind the express module to app

var stats = require("./statTracker"); //import the statistics counter module
var Game = require("./game"); //add the game module
var cookies = require("cookie-parser"); //add the cookie-parser module
require('dotenv').config();

app.use(express.static(__dirname + "/public")); //defines the root path for the static files (html css)
app.use(favicon(__dirname + "/public/images/favicon.png")); //specify the path for the favicon (icon in the tab)
app.use(cookies(process.env.COOKIE_SECRET)); //specify to use the cookie parser with the correct credentials information
app.set('view engine', 'ejs'); //set the view engine to ejs
app.get("/join", routes); //specify the route for /join in the routes.js file
app.get("/quit", routes); //specify the route for /quit in the routes.js file
app.get("/*", routes); //specify all other routes in routes.js

var server = http.createServer(app).listen(port);  //create the http server listening on the specified port
const wss = new WebSocket.Server({server}); //create the websocket
var websockets = {}; //websockets object, an object with all the websockets and their connected users

/** function to remove ended games after an x amount of time **/
setInterval(function () { //specifies the function that will be executed
    // this will loop trough all the objects in the web sockets objects
    for (let i in websockets) {
        if (websockets.hasOwnProperty(i)) {
            let gameObj = websockets[i];
            if (gameObj.gameState === "ENDED") { //if the game state is set to ended then it can be removed (ended indicating users have disconnected)
                console.log("\tDeleting element " + i);
                delete websockets[i]; //do the actual removal
            }
        }
    }
}, 50000); //times the interval executes

//game setup
var connectionID = 0; //initial id
var currentGame = new Game(stats.gamesInitialized++); //create a new game object and increase the games created counter

/**specify what happens when connections are mad and closed with the websocket**/
wss.on('connection', function connection(ws) { //when a new person connects

    let con = ws; //bind the current connection to con
    con.id = connectionID++; //give the connection an id
    let playerType = currentGame.addPlayer(con); //get a player type (either 1 or 2) from adding the connection to the current game
    websockets[con.id] = currentGame; //add the information to the websockets

    console.log("Player %s placed in game %s as %s", con.id, currentGame.id, playerType);

    if (playerType === "1") { //if the new player is player one
        //then send the following message:
        let message = {
            type: "PLAYER",
            player: "1"
        };
        con.send(JSON.stringify(message)); //actually send it
    } else if (playerType === "2") { //if the player is player two
        //then send the following message
        let message = {
            type: "PLAYER",
            player: "2"
        };
        con.send(JSON.stringify(message)); //actually send the message
        con.send(JSON.stringify({type: "SWITCH"})); //set to not this players turn to let player one start
    }

    /** if the currentgame already has two players connected create a new game **/
    if (currentGame.hasTwoConnectedPlayers()) {
        currentGame = new Game(stats.gamesInitialized++); //create new game and increase the new games counter
    }

    /**when a message comes in on this connection **/
    con.on("message", function incoming(message) {
        if (message !== undefined){
            let oMsg = JSON.parse(message); //bind the message to oMsg in object format
            console.log("received message " + oMsg.type);
            let gameObj = websockets[con.id]; //get the game this connection belongs to

            if (oMsg.type === "FIRED_AT") { //when users start firing
                gameObj.gameState = "FIRED"; //set the state to fired
            } else if (oMsg.type === "WON") { //when a user won
                gameObj.gameState = "won"; //set the state to won
                stats.gamesCompleted++; //increase the completed games counter
            } else if (oMsg.type === "SHIP_DESTROYED") { //when a ship is destroyed
                stats.shipsDestroyed++; //increase the destroyed ships counter
            }

            let isPlayer1 = (gameObj.player1 === con); //check if the current connection is player one

            if (isPlayer1) { //if it is player one
                console.log("send to P2");
                if (gameObj.player2 !== null) { //and there is a player 2
                    gameObj.player2.send(message); //send the message to player 2
                }
            } else { //if the current connection is player 2
                console.log("send to P1");
                if (gameObj.player1 !== null) { //check if there is a player one
                    gameObj.player1.send(message); //send the message to player 1
                }
            }
        }
    });

    /** on a connection that will be closed**/
    con.on("close", function () {
        console.log(con.id + " disconnected ...");
        let gameObj = websockets[con.id]; //get the game the connection belongs to

        if (gameObj.player1 !== null && gameObj.player1 === con && gameObj.player2 === null) { //if player one disconnects before player two we will end up with a game with only player two so we create a new game instead
            currentGame = new Game(stats.gamesInitialized++); //create a new current game and increase the counter
        }

        gameObj.gameState = "ENDED"; //set the game state to ended, this will get cleaned up with the interval remover
        try {
            gameObj.player1.close(); //if not already disconnected , disconnect the player
            gameObj.player1 = null; //completely remove the player
        } catch (e) {
        }

        try {
            gameObj.player2.close(); //if not already disconnected, disconnect the player
            gameObj.player2 = null; //completely remove the player
        } catch (e) {
        }
    });
});
