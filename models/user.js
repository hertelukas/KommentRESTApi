var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: String,
    hash: String,
    notes:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Note"
        }
    ]
});

module.exports = mongoose.model("User", UserSchema)