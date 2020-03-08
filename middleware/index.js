var middlewareObj = {};
    bcrypt        = require('bcrypt');
    User          = require('../models/user');


middlewareObj.handleAuthentication = function(req, res, next){
    if(req.headers.username && req.headers.password){
        User.findOne({username: req.headers.username}, function(err, foundUser){
            if(foundUser.hash != null){
                bcrypt.compare(req.headers.password, foundUser.hash, function(err, result){
                    if(err){
                        console.log(err);
                    }
                    if(result){
                        return next();
                    }
                    else{
                        res.json({code: 401, message: "Unauthorized"});
                    }
                });
            }else{
                res.json({code: 404, message: "User not found"});
            }
        });
    }
};

module.exports = middlewareObj;
