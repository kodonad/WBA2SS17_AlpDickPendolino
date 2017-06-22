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
   *  METHODS
   ** ***************************** 
*/


/* ** **************************************************************************
   *  readBooksFromFile
   *  ---------------
   *  liest alle Bücher aus der JSON Datei aus, speichert sie in ein Array
   *  und gibt sie anschließend zurück.
   ** **************************************************************************
*/
function readBooksFromFile(){
    var content = fs.readFileSync('routes/books/json/books.json').toString(); // liest die Datei synchron aus. (konvertiert zum String)
    var bookList = "[]";
    if(content.length > 0){
      var tempContent = content.substr(0,content.length-1); // Um das letzte Komma aus dem Inhalt zu entfernen.
      var contentObject = "["+tempContent+"]"; // Um aus den Objekten ein Array zumachen welches die Objekte beinhaltet.
      var bookList = JSON.parse(contentObject); // parsed den Inhalt der Datei in ein JSON Objekt.
    }
    return bookList;
}

/* ** **************************************************************************
   *  checkIfExistingBook
   *  ---------------
   *  Überprüft ob ein Buch schon Bereits in der JSON Datei vorhanden ist.
   *  Logik: Jedes Buch hat eine ID. Hier wird die ID des zu hinzuzufügenden
   *         Buches mit den IDs der Bücher aus der JSON Datei überprüft,
   *         Für jede nicht übereinstimmung wird ein Zähler inkrementiert.
   *         sollte ein Buch nicht vorhanden sein, 
   *         
   *         so gilt : Zähler = die Anzahl der Bücher. 
   ** **************************************************************************
*/
function checkIfExistingBook(singleBook,books){
    var statusFree; // Sagt aus ob ein Buch vorhanden ist oder nicht, true = ist nicht vorhanden, false = ist vorhanden.
    var notFound = 0; // Anzahl der nicht übereinstimmungen
    for (var i = 0; i < books.length;i++){
        
        if(books[i].id !== singleBook.id){
            notFound++;
        }
        
    }
    if(notFound < books.length){
        statusFree = false;
    }
    if(notFound === books.length){
        statusFree = true;
    }
    
    return statusFree;
}

/* ** **************************************************************************
   *  parseBookList
   *  ---------------
   *  Filtert gewünschte Attribute aus den API Objekten und schreibt es in eine
   *  Liste die dann zurückgegeben wird.
   ** **************************************************************************
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


/* ** **************************************************************************
   *  writeBookListIntoFile
   *  ---------------
   *  schreibt jedes Buch einzeln in die books.json Datei.
   ** **************************************************************************
*/
function writeBookListIntoFile(bookList){
    var parsedList = parseBookList(bookList); // um eine Bücherliste mit den gewünschten Attributen zu bekommen (dient zum entsorgen von redundanten oder nicht benötigte Informationen)
    var books = readBooksFromFile(); // Liest die vorhanden Bücher aus der JSON Datei aus.
    if(books.length > 0){
    for (var i = 0;i < parsedList.length;i++){
        var check = checkIfExistingBook(parsedList[i],books); // überprüft ob ein Buch aus der Liste bereits in der JSON Datei vorhanden ist.
        
        if(check){  // Falls das Buch nicht vorhanden ist füge es in die Datei ein.
//            console.log(parsedList[i].title+' ist nicht vorhanden.');
            
            var writeLine = JSON.stringify(parsedList[i])+",";
            
            fs.appendFile("routes/books/json/books.json", writeLine, function(err) {
                if(err){ console.log(err);}
                
            });
        }
    }
                
    }
    return parsedList;
    
    
}

/* ** **************************************************************************
   *  getBooksFromApi
   *  ---------------
   *  leitet die Suchanfrage von unserer API zur Google API über. Nachdem
   *   die Daten ausgelesen wurden, werden sie vor der Ausgabe noch verarbeitet.
   ** ************************************************************************** 
*/
function getBooksFromApi(queryString,res){
    var url = "https://www.googleapis.com/books/v1/volumes?q="+queryString; // Google API Call Url, inklusive des benötigten Querys.
    request.get(url, function(error,response,body){ // API Request
                var responseBody;
                var bookList;
                responseBody = JSON.parse(body);
                var bookList = writeBookListIntoFile(responseBody);
                res.send(bookList);
                    });
    
}

/* ** *****************************
   *  ROUTING
   ** ***************************** 
*/


/* ** *****************************
   * Ressource (books/)
   ** *****************************
*/

/* ** GET ** */  // TODO: Genre muss noch implementiert werden!
router.get('/',function(req,res){
    // Object.keys(req.query).length gibt die aktuelle Anzahl der Paramater aus.
    if(Object.keys(req.query).length > 0){ // überprüft ob Parameter angegeben sind
        for(var param in req.query){
            
            // Der switch überprüft, welcher Paramater gesetzt ist, es kann immer nur einer gesetzt sein.
            switch(param){
                case 'q': getBooksFromApi(req.query[param],res); // Um die Bücher aus der Google API zu laden, und diese später zu verarbeiten. || das res wird übergeben um mit den verarbeiteten Daten später ein Response zu senden.
                          
                    break;
                case 'genre': res.send("Hier sollen die Genres stehen.");
                    break;
                    
                default: res.send("");
            }
        }
    }
    else // Falls keine Parameter angegeben sind, sollen alle Bücher aus unserer JSON Datei ausgelesen werden.
    {
        var bookList = readBooksFromFile();
        res.send(bookList);
    }
});

/* ** POST ** */
router.post('/',bodyParser.json(),function(req,res){
    var book = req.body;
    var attributeCounter = 0;

    for ( var attribute in book){ // Zählt wieviele Attribute in dem Bücher Objekt enthalten sind.
        attributeCounter++;
    }

    if(book.id && book.isbn && book.lang && book.title && book.description && book.authors && book.pubdate 
       && book.publisher && attributeCounter === 8){ // Dient zur Überprüfung ob wirklich alle Attribute existieren
        
        var books = readBooksFromFile(); // liest die Bücher aus der JSON Datei aus.
        
        var check = checkIfExistingBook(book,books);
        
        if(check){
            
            var writeLine = JSON.stringify(book)+",";
            
            fs.appendFile("routes/books/json/books.json", writeLine, function(err) {
                if(err){ res.writeHead(500);
                         res.write(err);
                         res.end();}
                else{
                    res.status(200).send("Buch erfolgreich angelegt.");
                }
                
            });
            
        }
        else{
            res.writeHead(400);
            res.write("Es gibt bereits ein Buch mit dieser ID");
            res.end();
        }
    }
    else{
        res.writeHead(406);
        res.write("kein gültiges Buchobjekt, bitte überprüfen!");
        res.end();
    }
});
/* ** *****************************
   * Ressource (books/:id)
   ** *****************************
*/
router.get('/:id',function(req,res){
    var searchID = req.params.id; // der Wert der ID.
    var books = readBooksFromFile(); // liest die Bücher aus der JSON Datei aus.
    
    var exists = false;
    
    for(var i = 0 ; i < books.length;i++ )
    {
      if(books[i].id === searchID){
          exists = true;
          res.send(books[i]);
          break;
      }
    }
    if(exists === false){
        res.status(400).send("Es existiert kein Buch mit dieser ID");
    }
    
});


//Bereitstellen des Moduls um require in der app.js einbinden zu können.
module.exports = router;