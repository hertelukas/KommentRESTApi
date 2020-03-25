var mongoose = require('mongoose');

var NoteSchema = new mongoose.Schema({
    title: String,
    content: String,
    folders: [
        {
            formType: String
        }
    ],
    lastEdited: String 
});

module.exports = mongoose.model("Note", NoteSchema)