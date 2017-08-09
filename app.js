const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

const routes = require('./routes/routes');

const app = express();

mongoose.Promise = global.Promise;
if(process.env.NODE_ENV == undefined){
    console.log('running NORMAL DB');
    mongoose.connect('mongodb://localhost/kalender');
}


app.use(bodyParser.json());
app.use(expressValidator());
routes(app);

app.use((err, req, res, next) => {
    res.status(422).send({ error: err.message });
});

app.listen(3000, () => {
    console.log('server started on port: 3000');
});

module.exports = app;
