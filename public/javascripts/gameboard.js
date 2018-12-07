for (let i = 0; i < 10; i++) {
    $("#game-board-left").append("<div class='board-row-inactive' id='l-row-" + i + "'></div>");
    $("#game-board-right").append("<div class='board-row-active' id='r-row-" + i + "'></div>");
    for (let j = 0; j < 10; j++) {
        $("#l-row-" + i).append("<div class='game-board-square-inactive' id='l-square-" + i + j + "'></div>");
        $("#r-row-" + i).append("<div class='game-board-square-active' id='r-square-" + i + j + "'></div>");
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

        if (horizontal) { //horizontal placement
            let controlNum = 1;
            while (controlNum > 0) {
                let clear = true;
                for (let j = startPos; j < startPos + curShipLength; j++) {
                    if ($("#l-square-" + randomInt + j).hasClass('occupied')) {
                        clear = false
                    }
                }
                if (!clear) {
                    startPos = getRandomInt(maxStartPos);
                    randomInt = getRandomInt(9);
                } else {
                    controlNum = 0;
                }
            }

            for (let k = startPos; k < startPos + curShipLength; k++) {
                $(`#l-square-${randomInt}${k}`).addClass("occupied " + curShip.name);
                if (k === startPos) {
                    $("#l-square-" + randomInt + k).addClass("start");
                } else if (k === startPos + curShipLength - 1) {
                    $("#l-square-" + randomInt + k).addClass("end");
                }

            }
        } else { //vertical placement
            let controlNum = 1;
            while (controlNum > 0) {
                let clear = true;
                for (let j = startPos; j < startPos + curShipLength; j++) {
                    if ($("#l-square-" + j + randomInt).hasClass('occupied')) {
                        clear = false
                    }
                }
                if (!clear) {
                    startPos = getRandomInt(maxStartPos);
                    randomInt = getRandomInt(9);
                } else {
                    controlNum = 0;
                }
            }

            for (let k = startPos; k < startPos + curShipLength; k++) {
                $(`#l-square-${k}${randomInt}`).addClass("occupied " + curShip.name);
                if (k === startPos) {
                    $("#l-square-" + k + randomInt).addClass("start");
                } else if (k === startPos + curShipLength - 1) {
                    $("#l-square-" + k + randomInt).addClass("end");
                }

            }
        }
    }
}

$(document).ready(main());

function main() {
    let playerFleet = new PlayerFleet("first player");
    playerFleet.initShips();
    setupBoard(playerFleet);
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
//     //TODO:
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

