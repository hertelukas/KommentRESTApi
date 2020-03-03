var express       = require('express'),
    app           = express(),
    bodyParser    = require('body-parser'),
    mongoose      = require('mongoose');

var User     = require('./models/user'),
    Note     = require('./models/note');

var middleware  = require('./middleware');

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

app.use(bodyParser.urlencoded({extended: true}));

//-------------------
//Notes routes
//Get notes from user
//-------------------
app.get('/notes', middleware.handleAuthentication, function(req, res){
    console.log("Get notes request from " + req.headers.username);
    User.findOne({username: req.headers.username}).populate("notes").exec(function(err, foundUser){
        res.json({user: foundUser, code: 0});  
    });
});

app.get('/notes/:id', middleware.handleAuthentication,  function(req, res){
    User.findOne({username: req.headers.username}).populate("notes").exec(function(err, foundUser){
        var i = 0;

        foundUser.notes.forEach(note => {
            i++;
            if(note._id == req.params.id){
                res.json({note: note});
            }
            else if(i === foundUser.notes.length){
                res.send("No note found");
            }
        });
    });
});

//Create a new note
app.post('/notes', middleware.handleAuthentication, function(req, res){
    console.log("Post notes request from " + req.headers.username);
    if(!req.body.title){
        res.json({message: "Provide at least a title", code: 201});
    }else{
        User.findOne({username: req.headers.username}, function(err, foundUser){
            if(err){
                res.json({message: err, code: 1});
            } else{
                var newNote = new Note({title: req.body.title, content: req.body.content, lastEdited: new Date()});
                Note.create(newNote, function(req, createdNote){
                    if(err){
                        res.json({message: err, code: 1});
                    }else{
                        foundUser.notes.push(createdNote);
                        foundUser.save();
                        res.json({message: "Note created", code: 200, user: foundUser, createdNote: createdNote});
                    }
                });
            }
        });
    }
});

//Delete route
app.delete('/notes', middleware.handleAuthentication, function(req, res){
    if(!req.body._id){
        res.json({message: "No note _id found in body", code: 3});
    }else{
        User.findOne({username: req.body.username}).populate('notes').exec(function(err, foundUser){
            if(err){
                res.json({message: err, code: 1});
            }else{
                var i = 0;
                var noteDeleted = false;
                foundUser.notes.forEach(note => {
                    if(note._id == req.body._id){
                        foundUser.notes[i].delete();
                        foundUser.save();Authentication
                        noteDeleted = true;
                    }
                    i++;

                    if(i === foundUser.notes.length){
                        if(noteDeleted){
                            res.json({message: "Note deleted", code: 200});
                        }else{
                            res.json({message: "Note not found", code: 202});
                        }
                    }
                });
            }
        });
    }
});

//Edit route
app.put('/notes/:id', middleware.handleAuthentication, function(req, res){

});

//---------------------
//User routes
//---------------------

app.post('/users', function(req, res){
    if(!req.headers.username || !req.headers.password){
        res.json({message: "Provide a username and a password", code: "102"});
    }else{
        var newUser = new User({username: req.headers.username});
        User.find({username: req.headers.username}, function(err, foundUser){
            if(err){
                res.json({message: err, code: 1});
            }else{
                if(foundUser.length){
                    res.json({message: "Error: A user with this username exists already", code: "101"});
                }else{
                    User.register(newUser, req.headers.password, function(err, result){
                        if(err){
                            res.json({message: err, code: 1});
                        }else{
                            res.json({message: "User created", code: "100", user: result})
                        }
                    });
                }
            }
        });

    }
});

app.delete('/users/:id', middleware.handleAuthentication, function(req, res){

});


var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});