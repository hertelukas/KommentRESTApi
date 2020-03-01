var express  = require('express'),
    app      = express(),
    mongoose = require('mongoose');

var User     = require('./models/user'),
    Note     = require('./models/note');

mongoose.connect("mongodb+srv://lukas:VxhV440Px28DJWnw@main-gi9gw.mongodb.net/test",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() =>{
    console.log("connected to the db!");
}).catch(err => {
    console.log("Error connecting to the db: " + err)
});

app.get('/', function(req, res){
    res.send("Please read the documentation to connect to the API");
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