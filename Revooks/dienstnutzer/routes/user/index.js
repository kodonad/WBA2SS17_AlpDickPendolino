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
var _path = __dirname+'/json/user.json';
var serviceUrl = process.env.SERVICEURL || 'http://localhost:3000';
/* ** *****************************
   *  METHODS
   ** ***************************** 
*/

/* ** **************************************************************************
   *  readUserFromFile
   *  ---------------
   *  liest alle Benutzer aus der JSON Datei aus, speichert sie in ein Array
   *  und gibt sie anschließend zurück.
   ** **************************************************************************
*/
function readUserFromFile(){
    if(fs.existsSync(_path)){ // Überprüft ob die user.json Datei vorhanden ist
    var content = fs.readFileSync(_path).toString();
    var userList = "[]";
    if(content.length > 0){
      var tempContent = content.substr(0,content.length-1); // Um das letzte Komma aus dem Inhalt zu entfernen.
      var contentObject = "["+tempContent+"]"; // Um aus den Objekten ein Array zumachen welches die Objekte beinhaltet.
      var userList = JSON.parse(contentObject); // parsed den Inhalt der Datei in ein JSON Objekt.
    }
    return userList; // Falls die Datei vorhanden ist, wird der Inhalt dieser Datei zurückgegeben.
    }
    else{
        return false;
    }
}

/* ** **************************************************************************
   *  readFavoritesFromFile
   *  ---------------
   *  liest alle Bücher aus der Favoriten JSON Datei eines bestimmten Benutzerss aus, speichert sie in ein Array
   *  und gibt sie anschließend zurück.
   ** **************************************************************************
*/
function readFavoritesFromFile(fileUrl){
    var content = fs.readFileSync(fileUrl).toString();
    var favoriteList = "[]";
    if(content.length > 0){
        var tempContent = content.substr(0,content.length-1); // Um das letzte Komma aus dem Inhalt zu entfernen.
        var contentObject = "["+tempContent+"]"; // Um aus den Objekten ein Array zumachen welches die Objekte beinhaltet.
        var favoriteList = JSON.parse(contentObject);
    }
    return favoriteList;
}
/* ** **************************************************************************
   *  checkIfObjectExists
   *  ---------------
   *  Überprüft ob ein Objekt schon Bereits in der JSON Datei vorhanden ist.
   ** **************************************************************************
*/
function checkIfObjectExists(singleObj,objList){
    
    var statusFree = true; // Sagt aus ob ein Objekt vorhanden ist oder nicht, true = ist nicht vorhanden, false = ist vorhanden.
    
    for (var i = 0; i < objList.length;i++){
        
        if(objList[i].id == singleObj.id){
            statusFree = false;
            break;
        }    
    }
    
    return statusFree;
}
/* ** **************************************************************************
   *  checkIfIdentificatorExists
   *  ---------------
   *  Ähnlich wie checkIfObjectExists , der Unterschied hier ist, dass er ein
   *  true zurück gibt, wenn das Objekt existiert, da hier nur abgefragt werden soll,
   *  Ob es existiert.
   ** **************************************************************************
*/
function checkIfIdentificatorExists(id,objList){
    for ( var i = 0; i < objList.length;i++){
        if(objList[i].id == id){
            return true;
            break;
        }
    }
}
/* ** **************************************************************************
   *  updateFile
   *  ---------------
   *  aktualisiert die user.json Datei.
   ** **************************************************************************
*/
function updateFile(userList){
    
    /* truncate dient dazu alle Benutzer aus der user.json zu löschen. Dadurch, dass bereits zuvor der Inhalt in die Variable userList 
       geschrieben wurde, wird problemlos der Inhalt der Variable
       userList, welche alle Benutzer enthält, in die user.json geschrieben.
    */
    fs.truncate(_path,0, function(err){
               
      for(var i = 0 ; i < userList.length;i++){ // schreibt jeden einzelnen Benutzer aus der Liste der Benutzer in die user.json
                 
            var writeLine = JSON.stringify(userList[i])+",";
               
            fs.appendFile(_path,writeLine, function(err){
                     
            });
        }
    });
}
/* ** **************************************************************************
   *  updateFavoriteList
   *  ---------------
   *  aktualisiert die jeweilige Favoritenliste eines Benutzers.
   ** **************************************************************************
*/
function updateFavoriteList(favoriteList,res,fileUrl){
    fs.truncate(fileUrl,0, function(err){
               
      for(var i = 0 ; i < favoriteList.length;i++){ // schreibt jeden einzelnen Benutzer aus der Liste der Benutzer in die user.json
                 
            var writeLine = JSON.stringify(favoriteList[i])+",";
               
            fs.appendFile(fileUrl,writeLine, function(err){
                  
            });
        }
        
    }); 
}
/* ** **************************************************************************
   *  checkIfFavoriteExistsInSuggestion
   *  ---------------
   *  Überprüft, ob ein Buch aus der Favoritenliste in den Vorschlägen vorkommt,
   *  Falls ja, dann wird dieses aus den Vorschlägen entfernt.
   ** **************************************************************************
*/
function checkIfFavoriteExistsInSuggestion(favoriteList,suggestionList){
    // Überprüfung ob das favorisierte Buch in der Vorschlägeliste enthalten ist, sollte dies der Fall sein wird das Buch aus der Liste entfernt.
    for(var i = 0; i < favoriteList.length; i++){
         for(var s = 0; s < suggestionList.length; s++){ 
        if(suggestionList[s].id == favoriteList[i].id){

            suggestionList.splice(s,1);
            break;
            }
    }
    }
   
   return suggestionList;                   
}
/* ** **************************************************************************
   *  checkIfUserObjectIsValid
   *  ---------------
   *  Überprüft, ob der zu erstellende Benutzer den Anforderungen entspricht.
   *  ID, Passwort und Username müssen gesetzt sein. 
   ** **************************************************************************
*/
function checkIfUserObjectIsValid(userObject){
    var attributeCounter = 0;
    for(var attr in userObject){
        attributeCounter++;
    }
    if(userObject.id && userObject.username && userObject.password && attributeCounter == 3){
        return true;
    }
    else{
        return false;
    }
}

