var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    notes:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Note"
        }
    ]
});

module.exports = mongoose.model("User", UserSchema)