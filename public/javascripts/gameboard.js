for (let i = 0; i < 10; i++) {
    $("#game-board-left").append("<div class='board-row-active' id='l-row-" + i + "'></div>");
    $("#game-board-right").append("<div class='board-row-inactive' id='r-row-" + i + "'></div>");
    for (let j = 0; j < 10; j++) {
        $("#l-row-" + i).append("<div class='game-board-square-active' id='l-square-" + i + j + "'></div>");
        $("#r-row-" + i).append("<div class='game-board-square-inactive' id='r-square-" + i + j + "'></div>");
    }
}

function Ship(name) {
    this.name = name;
    this.length = 0;
}

function PlayerFleet() {
    this.name = name;
    this.shipsData = [{"name": "Carrier", "length": 5},
        {"name": "Battleship", "length": 4},
        {"name": "Cruiser", "length": 3},
        {"name": "Destroyer", "length": 3},
        {"name": "Frigate", "length": 2}];
    this.ships = [];
    this.initShips = function () {
        for (let i = 0; i < 5; i++) {
            this.ships[i] = new Ship(this.shipsData[i].name);
            this.ships[i].length = this.shipsData[i].length;
        }
    };
}

function getRandomInt(max) {
    return Math.floor(Math.random() * (Math.floor(max) + 1));
}

function setupBoard(fleet) {
    for (let i = 0; i < fleet.ships.length; i++) {
        let horizontal = Math.random() >= 0.5;
        let curShip = fleet.ships[i];
        let curShipLength = curShip.length;
        let maxStartPos = 9 - curShipLength;
        let startPos = getRandomInt(maxStartPos);
        let randomInt = getRandomInt(9);

        let controlNum = 1;
        while (controlNum > 0) {
            let clear = true;
            if (horizontal) {
                for (let j = startPos; j < startPos + curShipLength; j++) {
                    if ($("#l-square-" + randomInt + j).hasClass('occupied')) {
                        clear = false
                    }
                }
            } else {
                for (let j = startPos; j < startPos + curShipLength; j++) {
                    if ($("#l-square-" + j + randomInt).hasClass('occupied')) {
                        clear = false
                    }
                }
            }
            if (!clear) {
                startPos = getRandomInt(maxStartPos);
                randomInt = getRandomInt(9);
            } else {
                controlNum = 0;
            }
        }

        if (horizontal) {
            for (let k = startPos; k < startPos + curShipLength; k++) {
                $("#l-square-" + randomInt + k).addClass("occupied " + curShip.name + " horizontal");
            }
        } else {
            for (let k = startPos; k < startPos + curShipLength; k++) {
                $("#l-square-" + k + randomInt).addClass("occupied " + curShip.name + " vertical");
            }
        }
    }
}

$(document).ready(main());

function main() {
    let playerFleet = new PlayerFleet("first player");
    playerFleet.initShips();
    setupBoard(playerFleet);
    let curSquare;
    let newSquares = [];
    let listSquares = [];
    let newClass = ".new";
    let oldClass = ".old";

    $(document).mouseup(function () {
        $(".game-board-square-active").off("mouseenter mouseleave");
        let reSet = true;
        if ($(newClass).length <= 0) {
            reSet = false;
        }

        if (reSet) {
            $(newClass).addClass($(oldClass).attr('class')).removeClass("new old");
            $(oldClass).removeClass().addClass("game-board-square-active");
        } else {
            $(oldClass).removeClass("old");
        }

        newSquares = [];
        listSquares = [];
        curSquare = null;
        return false;
    });

    $(document).on("mousedown", ".occupied", function () {
        if (($(this).hasClass('occupied'))) {

            let horizontal = $(this).hasClass("horizontal");
            curSquare = $(this);
            let classList = $(curSquare).attr('class').split(/\s+/);
            let shipType = classList[2];
            let curLength;

            for (let i in playerFleet.ships) {
                if (playerFleet.ships[i].name === shipType) {
                    curLength = playerFleet.ships[i].length;
                }
            }

            let id = curSquare.attr('id');
            let squareRow = id.slice(-2, -1);
            let squareColumn = id.slice(-1);
            let colOrRow;
            let squareID;
            if (horizontal) {
                colOrRow = squareColumn;
            } else {
                colOrRow = squareRow;
            }

            for (let k = parseInt(colOrRow) - parseInt(curLength); k < parseInt(colOrRow) + parseInt(curLength); k++) {
                if (horizontal) {
                    squareID = squareRow + k;
                } else {
                    squareID = k + squareColumn;
                }

                if ($("#l-square-" + squareID).hasClass('occupied ' + shipType)) {
                    listSquares.push("l-square-" + squareID);
                }
            }

            let curSquarePos;
            for (let i in listSquares) {
                if (listSquares[i] === id) {
                    curSquarePos = i;
                }
            }

            $("." + shipType).addClass("old");
            $(".game-board-square-active").hover(
                function () {
                    let hoverRow = $(this).attr('id').slice(-2, -1);
                    let hoverColumn = $(this).attr('id').slice(-1);
                    let newRow;
                    let newColumn;

                    if (horizontal) {
                        for (let i in listSquares) {
                            let oldColumn = listSquares[i].slice(-1);
                            let diff = parseInt(hoverColumn) - parseInt(squareColumn);
                            newColumn = parseInt(oldColumn) + parseInt(diff);
                            newSquares[i] = ("l-square-" + hoverRow + newColumn);
                        }
                    } else {
                        for (let i in listSquares) {
                            let oldRow = listSquares[i].slice(-2, -1);
                            let diff = parseInt(hoverRow) - parseInt(squareRow);
                            newRow = parseInt(oldRow) + parseInt(diff);
                            newSquares[i] = ("l-square-" + newRow + hoverColumn);
                        }
                    }

                    let clear = true;
                    for (let i in newSquares) {
                        let temp = newSquares[i].split("-");
                        if (temp[2].length !== 2) {
                            clear = false;
                            break;
                        }

                        if (!$("#" + newSquares[i]).hasClass(shipType) && $("#" + newSquares[i]).hasClass("occupied")) {
                            clear = false;
                            break;
                        }
                    }

                    if ($(this).attr('id') === curSquare.attr('id')) {
                        clear = false;
                    }

                    if (clear) {
                        for (let i in newSquares) {
                            $("#" + newSquares[i]).addClass("new");
                        }
                    }
                },
                function () {
                    $(newClass).removeClass("new");
                }
            );
        }

        return false;
    });
}

