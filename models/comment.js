const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    userID : {
        type: Schema.ObjectId,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    datePlaced: {
        type: Date,
        default: Date.now()
    }
});

module.exports = CommentSchema;
