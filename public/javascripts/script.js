function setPlayDiv() {
    $("#button-div").hide();
    $("#play-div").show();
}

function setButtonDiv() {
    $("#button-div").show();
    $("#play-div").hide();
}

function gotToRules(){
    $("#rules-div").show();
    $("#default-splash").hide();
}
function returnToDef() {
    $("#rules-div").hide();
    $("#default-splash").show();
}
function main(){
    $("#play-div").hide();
    $("#rules-div").hide();
}

$(document).ready(main);