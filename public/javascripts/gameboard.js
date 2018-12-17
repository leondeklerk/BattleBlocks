let socket = new WebSocket("ws://localhost:8080");

socket.onopen = function () {
    let message = {
        type: "CONNECTED"
    };
    socket.send(JSON.stringify(message));
};

socket.onmessage = function (event) {
    let msg = JSON.parse(event.data);
    let type = msg.type;

    if (type === "PLAYER") {
        output.log("You are player " + msg.player);
        if(msg.player === "2"){
            output.log("Other player is already connected");
        } else {
            output.log("Waiting for another player...");
        }
    } else if (type === "CONNECTED"){
        output.log("The other player connected");
    } else if (type === "SWITCH") {
        switchTurns();
    } else if (type === "READY") {
        output.log("The other player is ready");
        otherReady = true;
        testListener();
    } else if (type === "FIRED_AT") {
        if(!otherReady){
            otherReady = true;
            testListener();
        }

        let column = msg.column;
        let row = msg.row;
        output.log("Incoming fire! Enemy fired at " + String.fromCharCode(65 + parseInt(row)) + (parseInt(column) + 1));
        processFired(row, column);
    } else if (type === "FIRED_RESULT") {
        if (msg.data === "HIT") {
            setResult(msg.row, msg.column, true);
            output.log("You hit!");
        } else {
            setResult(msg.row, msg.column, false);
            output.log("You missed!");
        }
    } else if (type === "SHIP_DESTROYED") {
        output.log("You destroyed the enemy " + msg.data);
        updateShipList(msg.data);
    } else if (type === "WON") {
        $("#return-to-splash").show();
        $(document).off('click');
        sendShips();
        output.log("You won!");
        disconnect();
    } else if (type === "SHIPS_LOCATIONS") {
        showShips(msg.data);
        output.log("Showing the enemy ships");
    }

};

socket.onclose = function () {
    disconnect();
};

function disconnect(){
    output.log("Other player has disconnected");
    output.log("you will automatically be disconnected in 30 seconds...");
    $(".board-bottom-button").hide();
    $("#return-to-splash").show();
    setTimeout(function () {
        $("#return-to-splash button").trigger("click");
    }, 30000);
}

let otherReady = false;
let ready = false;
let turn = true;
let hitSound = new Audio("../sounds/hit.mp3");
hitSound.volume = 0.1;
let missSound = new Audio("../sounds/miss.mp3");
missSound.volume = 0.1;
let messageSound = new Audio("../sounds/message.mp3");
messageSound.volume = 0.1;

var output = {
    log: function (message) {
        messageSound.play();
        $("#log").append("<p class='console-item'>" + message + "</p>");
        updateScroll();
    }
};

