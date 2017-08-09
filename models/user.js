const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = require('./event');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    events: [EventSchema]
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
