var express = require("express"); //add the epxress module
const stats = require("../statTracker"); //add the statstracker module
var router = express.Router(); //initialize the express router
/** when connected to /join **/
router.get("/join", function(req, res) {
  res.sendFile("game.html", {root: "./public"}); //send the game.html file
});

/** when connected to /quit **/
router.get("/quit", function (req, res) {
  res.redirect("http://localhost:8080"); //redirect to the splash screen
});

/** when connected all other addresses **/
router.get("/*", function (req, res) {
  let value = req.cookies.count; //get the value from the user cookie
  if(value > 0){ //if it is bigger then 0 (aka is it set?)
    res.clearCookie('count'); //clear the cookie
    value++; //increase the value
    res.cookie('count',  value); //create a new cookie with the new value
  } else {
    res.cookie("count", "1"); //if there is no cookie then create a new one;
    value = 1;
  }

  res.render("splash.ejs", { gamesInitialized: stats.gamesInitialized, gamesCompleted: stats.gamesCompleted, shipsDestroyed: stats.shipsDestroyed, numConnections: value, root: "./public"}); //render the splash screen with ejs and the values injected
});

module.exports = router;