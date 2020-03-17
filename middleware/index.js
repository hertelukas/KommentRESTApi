var middlewareObj = {};
    bcrypt        = require('bcrypt');
    User          = require('../models/user');


middlewareObj.handleAuthentication = function(req, res, next){
    console.log("Authenticating " + req.headers.username);
    if(req.headers.username && req.headers.password){
        User.findOne({username: req.headers.username}, function(err, foundUser){
            if(typeof foundUser.hash !== "undefined" && foundUser.hash){
                bcrypt.compare(req.headers.password, foundUser.hash, function(err, result){
                    if(err){
                        console.log(err);
                        return null;
                    }
                    if(result){
                        return next();
                    }
                    else{
                        res.json({code: 401, message: "Unauthorized"});
                        return null;
                    }
                });
            }else{
                res.json({code: 404, message: "User not found"});
                return null;
            }
        });
    }
};

module.exports = middlewareObj;
