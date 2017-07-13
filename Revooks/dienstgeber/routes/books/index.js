/* ** *****************************
   *  REQUIRE
   ** ***************************** 
*/
var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var bodyParser = require('body-parser');

var _path = __dirname+'json/books.json'; // globale Variable

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
    
    if(fs.existsSync(_path)){ // wenn die Bücher Datei existiert.
    var content = fs.readFileSync(_path).toString(); // liest die Datei synchron aus. (konvertiert zum String)
    var bookList = "[]";
    if(content.length > 0){
      var tempContent = content.substr(0,content.length-1); // Um das letzte Komma aus dem Inhalt zu entfernen.
      var contentObject = "["+tempContent+"]"; // Um aus den Objekten ein Array zumachen welches die Objekte beinhaltet.
      var bookList = JSON.parse(contentObject); // parsed den Inhalt der Datei in ein JSON Objekt.
    
        }
    }
    else{ // falls sie nicht existiert.
        return false; // Um abzufangen , wenn es keine Bücher gibt.
    }
    return bookList;
}

/* ** **************************************************************************
   *  checkIfExistingBook
   *  ---------------
   *  Überprüft ob ein Buch schon Bereits in der JSON Datei vorhanden ist. 
   ** **************************************************************************
*/
function checkIfExistingBook(singleBook,books){
    var statusFree = true; // Sagt aus ob ein Buch vorhanden ist oder nicht, true = ist nicht vorhanden, false = ist vorhanden.
    for (var i = 0; i < books.length;i++){
        
        if(books[i].id === singleBook.id){
            statusFree = false;
            break;
        }   
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
   *  updateFile
   *  ---------------
   *  aktualisiert die books.json Datei.
   ** **************************************************************************
*/
function updateFile(bookList){
    
    /* truncate dient dazu alle Bücher aus der books.json zu löschen. Dadurch, dass bereits zuvor der Inhalt in die Variable bookList 
       geschrieben wurde, wird problemlos der Inhalt der Variable
       bookList, welche alle Bücher enthält, in die books.json geschrieben.
    */
    fs.truncate(_path,0, function(err){
               
      for(var i = 0 ; i < bookList.length;i++){ // schreibt jedes einzelne Buch aus der Liste der Bücher in die books.json
                 
            var writeLine = JSON.stringify(bookList[i])+",";
               
            fs.appendFile(_path,writeLine, function(err){
                     
            });
        }
    });
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
    if(books && books.length > 0){
    for (var i = 0;i < parsedList.length;i++){
        var check = checkIfExistingBook(parsedList[i],books); // überprüft ob ein Buch aus der Liste bereits in der JSON Datei vorhanden ist.
        
        if(check){  // Falls das Buch nicht vorhanden ist füge es in die Datei ein.
            var writeLine = JSON.stringify(parsedList[i])+",";
            
            fs.appendFile(_path, writeLine, function(err) {
                if(err){ console.log(err);}
                
            });
        }
    }
        
    }
    else{ // falls die Bücher Datei leer ist werden die Bücher aus dem API Request in die Datei eingefügt. Falls die Datei vorher nicht existiert hat, wird sie angelegt.
        for(var i = 0;i < parsedList.length; i++){
            
        var writeLine = JSON.stringify(parsedList[i])+",";
            
            fs.appendFile(_path, writeLine, function(err) {
                if(err){ console.log(err);}
        });
            
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

/* ** **************************************************************************
   *  checkIfValidBookObject
   *  ---------------
   *  Überprüft ob das zu erstellende Buch die Anforderungen entspricht
   ** ************************************************************************** 
*/
function checkIfValidBookObject(book){
    var attributeCounter = 0;
    
    for ( var attribute in book){ // Zählt wieviele Attribute in dem Bücher Objekt enthalten sind.
        attributeCounter++;
    }
    
    if(book.id && book.isbn && book.lang && book.title && book.description && book.authors && book.pubdate 
       && book.publisher && attributeCounter === 8){ // Dient zur Überprüfung ob wirklich alle Attribute existieren und keine zusätzlichen Attribute zusätzlich gespeichert werden.
        
        return true;
    }
    else{
        return false;
    }
    
}


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
    // Object.keys(req.query).length gibt die aktuelle Anzahl der Paramater aus.
    if(Object.keys(req.query).length > 0){ // überprüft ob Parameter angegeben sind
        for(var param in req.query){
            
            // Der switch überprüft, welcher Paramater gesetzt ist, es kann immer nur einer gesetzt sein.
            switch(param){
                case 'title': getBooksFromApi(req.query[param],res); // Um die Bücher aus der Google API zu laden, und diese später zu verarbeiten. || das res wird übergeben um mit den verarbeiteten Daten später ein Response zu senden.             
                    break;
                default: res.send("");
            }
        }
    }
    else // Falls keine Parameter angegeben sind, sollen alle Bücher aus unserer JSON Datei ausgelesen werden.
    {
        var bookList = readBooksFromFile();
        if(bookList){
            res.status(200).send(bookList);
        }
        else{
            res.status(404).send("Es existieren noch keine Bücher in der Anwendung");
        }
    }
});

/* ** POST ** */
router.post('/',bodyParser.json(),function(req,res){
    var book = req.body;
    
    
    var isValid = checkIfValidBookObject(book);
    

    if(isValid){ // Dient zur Überprüfung ob wirklich alle Attribute existieren und keine zusätzlichen Attribute zusätzlich gespeichert werden.
        
        var books = readBooksFromFile(); // liest die Bücher aus der JSON Datei aus.
        
        if(books){
            
        var check = checkIfExistingBook(book,books);
        
        if(check){
            
            var writeLine = JSON.stringify(book)+",";
            
            fs.appendFile(_path, writeLine, function(err) {
                if(err){ res.writeHead(500);
                         res.write(err);
                         res.end();}
                else{
                    res.status(201).send("Buch erfolgreich angelegt.");
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
          res.status(404).send("Es existieren noch keine Bücher in der Anwendung");
      }
     }
     else{
            res.writeHead(406);
            res.write('kein gültiges Buchobjekt,\n  ==>\n "id": int \n "isbn":[{"type":"xyz","identifier":"xyz"}]\n "lang":"xyz" \n "title":"xyz"\n "description":"xyz" \n "authors":["xyz"]\n "pubdate":"01.01.1990"\n "publisher":"xyz"');
            res.end();
        }
});
/* ---------------------------------
   >>  Ressource (books/:id)
   ---------------------------------
*/

/* ** GET ** */
router.get('/:id',function(req,res){
    var reqID = req.params.id; // der Wert der ID.
    var books = readBooksFromFile(); // liest die Bücher aus der JSON Datei aus.
    
    var exists = false;
    
    for(var i = 0 ; i < books.length;i++ )
    {
      if(books[i].id === reqID){ // falls eines der Bücher die ID hat die mit der request id übereinstimmen.
          exists = true;
          res.status(200).send(books[i]);
          break;
      }
    }
    if(exists === false){
        res.status(404).send("Es existiert kein Buch mit dieser ID");
    }    
});

/* ** PUT ** */
router.put('/:id',bodyParser.json(),function(req,res){

    var reqID = req.params.id; // die ID des abzuänderten Buches.
    var newBook = req.body; // Die Informationen des neu zu speichernden Buches
    var bookList = readBooksFromFile(); // liest die Bücher aus der JSON Datei aus.
    
    var exists = false;
    
    for (var i = 0; i < bookList.length; i++){
        
        if(bookList[i].id === reqID){ // falls eines der Bücher die ID hat die mit der request id übereinstimmen.
            
            var bookToChange; // =  Aktuelles Buch ohne Änderung der Buchinformationen.
            var changedBook; // = neues Buch mit Änderungen der Buchinformationen.
            
            exists = true;
            bookToChange = bookList[i];
            
            changedBook = bookToChange; // Schreibt das Aktuelle Buch in die changedBook Variable, dessen Attribute überschrieben werden.
            
            for (var attrNew in newBook){ // für jedes Attribut in der abgeänderten Buchinformation.
        
                for (var attr in changedBook){ // für jedes Attribut in der jetzigen Buchinformation. 
            
                    if(attrNew === attr){
                    changedBook[attr] = newBook[attrNew]; // überschreibt den Wert des Attributs mit dem des neuen.
                    }
                }
            
            }
         bookList[i] = changedBook; // überschreibt das Buch aus der Bücherliste.
         
         updateFile(bookList);
        res.status(201).send("Buchinformation erfolreich aktualisiert.");
        }
        
    }
    if(exists === false){
        res.status(400).send("Es existiert kein Buch mit dieser ID");
    }
 
});


/* ** DELETE ** */
router.delete('/:id',function(req,res){
    var reqID = req.params.id; // der Wert der ID.
    var bookList = readBooksFromFile(); // liest die Bücher aus der JSON Datei aus.

    var exists = false;
    for(var i = 0;i < bookList.length;i++){
       if(bookList[i].id === reqID){ // falls eines der Bücher die ID hat die mit der request id übereinstimmen.
           var bookTitle = bookList[i].title; // um ausgeben zukönnen welches Buch gelöscht wurde.
           exists = true;
           
           bookList.splice(i,1); // entfernt das Buch aus der Liste. (i = die aktuelle Stelle im Array)
           updateFile(bookList);
         res.status(200).send("Das Buch mit dem Titel: "+bookTitle+" wurde erfolgreich gelöscht.");
       }
    }
    if(exists === false){
        res.status(400).send("Es existiert kein Buch mit dieser ID");
    }
});


//Bereitstellen des Moduls um require in der app.js einbinden zu können.
module.exports = router;