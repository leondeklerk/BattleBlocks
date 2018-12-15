var express = require("express");
var router = express.Router();

/* Pressing join */
router.get("/join", function(req, res) {
  res.sendFile("game.html", {root: "./public"});
});

/* GET home page. */
router.get("/*", function (req, res) {
  res.sendFile("splash.html", {root: "./public"});
});

module.exports = router;