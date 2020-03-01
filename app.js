var express  = require('express'),
    app      = express(),
    mongoose = require('mongoose');

app.get('/', function(req, res){
    res.json({username: 'Gzuz'});
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});