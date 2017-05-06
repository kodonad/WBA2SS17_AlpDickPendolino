/*╔══════════════════════════════════════════════════════════╗
  ║ Beispiel Syntax zum färben von Strings o. Variabeln      ║
  ║                                                          ║
  ║ -> console.log(chalk.blue('Hello world!'));              ║
  ╚══════════════════════════════════════════════════════════╝*/

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
    
    var chalk = require('chalk'); // Terminal String Styling Module, nachzulesen auf: https://github.com/chalk/chalk
    
    for(var b = 0; b < cities.length; b++){
        console.log(chalk.black.bgWhite.bold("Name:")+"\t\t"+chalk.blue(cities[b].name)                    );
        console.log(chalk.black.bgWhite.bold("Country:")+"\t"+chalk.green(cities[b].country)              );
        console.log(chalk.black.bgWhite.bold("Population:")+"\t"+chalk.yellow(cities[b].population));
        console.log("-----------------------------------------\n");
    }
}







function init(){ // Initialisierung des Scripts. (Struktur)
    readCities();
    
    
}

init(); // Sobald die Javascript Datei ausgeführt eingebunden und geladen wird, wird die Initialisierung des Scripts ausgeführt.