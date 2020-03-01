var express       = require('express'),
    app           = express(),
    bodyParser    = require('body-parser'),
    mongoose      = require('mongoose'),
    passport      = require('passport'),
    LocalStrategy = require("passport-local");


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

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res){
    if(connected){
        res.json({message: "Please read the documentation to connect to the API.", code: 0, database: "connected"});
    }else{
        res.json({message: "Please read the documentation to connect to the API.", code: 2, database: "not connected"});
    }
});

//Get notes from user
app.post('/loadNotes', passport.authenticate('local'), function(req, res){
    User.findOne({username: req.body.username}).populate("notes").exec(function(err, foundUser){
        if(err){
            res.json({message: err, code: 1});
        }else{
            res.json({user: foundUser, code: 0});
        }
    })
});

//Create a new note
app.post('/note', passport.authenticate('local'), function(req, res){
    if(!req.body.title){
        res.json({message: "Provide at least a title", code: 201});
    }else{
        User.findOne({username: req.body.username}, function(err, foundUser){
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
                })
            }
        });
    }
});

//Delete route
app.delete('/note',passport.authenticate('local'), function(req, res){
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
                        foundUser.save();
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

//---------------------
//Authentication routes
//---------------------

app.post('/register', function(req, res){
    if(!req.body.username || !req.body.password){
        res.json({message: "Provide a username and a password", code: "102"});
    }else{
        var newUser = new User({username: req.body.username});
        User.find({username: req.body.username}, function(err, foundUser){
            if(err){
                res.json({message: err, code: 1});
            }else{
                if(foundUser.length){
                    res.json({message: "Error: A user with this username exists already", code: "101"});
                }else{
                    User.register(newUser, req.body.password, function(err, result){
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



var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});