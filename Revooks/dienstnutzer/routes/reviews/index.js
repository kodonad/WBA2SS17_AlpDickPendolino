/* ** *****************************
   *  REQUIRE
   ** ***************************** 
*/
var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var bodyParser = require('body-parser');

/* ** *****************************
   *  GLOBALS
   ** ***************************** 
*/
var _pathOfReviews = __dirname+'/json/reviews.json';
var _serviceUrl = process.env.SERVICEURL || 'http://localhost:3000';

/* ** *****************************
   *  METHODS
   ** ***************************** 
*/

/* ** **************************************************************************
   *  getReviewsFromFile
   *  ---------------
   *  liest die Rezensionen aus der Datei aus.
   ** **************************************************************************
*/
function getReviewsFromFile(){
    var path = _pathOfReviews;
    if(fs.existsSync(_pathOfReviews)){
        
    var reviews = fs.readFileSync(path).toString(); // liest die Datei synchron aus. (konvertiert zum String)
    var tempContent = reviews.substr(0,reviews.length-1); // Um das letzte Komma aus dem Inhalt der Datei zu entfernen.
      var contentObject = "["+tempContent+"]"; // Um aus den Objekten ein Array zumachen welches die Rezensionen beinhaltet.
    
    var reviewList = JSON.parse(contentObject); // parsed den Inhalt der Datei in ein JSON Objekt.
    
    if(reviews.length == 0 ){
        reviewList = []; // wenn keine Rezension in der Liste sein sollte, wird ein leeres Objekt bzw Array ausgegeben.
    }
    return reviewList;
        
    }
    else{ // Falls die Datei nicht existieren sollte, wird ein leeres Array zurückgegeben.
        var temp = []
        return temp;
    }
}

/* ** **************************************************************************
   *  checkIfValidReview
   *  ---------------
   *  Überprüft, ob die zu erstellende Rezension über alle geforderten Attribute
   *  verfügt.
   ** **************************************************************************
*/
function checkIfValidReview(reviewObject){
    var attrCounter = 0;
    for(var attr in reviewObject){
        attrCounter++;
    }
    if(reviewObject.id && reviewObject.bookID &&  reviewObject.message && reviewObject.rating && reviewObject.userID && attrCounter == 5){
        return true;
    }
    else{
        return false;
    }
}

/* ** **************************************************************************
   *  checkIfReviewIsExisting
   *  ---------------
   *  diese Funktion dient dazu, zu überprüfen ob es schon ein Eintrag 
   *  mit der gegebenen ID gibt.
   ** **************************************************************************
*/
function checkIfReviewIsExisting(id,reviewList){
    var temp = false; // Standardgemäß auf false gesetzt, falls beide IDs gleich sind, wird der Wert auf true gesetzt.
    for (var i = 0 ; i < reviewList.length; i++){
        if(reviewList[i].id == id){
            temp = true;
            break;
        }
    }
    
    return temp;
}

/* ** *****************************
   *  ROUTING
   ** ***************************** 
*/

/* ---------------------------------
   >>  Ressource (reviews/)
   ---------------------------------
*/

/* ** GET ** */
router.get("/",function(req,res){
   
    if(fs.existsSync(_pathOfReviews)){ // Überprüft ob die Datei existiert.
        
        var reviewList = getReviewsFromFile(); // Liest alle Rezensionen aus der Datei aus.
        res.status(200).send(reviewList);
    }
    else{
        res.status(404).send("Es wurden noch keine Rezensionen verfasst");
    }    
});
/* ** POST ** */
router.post("/",bodyParser.json(),function(req,res){
    var reviewObject = req.body;
    var check = checkIfValidReview(reviewObject); // überprüft ob die Rezension valide ist
    
    if(check){
     request.get(_serviceUrl+"/books/"+reviewObject.bookID,function(error,response,body){ // Fragt die Bücher  mit der angegebenen ID des Dienstgebers an.
         switch(response.statusCode){ // überprüft die Anfrage, wenn erfolgreich 200, wenn 404 nicht erfolgreich.
             case 200:
            request.get("http://localhost:3001/user/"+reviewObject.userID,function(error,response,body){ // Fragt die Benutzer  mit der angegebenen ID des Dienstgebers an.
                 
            switch(response.statusCode){ // überprüft die Anfrage, wenn erfolgreich 200, wenn 404 nicht erfolgreich.
                    
                case 200:  // Ab Hier Gehts erst los , Zuerst wurde überprüft ob das Buch was man rezensieren möchte existiert und direkt danach wurde überprüft ob der Benutzer existiert.      
                var writeLine = JSON.stringify(reviewObject)+","; // das "," dient dazu innerhalb der JSON Datei die einzelnen Rezensionen aufzulisten.
                    
                if(fs.existsSync(_pathOfReviews)){ // Überprüft ob das Produkt mit der ID , eine Datei mit Rezensionen besitzt.
                    
                    var reviewList = getReviewsFromFile(); // Liest die Rezensionen aus der Datei , die nach der ID benannt ist.
                         
                         var check = checkIfReviewIsExisting(reviewObject.id,reviewList); // true = ID existiert schon, false= ID existiert nicht. 
                    
                    
                    if(check === false){
                        fs.appendFile(_pathOfReviews,writeLine,function(err){
                            if(err){console.log(err);}   
                        });
                        res.status(201).send("Rezension wurde erfolgreich erstellt.");
                    }
                    else{
                        res.status(400).send("Es existiert bereits eine Rezension mit dieser ID");
                    }
                  }
                    else{
                        fs.writeFile(_pathOfReviews,writeLine,function(err){
                           res.status(201).send("Rezension wurde erfolgreich erstellt.")  
                         });
                    }
                    
                    break;
                    
                case 404: res.send("Der Benutzer mit der ID: "+reviewObject.userID+" existiert nicht.");
                          break;
                    
                default: res.status(500).send(""); 
                         break;    
                                       
                                           
             }
            });
                 break;
             case 404: res.send("Das Buch mit der ID: "+reviewObject.bookID+" existiert nicht.");
                     break;
             default: res.status(500).send(""); 
                       break;    
         }
     });
        
    }
    else{ 
        res.status(406).send("Kein Gültiges Rezensionsobjekt\nBeachten sie , dass ID,BOOKID,MESSAGE,RATING & USERID gesetzt sind");
    }
});



//Bereitstellen des Moduls um require in der app.js einbinden zu können.
module.exports = router;