/* ** **************************************************************************
   *  checkIfUsernameIsTaken
   *  ---------------
   *  Überprüft, ob der Username des zu erstellenden Benutzers bereits existiert.
   ** **************************************************************************
*/
function checkIfUsernameIsTaken(userObject,userList){
    var isFree = true;
    for(var i = 0;i < userList.length;i++){
        if(userObject.username === userList[i].username){
            isFree = false;
            break;
        }
    }
    return isFree;
}

/* ** **************************************************************************
   *  checkDirectorySync
   *  ---------------
   *  Überprüft ob das aktuelle Verzeichnis vorhanden ist, ansonsten wird es angelegt.
   ** **************************************************************************
*/
function checkDirectorySync(directory) {  
  try {
    fs.statSync(directory);
  } 
    catch(e) {
    fs.mkdirSync(directory);
  }
}

function checkIfValidFavorite(favoriteBook){
    var attrCounter = 0;
    for(var attr in favoriteBook){
        attrCounter++;
    }
    if(favoriteBook.id && attrCounter == 1){
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
   >>  Ressource (user/)
   ---------------------------------
*/

/* ** GET ** */
router.get('/',function(req,res){
    var userList = readUserFromFile();
    if(userList){
        res.status(200).send(userList);
    }
    else{
        res.status(404).send("Es existieren noch keine Benutzer in der Anwendung.")
    }
});

/* ** POST ** */
router.post('/',bodyParser.json(),function(req,res){
    var userObject = req.body; // der hinzuzufügende Benutzer
    var userList = readUserFromFile();
    
    var isValid = checkIfUserObjectIsValid(userObject); // Überprüft ob das Objekt den Anforderungen entspricht.
    if(isValid){
        
    
    if(userList){
        
    var check = checkIfObjectExists(userObject,userList);
    
    if(check){
        var usernameFree = checkIfUsernameIsTaken(userObject,userList);
        if(usernameFree){
            
        
        var writeLine = JSON.stringify(userObject)+","; // das "," dient dazu innerhalb der JSON Datei die einzelnen Benutzer aufzulisten.
        fs.appendFile(_path,writeLine,function(err){
        if(err){console.log(err);}             
        });
        res.status(201).send("Benutzer wurde erfolgreich erstellt.");
        }
        else{
            res.status(400).send("Der Benutzername ist leider schon vergeben.");
        }
    }
    else{
        res.status(400).send("Es gibt bereits schon einen Benutzer mit der ID: "+userObject.id);
    }
        
    }
    else{
        var writeLine = JSON.stringify(userObject)+","; // das "," dient dazu innerhalb der JSON Datei die einzelnen Benutzer aufzulisten.
        fs.writeFile(_path,writeLine,function(err){
        if(err){console.log(err);}             
        });
        res.status(201).send("Benutzer wurde erfolgreich erstellt.");
    }
    }
    else{
        res.status(406).send('kein gültiges Benutzerobjekt\n==>\n "id":integer\n"username":"xyz"\n"password":"xyz"')
    }
    
});

/* ---------------------------------
   >>  Ressource (user/:id)
   ---------------------------------
*/

/* ** GET ** */
router.get('/:id',function(req,res){
    var reqID = req.params.id; // der Wert der ID.
    var userList = readUserFromFile(); // liest die Benutzer aus der JSON Datei aus.
    
    var exists = false;
    
    for(var i = 0 ; i < userList.length;i++ )
    {
      if(userList[i].id == reqID){ // falls einer der Benutzer die ID hat die mit der request id übereinstimmen.
          exists = true;
          res.status(200).send(userList[i]);
          break;
      }
    }
    
    if(exists === false){
        res.status(404).send("Es existiert kein Benutzer mit dieser ID");
    }
});
/* ** PUT ** */
router.put('/:id',bodyParser.json(),function(req,res){
    var reqID = req.params.id; // die ID des abzuänderten Benutzers.
    var newUser = req.body; // Die Informationen des neu zu speichernden Benutzers
    var userList = readUserFromFile(); // liest die Benutzer aus der JSON Datei aus.
    
    var exists = false;
    
    for (var i = 0; i < userList.length; i++){
        
        if(userList[i].id === reqID){ // falls eines der Benutzer die ID hat die mit der request id übereinstimmen.
            
            var userToChange; // =  Aktueller Benutzer ohne Änderung der Benutzerinformationen.
            var changedUser; // = neuer Benutzer mit Änderungen der Benutzerinformationen.
            
            exists = true;
            userToChange = userList[i];
            
            changedUser = userToChange; // Schreibt den aktuellen Benutzer in die changedUser Variable, dessen Attribute überschrieben werden.
            
            for (var attrNew in newUser){ // für jedes Attribut in der abgeänderten Benutzerinformation.
        
                for (var attr in changedUser){ // für jedes Attribut in der jetzigen Benutzerinformation. 
            
                    if(attrNew === attr){
                    changedUser[attr] = newUser[attrNew]; // überschreibt den Wert des Attributs mit dem des neuen.
                    }
                }
            
            }
         userList[i] = changedUser; // überschreibt den Benutzer aus der Benutzerliste.
         
        updateFile(userList); // Aktualisiert die JSON Datei.
        
        res.status(201).send("Benutzerinformationen erfolreich aktualisiert.");
        }
        
    }
    if(exists === false){
        res.status(404).send("Es existiert kein Benutzer mit dieser ID");
    }
});

/* ** DELETE ** */
router.delete('/:id',function(req,res){
    var reqID = req.params.id; // der Wert der ID.
    var userList = readUserFromFile(); // liest die Bücher aus der JSON Datei aus.
    
    var exists = false;
    for(var i = 0;i < userList.length;i++){
       if(userList[i].id == reqID){ // falls eines der Bücher die ID hat die mit der request id übereinstimmen.
           exists = true;
           
           userList.splice(i,1); // entfernt den Benutzer aus der Liste. (i = die aktuelle Stelle im Array)
           updateFile(userList);
         res.status(200).send("der Benutzer wurde erfolgreicht gelöscht.");
       }
    }
    if(exists === false){
        res.status(404).send("Es existiert kein Benutzer mit dieser ID");
    }
     
});

/* ---------------------------------
   >>  Ressource (user/:id/favorites)
   ---------------------------------
*/
router.get('/:id/favorites',function(req,res){
    var userID = req.params.id;
    var userList = readUserFromFile();
    var exists = false;
    
    for(var i = 0;i < userList.length;i++){
        if(userList[i].id == userID){ // wenn der Benutzer existiert
            exists = true;
            var fileUrl = __dirname+'/json/favorites/user_'+userID+'.json'; // der Pfad an den für jeden Benutzer eine Favoritenliste angelegt wird.
            if(fs.existsSync(fileUrl)){
                
            
            var favoriteList = readFavoritesFromFile(fileUrl); // liest die Favoritenliste aus der Datei aus.
            
            res.status(200).send(favoriteList); // gibt die Favoritenliste aus.
            }
            else{
                res.status(404).send("Dieser Benutzer verfügt über keine Favoritenliste");
            }
        }
    }
    if(exists === false){
        res.status(404).send("Es existiert kein Benutzer mit dieser ID");
    }
});

router.post('/:id/favorites',bodyParser.json(),function(req,res){
     var userID = req.params.id;
     var userList = readUserFromFile();
    
     var exists = false;
     
     checkDirectorySync(__dirname+'/json/favorites'); // Überprüft ob der Favoriten Ordner schon angelegt ist, falls dies nicht der Fall sein sollte, wird er angelegt.
            
     for(var i = 0; i < userList.length;i++){
         if(userList[i].id == userID){ // wenn der Benutzer existiert
            exists = true;
             
            var fileUrl = __dirname+'/json/favorites/user_'+userID+'.json'; // der Pfad an den für jeden Benutzer eine Favoritenliste angelegt wird.
            var favoriteBook = req.body; 
            
            var checkIfValid = checkIfValidFavorite(favoriteBook);
            if(checkIfValid){
                
            
            var checkIfFileExists = fs.existsSync(fileUrl); // überprüft ob die Datei exisiert
     
      
            if(checkIfFileExists){ // falls sie existiert
            var reqUrl = serviceUrl+'/books/'+favoriteBook.id; // Fragt nach ob das Buch mit dieser ID beim Dienstgeber existiert.
                request.get(reqUrl,function(error,response,body){
    
            switch(response.statusCode){
                
                case 200 : 
                    var favoriteList = readFavoritesFromFile(fileUrl);
                    var check = checkIfObjectExists(favoriteBook,favoriteList);
                    
                    if(check){
                        
                        var writeLine = JSON.stringify(favoriteBook)+",";
                        
                        fs.appendFile(fileUrl,writeLine,function(err){             
                            });
                        
                        res.status(201).send("Buch wurde erfolgreich der Favoritenliste hinzugefügt.");
                    }
                    else{
                        
                        res.status(400).send("Dieses Buch existiert bereits in der Favoritenliste.");
                        
                    }
                    break;
                
                case 404 : 
                    res.status(404).send(body); // Buch existiert nicht, dementsprechend kann dieses Buch nicht zur Favoritenliste hinzugefügt werden.
                    break;
                
                default: break;
            }
            
        });
     }
    
        else{  // falls sie nicht existiert.
            
        var reqUrl = serviceUrl+'/books/'+favoriteBook.id; // Fragt nach ob das Buch mit dieser ID beim Dienstgeber existiert.
         request.get(reqUrl,function(error,response,body){
             
             switch(response.statusCode){ // überprüft den StatusCode der Abfrage , 200 = OK , 400 = Bad Request
                 
                 case 200: // Buch existiert, kann in die Favoritenliste geschrieben werden.
                     var writeLine = JSON.stringify(favoriteBook)+",";
                     fs.writeFile(fileUrl,writeLine,function(err){
                         
                     });
                     res.status(201).send("Buch wurde erfolgreich der Favoritenliste hinzugefügt.");
                           break;
                 
                 case 404: 
                     res.status(404).send(body); // Buch existiert nicht, dementsprechend kann dieses Buch nicht zur Favoritenliste hinzugefügt werden.
                           break;
                 
                 default:  res.status(500).send(error);
             }
            });    
        
        }
        }
         else{
             res.status(406).send("Bitte beachten Sie , dass nur die ID des Buches im zu erstellenden Objekt vorhanden ist.");
         }
      }
     }
    if(exists === false){
        res.status(404).send("Es existiert kein Benutzer mit dieser ID");
    }
});

/* ---------------------------------
   >>  Ressource (user/:id/favorites/:id)
   ---------------------------------
*/
router.get('/:id/favorites/:favid',function(req,res){
    var favID = req.params.favid;
    var userID = req.params.id;
    
    var userList = readUserFromFile();
    
    var checkUser = checkIfIdentificatorExists(userID,userList); // Überprüft ob der Benutzer existiert.
    if(checkUser){ // falls der Benutzer existiert.
        var fileUrl = 'routes/user/json/favorites/user_'+userID+'.json';
        if(fs.existsSync(fileUrl)){
            
        
        var favoriteList = readFavoritesFromFile(fileUrl);
        var checkFavorite = checkIfIdentificatorExists(favID,favoriteList); // Überprüft ob das Buch bereits in der Favoritenliste existiert.
        if(checkFavorite){ // falls das Buch dort existiert.
            
            var reqUrl = serviceUrl+'/books/'+favID; // führt einen GET Befehl auf die Dienstgeber Ressource Books aus.
                request.get(reqUrl,function(error,response,body){
                switch(response.statusCode){
                    case 200:
                        res.status(response.statusCode).send(JSON.parse(body));  // wandelt den Inhalt der Response in ein JSON Objekt um.
                        break;
                    case 404:
                        res.status(response.statusCode).send(body); // Response = text/plain, deswegen JSON.parse nicht nötig.
                        break;
                    default: break;
                }
                
                });
        }
        else{
            res.status(400).send("Dieses Buch existiert nicht in der Favoritenliste");            
            }
        }
        else{
            res.status(400).send("Dieser Benutzer verfügt über keine Favoritenliste.");
        }
        
    }
    else{
        res.status(400).send("Es existiert kein Benutzer mit dieser ID.");
    }
    
});

router.delete('/:id/favorites/:favid',function(req,res){
    var favID = req.params.favid; // Die ID des Buches in der Favoritenliste.
    var userID = req.params.id; // Die ID des Benutzers.
    
    var userList = readUserFromFile(); // liest die gesamten Benutzer aus der Datei aus.
    
    
    var checkUser = checkIfIdentificatorExists(userID,userList); // Überprüft ob der Benutzer existiert.
    if(checkUser){ // falls der Benutzer existiert.
        var fileUrl = __dirname+'/json/favorites/user_'+userID+'.json'; // Favoriten Datei des Nutzers : Bsp: user_2.json
        if(fs.existsSync(fileUrl)){
        var favoriteList = readFavoritesFromFile(fileUrl); // liest alle Bücher aus der Favoritenliste aus.
        
        var reqUrl = serviceUrl+'/books/'+favID; // Url der Bücher Ressource des Dienstgebers.
        
        request.get(reqUrl,function(error,response,body){ // GET Request auf diese Url
           
            switch(response.statusCode){ // überprüft ob die Anfrage erfolgreich war.
                    
                case 200: // Das Buch existiert beim Dienstgeber.
                    var checkFavorite = checkIfIdentificatorExists(favID,favoriteList);
                    
                    
                    if(checkFavorite){ // falls das Buch in der Favoritenliste existiert.
                        
                        var newFavoriteList = favoriteList; // kopiert die Favoritenliste in ein neues Array.
                        
                        for(var i = 0; i < favoriteList.length ; i++){
                            
                            if(favoriteList[i].id === favID){ // Falls das Buch mit der gewünschten ID gefunden wurde
                                
                                newFavoriteList.splice(i,1); // lösche es aus der Favoritenliste raus.
                                break;
                            }
                        }
                        updateFavoriteList(newFavoriteList,res,fileUrl);    // Aktualisiert die Favoritenliste des aktuellen Benutzers.
                        res.status(200).send("Das Buch wurder erfolgreich aus der Favoritenliste entfernt.");
                        
                    }
                    else{
                        res.status(404).send("Dieses Buch existiert nicht in der Favoritenliste dieses Benutzers.");
                    }
                    break;
                    
                case 404: // Das Buch existiert nicht beim Dienstgeber.
                    res.status(response.statusCode).send(body);
                    break;
                    
                default:
                break;
            }
            
        });
        
        
        }
        else{
            res.status(404).send("Dieser Benutzer verfügt über keine Favoritenliste.")
        }
    }
    else{ // Falls der Benutzer nicht existieren sollte.
        res.status(404).send("Es existiert kein Benutzer mit dieser ID");
    }
    
});


/* ---------------------------------
   >>  Ressource (user/:id/suggestions)
   ---------------------------------
*/

/* - Dies ist unsere Anwendungslogik für den User. Dem User werden an Hand seiner Favoriten eine Handvoll Bücher vorgeschlagen.
   - Als erstes wird überprüft ob der User existiert gefolgt von der Favoritenliste.
   - Dann werden die Bücher aus der jeweiligen Favoritenliste ausgelesen.
   - Die ausgelesenen Bücher der Favoritenliste werden mit den Büchern vom Dienstgeber verglichen (Autor)
   - Zum Schluss werden diese Bücher ausgegeben.
*/

router.get('/:id/suggestions',function(req,res){
    var userID = req.params.id;
    
    var userList = readUserFromFile(); // liest die gesamten Benutzer aus der Datei aus.
    
    
    var checkUser = checkIfIdentificatorExists(userID,userList); // Überprüft ob der Benutzer existiert.
    
    if(checkUser){
        var fileUrl = 'routes/user/json/favorites/user_'+userID+'.json'; // Favoriten Datei des Nutzers : Bsp: user_2.json
        if(fs.existsSync(fileUrl)){
            var favoriteList = readFavoritesFromFile(fileUrl); // liest alle Bücher aus der Favoritenliste aus.
            
            var reqUrl = serviceUrl+'/books/'  // um alle Bücher abzufragen, die beim Dienstgeber existieren.
            
            request.get(reqUrl,function(error,response,body){ // GET Request auf diese Url
            
            switch(response.statusCode){ // überprüft ob die Anfrage erfolgreich war.
                    
                case 200: // Es existieren Bücher beim Dienstgeber.
                    var bookList = JSON.parse(body); // wandelt den Inhalt der Response in ein JSON Objekt um.
                    
                    for (var i = 0 ; i < favoriteList.length; i++){ // für Jede Buch ID die in der Favoritenliste eingetragen wurde, wird das zugehörige Buch aus der Bücherliste gesucht.
                        
                        for ( var j = 0 ; j < bookList.length ; j++){
                            
                            if(favoriteList[i].id == bookList[j].id){
                                favoriteList[i] = bookList[j];  // Überschreibt das Favoriten Buch, welches nur die ID hat, mit dem kompletten Bücher Datensatz, welches zu dieser ID gehört.
                                break;
                            }
                        }
                        
                    }
                    // ** Zwischenstopp! Ab Hier befindet sich in der FavoritenListe vollständige Buchinformationen, dementsprechend  können jetzt die Autoren verglichen werden.
                    var suggestionList = [];
                    
                    for(var i = 0 ; i < favoriteList.length ; i++){ // For Schleife um durch die Favoritenliste zu iterieren
                        for ( var j = 0 ; j < bookList.length ; j++){ // For Schleife um durch die Bücher zu iterieren
                                
                            
                                    //console.log(bookList[j].title);
                                /* Liest jeweils die Autoren aus um diese zu vergleichen */
                                for(var author in favoriteList[i].authors){ 
                                    
                                    for (var author2 in bookList[j].authors){ 
                                      
                                        /* Überprüft, ob die Autoren der Favoriten Bücher auch andere Bücher verfasst haben */
                                        if(favoriteList[i].authors[author] == bookList[j].authors[author]){
                                        
                                            if(suggestionList.length > 0){ // Vorschlägeliste existiert, und hat einen Eintrag, so dass man überprüfen kann, ob die folgenden Bücher schon dort vorhanden sind.
                                                var existsInList = false;
                                                for(var s = 0 ; s < suggestionList.length; s++){
                                                    if(suggestionList[s].id == bookList[j].id){ // Überprüft ob das vorzuschlagende Buch schon in den Vorschlägen enthalten ist.
                                                        existsInList = true;
                                                        break;
                                                    }
                                                }
                                                if(existsInList === false){
                                                    suggestionList.push(bookList[j]); // falls das Buch noch nicht vorhanden ist , wird es hinzugefügt.
                                                }
                                            }
                                            else{ // Vorschlägeliste existiert noch nicht, erster Eintrag wird ausgeführt.
                                                suggestionList.push(bookList[j]);
                                            }
                                        
                                        }
                                    }
                                
                              
                            }
                        }
                    }
                    var suggestionList = checkIfFavoriteExistsInSuggestion(favoriteList,suggestionList); // Überprüft ob favorisierte Bücher in den Vorschlägen existieren, falls ja , werden diese aus den Vorschlägen entfernt.
                       
                    
                    res.status(200).send(suggestionList);
                    break;
                    
                case 404: // Es existieren keine Bücher beim Dienstgeber.
                    res.status(response.statusCode).send(body);
                    break;
                    
                default: break;
                
                }
                    
            });
            
            
        }
        else{
            res.status(404).send("Es konnten keine Vorschläge für diesen Benutzer gefunden werden. (der Benutzer verfügt über keine Favoriten)"); // Falls keine Favoritenliste existiert, können auch keine Vorschläge generiert werden.
            
        }
    }
    else{ 
        res.status(404).send("Es existiert kein Benutzer mit dieser ID");
    }
    
});

//Bereitstellen des Moduls um require in der app.js einbinden zu können.
module.exports = router;