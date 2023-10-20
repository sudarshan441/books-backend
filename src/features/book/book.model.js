const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    Name: { type: String, require: true },
    Image: { type: String, require:true,},
    Author: { type: String, require: true },
    Genre:{ type: String, require: true},
    Price: { type: String, require: true },
    PublicationDate: { type: String, require: true},
  },{versionKey: false});

const bookModel = mongoose.model("book", bookSchema);
module.exports = bookModel;