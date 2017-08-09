const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    time: {
        type: String,
        length: 5,
        required: false
    },
    location: {
        name: {
            type: String,
            required: false
        },
        coordinates: {
            lat: Number ,
            lng: Number
        }
    }
});

module.exports = EventSchema;


// attendingUsers: []
