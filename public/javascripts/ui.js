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

var elem = document.documentElement;

/* View in fullscreen */
function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
    $("#full").hide();
    $("#no-full").show();
}

/* Close fullscreen */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
    }
    $("#full").show();
    $("#no-full").hide();
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