for (let i = 0; i < 10; i++) {
    $("#game-board-left").append("<div class='board-row' id='" + i + "'></div>");
    $("#game-board-right").append("<div class='board-row' id='" + i + "'></div>");
    for (let j = 0; j < 10; j++) {
        $("#game-board-left #" + i).append("<div class='board-square' id='" + i + j + "'></div>");
        $("#game-board-right #" + i).append("<div class='board-square' id='" + i + j + "'></div>");
    }
}

$("#return-to-splash").hide();

function gotToRules(){
    $("#rules-div").show();
    $("#default-splash").hide();
}
function returnToDef() {
    $("#rules-div").hide();
    $("#default-splash").show();
}

// function setPlayDiv() {
//     $("#join-friend-div").hide();
//     $("#main-buttons").hide();
//     $("#play-buttons").show();
// }
//
// function setButtonDiv() {
//     $("#main-buttons").show();
//     $("#play-buttons").hide();
// }

// function joinFriend() {
//     $("#play-buttons").hide();
//     $("#join-friend-div").show();
// }