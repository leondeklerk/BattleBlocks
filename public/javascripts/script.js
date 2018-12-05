function setPlayDiv() {
    $("#join-friend-div").hide();
    $("#main-buttons").hide();
    $("#play-buttons").show();
}

function setButtonDiv() {
    $("#main-buttons").show();
    $("#play-buttons").hide();
}

function gotToRules(){
    $("#rules-div").show();
    $("#default-splash").hide();
}
function returnToDef() {
    $("#rules-div").hide();
    $("#default-splash").show();
}

function joinFriend() {
    $("#play-buttons").hide();
    $("#join-friend-div").show();
}