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