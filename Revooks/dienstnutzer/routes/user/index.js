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
    var content = fs.readFileSync('routes/user/json/user.json').toString();
    var userList = "[]";
    if(content.length > 0){
      var tempContent = content.substr(0,content.length-1); // Um das letzte Komma aus dem Inhalt zu entfernen.
      var contentObject = "["+tempContent+"]"; // Um aus den Objekten ein Array zumachen welches die Objekte beinhaltet.
      var userList = JSON.parse(contentObject); // parsed den Inhalt der Datei in ein JSON Objekt.
    }
    return userList;
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
   *  checkIfExistingUser
   *  ---------------
   *  Überprüft ob ein Benutzer schon Bereits in der JSON Datei vorhanden ist. 
   ** **************************************************************************
*/
function checkIfExistingUser(user,userList){
    var statusFree = true; // Sagt aus ob ein Benutzer vorhanden ist oder nicht, true = ist nicht vorhanden, false = ist vorhanden.
    
    for (var i = 0; i < userList.length;i++){
        
        if(userList[i].id === user.id){
            statusFree = false;
            break;
        }    
    }
    
    return statusFree;
}
/* ** **************************************************************************
   *  checkIfExistingFavorite
   *  ---------------
   *  Überprüft ob ein Buch schon Bereits in der Favoriten JSON Datei eines 
   *  Benutzers vorhanden ist. 
   ** **************************************************************************
*/
function checkIfExistingFavorite(favoriteBook,favoriteList){
    var statusFree = true; // Sagt aus ob ein Buch vorhanden ist oder nicht, true = ist nicht vorhanden, false = ist vorhanden.
    
    for (var i = 0; i < favoriteList.length;i++){
        
        if(favoriteList[i].id === favoriteBook.id){
            statusFree = false;
            break;
        }    
    }
    
    return statusFree;
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
    fs.truncate("routes/user/json/user.json",0, function(err){
               
      for(var i = 0 ; i < userList.length;i++){ // schreibt jeden einzelnen Benutzer aus der Liste der Benutzer in die user.json
                 
            var writeLine = JSON.stringify(userList[i])+",";
               
            fs.appendFile("routes/user/json/user.json",writeLine, function(err){
                     
            });
        }
    });
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
    res.status(200).send(userList);
});

/* ** POST ** */
router.post('/',bodyParser.json(),function(req,res){
    var userObject = req.body; // der hinzuzufügende Benutzer
    var userList = readUserFromFile();
    
    
    var check = checkIfExistingUser(userObject,userList);
    
    if(check){
        var writeLine = JSON.stringify(userObject)+","; // das "," dient dazu innerhalb der JSON Datei die einzelnen Benutzer aufzulisten.
        fs.appendFile("routes/user/json/user.json",writeLine,function(err){
        if(err){console.log(err);}             
        });
        res.status(201).send("Benutzer wurde erfolgreich erstellt.");
    }
    else{
        res.status(400).send("Es gibt bereits schon einen Benutzer mit der ID: "+userObject.id);
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
      if(userList[i].id === reqID){ // falls einer der Benutzer die ID hat die mit der request id übereinstimmen.
          exists = true;
          res.status(200).send(userList[i]);
          break;
      }
    }
    
    if(exists === false){
        res.status(400).send("Es existiert kein Benutzer mit dieser ID");
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
        res.status(400).send("Es existiert kein Benutzer mit dieser ID");
    }
});

/* ** DELETE ** */
router.delete('/:id',function(req,res){
    var reqID = req.params.id; // der Wert der ID.
    var userList = readUserFromFile(); // liest die Bücher aus der JSON Datei aus.
    
    var exists = false;
    for(var i = 0;i < userList.length;i++){
       if(userList[i].id === reqID){ // falls eines der Bücher die ID hat die mit der request id übereinstimmen.
           exists = true;
           
           userList.splice(i,1); // entfernt den Benutzer aus der Liste. (i = die aktuelle Stelle im Array)
           console.log("userList: "+userList);
           updateFile(userList);
         res.status(200).send("der Benutzer wurde erfolgreicht gelöscht.");
       }
    }
    if(exists === false){
        res.status(400).send("Es existiert kein Benutzer mit dieser ID");
    }
     
});

/* ---------------------------------
   >>  Ressource (user/:id/favorites)
   ---------------------------------
*/
router.get('/:id/favorites',function(req,res){
    
});

router.post('/:id/favorites',bodyParser.json(),function(req,res){
     var userID = req.params.id;
     var userList = readUserFromFile();
    
     var exists = false;
     
     for(var i = 0; i < userList.length;i++){
         if(userList[i].id === userID){ // wenn der Benutzer existiert
            exists = true;
             
            var fileUrl = 'routes/user/json/favorites/user_'+userID+'.json'; // der Pfad an den für jeden Benutzer eine Favoritenliste angelegt wird.
            var favoriteBook = req.body; 
    
            var checkIfFileExists = fs.existsSync(fileUrl); // überprüft ob die Datei exisiert
     
    
            if(checkIfFileExists){ // falls sie existiert
            var reqUrl = 'http://localhost:3000/books/'+favoriteBook.id; // Fragt nach ob das Buch mit dieser ID beim Dienstgeber existiert.
                request.get(reqUrl,function(error,response,body){
    
            switch(response.statusCode){
                
                case 200 : 
                    var favoriteList = readFavoritesFromFile(fileUrl);
                    var check = checkIfExistingFavorite(favoriteBook,favoriteList);
                    
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
                
                case 400 : 
                    res.status(400).send(body); // Buch existiert nicht, dementsprechend kann dieses Buch nicht zur Favoritenliste hinzugefügt werden.
                    break;
                
                default: break;
            }
            
        });
     }
    
        else{  // falls sie nicht existiert.
        var reqUrl = 'http://localhost:3000/books/'+favoriteBook.id; // Fragt nach ob das Buch mit dieser ID beim Dienstgeber existiert.
         request.get(reqUrl,function(error,response,body){
             
             switch(response.statusCode){ // überprüft den StatusCode der Abfrage , 200 = OK , 400 = Bad Request
                 
                 case 200: // Buch existiert, kann in die Favoritenliste geschrieben werden.
                     var writeLine = JSON.stringify(favoriteBook)+",";
                     fs.writeFile(fileUrl,writeLine,function(err){
                         
                     });
                     res.status(201).send("Buch wurde erfolgreich der Favoritenliste hinzugefügt.");
                           break;
                 
                 case 400: 
                     res.status(400).send(body); // Buch existiert nicht, dementsprechend kann dieses Buch nicht zur Favoritenliste hinzugefügt werden.
                           break;
                 
                 default:  res.status(500).send(error);
             }
            })
        }
             
      }
     }
    if(exists === false){
        res.status(400).send("Es existiert kein Benutzer mit dieser ID");
    }
});

/* ---------------------------------
   >>  Ressource (user/:id/favorites/:id)
   ---------------------------------
*/
router.get('/:id/favorites/:id',function(req,res){
    
});

router.delete('/:id/favorites/:id',function(req,res){
    
});

//Bereitstellen des Moduls um require in der app.js einbinden zu können.
module.exports = router;