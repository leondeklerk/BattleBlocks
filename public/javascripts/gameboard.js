for (let i = 0; i < 10; i++) {
    $("#game-board-left").append("<div class='board-row-active' id='l-row-" + i + "'></div>");
    $("#game-board-right").append("<div class='board-row-inactive' id='r-row-" + i + "'></div>");
    for (let j = 0; j < 10; j++) {
        $("#l-row-" + i).append("<div class='game-board-square-active' id='l-square-" + i + j + "'></div>");
        $("#r-row-" + i).append("<div class='game-board-square-inactive' id='r-square-" + i + j + "'></div>");
    }
}

var boardContainer = $("#game-board-left");
//gameboard as 3d Array
var gameBoard = [
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

boardContainer.click(fire);

showShips();
function showShips(){
    for (let i = 0; i < 10;i++){
        for (let j = 0; j < 10; j++){
            if (gameBoard[i][j] == 1){
                $("#l-square-" + i + j).css({"background-color":"gray"});
            }
        }
    }
}

function fire(e){
    //e.target (div clicked on)
    //e.currentTarget parent element of e.target. The element on which the event listener is set on (boardContainer)
    if (e.target !== e.currentTarget){
        var row = e.target.id.substring(e.target.id.length-2,e.target.id.length-1);
        var col = e.target.id.substring(e.target.id.length-1,e.target.id.length);

        console.log("row: " + row + " col: " + col);
    }
    // miss
    if (gameBoard[row][col] == 0) {
        e.target.style.background = 'blue'
        gameBoard[row][col] = 3;

    // hit
    }else if(gameBoard[row][col] == 1) {
        e.target.style.background = 'red';
        gameBoard[row][col] = 2;

    // prevent player from firing on fired block
    }else if(gameBoard[row][col] > 1){
        alert("Already fired");
    }
    e.stopPropagation();
}

function rotate(e){
    if (e.target !== e.currentTarget){
        var row = e.target.id.substring(e.target.id.length-2,e.target.id.length-1);
        var col = e.target.id.substring(e.target.id.length-1,e.target.id.length);

        console.log("row: " + row + " col: " + col);
    }
    // miss
    if (gameBoard[row][col] == 0) {
       

    // hit
    }else if(gameBoard[row][col] == 1) {
        e.target.style.background = 'red';
        gameBoard[row][col] = 2;
        alert("HITTTT");

    // prevent player from firing on fired block
    }else if(gameBoard[row][col] > 1){
        alert("Already fired");
    }
    e.stopPropagation();

}