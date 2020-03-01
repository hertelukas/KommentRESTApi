var express  = require('express'),
    app      = express(),
    mongoose = require('mongoose');

var User     = require('./models/user'),
    Note     = require('./models/note');

var connected = false;

mongoose.connect(process.env.DATABASEURL || "mongodb://localhost:27017/komment",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() =>{
    console.log("connected to the db!");
    connected = true;
}).catch(err => {
    console.log("Error connecting to the db: " + err)
});

app.get('/', function(req, res){
    if(connected){
        res.send("Please read the documentation to connect to the API. The server is connected to the database!");
    }else{
        res.send("Please read the documentation to connect to the API. The server is not connected to the database!");
    }
});

app.get('/notes', function(req, res){
    Note.find({}, function(err, notes){
        if(err){
            res.send(err);
        }else{
            res.json(notes);
        }
    })
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});