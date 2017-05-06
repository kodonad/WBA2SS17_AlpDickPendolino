function readCities(){
    var fs = require('fs'); // Modul welches zum Lesen der Datei gebraucht wird.
    
    
    fs.readFile("json/staedte.json",function(err,data) {
    var cities =  []; // leeres Array um später die Städte in dieses Array zu speichern.
    var tempData = data.toString(); // tempData enthält die in String konvertierte Ausgabe des FileReaders ( Rückgabe erfordert in binär) 
    var parsedData = JSON.parse(tempData); // erstellt ein Objekt und speichert es in parsedData.
    
    
    for (var i = 0; i < parsedData.cities.length;i++){ // iteriert durch das Objekt parsedData und kopiert die Städte aus dem Objekt in ein von uns angelegtes Array. (dient zum vereinfachten Verstehen).
      cities[i] = parsedData.cities[i];
    }
    
    getCitiesWhenFinished(cities); // Da die readFile und writeFile asynchrone Funktionen bzw Methoden sind, dient dieser Funktions Aufruf dazu Cities verfügbar zu machen, sobald er sich die Daten geholt hat.
});
}


function getCitiesWhenFinished(cities){ // Dient für diese Aufgabe nur zur Ausgabe, wie in der Aufgabenstellung beschrieben.
    for(var b = 0; b < cities.length; b++){
        console.log("Name: "+cities[b].name                    );
        console.log("Country: "+cities[b].country              );
        console.log("Population: "+cities[b].population        );
        console.log("-----------------------------------------");
        console.log(" "); //Imitiert Zeilenumsprung.
    }
}







function init(){ // Initialisierung des Scripts. (Struktur)
    readCities();
    
    
}

init(); // Sobald die Javascript Datei ausgeführt eingebunden und geladen wird, wird die Initialisierung des Scripts ausgeführt.