//set .env
require('dotenv').load();

const path = require('path');
const express = require('express');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// api routes
const user_route = require('./app/routes/user_route');
const event_route = require('./app/routes/event_route');
const comment_route = require('./app/routes/comment_route');

// frontend routes
const index_front = require('./public/index');

const app = express();

// Handlebars/view-engine setup
app.set('views', path.join(__dirname, 'public/views'));
app.engine('handlebars', hbs({defaultLayout: 'main', layoutsDir: 'public/views/layouts/'}));
app.set('view engine', 'handlebars');

console.log('process.env: ', process.env);

mongoose.Promise = global.Promise;
if(process.env.NODE_ENV == undefined){
    console.log('running NORMAL DB');
    mongoose.connect('mongodb://localhost/kalender');
};

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// API Routes
user_route(app);
event_route(app);
comment_route(app);

// Frontend routes
index_front(app);

//error handler
app.use((err, req, res, next) => {
    if(err.name === 'MongoError') {
        if(err.code === 11000) {
            return res.status(422).json( { error: 'user with that email already exists'} );
        };
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
