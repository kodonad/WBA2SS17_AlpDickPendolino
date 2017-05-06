/*╔══════════════════════════════════════════════════════════╗
  ║ Beispiel Syntax zum färben von Strings o. Variabeln      ║
  ║                                                          ║
  ║ -> console.log(chalk.blue('Hello world!'));              ║
  ╚══════════════════════════════════════════════════════════╝*/

function printCitiesOnConsole(sortedCities){
    
     var chalk = require('chalk'); // Terminal String Styling Module, nachzulesen auf: https://github.com/chalk/chalk
    
    for(var b = 0; b < sortedCities.length; b++){
        console.log(chalk.black.bgWhite.bold("Name:")+"\t\t"+chalk.blue(sortedCities[b].name)                    );
        console.log(chalk.black.bgWhite.bold("Country:")+"\t"+chalk.green(sortedCities[b].country)              );
        console.log(chalk.black.bgWhite.bold("Population:")+"\t"+chalk.yellow(sortedCities[b].population));
        console.log("-----------------------------------------\n");
    }
}

function writeCitiesToFile(sortedCities){
    var fs = require('fs'); // Modul welches zum Lesen der Datei gebraucht wird.
    var tempData = JSON.stringify(sortedCities); // konvertiert die Objekte in Strings.
    var writeData = '{ "cities":'+tempData+'}'; // dient zum identischen abbilden der staedte.json Datei. { "cities" : [...] }
    
    fs.writeFile("json/staedte_sortiert.json", writeData , function(err) { // schreibt writeData in die staedte_sortiert.json Datei.    
    });
}

function sortCities(cities){ // Funktion um die Städte zu sortieren.
    var sortedCities = cities; // kopiert das vorhande Array in ein temporäres Array
    
    sortedCities.sort(compare); // Sortiert das Array anhand einer Vergleichungsmethode
    
    function compare(a,b){ // übergibt zwei mal das Array um es zu vergleichen
        
        if(a.population < b.population){ // Wenn compareFunction(a, b) kleiner als 0, sortiere a auf einen niedrigeren Index als b, d.h. a kommt zuerst.
            return -1;
        }
        
        if(a.population > b.population){ 
            return 1;
        }
        
       
        return 0; /* Wenn compareFunction(a, b) den Wert 0 zurückgibt, bleibt die Reihenfolge von a und b in Bezug zueinander 
        unverändert, werden aber im Vergleich zu den restlichen Elementen des Arrays einsortiert. */
    }
    
    writeCitiesToFile(sortedCities);    // Führt die Funktion zum erstellen einer sortierten JSON Datei aus.
    printCitiesOnConsole(sortedCities); // Führt die Funktion zur Ausgabe auf der Konsole aus.
}


function readCities(){
    var fs = require('fs'); // Modul welches zum Lesen der Datei gebraucht wird.

    fs.readFile("json/staedte.json",function(err,data) {
    var cities =  []; // leeres Array um später die Städte in dieses Array zu speichern.
    var tempData = data.toString(); // tempData enthält die in String konvertierte Ausgabe des FileReaders ( Rückgabe erfordert in binär) 
    var parsedData = JSON.parse(tempData); // erstellt ein Objekt und speichert es in parsedData.
    
    
    for (var i = 0; i < parsedData.cities.length;i++){ // iteriert durch das Objekt parsedData und kopiert die Städte aus dem Objekt in ein von uns angelegtes Array. (dient zum vereinfachten Verstehen).
      cities[i] = parsedData.cities[i];
    }
    
    sortCities(cities); // Da die readFile und writeFile asynchrone Funktionen bzw Methoden sind, dient dieser Funktions Aufruf dazu Cities verfügbar zu machen, sobald er sich die Daten geholt hat.
});
}



function init(){ // Initialisierung des Scripts. (Struktur)
    readCities();
    
    
}

init(); // Sobald die Javascript Datei ausgeführt eingebunden und geladen wird, wird die Initialisierung des Scripts ausgeführt.