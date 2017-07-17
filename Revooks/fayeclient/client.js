var faye = require('faye');
var chalk = require('chalk');

var client = new faye.Client('http://localhost:8000/faye');

client.subscribe('/news',function(message){
    console.log("\n"+chalk.white.bgRed("Mitteilung")+"\n"+message.text);
});