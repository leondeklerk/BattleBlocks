//specify the socket
let socket = new WebSocket("ws://localhost:8080");

//when the connections opens send the message
socket.onopen = function () {
    let message = {
        type: "CONNECTED"
    };
    socket.send(JSON.stringify(message));
};

//when a message comes in
socket.onmessage = function (event) {
    let msg = JSON.parse(event.data);
    let type = msg.type;

    if (type === "PLAYER") {
        output.log("You are player " + msg.player); //log to the game console
        if (msg.player === "2") {
            output.log("Other player is already connected");
        } else {
            output.log("Waiting for another player...");
        }
    } else if (type === "CONNECTED") {
        output.log("The other player connected");
    } else if (type === "SWITCH") {
        switchTurns(); //switch the turn, changing the board to either active or intactive
    } else if (type === "READY") {
        output.log("The other player is ready");
        otherReady = true;
        testListener(); //set a listener to fire when both players are ready
    } else if (type === "FIRED_AT") {
        if (!otherReady) {
            otherReady = true;
            testListener();
        }

        let column = msg.column;
        let row = msg.row;
        output.log("Incoming fire! Enemy fired at " + String.fromCharCode(65 + parseInt(row)) + (parseInt(column) + 1));
        processFired(row, column); //process incomming fire
    } else if (type === "FIRED_RESULT") {
        //set the result of fire on the board
        if (msg.data === "HIT") {
            setResult(msg.row, msg.column, true);
            output.log("You hit!");
        } else {
            setResult(msg.row, msg.column, false);
            output.log("You missed!");
        }
    } else if (type === "SHIP_DESTROYED") {
        //remove a ship from the list and send the correct console output
        output.log("You destroyed the enemy " + msg.data);
        updateShipList(msg.data);
    } else if (type === "WON") {
        //when the game is won by a player show a button to quit, update the console output, deregister the clicker of the fire, send your ships to other player and initiate automatic disconnect
        $("#return-to-splash").show();
        $(document).off('click');
        sendShips();
        output.win();
        updateScroll();
        disconnect(true);
    } else if (type === "SHIPS_LOCATIONS") {
        //show the locations of the enemy ships
        showShips(msg.data);
        output.log("Showing the enemy ships");
    }

};

//when the connection closes
socket.onclose = function () {
    disconnect(false);
};

// a functions that gives puts game information into the console and initiates an automatic disconnect
function disconnect(end) {
    if(!end){
        output.log("Other player has disconnected");
    }
    output.log("you will automatically be disconnected in 30 seconds...");
    $(".board-bottom-button").hide();
    $("#return-to-splash").show();
    setTimeout(function () {
        $("#return-to-splash button").trigger("click");
    }, 30000);
}

let otherReady = false; //the other player is ready
let ready = false; //you are ready
let turn = true; //it is your turn
let hitSound = new Audio("../sounds/hit.mp3"); //sound for hitting
hitSound.volume = 0.1;
let missSound = new Audio("../sounds/miss.mp3"); //sound for missing
missSound.volume = 0.1;
let messageSound = new Audio("../sounds/message.mp3"); //sound for incomming console message
messageSound.volume = 0.1;

//object for the game console
let log = "#log";
var output = {
    log: function (message) { //function log acts like console.log
        messageSound.play(); //play the incoming message sound
        $(log).append("<p class='console-item'>" + message + "</p>"); //add the text to the console
        updateScroll(); //set the view of the console to the bottom
    },
    win: function () { //function log acts like console.log
        messageSound.play(); //play the incoming message sound
        $(log).append("<p class='console-item' id='win'>You won!</p>");
    },
    lost: function () { //function log acts like console.log
        messageSound.play(); //play the incoming message sound
        $(log).append("<p class='console-item' id='lost'>You lost!</p>");
    }

};

//function to make sure the console is always showing the newest message
function updateScroll() {
    var element = document.getElementById("log");
    element.scrollTop = element.scrollHeight;
}

//ship object
function Ship(name) {
    this.name = name;
    this.length = 0;
}

//fleet object with list of ships and a function to initialize them
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

//function that returns a random int between 0 and the specified max value
function getRandomInt(max) {
    return Math.floor(Math.random() * (Math.floor(max) + 1));
}

