const mongoose = require('mongoose');
const ObjectId =  mongoose.Types.ObjectId;

var eventSchema = new mongoose.Schema({
    eventname: {
        type: String,
        minlength: 1,
        maxlength: 25,
        required: true,
        trim: true
    },
    date: {
        type: String,
        required: true,
        trim: true
    },
    time: {
        type: String,
        length: 5,
        required: true,
        trim: true
    },
    location: {
        type: String,
        minlength: 3,
        maxlength: 20,
        required: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: 200,
        required: false,
    },
    admin_id: {type: String},
    attending: [{user_id: String}]
});

// Handler **must** take 3 parameters: the error that occurred, the document
// in question, and the `next()` function
eventSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(`Event already exists`);
  } else {
    next(error);
  }
});

eventSchema.statics.findEventByName = function (eventname) {
    var User = this;
    return EventS.findOne({eventname});
};

eventSchema.statics.findEventById = function (_id) {
    var User = this;
    return EventS.findOne({_id});
};

eventSchema.statics.findEventByName = function (eventname) {
    var User = this;
    return EventS.findOne({eventname});
};

var EventS = mongoose.model('EventS', eventSchema);

module.exports = {EventS};
