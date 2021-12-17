const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    authorId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Author"
    }
});



const AuthorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const Book = mongoose.model('Book', BookSchema);
const Author = mongoose.model('Author', AuthorSchema);

module.exports = {
    Book,
    Author
}



