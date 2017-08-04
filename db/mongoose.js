const mongoose = require('mongoose');
const db = mongoose.connection;

mongoose.Promise = global.Promise;

var localDB = 'mongodb://localhost/kalender'
var testDB = 'mongodb://localhost/kalenderTest'
// var url = process.env.MONGODB_URI;
// var url = process.env.MONGODB_URI || 'mongodb://localhost:27017/ToDoApp';

if(process.env.NODE_ENV === 'test'){
    mongoose.connect(testDB);
    console.log('Connected to TEST-db');
} else {
    mongoose.connect(localDB);
    console.log('Connected to DB');
}

db.on('error', console.error.bind(console, 'connection error:'));

module.exports = {
    mongoose
};