function updateScroll(){
    var element = document.getElementById("log");
    element.scrollTop = element.scrollHeight;
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

        let controlNum = 1;
        while (controlNum > 0) {
            let clear = true;
            if (horizontal) {
                for (let j = startPos; j < startPos + curShipLength; j++) {
                    if ($("#game-board-left " + "#" + randomInt + j).hasClass('occupied')) {
                        clear = false
                    }
                }
            } else {
                for (let j = startPos; j < startPos + curShipLength; j++) {
                    if ($("#game-board-left " + "#" + j + randomInt).hasClass('occupied')) {
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
                $("#game-board-left " + "#" + randomInt + k).addClass("occupied " + curShip.name + " horizontal");
            }
        } else {
            for (let k = startPos; k < startPos + curShipLength; k++) {
                $("#game-board-left " + "#" + k + randomInt).addClass("occupied " + curShip.name + " vertical");
            }
        }

        if (side === "l") {
            $(".board-square.occupied").addClass("drag");
        }
    }
}

$(document).ready(main());

function main() {
    switchTurns();
    playerFleet = new PlayerFleet("P1");
    playerFleet.initShips();
    setupBoard(playerFleet, "l");
    let curSquare;
    let newSquares = [];
    let oldSquares = [];

    //end setup
    $("#dep").click(function () {
        $(".drag").removeClass("drag");
        $(".board-bottom-button").hide();
        $(document).off('click');
        ready = true;
        let message = {
            type: "READY"
        };
        // if(otherReady){
        //     output.log("You and the other player are ready, the game will start now");
        // } else {
        //     output.log("Still waiting on the other player to be ready");
        // }

        socket.send(JSON.stringify(message));
        testListener();
        return false;
    });

    //Rotation
    $(document).on("click", ".board-square", function () {
        if ($(this).hasClass('drag')) {
            rotate(this);
        }
        return false;
    });

    //confirm drag
    $(document).mouseup(function () {
        $(".error").removeClass('error');
        $(".board-square").off("mouseenter mouseleave");
        let reSet = true;
        if ($(".new").length <= 0) {
            reSet = false;
        }

        if (reSet) {
            $(".new").addClass($(".old").attr('class')).removeClass("new old");
            $(".old").removeClass().addClass("board-square");
        } else {
            $(".old").removeClass("old");
        }

        newSquares = [];
        oldSquares = [];
        curSquare = null;
        return false;
    });

    //Drag
    $(document).on("mousedown", ".drag", function () {
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

            if ($("#" + squareID).hasClass('occupied ' + shipType)) {
                oldSquares.push(squareID);
            }
        }

        let curSquarePos;
        for (let i in oldSquares) {
            if (oldSquares[i] === id) {
                curSquarePos = i;
            }
        }

        $("." + shipType).addClass("old");
        $(".board-square").hover(
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
                        newSquares[i] = (hoverRow + newColumn);
                    }
                } else {
                    for (let i in oldSquares) {
                        let oldRow = oldSquares[i].slice(-2, -1);
                        let diff = parseInt(hoverRow) - parseInt(squareRow);
                        newRow = parseInt(oldRow) + parseInt(diff);
                        newSquares[i] = (newRow + hoverColumn);
                    }
                }

                let clear = true;
                for (let i in newSquares) {
                    if (newSquares[i].length !== 2) {
                        clear = false;
                        break;
                    }

                    if (!$("#" + newSquares[i]).hasClass(shipType) && $("#" + newSquares[i]).hasClass("drag")) {
                        clear = false;
                        for (let i in newSquares) {
                            $("#" + newSquares[i]).addClass("error");
                        }
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
                $(".error").removeClass('error');
            }
        );
        return false;
    });
}

function testListener() {
    if (ready && otherReady) {
        output.log("You are both ready and the game will start");
        $(document).on("click", "#game-board-right .board-square", fire);
    }
}

function fire() {


    if (!$(this).hasClass('hit') && !$(this).hasClass('miss') && !$(this).hasClass('inactive')) {
        let id = $(this).attr('id');
        let row = id.slice(-2, -1);
        let column = id.slice(-1);
        var outgoingMessage = {
            type: "FIRED_AT",
            row: row,
            column: column
        };

        socket.send(JSON.stringify(outgoingMessage));
    }

}

function processFired(row, column) {
    let curSquare = "#game-board-left " + "#" + row + column;
    let message;
    if ($(curSquare).hasClass('occupied')) {
        hitSound.play();
        let shipName = $(curSquare).attr('class').split(/\s+/)[2];
        $(curSquare).addClass("hit").removeClass("occupied").removeClass(shipName);
        message = {
            type: "FIRED_RESULT",
            data: "HIT",
            row: row,
            column: column
        };
        if ($("#game-board-left " + "." + shipName).length === 0) {
            removeList(shipName);
        }
    } else if (!$(curSquare).hasClass('hit') && !$(curSquare).hasClass('miss')) {
        missSound.play();
        $(curSquare).addClass("miss");
        message = {
            type: "FIRED_RESULT",
            data: "MISS",
            row: row,
            column: column
        };
        console.log("MISS! :)");
    }
    socket.send(JSON.stringify(message));
}

function setResult(row, column, hit) {
    let curSquare = "#game-board-right " + "#" + row + column;
    if (hit) {
        $(curSquare).addClass('hit');
    } else {
        $(curSquare).addClass('miss');
    }

    switchTurns();
    let message = {
        type: "SWITCH"
    };
    socket.send(JSON.stringify(message));
}

