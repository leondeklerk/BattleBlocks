var express = require("express");
const stats = require("../statTracker");
var router = express.Router();

/* Pressing join */
router.get("/join", function(req, res) {
  res.sendFile("game.html", {root: "./public"});
});

/* pressing quit*/
router.get("/quit", function (req, res) {
  res.redirect("http://localhost:8080");
});

router.get("", function (req, res) {
  let value = req.cookies.count;
  if(value > 0){
    res.clearCookie('count');
    value++;
    res.cookie('count',  value);
    stats.numConnections++;
  } else {
    res.cookie("count", "1");
  }

  res.render("splash.ejs", { gamesInitialized: stats.gamesInitialized, gamesCompleted: stats.gamesCompleted, shipsDestroyed: stats.shipsDestroyed, numConnections: stats.numConnections, root: "./public"});
});

/* GET home page. */
router.get("/*", function (req, res) {
  res.render("splash.ejs", { gamesInitialized: stats.gamesInitialized, gamesCompleted: stats.gamesCompleted, shipsDestroyed: stats.shipsDestroyed,numConnections: stats.numConnections, root: "./public"});
});

module.exports = router;