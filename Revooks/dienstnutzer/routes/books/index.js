/* ** *****************************
   *  REQUIRE
   ** ***************************** 
*/
var express = require('express');
var router = express.Router();
var request = require('request');
var bodyParser = require('body-parser');

/* ** *****************************
   *  GLOBALS
   ** ***************************** 
*/
var serviceUrl = process.env.SERVICEURL || 'http://localhost:3000';

/* ** *****************************
   *  METHODS
   ** ***************************** 
*/

/* ** *****************************
   *  ROUTING
   ** ***************************** 
*/

/* ---------------------------------
   >>  Ressource (books/)
   ---------------------------------
*/

/* ** GET ** */
router.get('/',function(req,res){
    var reqUrl = serviceUrl+'/books/';
    if(Object.keys(req.query).length > 0){ // überprüft ob Parameter angegeben sind
        for(var param in req.query){
            
            // Der switch überprüft, welcher Paramater gesetzt ist, es kann immer nur einer gesetzt sein.
            switch(param){
                case 'title':  reqUrl = serviceUrl+'/books?title='+req.query[param]; // Wenn Titel gesetzt ist wird die Dienstgeber Ressource aufgerufen mit dem gleichen Parameter.           
                    break;
                default: res.send("");
            }
        }
    }
    request.get(reqUrl,function(error,response,body){
        switch(response.statusCode){
            case 200: res.status(response.statusCode).send(JSON.parse(body));
                break;
            case 404: res.status(response.statusCode).send(body);
                break;
            default:break;
         }
    })
});


/* ** GET ** */
router.get('/:id',function(req,res){
    var id = req.params.id;
    var reqUrl = serviceUrl+'/books/'+id;
    request.get(reqUrl,function(error,response,body){
        switch(response.statusCode){
            case 200: res.status(response.statusCode).send(JSON.parse(body));
                break;
            case 404: res.status(response.statusCode).send(body);
                break;
            default:break;
         }
    })
});







//Bereitstellen des Moduls um require in der app.js einbinden zu können.
module.exports = router;