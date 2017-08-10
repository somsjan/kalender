const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');

const routes = require('./routes/routes');

const app = express();

process.env.SECRET_KEY = "le_secret_0505";

mongoose.Promise = global.Promise;
if(process.env.NODE_ENV == undefined){
    console.log('running NORMAL DB');
    mongoose.connect('mongodb://localhost/kalender');
}

app.use(bodyParser.json());
app.use(expressValidator());
app.use(session({secret: process.env.SECRET_KEY, resave:false, saveUninitialized:true}));
routes(app);

app.use((err, req, res, next) => {
    res.status(422).send({ error: err.message });
});

app.listen(3000, () => {
    console.log('server started on port: 3000');
});

module.exports = app;
