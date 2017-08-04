const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const routes = require('./routes/routes');

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/kalender');

app.use(bodyParser.json());
routes(app);

app.use((err, req, res, next) => {
    res.status(422).send({ error: err.message });
});

app.listen(3000, () => {
    console.log('server started on port: 3000');
});

module.exports = app;
