var mongoose = require('mongoose');

var NoteSchema = new mongoose.Schema({
    title: String,
    content: String,
    folders: [
        String
    ],
    lastEdited: String,
    public: String
});

module.exports = mongoose.model("Note", NoteSchema)