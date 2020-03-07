var middlewareObj = {};
    bcrypt        = require('bcrypt');
    User          = require('../models/user');


middlewareObj.handleAuthentication = function(req, res, next){
    
    User.findOne({username: req.headers.username}, function(err, foundUser){
        bcrypt.compare(req.headers.password, foundUser.hash, function(err, result){
            if(err){
                console.log(err);
            }
            if(result){
                return next();
            }
            else{
                res.json({message: "Password is not correct"});
            }
        });
    });
};

module.exports = middlewareObj;