function updateShipList(ship) {
    $("#list-" + ship + "-right .ship-part").addClass("destroyed");
}

function switchTurns() {
    if (turn) {
        $("#game-board-right .board-square").removeClass("inactive");
    } else {
        $("#game-board-right .board-square").addClass("inactive");
    }
    turn = !turn;
}

function removeList(shipName) {
    $("#list-" + shipName + "-left .ship-part").addClass("destroyed");
    for (let i in playerFleet.ships) {
        if (playerFleet.ships[i].name === shipName) {
            playerFleet.ships.splice(i, 1);
            output.log("Your " + shipName + " got destroyed");
            let message = {
                type: "SHIP_DESTROYED",
                data: shipName
            };
            socket.send(JSON.stringify(message));
        }
    }

    if (playerFleet.ships.length === 0) {
        let message = {
            type: "WON",
        };
        socket.send(JSON.stringify(message));
        $(document).off('click');
        output.log("You lost!");
        disconnect();
    }
}

function sendShips() {
    let shipsList = [];
    $(".occupied").each(function () {
        shipsList.push($(this).attr('id'));
    });

    let message = {
        type: "SHIPS_LOCATIONS",
        data: shipsList
    };

    socket.send(JSON.stringify(message));
}


function showShips(arr) {
    for (let i = 0; i < arr.length; i++) {
        $("#game-board-right #" + arr[i]).addClass('occupied');
    }

    let selector = "#game-board-right .board-square";
    $(selector).each(function () {
        if (!$(this).hasClass('occupied') && !$(this).hasClass('hit')) {
            $(this).addClass('miss');
        }
    });


}

function rotate(object) {
    let horizontal;
    if ($(object).hasClass('horizontal')) {
        horizontal = true;
    }

    let oldSquaresList = [];
    let newSquaresList = [];
    let clickedPos;
    let squareToTest;

    let curSquare = $(object);
    let id = curSquare.attr('id');
    let squareRow = id.slice(-2, -1);
    let squareColumn = id.slice(-1);
    let classList = curSquare.attr('class').split(/\s+/);
    let shipType = classList[2];

    let k = 2;

    if (horizontal) {
        squareToTest = $("#" + squareRow + (squareColumn - 1));
    } else {
        squareToTest = $("#" + (parseInt(squareRow) - 1) + squareColumn);
    }

    while (squareToTest.hasClass(shipType)) {
        oldSquaresList.push(squareToTest.attr('id'));
        if (horizontal) {
            squareToTest = $("#" + squareRow + (squareColumn - k));
        } else {
            squareToTest = $("#" + (parseInt(squareRow) - k) + squareColumn);
        }
        k++;
    }

    oldSquaresList.push(id);

    k = 2;
    if (horizontal) {
        squareToTest = $("#" + squareRow + (parseInt(squareColumn) + 1));
    } else {
        squareToTest = $("#" + (parseInt(squareRow) + 1) + squareColumn);
    }

    while (squareToTest.hasClass(shipType)) {
        oldSquaresList.push(squareToTest.attr('id'));
        if (horizontal) {
            squareToTest = $("#" + squareRow + (parseInt(squareColumn) + k));
        } else {
            squareToTest = $("#" + (parseInt(squareRow) + k) + squareColumn);
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
        if ((newSquaresList[i] !== id && $("#" + newSquaresList[i]).hasClass('drag')) || newSquaresList[i].length !== 2) {
            clear = false;
            for (let i in newSquaresList) {
                $("#" + newSquaresList[i]).addClass("error");
            }
            break;
        }
    }

    if (clear) {
        for (let i in oldSquaresList) {
            let selectorNew = $("#" + newSquaresList[i]);
            let selectorOld = $("#" + oldSquaresList[i]);
            if (newSquaresList[i] !== id) {
                selectorNew.addClass(selectorOld.attr('class'));
                selectorOld.removeClass().addClass("board-square");
            }
            if (horizontal) {
                selectorNew.removeClass('horizontal').addClass('vertical');
            } else {
                selectorNew.removeClass('vertical').addClass('horizontal');
            }

        }
    } else {
        setTimeout(function(){
            $(".error").removeClass('error');
        },200);
    }
}

