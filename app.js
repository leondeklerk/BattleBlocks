var express = require("express");
var http = require("http");

var port = process.argv[2];
var app = express();

var game = require("./game");
var gameStatus = require("./statTracker");

app.use(express.static(__dirname + "/public"));
http.createServer(app).listen(port);