//function to create a randomized board setup, takes a fleet of which the ships should be placed randomized
function setupBoard(fleet) {
    for (let i = 0; i < fleet.ships.length; i++) { //for all the ships in the list with ships
        let horizontal = Math.random() >= 0.5; //randomized horizontal or vertical
        let curShip = fleet.ships[i]; //holder for the currently selected ship
        let curShipLength = curShip.length; //lenght of this ship
        let maxStartPos = 10 - curShipLength; //maximum position a ship can start in e.g. a ship with length 2 can have a maximum position of 8 (index from 0 to 9)
        let startPos = getRandomInt(maxStartPos); //determine the position the ship should start
        let randomInt = getRandomInt(9); //determine the other place on the grid (row if this ship is horizontal, column if this ship is vertical

        let controlNum = 1; //number to keep the while loop running until we want it to stop
        while (controlNum > 0) {
            let clear = true; //indicated whether or not the new spots are clear
            if (horizontal) { //if this ship should be placed horizontally
                for (let j = startPos; j < startPos + curShipLength; j++) {
                    if ($("#game-board-left " + "#" + randomInt + j).hasClass('occupied')) {
                        clear = false //check if a new spot is empty or not if it is not then clear if set to false
                    }
                }
            } else { //if this ship should be placed vertically
                for (let j = startPos; j < startPos + curShipLength; j++) {
                    if ($("#game-board-left " + "#" + j + randomInt).hasClass('occupied')) {
                        clear = false //check if a new spot is empty or not if it is not then clear if set to false
                    }
                }
            }
            //if the new squares where not clear then try everything again with new randomized numbers
            if (!clear) {
                startPos = getRandomInt(maxStartPos);
                randomInt = getRandomInt(9);
            } else {
                controlNum = 0; //if it was clear stop the while loop
            }
        }

        //after we determined the squares where the ships have to be placed in, actually add to class to place them
        if (horizontal) {
            for (let k = startPos; k < startPos + curShipLength; k++) {
                $("#game-board-left " + "#" + randomInt + k).addClass("occupied " + curShip.name + " horizontal");
            }
        } else {
            for (let k = startPos; k < startPos + curShipLength; k++) {
                $("#game-board-left " + "#" + k + randomInt).addClass("occupied " + curShip.name + " vertical");
            }
        }

        $("#game-board-left .board-square.occupied").addClass("drag"); //add the class to indicated the ships can be dragged in the manual deployment adjustments

    }
}

//when the document (HTML) is loaded execute the function main
$(document).ready(main());

