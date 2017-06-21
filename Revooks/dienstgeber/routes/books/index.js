/* ** *****************************
   *  REQUIRE
   ** ***************************** 
*/
var express = require('express');
var router = express.Router();
var request = require('request');



/* ** *****************************
   *  METHODS
   ** ***************************** 
*/
function parseBookList(bookList){
    // Die Anzahl der zu suchenden Bücher (bookList) beträgt 10, um eine riesige Datenhaltung zu vermeiden.
    
    var tempList = []; // um die Liste temporär zu speichern nach dem die gewünschten Informationen aus dem Objekt geholt wurden.
    
    for(var i=0; i < bookList.items.length; i++){
        var bookID = bookList.items[i].id; // ID des jeweiligen Buches
        var isbn = bookList.items[i].volumeInfo.industryIdentifiers; // ISBN des jeweiligen Buches
        var lang = bookList.items[i].volumeInfo.language; // Sprache des jeweiligen Buches.
        var title = bookList.items[i].volumeInfo.title; // Titel des Buches.
        var authors = bookList.items[i].volumeInfo.authors; // Array von Autoren.
        var date = bookList.items[i].volumeInfo.publishedDate; // Publikationsdatum.
        
        if(bookList.items[i].volumeInfo.publisher){
          var publisher = bookList.items[i].volumeInfo.publisher; // Publizierer    
        }
        else{
            var publisher = "keine Angabe";
        }
        
        if(bookList.items[i].volumeInfo.description){
            var description = bookList.items[i].volumeInfo.description;
        }
        else{
            var description = "für dieses Buch steht leider keinerlei Beschreibung zur Verfügung";
        }
        
        // Fügt die Elemente in das tempList Array ein.
        tempList.push({id:bookID,
                       isbn:isbn,
                       lang:lang,
                       title:title,
                       description:description,
                       authors:authors,
                       pubdate:date,
                       publisher:publisher});
    }
    return tempList;
}


function writeBookListIntoFile(bookList){
    var parsedList = parseBookList(bookList); // um eine Bücherliste mit den gewünschten Attributen zu bekommen (dient zum entsorgen von redundanten oder nicht benötigte Informationen)
    return parsedList;
    
    
}
function getBooksFromApi(queryString,res){
    var url = "https://www.googleapis.com/books/v1/volumes?q="+queryString; // Google API Call Url, inklusive des benötigten Querys.
    request.get(url, function(error,response,body){ // API Request
                var responseBody;
                var bookList;
                responseBody = JSON.parse(body);
                var bookList = writeBookListIntoFile(responseBody); // Dient nur zur testweisen Ausgabe momentan.
                res.send(bookList);
                    });
    
}

/* ** *****************************
   *  ROUTING
   ** ***************************** 
*/
router.get('/',function(req,res){
    // Object.keys(req.query).length gibt die aktuelle Anzahl der Paramater aus.
    if(Object.keys(req.query).length > 0){ // überprüft ob Parameter angegeben sind
        for(var param in req.query){
            
            // Der switch überprüft, welcher Paramater gesetzt ist, es kann immer nur einer gesetzt sein.
            switch(param){
                case 'q': getBooksFromApi(req.query[param],res); // Um die Bücher aus der Google API zu laden, und diese später zu verarbeiten. || das res wird übergeben um mit den verarbeiteten Daten später ein Response zu senden.
                          
                    break;
                case 'id': res.send("ist ID");
                    break;
                    
                default: res.send("");
            }
        }
    }
    else // Falls keine Parameter angegeben sind, sollen alle Bücher aus unserer JSON Datei ausgelesen werden.
    {
        res.send("Test2");
    }
});


//Bereitstellen des Moduls um require in der app.js einbinden zu können.
module.exports = router;