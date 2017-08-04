const mongoose = require('mongoose');
const ObjectId =  mongoose.Types.ObjectId;

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 1,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        minlength: 4,
        required: true,
        trim: true
    }
});

// Handler **must** take 3 parameters: the error that occurred, the document
// in question, and the `next()` function
userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(`${doc.username} already exists`);
  } else {
    next(error);
  }
});

userSchema.statics.findUserByName = function (username) {
    var User = this;
    return User.findOne({username});
};

userSchema.statics.findUserById = function (_id) {
    var User = this;
    return User.findOne({_id});
};

// userSchema.statics.comparePassword = function (password, hash, callback) {
//
// };

var User = mongoose.model('User', userSchema);

module.exports = {User};