function main() {
    switchTurns(); //initially set it so that the player is not ready at the start
    playerFleet = new PlayerFleet("P1"); //create a new fleet for this player
    playerFleet.initShips(); //initialize the ships
    setupBoard(playerFleet); //create the randomized board
    let curSquare; //the square that will be selected
    let newSquares = []; //list of new squares where the ship should be moved to
    let oldSquares = []; //list of old squares where the ship is currently placed

    //when clicked the ships can no longer be changed, the places are confirmed and the game will start
    $("#dep").click(function () { //#dep is the ready button
        $(".drag").removeClass("drag"); //remove the class drag so no ships can be moved anymore
        $(".board-bottom-button").hide(); //hide the ready button
        $(document).off('click'); //de register the clicks from the rotation
        ready = true; //set this player is ready to true
        let message = {
            type: "READY"
        };

        socket.send(JSON.stringify(message)); //send the message that you are ready
        testListener(); //try to register the click listener for firing (only works if the other player is also ready)
        return false;
    });

    //Register the clicker to rotate a ship
    $(document).on("click", ".board-square", function () {
        if ($(this).hasClass('drag')) { //if this is actually a ship execute the function rotate on this object
            rotate(this);
        }
        return false;
    });

    //when the mouse is no longer clicked the movement is confirmed, registers the mouseup listnener to the whole document
    $(document).mouseup(function () {
        let n = ".new";
        let o = ".old";
        $(".error").removeClass('error'); //remove the class error if there was one (indicating an invalid placement try)
        $(".board-square").off("mouseenter mouseleave"); //deregister the hover listeners
        let reSet = true; //if there are no issues re-Set will be true, indicating that the ships can be re-set
        if ($(n).length <= 0) { //if there are no squares that indicate that the ship will be moved to there then the move is invalid so reSet must be false
            reSet = false;
        }

        //if there were no invalid moves remove the class copy all the classes from the old squares to the new squares and remove the new and old classes indicating new squares and the old squared respectively
        if (reSet) {
            $(n).addClass($(o).attr('class')).removeClass("new old"); //copy the classes
            $(o).removeClass().addClass("board-square"); //remove all the classes of the old squares and just add a regular empty square class to it
        } else {
            $(o).removeClass("old"); //if the moves were invalid remove the old class from the current squares (indicating that the ships will not be moved and are no longer selected)
        }

        //reset the lists and variables
        newSquares = [];
        oldSquares = [];
        curSquare = null;
        return false;
    });

    //Code for actually dragging the ship and determining its new place, initiated by registering a mousedown listener to the draggable ships
    $(document).on("mousedown", ".drag", function () {
        let horizontal = $(this).hasClass("horizontal"); //check if this ship is an horizontal ship or not
        curSquare = $(this); //set the currently selected square
        let classList = $(curSquare).attr('class').split(/\s+/); //create a list of classes
        let shipType = classList[2]; //get the ship name from the list of classes (always the second one)
        let curLength;

        //loop trough all the ships in the fleet until we find this ships, then get its length
        for (let i in playerFleet.ships) {
            if (playerFleet.ships[i].name === shipType) {
                curLength = playerFleet.ships[i].length; //set the length of the current ship
            }
        }

        let id = curSquare.attr('id'); //get the id of the current square (which is just a combination of the row and the column
        let squareRow = id.slice(-2, -1); //extract the row from the id (e.g. id 00 is row 0 column 0)
        let squareColumn = id.slice(-1); //extract the column from the id
        let colOrRow;
        let squareID;
        if (horizontal) {
            colOrRow = squareColumn; //if the ships is horizontal we need the column
        } else {
            colOrRow = squareRow; //else we need the row
        }

        //get all the squares that belong to this ship, we do so by testing every square for the the class occupied (indicating it is a ship) and ship type (indicating it belongs to the same ship) (e.g. if we start at column 5 and our ship is length 3, we check square 5 - 3 up until 5 + 3
        for (let k = parseInt(colOrRow) - parseInt(curLength); k < parseInt(colOrRow) + parseInt(curLength); k++) {
            //determine the id of the square currently testing
            if (horizontal) {
                squareID = squareRow + k;
            } else {
                squareID = k + squareColumn;
            }

            //if it is a ship and part of this ship add id to the list of old (current) squares
            if ($("#" + squareID).hasClass('occupied ' + shipType)) {
                oldSquares.push(squareID);
            }
        }

        //we want to determine the position of the initial square in the ship (is equal to the position in the list)
        let curSquarePos;
        for (let i in oldSquares) {
            if (oldSquares[i] === id) { //id is the square that was selected initially
                curSquarePos = i;
            }
        }

        $("." + shipType).addClass("old"); //add the class old to the ship, indicating it is currently selected
        //register a hover listener to the squares of the board
        $(".board-square").hover(
            function () {
                let hoverRow = $(this).attr('id').slice(-2, -1); //get to row of the square that is currently hovered over
                let hoverColumn = $(this).attr('id').slice(-1); //get the column of the square that is currently hovered over
                let newRow;
                let newColumn;

                if (horizontal) { //if this ship is horizontal
                    //based on the offset of the square we initially selected and the square currently hovered over, apply that offset to all other squares of the currently selected squares and put that into a list
                    for (let i in oldSquares) {
                        let oldColumn = oldSquares[i].slice(-1); //get the column of the old square
                        let diff = parseInt(hoverColumn) - parseInt(squareColumn); //calculate the difference of the clicked square's column and the column of the hover
                        newColumn = parseInt(oldColumn) + parseInt(diff); //calculate the column of the square currently selected in the loop and apply the offset
                        newSquares[i] = (hoverRow + newColumn); //add it to the list of new squares
                    }
                } else { //same stuff for the vertical but then with a row offset instead of column offset
                    for (let i in oldSquares) {
                        let oldRow = oldSquares[i].slice(-2, -1);
                        let diff = parseInt(hoverRow) - parseInt(squareRow);
                        newRow = parseInt(oldRow) + parseInt(diff);
                        newSquares[i] = (newRow + hoverColumn);
                    }
                }

                //now we need to test if the new squares are clear
                let clear = true;
                //loop trough all the new squares
                for (let i in newSquares) {
                    if (newSquares[i].length !== 2) { //if the length of the id is not 2 the new square is invalid (min square is 00, max is 99 rest is between)
                        clear = false; //then set clear to false;
                        break;
                    }
                    //test if the new square is not already occupied (tested with the squares ships and drag class)
                    if (!$("#" + newSquares[i]).hasClass(shipType) && $("#" + newSquares[i]).hasClass("drag")) {
                        clear = false;
                        for (let i in newSquares) {
                            $("#" + newSquares[i]).addClass("error"); //if the square is occupied add the class error indicating a invalid move (red indicator)
                        }
                        break;
                    }
                }

                //if the ship is not moved at all clear is false (ship does not have to be moved in this case)
                if ($(this).attr('id') === curSquare.attr('id')) {
                    clear = false;
                }
                //if everything is clear add the class new indicating this is where the ship will be moved to (confirmed by mouseup)
                if (clear) {
                    for (let i in newSquares) {
                        $("#" + newSquares[i]).addClass("new"); //add the class new (green indicator)
                    }
                }

            },
            function () { //when hovering out of the squares everything needs to be calculated again for the square currently hovering over
                $(".new").removeClass("new"); //remove the new class
                $(".error").removeClass('error'); //remove the error class
            }
        );
        return false;
    });
}

