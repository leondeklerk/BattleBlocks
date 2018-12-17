/**module with different counters for the data that should be injected into the web page with ejs**/
var gameStatus = {
    since : Date.now(), //time started counting
    gamesInitialized : 0, //number of games initialized
    gamesCompleted : 0, //number of games that were completed (won)
    shipsDestroyed : 0, //number of ships that is destroyed
};

module.exports = gameStatus;