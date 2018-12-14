var socket = new WebSocket('ws://localhost:8080/');

socket.onopen = function(){
    socket.send("Player joined");
};

socket.onmessage = function(){
    
}
socket.onclose = function(){
};