//test if both players are ready to register the click listener to fire
function testListener() {
    if (ready && otherReady) {
        output.log("You are both ready and the game will start"); //send message to the game console
        $(document).on("click", "#game-board-right .board-square", fire); //register the listener and the function
    }
}

function fire() {
    if (!$(this).hasClass('hit') && !$(this).hasClass('miss') && !$(this).hasClass('inactive')) { //you can only fire if the class is not already shot at (hit or miss) or if it is not you turn (indicated with the inactive class)
        let id = $(this).attr('id'); //get the id of the square shot at
        let row = id.slice(-2, -1); //extract the row
        let column = id.slice(-1); //extract the column
        //create the message to send to the other player to process
        var outgoingMessage = {
            type: "FIRED_AT",
            row: row,
            column: column
        };

        socket.send(JSON.stringify(outgoingMessage)); //actually send the message
    }
}

//if the enemy fired you need to process what happened, set the results and send results back to the other player
function processFired(row, column) { //takes the row and column fired at
    let curSquare = "#game-board-left " + "#" + row + column; //the square shot at
    let message;
    //if it is occupied this is a hit
    if ($(curSquare).hasClass('occupied')) {
        hitSound.play(); //play the hit sound
        let shipName = $(curSquare).attr('class').split(/\s+/)[2]; //get the name of the ship that was hit
        $(curSquare).addClass("hit").removeClass("occupied").removeClass(shipName); //add the hit class and remove the rest of the classes
        //create the message for the other player so the results can also be set at the other players board
        message = {
            type: "FIRED_RESULT",
            data: "HIT",
            row: row,
            column: column
        };
        if ($("#game-board-left " + "." + shipName).length === 0) { //if there are no more squares left of this ship it needs to be removed from the list
            removeList(shipName); //execute the function to remove the ship from the list (with given ship name)
        }
    } else if (!$(curSquare).hasClass('hit') && !$(curSquare).hasClass('miss')) { //if it was a miss
        missSound.play(); //play the miss sound
        $(curSquare).addClass("miss"); //add the class missed
        //create the message for the other player
        message = {
            type: "FIRED_RESULT",
            data: "MISS",
            row: row,
            column: column
        };
    }
    socket.send(JSON.stringify(message)); //actually send the message
}

//set the result based on the message from the other player
function setResult(row, column, hit) {
    let curSquare = "#game-board-right " + "#" + row + column; //get the square where the results should be set
    if (hit) { //if it was a hit
        $(curSquare).addClass('hit');
    } else { //if it was a miss
        $(curSquare).addClass('miss');
    }
    //now everything is processed we need to switch turns
    switchTurns();
    let message = {
        type: "SWITCH"
    };
    socket.send(JSON.stringify(message)); //send the message to switch turns
}

