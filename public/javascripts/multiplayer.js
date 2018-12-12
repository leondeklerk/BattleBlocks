var socket = new WebSocket('ws://145.94.167.129:8080/');

socket.onopen = function(){
    socket.send("{}");
};

socket.onclose = function(){
};

socket.onerror = function(){  
};

