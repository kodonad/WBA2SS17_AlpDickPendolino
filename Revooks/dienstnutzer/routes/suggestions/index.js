/* ** *****************************
   *  REQUIRE
   ** ***************************** 
*/
var express = require('express');
var router = express.Router();
var fs = require('fs');
var bodyParser = require('body-parser');
var request = require('request');

/* ** *****************************
   *  GLOBALS
   ** ***************************** 
*/
var _serviceUrl = process.env.SERVICEURL || 'http://localhost:3000';

/* ** *****************************
   *  METHODS
   ** ***************************** 
*/

/* ** ************************************************************
   *  getAverage
   *  -----------
   *  Dient dazu den Durchschnitt zu berechnen.
   ** ************************************************************ 
*/
function getAverage(sum,count){
    return parseFloat(sum/count);
}

/* ** ************************************************************
   *  getBestRatedBook
   *  -----------------
   *  Da die Variable bestRatedList nur über die jeweiligen
   *  IDs der Bücher verfügt, sorgt diese Funktion dafür, dass
   *  die zugehörigen Informationen zu der ID ausgegeben werden können.
   ** ************************************************************
*/
function getBestRatedBook(bestRatedList,bookList){
    
    var bestRatedBookList = [];
    
    for(var i = 0; i < bestRatedList.length ; i++){
        
        var bookID = bestRatedList[i];
       
        for(var j = 0 ; j < bookList.length ; j++){
            
            if(bookID == bookList[j].id){
                
                bestRatedBookList.push(bookList[j]);
                break;
            }
        }
    }
    return bestRatedBookList;
}


/* ** ************************************************************
   *  calculateBestRatedBooks
   *  -----------------------
   *  Diese Funktion dient dazu, die Durchschnittsbewertung
   *  aller Bücher zu kalkulieren, falls die 
   *  Durchschnittsbewertung 3.5 oder höher beträgt, 
   *  werden diese Bücher dem Endnutzer als Vorschläge angezeigt.
   ** ************************************************************
*/
function calculateBestRatedBooks(res,bookList){
    // Dieses Request auf die eigene URL dient dazu alle Rezensionen auszulesen
    request.get("http://localhost:3001/reviews/",function(error,response,body){
        if(response.statusCode == 200){
                   var reviewList = JSON.parse(body);
                   
                   var bestRatedList = [];
                   for(var i = 0; i < reviewList.length ; i++){
                       var bookID = reviewList[i].bookID;
                       
                       var sum = 0;      // Die Summe der Bewertungen
                       var count = 0;
                       
                       for(var j = 0; j < reviewList.length; j++){
                           var compareReview = reviewList[j];
                           
                           if(bookID == compareReview.bookID){ // Überprüft die Anzahl der gleichen Bücher, um die Bewertungen zu summieren.
                               count++; // zählt wieviele gleiche Bücher existieren.
                               
                               sum += parseInt(compareReview.rating,10); // wandelt das Rating in ein Integer wird um.
                           }
                       }
                       var avg = getAverage(sum,count); // Berechnet den Durchschnitt der Bewertungen für die Bücher 
                       
                       if(avg >= 3.5){  
                           
                           // Überprüft ob das Buch schon in der Liste vorhanden ist
                           if(bestRatedList.length > 0){
                               for(var b = 0; b < bestRatedList.length; b++){
                                   var exists = false;
                                   
                                   if(bestRatedList[b] == bookID){
                                       exists = true;
                                       break;
                                   }
                                   if(exists === false){ // Falls die Bücher ID noch nicht existieren sollte, wird sie hier der Liste hinzugefügt.
                                   bestRatedList.push(bookID);
                                   }
                               }
                           }
                        else{  // Falls die Liste noch keinen Eintrag hat, wird problemlos eingefügt.
                             bestRatedList.push(bookID);
                        }
                           
                           
                       }
                   }
                   var bestRatedBook = getBestRatedBook(bestRatedList,bookList);
                   if(bestRatedBook.length > 0){
                       res.status(200).send(bestRatedBook);
                   }
                   else{
                       res.status(404).send("Es gibt noch kein Produkt dessen Bewertung höher als 3.5 ist.");
                   }
                   
               }
               else{
                   res.status(response.statusCode).send(body);
               }
           });
}


/* ** *****************************
   *  ROUTING
   ** ***************************** 
*/

router.get('/',function(req,res){
    
    request.get(_serviceUrl+'/books',function(error,response,body){
        
        switch(response.statusCode){
            case 200: 
                var bookList = JSON.parse(body);
                calculateBestRatedBooks(res,bookList); 
                break;
                
            case 404:
                res.status(404).send(body);
                break;
            default: res.status(500).send(error);
                break;
        }
    })
});

//Bereitstellen des Moduls um require in der app.js einbinden zu können.
module.exports = router;