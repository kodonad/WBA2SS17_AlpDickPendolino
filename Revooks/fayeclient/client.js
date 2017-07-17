var faye = require('faye');

var client = new faye.Client('http://localhost:8000/faye');

client.subscribe('/news',function(message){
    console.log(message.text);
});