// var boardContainer = $("#game-board-right");
// //gameboardRight as 3d Array
// var gameBoardRight = [
//                     [0,0,0,0,0,0,0,0,0,0],
//                     [0,0,0,0,0,0,0,0,0,0],
//                     [0,0,0,0,0,0,0,0,0,0],
//                     [0,0,0,0,0,0,0,0,0,0],
//                     [0,0,0,0,0,0,0,0,0,0],
//                     [1,0,0,0,0,0,0,0,0,0],
//                     [1,0,1,0,0,0,0,0,0,0],
//                     [1,0,1,0,1,0,1,0,0,0],
//                     [1,0,1,0,1,0,1,0,1,0],
//                     [1,0,1,0,1,0,1,0,1,0],
//                     ]
//
// var gameBoardLeft = [
//                     [0,0,0,0,0,0,0,0,0,0],
//                     [0,0,0,0,0,0,0,0,0,0],
//                     [0,0,0,0,0,0,0,0,0,0],
//                     [0,0,0,0,0,0,0,0,0,0],
//                     [0,0,0,0,0,0,0,0,0,0],
//                     [1,0,0,0,0,0,0,0,0,0],
//                     [1,0,1,0,0,0,0,0,0,0],
//                     [1,0,1,0,1,0,1,0,0,0],
//                     [1,0,1,0,1,0,1,0,1,0],
//                     [1,0,1,0,1,0,1,0,1,0],
//                     ]
//
// boardContainer.click(fire);
//
// showShips();
// function showShips(){
//     for (let i = 0; i < 10;i++){
//         for (let j = 0; j < 10; j++){
//             if (gameBoardLeft[i][j] == 1){
//                 $("#l-square-" + i + j).css({"background-color":"black"});
//             }
//         }
//     }
// }
//
// function fire(e){
//     //e.target (div clicked on)
//     //e.currentTarget parent element of e.target. The element on which the event listener is set on (boardContainer)
//     if (e.target !== e.currentTarget){
//         var row = e.target.id.substring(e.target.id.length-2,e.target.id.length-1);
//         var col = e.target.id.substring(e.target.id.length-1,e.target.id.length);
//
//         console.log("row: " + row + " col: " + col);
//     }
//     // miss
//     if (gameBoardRight[row][col] == 0) {
//         e.target.style.background = 'blue'
//         gameBoardRight[row][col] = 3;
//
//     // hit
//     }else if(gameBoardRight[row][col] == 1) {
//         e.target.style.background = 'red';
//         gameBoardRight[row][col] = 2;
//
//     // prevent player from firing on fired block
//     }else if(gameBoardRight[row][col] > 1){
//         alert("Already fired");
//     }
//     e.stopPropagation();
//
//
//     //Switch active/inactive boards
//     //Player 2 fires
// }
//
// //not priority
// //Random gameboards?
// function rotate(e){
//     if (e.target !== e.currentTarget){
//         var row = e.target.id.substring(e.target.id.length-2,e.target.id.length-1);
//         var col = e.target.id.substring(e.target.id.length-1,e.target.id.length);
//
//         console.log("row: " + row + " col: " + col);
//     }
//     // miss
//     if (gameBoardRight[row][col] == 0) {
//
//
//     // hit
//     }else if(gameBoardRight[row][col] == 1) {
//         e.target.style.background = 'red';
//         gameBoardRight[row][col] = 2;
//         alert("HITTTT");
//
//     // prevent player from firing on fired block
//     }else if(gameBoardRight[row][col] > 1){
//         alert("Already fired");
//     }
//     e.stopPropagation();
//
// }

