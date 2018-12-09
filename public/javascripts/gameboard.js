for (let i = 0; i < 10; i++) {
    $("#game-board-left").append("<div class='board-row' id='l-row-" + i + "'></div>");
    $("#game-board-right").append("<div class='board-row' id='r-row-" + i + "'></div>");
    for (let j = 0; j < 10; j++) {
        $("#l-row-" + i).append("<div class='board-square-active' id='l-square-" + i + j + "'></div>");
        $("#r-row-" + i).append("<div class='board-square-inactive' id='r-square-" + i + j + "'></div>");
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

function setupBoard(fleet, side) {
    for (let i = 0; i < fleet.ships.length; i++) {
        let horizontal = Math.random() >= 0.5;
        let curShip = fleet.ships[i];
        let curShipLength = curShip.length;
        let maxStartPos = 9 - curShipLength;
        let startPos = getRandomInt(maxStartPos);
        let randomInt = getRandomInt(9);
        let pref = "#" + side + "-square-";

        let controlNum = 1;
        while (controlNum > 0) {
            let clear = true;
            if (horizontal) {
                for (let j = startPos; j < startPos + curShipLength; j++) {
                    if ($(pref + randomInt + j).hasClass('occupied')) {
                        clear = false
                    }
                }
            } else {
                for (let j = startPos; j < startPos + curShipLength; j++) {
                    if ($(pref + j + randomInt).hasClass('occupied')) {
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
                $(pref + randomInt + k).addClass("occupied " + curShip.name + " horizontal");
            }
        } else {
            for (let k = startPos; k < startPos + curShipLength; k++) {
                $(pref + k + randomInt).addClass("occupied " + curShip.name + " vertical");
            }
        }

        if (side === "l") {
            $(".board-square-active.occupied").addClass("drag");
        }
    }
}

$(document).ready(main());


function main() {
    let player = "#game-board-left";
    let playerFleetP1 = new PlayerFleet("P1");
    let playerFleetP2 = new PlayerFleet("P2");
    playerFleetP1.initShips();
    playerFleetP2.initShips();
    setupBoard(playerFleetP1, "l");
    let curSquare;
    let newSquares = [];
    let oldSquares = [];


    $("#dep").click(function () {
        $(".drag").removeClass("drag");
        $(".board-bottom").hide();
        setupBoard(playerFleetP2, "r");
        $(document).off('click');
        $(document).on("click", ".board-square-active", fire);
        switchBoard();
        return false;
    });

    $(document).on("click", ".board-square-active", function () {
        if ($(this).hasClass('drag')) {
            let horizontal;
            if ($(this).hasClass('horizontal')) {
                horizontal = true;
            }

            let oldSquaresList = [];
            let newSquaresList = [];
            let clickedPos;
            let squareToTest;

            curSquare = $(this);
            let id = curSquare.attr('id');
            let squareRow = id.slice(-2, -1);
            let squareColumn = id.slice(-1);
            let classList = curSquare.attr('class').split(/\s+/);
            let shipType = classList[2];

            let k = 2;

            if (horizontal) {
                squareToTest = $("#l-square-" + squareRow + (squareColumn - 1));
            } else {
                squareToTest = $("#l-square-" + (parseInt(squareRow) - 1) + squareColumn);
            }

            while (squareToTest.hasClass(shipType)) {
                oldSquaresList.push(squareToTest.attr('id'));
                if (horizontal) {
                    squareToTest = $("#l-square-" + squareRow + (squareColumn - k));
                } else {
                    squareToTest = $("#l-square-" + (parseInt(squareRow) - k) + squareColumn);
                }
                k++;
            }

            oldSquaresList.push(id);

            k = 2;
            if (horizontal) {
                squareToTest = $("#l-square-" + squareRow + (parseInt(squareColumn) + 1));
            } else {
                squareToTest = $("#l-square-" + (parseInt(squareRow) + 1) + squareColumn);
            }

            while (squareToTest.hasClass(shipType)) {
                oldSquaresList.push(squareToTest.attr('id'));
                if (horizontal) {
                    squareToTest = $("#l-square-" + squareRow + (parseInt(squareColumn) + k));
                } else {
                    squareToTest = $("#l-square-" + (parseInt(squareRow) + k) + squareColumn);
                }
                k++;
            }

            oldSquaresList.sort();

            for (let i in oldSquaresList) {
                if (oldSquaresList[i] === id) {
                    clickedPos = i;
                }
            }


            for (let i = 0; i < clickedPos; i++) {
                let firstPart = oldSquaresList[i].slice(0, -2);
                if (horizontal) {
                    newSquaresList.push(firstPart + (parseInt(squareRow) - (i + 1)) + squareColumn);
                } else {
                    newSquaresList.push(firstPart + squareRow + (parseInt(squareColumn) - (i + 1)));
                }
            }

            newSquaresList.push(id);

            for (let i = parseInt(clickedPos) + 1; i < oldSquaresList.length; i++) {
                let firstPart = oldSquaresList[i].slice(0, -2);
                if (horizontal) {
                    newSquaresList.push(firstPart + (parseInt(squareRow) + i - clickedPos) + squareColumn);
                } else {
                    newSquaresList.push(firstPart + squareRow + (parseInt(squareColumn) + i - clickedPos));
                }
            }

            let clear = true;
            for (let i  in newSquaresList) {
                let temp = newSquaresList[i].split("-");
                if ((newSquaresList[i] !== id && $("#" + newSquaresList[i]).hasClass('drag')) || temp[2].length !== 2) {
                    clear = false;
                    break;
                }
            }

            if (clear) {
                for (let i in oldSquaresList) {
                    let selectorNew = $("#" + newSquaresList[i]);
                    let selectorOld = $("#" + oldSquaresList[i]);
                    if (newSquaresList[i] !== id) {
                        selectorNew.addClass(selectorOld.attr('class'));
                        selectorOld.removeClass().addClass("board-square-active");
                    }
                    if (horizontal) {
                        selectorNew.removeClass('horizontal').addClass('vertical');
                    } else {
                        selectorNew.removeClass('vertical').addClass('horizontal');
                    }

                }
            }
        }
        return false;
    });

    $(document).mouseup(function () {
        $(".board-square-active").off("mouseenter mouseleave");
        let reSet = true;
        if ($(".new").length <= 0) {
            reSet = false;
        }

        if (reSet) {
            $(".new").addClass($(".old").attr('class')).removeClass("new old");
            $(".old").removeClass().addClass("board-square-active");
        } else {
            $(".old").removeClass("old");
        }

        newSquares = [];
        oldSquares = [];
        curSquare = null;
        return false;
    });

    $(document).on("mousedown", ".drag", function () {
        let horizontal = $(this).hasClass("horizontal");
        curSquare = $(this);
        let classList = $(curSquare).attr('class').split(/\s+/);
        let shipType = classList[2];
        let curLength;

        for (let i in playerFleetP1.ships) {
            if (playerFleetP1.ships[i].name === shipType) {
                curLength = playerFleetP1.ships[i].length;
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
                oldSquares.push("l-square-" + squareID);
            }
        }

        let curSquarePos;
        for (let i in oldSquares) {
            if (oldSquares[i] === id) {
                curSquarePos = i;
            }
        }

        $("." + shipType).addClass("old");
        $(".board-square-active").hover(
            function () {
                let hoverRow = $(this).attr('id').slice(-2, -1);
                let hoverColumn = $(this).attr('id').slice(-1);
                let newRow;
                let newColumn;

                if (horizontal) {
                    for (let i in oldSquares) {
                        let oldColumn = oldSquares[i].slice(-1);
                        let diff = parseInt(hoverColumn) - parseInt(squareColumn);
                        newColumn = parseInt(oldColumn) + parseInt(diff);
                        newSquares[i] = ("l-square-" + hoverRow + newColumn);
                    }
                } else {
                    for (let i in oldSquares) {
                        let oldRow = oldSquares[i].slice(-2, -1);
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

                    if (!$("#" + newSquares[i]).hasClass(shipType) && $("#" + newSquares[i]).hasClass("drag")) {
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
                $(".new").removeClass("new");
            }
        );
        return false;
    });

    function fire() {
        if ($(this).hasClass('occupied')) {
            let shipName = $(this).attr('class').split(/\s+/)[1];
            $(this).addClass("hit").removeClass("occupied").removeClass(shipName);
            if ($(player + " ." + shipName).length === 0) {
                removeList(shipName);
            }
            switchBoard();
        } else if (!$(this).hasClass('hit') && !$(this).hasClass('miss')) {
            $(this).addClass("miss");
            switchBoard();
        }

    }

    function switchBoard() {
        $(player + " .board-square-active").addClass("board-square-inactive").removeClass("board-square-active");
        if (player === "#game-board-right") {
            player = "#game-board-left";
        } else {
            player = "#game-board-right";
        }
        $(player + " .board-square-inactive").addClass("board-square-active").removeClass("board-square-inactive");
    }

    function removeList(shipName) {
        console.log(shipName);
        if (player === "#game-board-right") {
            $("#list-" + shipName + "-right .ship-part").addClass("destroyed");
            for (let i in playerFleetP1.ships) {
                if (playerFleetP1.ships[i].name === shipName) {
                    playerFleetP1.ships.splice(i, 1)
                }
            }
        } else if (player === "#game-board-left") {
            $("#list-" + shipName + "-left .ship-part").addClass("destroyed");
            for (let i in playerFleetP2.ships) {
                if (playerFleetP2.ships[i].name === shipName) {
                    playerFleetP2.ships.splice(i, 1)
                }
            }
        }

        if (playerFleetP1.ships.length === 0) {
            alert("P1 Wins!");
            window.location.replace("./splash.html");
        } else if (playerFleetP2.ships.length === 0) {
            alert("P2 Wins!");
            window.location.replace("./splash.html");
        }


    }
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

