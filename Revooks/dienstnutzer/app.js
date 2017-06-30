// Module einbinden
var express = require('express');
var router = express.Router();
// für Zugriff an Objekte binden.
var app = express();

//Konstante zur Konfiguration
var settings = {
    port: 3001
};


/* ** *****************************
   *  ROUTING
   ** ***************************** */

//binden des Pfades an eine Variable
const user = require('./routes/user'); 

//einbinden der Pfade.
app.use("/user",user);

app.get("/",function(req,res){
   res.send("Hello World").end();
});

app.listen(settings.port, function(){
    console.log("Express app läuft auf Port "+settings.port);
});