var express = require('express');
var router = express.Router();

router.get('/',function(req,res){
   res.send('Hier stehen alle User');
});


//Bereitstellen des Moduls um require in der app.js einbinden zu können.
module.exports = router;