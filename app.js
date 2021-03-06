const express       = require('express'),
      app           = express(),
      bodyParser    = require('body-parser'),
      mongoose      = require('mongoose'),
      bcrypt        = require('bcrypt');

var User     = require('./models/user'),
    Note     = require('./models/note');

var middleware  = require('./middleware');

var connected = false;

//Mongoose setup
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

//Bcrypt setup
const saltRounds = 10;

//Body Parser setup
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

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
    Note.findById(req.params.id, function(err, foundNote){
        if(foundNote.public === "true"){
            res.json({note: foundNote, code: 0});
        }else{
            res.json({message: "This note is private", code: 401})
        }
    });
    // User.findOne({username: req.headers.username}).populate("notes").exec(function(err, foundUser){
    //     var i = 0;
    //     foundUser.notes.forEach(note => {
    //         if(note._id == req.params.id){
    //             res.json({note: note});
    //         }
    //         i++;
    //         if(i === foundUser.notes.length){
    //             res.send("No note found");
    //         }
    //     });
    // });
});

//Create a new note
app.post('/notes', middleware.handleAuthentication, function(req, res){
    console.log("Post notes request from " + req.headers.username);
    if(!req.body.title){
        res.json({message: "Provide at least a title", code: 201});
    }else{
        User.findOne({username: req.headers.username}, function(err, foundUser){
            if(err){
                res.json({message: err, code: 500});
            } else{
                var newNote = new Note({title: req.body.title, content: req.body.content, lastEdited: new Date(), public: false});
                Note.create(newNote, function(req, createdNote){
                    if(err){
                        res.json({message: err, code: 500});
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

app.delete('/notes/:id', middleware.handleAuthentication, function(req, res){
    Note.findById(req.params.id, function(err, foundNote){
        if(err){
            res.json({message: err, code: 1});
        }else{
            var userOwnsNote = false;
            User.findOne({username: req.headers.username}).populate('notes').exec(function(err, foundUser){
                if(err){
                    res.json({message: err, code: 1});
                }
                else{
                    var i = 0;
                    foundUser.notes.forEach(note =>{
                        if(note._id == req.params.id){
                            userOwnsNote = true;
                        }
                        i++;
                        if(i === foundUser.notes.length){
                            if(userOwnsNote){
                                foundNote.delete();
                                res.json({message: "Note deleted", code: 200});
                            }
                            else{
                                res.json({message: "User not authorized", code: 401});
                            }
                        }
                    });
                }
            });
        }
    });
});

//Edit route
app.put('/notes/:id', middleware.handleAuthentication, function(req, res){
    console.log(req.body);
    if(!req.body.title){
        res.json({message: "No title provided", code: 103});
    }else{
        Note.findById(req.params.id, function(err, foundNote){
            if(err){
                res.json({message: err, code: 1});
            }else{
                var userOwnsNote = false;
                User.findOne({username: req.headers.username}).populate('notes').exec(function(err, foundUser){
                    if(err){
                        res.json({message: err, code: 1});
                    }
                    else{
                        var i = 0;
                        foundUser.notes.forEach(note =>{
                            if(note._id == req.params.id){
                                userOwnsNote = true;
                            }
                            i++;
                            if(i === foundUser.notes.length){
                                if(userOwnsNote || foundNote.public === "true"){
                                    foundNote.content = req.body.content;
                                    foundNote.lastEdited = new Date();
                                    foundNote.title = req.body.title;
                                    if(req.body.folders){
                                        foundNote.folders = req.body.folders;
                                    }
                                    if(req.body.public){
                                        foundNote.public = req.body.public;
                                    }
                                    foundNote.save();
                                    res.json({message: "Note updated", code: 200});
                                }
                                else{
                                    res.json({message: "User not authorized", code: 401});
                                }
                            }
                        })
                    }
                });
            }
        });
    }
});

//---------------------
//User routes
//---------------------

app.post('/users', function(req, res){
    if(!req.headers.username || !req.headers.password){
        res.json({message: "Provide a username and a password", code: "102"});
    }else{
        var username = req.headers.username;
        User.find({username: username}, function(err, foundUser){
            if(err){
                res.json({message: err, code: 500});
            }else{
                if(foundUser.length){
                    res.json({message: "Error: A user with this username exists already", code: "101"});
                }else{
                    bcrypt.hash(req.headers.password, saltRounds, function(err, hash){
                        var newUser = ({username: username, hash: hash});
                        User.create(newUser, function(req, createdUser){
                            if(err){
                                res.json({message: err, code: 500});
                            }else{
                                res.json({message: "User created", code: 100, user: createdUser})
                            }
                        });
                    });
                }
            }
        });
    }
});

app.get('/users', middleware.handleAuthentication, function(req, res){
    User.findOne({username: req.headers.username}, function(err, foundUser){
        if(err){
            res.json({message: err, code: 500});
        }else{
            res.json({message: "Authentication successfull", code: 104, user: foundUser})
        }
    });


})

app.delete('/users/:id', middleware.handleAuthentication, function(req, res){
    User.findByIdAndDelete(req.params.id, function(err){
        if(err){
            res.json({message: err, code: 500});
        }else{
            res.json({message: "User deleted", code: 100});
        }
    })
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});