//update the ships list
function updateShipList(ship) {
    $("#list-" + ship + "-right .ship-part").addClass("destroyed");
}

//switch the turns
function switchTurns() {
    if (turn) { //if it is this players turn set its board to active
        $("#game-board-right .board-square").removeClass("inactive");
    } else { //else change its board to inactive
        $("#game-board-right .board-square").addClass("inactive");
    }
    turn = !turn; //and also change its turn indicator
}

//function to remove the ships from the shipslist and send a message to the other player so it can be removed over there as well
function removeList(shipName) {
    $("#list-" + shipName + "-left .ship-part").addClass("destroyed"); //update your own list
    //loop trough the list of ships until we find the ship we need
    for (let i in playerFleet.ships) {
        if (playerFleet.ships[i].name === shipName) {
            playerFleet.ships.splice(i, 1); //remove it from the list
            output.log("Your " + shipName + " got destroyed"); //give console output
            let message = {
                type: "SHIP_DESTROYED",
                data: shipName
            };
            socket.send(JSON.stringify(message)); //send a message which ship was destroyed so the other player can process it
        }
    }

    //if there are no more ships left in the fleet the player has lost
    if (playerFleet.ships.length === 0) {
        let message = {
            type: "WON",
        };
        socket.send(JSON.stringify(message)); //this player lost so we need to send a message to the other player to tell that that player won
        $(document).off('click'); //unregister the fire listener
        output.lost(); //send output
        updateScroll();
        disconnect(true); //initiate the disconnect function to give the correct console output and initiate automatic disconnect
    }
}

//send the list of your ships to the enemy (that has already lost by now) and the other player the location of you ships
function sendShips() {
    let shipsList = [];
    //create a list with all you ships
    $(".occupied").each(function () {
        shipsList.push($(this).attr('id'));
    });

    let message = {
        type: "SHIPS_LOCATIONS",
        data: shipsList
    };

    socket.send(JSON.stringify(message)); //send the message containing a list with all the locations of this players ships left
}

//show the ships of the winner on this players screen based on the information send with the message
function showShips(arr) {
    //for all the items in the list add it to the board
    for (let i = 0; i < arr.length; i++) {
        $("#game-board-right #" + arr[i]).addClass('occupied');
    }

    //for all the other squares show the miss for stimulating an ocean (blue)
    let selector = "#game-board-right .board-square";
    $(selector).each(function () {
        if (!$(this).hasClass('occupied') && !$(this).hasClass('hit')) { //if it not already has a special class (occupied for ship or hit for a hit) add the miss class
            $(this).addClass('miss');
        }
    });
}

