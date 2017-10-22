const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = require('./user');
const CommentSchema = require('./comment');
const AttendingSchema = require('./attending');

const EventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    date: {
        type: Date
    },
    time: {
        type: String
    },
    location: {
        type: String,
    },
    coordinatesLocation: {
        lat: Number ,
        lng: Number
    },
    comments: [CommentSchema],
    attendingUsers: [AttendingSchema]
});

module.exports = EventSchema;



// attendingUsers: []
