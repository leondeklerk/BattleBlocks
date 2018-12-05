for (let i = 0; i < 10; i++) {
    $("#game-board-left").append("<div class='board-row-active' id='l-row-" + i + "'></div>");
    $("#game-board-right").append("<div class='board-row-inactive' id='r-row-" + i + "'></div>");
    for (let j = 0; j < 10; j++) {
        $("#l-row-" + i).append("<div class='game-board-square-active' id='l-square-" + i + j + "'></div>");
        $("#r-row-" + i).append("<div class='game-board-square-inactive' id='r-square-" + i + j + "'></div>");
    }
}