//function for rotating a ship
function rotate(object) {
    let horizontal;
    if ($(object).hasClass('horizontal')) { //if the ship is a horizontal ship
        horizontal = true;
    }

    let oldSquaresList = []; //list of old squares
    let newSquaresList = []; //list of new squares
    let clickedPos; //position where player clicked
    let squareToTest; //square to test

    let curSquare = $(object); //get the current square
    let id = curSquare.attr('id'); //extract the id from the square
    let squareRow = id.slice(-2, -1); //extract the row
    let squareColumn = id.slice(-1); //extract the column
    let classList = curSquare.attr('class').split(/\s+/); //get a list with all classes from the clicked square
    let shipType = classList[2]; //extract the name/type of the ship (always number 2 in the list)

    let k = 2;//k is 2 because the maximum length on the left is 2 (max length is 5 and we already have one square selected, the square we originally clicked)

    //select the first square to test
    if (horizontal) {
        squareToTest = $("#" + squareRow + (squareColumn - 1)); //square left of the current square
    } else {
        squareToTest = $("#" + (parseInt(squareRow) - 1) + squareColumn); //square above the current square
    }

    //keep testing the next square until we find a square that is not part of this ship
    while (squareToTest.hasClass(shipType)) {
        oldSquaresList.push(squareToTest.attr('id')); //add the old square to test to the squares list
        if (horizontal) {
            squareToTest = $("#" + squareRow + (squareColumn - k)); //set a new square to test by going further to the left
        } else {
            squareToTest = $("#" + (parseInt(squareRow) - k) + squareColumn); //set a new square to test by going further to the top
        }
        k++;
    }

    oldSquaresList.push(id); //push the last square we found

    //now we need to start getting the square from the other side of the clicked square
    k = 2; //reset the counter
    if (horizontal) {
        squareToTest = $("#" + squareRow + (parseInt(squareColumn) + 1)); //square to the right of the clicked square
    } else {
        squareToTest = $("#" + (parseInt(squareRow) + 1) + squareColumn); //square below the clicked square
    }

    //now we need to keep testing squares until we found the last square belonging to this ship
    while (squareToTest.hasClass(shipType)) {
        oldSquaresList.push(squareToTest.attr('id')); //add the old square to test to the squares list
        if (horizontal) {
            squareToTest = $("#" + squareRow + (parseInt(squareColumn) + k)); //set a new square to test by going further to the right
        } else {
            squareToTest = $("#" + (parseInt(squareRow) + k) + squareColumn); //set a new square to test by going further to the top
        }
        k++;
    }

    oldSquaresList.sort(); //sort the list (by id) so we get an ordered

    //now we need to get the position of the clicked square in the list
    for (let i in oldSquaresList) {
        if (oldSquaresList[i] === id) {
            clickedPos = i;
        }
    }

    //now we need to rotate the squares and put their positions in a list, first start with all the squares left/above the clicked square
    for (let i = 0; i < clickedPos; i++) {
        let firstPart = oldSquaresList[i].slice(0, -2);
        if (horizontal) {
            newSquaresList.push(firstPart + (parseInt(squareRow) - (i + 1)) + squareColumn); //if it is a horizontal square the column is the same as the clicked square, the row can be calculated based on the row of the clicked square and the position in the list, calculate its position and add it
        } else {
            newSquaresList.push(firstPart + squareRow + (parseInt(squareColumn) - (i + 1))); //if it is a vertical square the row is the same as the clicked square, the column can be calculated based on the column of the clicked square and the position in the list, then calculate its position and add
        }
    }

    newSquaresList.push(id); //push the clicked square

    //repeat the same but then for the right and below squares
    for (let i = parseInt(clickedPos) + 1; i < oldSquaresList.length; i++) {
        let firstPart = oldSquaresList[i].slice(0, -2);
        if (horizontal) {
            newSquaresList.push(firstPart + (parseInt(squareRow) + i - clickedPos) + squareColumn); //calculate and add
        } else {
            newSquaresList.push(firstPart + squareRow + (parseInt(squareColumn) + i - clickedPos)); //calculate and add
        }
    }

    let clear = true; //variable to test if the new squares are clear
    for (let i  in newSquaresList) { //test every square in the new squares list
        if ((newSquaresList[i] !== id && $("#" + newSquaresList[i]).hasClass('drag')) || newSquaresList[i].length !== 2) { //if the length of the id is to long/short or if the new squares already are parts of a ship
            clear = false; //then the new squares are not clear
            for (let i in newSquaresList) {
                $("#" + newSquaresList[i]).addClass("error"); //then for all the new squares, they are invalid and add the class error
            }
            break;
        }
    }

    //if it is clear
    if (clear) {
        for (let i in oldSquaresList) {
            let selectorNew = $("#" + newSquaresList[i]); //create selector
            let selectorOld = $("#" + oldSquaresList[i]);
            if (newSquaresList[i] !== id) {
                selectorNew.addClass(selectorOld.attr('class')); //copy all classes from the old squares
                selectorOld.removeClass().addClass("board-square"); //remove all the classes from the old squares and make it a regular empty board square
            }
            if (horizontal) {
                selectorNew.removeClass('horizontal').addClass('vertical'); //if it was horizontal it will now be vertical
            } else {
                selectorNew.removeClass('vertical').addClass('horizontal'); //if it was vertical it will now be horizontal
            }

        }
    } else { //if it was not clear to set the new squares
        setTimeout(function () {
            $(".error").removeClass('error'); //remove the class error
        }, 200); //after 200ms
    }
}

