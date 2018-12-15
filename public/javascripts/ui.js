for (let i = 0; i < 10; i++) {
    $("#game-board-left").append("<div class='board-row' id='" + i + "'></div>");
    $("#game-board-right").append("<div class='board-row' id='" + i + "'></div>");
    for (let j = 0; j < 10; j++) {
        $("#game-board-left #" + i).append("<div class='board-square' id='" + i + j + "'></div>");
        $("#game-board-right #" + i).append("<div class='board-square' id='" + i + j + "'></div>");
    }
}