var middlewareObj = {};

middlewareObj.handleAuthentication = function(req, res, next){
    //Needs to be implimented
    next();
};

module.exports = middlewareObj;