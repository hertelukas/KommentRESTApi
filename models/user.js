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

const Note = require('./note');
UserSchema.pre('remove', async function(){
    await Note.remove({
        _id:{
            $in: this.notes
        }
    });
});

module.exports = mongoose.model("User", UserSchema)