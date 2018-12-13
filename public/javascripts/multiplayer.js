var socket = new WebSocket('ws://localhost:8080/');

socket.onopen = function(){
    socket.send("{}");
};

socket.onclose = function(){
};

socket.onerror = function(){  
};

