var game = function (gameID){
    this.id = gameID;

    this.drawBoards();
    this.deployBoats();
};

var g = game.prototype;

g.drawBoards = function (){
    for (let i = 0; i < 10; i++) {
        $("#game-board-left").append("<div class='board-row-inactive' id='l-row-" + i + "'></div>");
        $("#game-board-right").append("<div class='board-row-active' id='r-row-" + i + "'></div>");
        for (let j = 0; j < 10; j++) {
            $("#l-row-" + i).append("<div class='game-board-square-inactive' id='l-square-" + i + j + "'></div>");
            $("#r-row-" + i).append("<div class='game-board-square-active' id='r-square-" + i + j + "'></div>");
        }
    }
};

g.deployBoats = function(){
    var gameBoardRight = [
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0],
        [1,0,1,0,0,0,0,0,0,0],
        [1,0,1,0,1,0,1,0,0,0],
        [1,0,1,0,1,0,1,0,1,0],
        [1,0,1,0,1,0,1,0,1,0],
        ]

    var gameBoardLeft = [
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0],
        [1,0,1,0,0,0,0,0,0,0],
        [1,0,1,0,1,0,1,0,0,0],
        [1,0,1,0,1,0,1,0,1,0],
        [1,0,1,0,1,0,1,0,1,0],
        ]
};

g.fire = function(e){
    //e.target (div clicked on)
    //e.currentTarget parent element of e.target. The element on which the event listener is set on (boardContainer)
    if (e.target !== e.currentTarget){
        var row = e.target.id.substring(e.target.id.length-2,e.target.id.length-1);
        var col = e.target.id.substring(e.target.id.length-1,e.target.id.length);

        console.log("row: " + row + " col: " + col);
    }
    // miss
    if (gameBoardRight[row][col] == 0) {
        e.target.style.background = 'blue'
        gameBoardRight[row][col] = 3;

    // hit
    }else if(gameBoardRight[row][col] == 1) {
        e.target.style.background = 'red';
        gameBoardRight[row][col] = 2;

    // prevent player from firing on fired block
    }else if(gameBoardRight[row][col] > 1){
        alert("Already fired");
    }
    e.stopPropagation();

    //TODO:
    //Switch active/inactive boards
    //Player 2 fires

};

g.rotate = function(e) {
    //not priority
//Random gameboards?
    if (e.target !== e.currentTarget){
        var row = e.target.id.substring(e.target.id.length-2,e.target.id.length-1);
        var col = e.target.id.substring(e.target.id.length-1,e.target.id.length);

        console.log("row: " + row + " col: " + col);
    }
    // miss
    if (gameBoardRight[row][col] == 0) {
       

    // hit
    }else if(gameBoardRight[row][col] == 1) {
        e.target.style.background = 'red';
        gameBoardRight[row][col] = 2;
        alert("HITTTT");

    // prevent player from firing on fired block
    }else if(gameBoardRight[row][col] > 1){
        alert("Already fired");
    }
    e.stopPropagation();
};

module.exports = game;
