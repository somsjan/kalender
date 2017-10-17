//set .env
require('dotenv').load();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const user_route = require('./routes/user_route');
const event_route = require('./routes/event_route');
const comment_route = require('./routes/comment_route');


const app = express();

mongoose.Promise = global.Promise;
if(process.env.NODE_ENV == undefined){
    console.log('running NORMAL DB');
    mongoose.connect('mongodb://localhost/kalender');
};

app.use(bodyParser.json());

user_route(app);
event_route(app);
comment_route(app);

//error handler
app.use((err, req, res, next) => {
    if(err.name === 'MongoError') {
        return res.status(422).json( { error: err.message} );
    }
    if(err.name === 'ValidationError'){
        return res.status(422).json( { error: err.message} );
    }
    return res.status(422).json( err );
});

app.listen(3000, () => {
    console.log('server started on port: 3000');
});

module.exports = app;
