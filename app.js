var express = require('express');
var http = require("http");
var WebSocket = require('ws');

var port = process.argv[2];
var app = express();

var Game = require("./game");

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
    res.sendFile("game.html", {root: "./public"});
});

var server = http.createServer(app).listen(port);
//Static files

//socket setup
const wss = new WebSocket.Server({server});

//game setup
var connectionID = 0;
var currentGame = new Game();

wss.on('connection', function connection(ws){
    console.log("made socket connection");

    let con = ws;
    con.id = connectionID++;

    let playerType = currentGame.add
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
      });
    
      ws.send('something');
});


// server.listen(port, function(){
//     console.log("listening on port 3001");
// });
