const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendingSchema = new Schema({
    _id: false,
    userID : {
        type: Schema.ObjectId,
        required: true
    }
});

module.exports = AttendingSchema;
