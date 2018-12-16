var express = require('express');
var http = require("http");
var WebSocket = require('ws');

var routes = require("./routes/routes");

var port = process.argv[2];
var app = express();

var stats = require("./statTracker");
var Game = require("./game");
var cookies = require("cookie-parser");
var credentials = require("./credentials");

app.use(express.static(__dirname + "/public"));
app.use(cookies(credentials.cookieSecret));
app.set('view engine', 'ejs');
app.get("/join", routes);
app.get("/quit", routes);
app.get("", routes);
app.get("/*", routes);

var server = http.createServer(app).listen(port);
const wss = new WebSocket.Server({server});
var websockets = {};

setInterval(function () {
    for (let i in websockets) {
        if (websockets.hasOwnProperty(i)) {
            let gameObj = websockets[i];
            if (gameObj.gameState === "ABORTED") {
                console.log("\tDeleting element " + i);
                delete websockets[i];
            }
        }
    }
}, 50000);

//game setup
var connectionID = 0;
var currentGame = new Game(stats.gamesInitialized++);

wss.on('connection', function connection(ws) {

    let con = ws;
    con.id = connectionID++;
    let playerType = currentGame.addPlayer(con);
    websockets[con.id] = currentGame;

    console.log("Player %s placed in game %s as %s", con.id, currentGame.id, playerType);

    if (playerType === "1") {
        let message = {
            type: "PLAYER",
            player: "1"
        };
        con.send(JSON.stringify(message));
    } else if (playerType === "2") {
        let message = {
            type: "PLAYER",
            player: "2"
        };
        con.send(JSON.stringify(message));
        con.send(JSON.stringify({type: "SWITCH"}));
    }

    if (currentGame.hasTwoConnectedPlayers()) {
        currentGame = new Game(stats.gamesInitialized++);
    }


    con.on("message", function incoming(message) {

        let oMsg = JSON.parse(message);
        console.log("received message " + oMsg.type);
        let gameObj = websockets[con.id];

        if (oMsg.type === "FIRED_AT") {
            gameObj.setStatus("FIRED");
        } else if (oMsg.type === "WON") {
            gameObj.setStatus(con.id.toString());
            stats.gamesCompleted++;
        } else if (oMsg.type === "SHIP_DESTROYED"){
            stats.shipsDestroyed++;
        }


        let isPlayer1 = (gameObj.player1 === con);

        if (isPlayer1) {
            console.log("send to P2");
            if (gameObj.player2 !== null) {
                gameObj.player2.send(message);
            }

            if (oMsg.type === "FIRED_AT") {
                gameObj.setStatus("FIRED");
                console.log("1 FIRED");
            } else if (oMsg.type === "WON") {
                gameObj.setStatus("2");
                stats.gamesCompleted++;
                console.log("2 WON");
            }
        } else {
            console.log("send to P1");
            if (gameObj.player1 !== null) {
                gameObj.player1.send(message);
            }

            if (oMsg.type === "FIRED_AT") {
                gameObj.setStatus("FIRED");
                console.log("2 FIRED");
            } else if (oMsg.type === "WON") {
                gameObj.setStatus("1");
                stats.gamesCompleted++;
                console.log("1 WON");
            }
        }
    });

    con.on("close", function () {

        console.log(con.id + " disconnected ...");
        let gameObj = websockets[con.id];

        if(gameObj.player1 === con && gameObj.player2 === null){
            currentGame = new Game(stats.gamesInitialized++);
        }

        if (gameObj.isValidTransition(gameObj.gameState, "ABORTED")) {
            gameObj.setStatus("ABORTED");
            try {
                gameObj.player1.close();
                gameObj.player1 = null;
            } catch (e) {
                console.log("Player 1 closing: " + e);
            }

            try {
                gameObj.player2.close();
                gameObj.player2 = null;
            } catch (e) {
                console.log("Player 2 closing: " + e);
            }
        }
    });
});
