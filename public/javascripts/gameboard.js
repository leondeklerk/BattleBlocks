//container element of gameboard
var gameBoardContainer = document.getElementById("game-board-left");

//set and make the grid columns and rows
var rows = 10;
var cols = 10;
var squareSize = 40;

for (i = 0;i < cols; i++){
    for(j =0;j < rows; j++){
        var square = document.createElement("div");
        gameBoardContainer.appendChild(square);

        square.id = 's' + j + i;

        var topPosition = j * squareSize;
        var leftPosition = i * squareSize;

        square.style.top = topPosition + 'px';
        square.style.left = leftPosition + 'px';
    }
}

// gameBoardContainer.addEventListener("click", fire, false);

// function fire(e) {

//     if (e.target !== e.currentTarget){
//         var row = e.target.id.substring(1,2);

//     }
// }
