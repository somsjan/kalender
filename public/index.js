const http = require('http');
const host = process.env.HOST || 'localhost:3000';
const _ = require('lodash');
const request = require('request');

// used to display messages
let succesMessage;
let errorMessage;
let loggedIn = null;

module.exports = (app) => {

    app.get('/', (req, res, next) => {
        const succesMsg = succesMessage;
        const errorMsg = errorMessage;
        succesMessage = null;
        errorMessage = null;

        res.render('index', {
            succes: succesMsg,
            error: errorMsg,
            loggedIn: loggedIn,
            title: 'Kalender-web frontpage',
            headerTitle: 'Frontpage',
            headerText: 'Welcome text',
            bodyTitle: 'Body title',
            bodyText: 'Body TEXTXTXT',
        });
    });

    app.get('/profile', (req, res, next) => {
        const formData = {token: process.env.USER_TOKEN};
        request('http://' +host+ '/api/user/me', {method: 'GET', form: formData}, (error, response, body) => {
            const data = JSON.parse(body);
            const succesMsg = succesMessage;
            const errorMsg = errorMessage;
            succesMessage = null;
            errorMessage = null;

            if(data.error){
                errorMessage = data.error;
                return res.redirect('/');
            };

            res.render('profile', {
                succes: succesMsg,
                error: errorMsg,
                loggedIn,
                title: `Userpage: ${data.email}`,
                headerTitle: `Userpage: ${data.email}`,
                headerText: `Header text with userID: ${data._id}`,
                bodyTitle: 'Body title',
                bodyText: 'Body TEXTXTXT',
                user: data
            });
        });
    });

    app.get('/user/:userID', (req, res, next) => {
        const userID = req.params.userID;

        // if loggedIn user is going to his own userID page redirect to /profile
        if(loggedIn){
            if(userID == loggedIn._id) {
                return res.redirect('/profile');
            }
        }

        request('http://' +host+ '/api/user/' + userID, (error, response, body) => {
            const data = JSON.parse(body);
            const succesMsg = succesMessage;
            const errorMsg = errorMessage;
            succesMessage = null;
            errorMessage = null;

            if(data.error){
                errorMessage = data.error;
                return res.redirect('/');
            };

            res.render('userPage', {
                succes: succesMsg,
                error: errorMsg,
                loggedIn,
                title: `Userpage: ${data.email}`,
                headerTitle: `Userpage: ${data.email}`,
                headerText: `Header text with userID: ${data._id}`,
                bodyTitle: 'Body title',
                bodyText: 'Body TEXTXTXT',
                user: data
            });
        });
    });

    app.get('/users', (req, res, next) => {
        request('http://' +host+ '/api/users/all', (error, response, body) => {
            const data = JSON.parse(body);
            const succesMsg = succesMessage;
            const errorMsg = errorMessage;
            succesMessage = null;
            errorMessage = null;

            res.render('users', {
                succes: succesMsg,
                error: errorMsg,
                loggedIn,
                title: 'Kalender-web Users',
                headerTitle: 'Users',
                headerText: 'List of users',
                bodyTitle: 'Body title',
                bodyText: 'Body TEXTXTXT',
                users: data
            });
        });
    });

    // Login system
    app.post('/login', (req, res) => {
        const formData = req.body;
        request('http://' +host+ '/api/login', {method: 'POST', form: formData}, (error, response, body) => {
            const data = JSON.parse(body);
            if(!data.error){
                loggedIn = {_id: data._id, email: data.email};
                succesMessage = 'Login was succesfull!';
                return res.redirect('/');
            };
            if(data.error){
                errorMessage = data.error;
                return res.redirect('/');
            };
        });
    });

    // Logout
    app.get('/logout', (req, res) => {
        const form = {token: process.env.USER_TOKEN};
        request('http://' +host+ '/api/logout', {method: 'DELETE', form }, (error, response, body) => {
            const data = JSON.parse(body);
            if(!data.error){
                loggedIn = null;
                succesMessage = 'Succesfully logged out!';
                return res.redirect('/');
            };
            if(data.error){
                errorMessage = 'already logged out';
                return res.redirect('/');
            };
        });
    });

    // Register
    app.post('/register', (req, res) => {
        const formData = req.body;
        request('http://' +host+ '/api/register', {method: 'POST', form: formData}, (error, response, body) => {
            const data = JSON.parse(body);
            if(!data.error){
                succesMessage = 'Succesfully made an account!';
                return res.redirect('/');
            };
            if(data.error){
                errorMessage = data.error;
                return res.redirect('/');
            };
        });
    });

    //show all events
    app.get('/events', (req, res, next) => {
        request('http://' +host+ '/api/event', (error, response, body) => {
            const data = JSON.parse(body);
            const succesMsg = succesMessage;
            const errorMsg = errorMessage;
            succesMessage = null;
            errorMessage = null;

            res.render('events', {
                succes: succesMsg,
                error: errorMsg,
                loggedIn,
                title: 'Kalender-web Events',
                headerTitle: 'Events',
                headerText: 'List of events',
                bodyTitle: 'Body title',
                bodyText: 'Body TEXTXTXT',
                events: data
            });
        });
    });

    app.get('/event/:eventID', (req, res, next) => {
        const eventID = req.params.eventID;
        request('http://' +host+ '/api/event/' + eventID, (error, response, body) => {
            const data = JSON.parse(body);
            const succesMsg = succesMessage;
            const errorMsg = errorMessage;
            succesMessage = null;
            errorMessage = null;

            if(data.error){
                errorMessage = data.error;
                return res.redirect('/');
            };

            res.render('eventPage', {
                succes: succesMsg,
                error: errorMsg,
                loggedIn,
                title: `Eventpage: ${data.title}`,
                headerTitle: `Eventpage: ${data.title}`,
                headerText: `Header text with eventID: ${data._id}`,
                bodyTitle: 'Body title',
                bodyText: 'Body TEXTXTXT',
                data
            });
        });
    });

    app.post('/newEvent', (req, res, next) => {
        const eventID = req.params.eventID;
        const formData = {
            token: process.env.USER_TOKEN,
            title: req.body.title,
            time: req.body.time,
            date: req.body.date,
            location: req.body.location
        };

        request('http://' +host+ '/api/event/add',  {method: 'PUT', form: formData }, (error, response, body) => {
            const data = JSON.parse(body);
            const succesMsg = succesMessage;
            const errorMsg = errorMessage;
            succesMessage = null;
            errorMessage = null;

            if(data.error){
                errorMessage = data.error;
                return res.redirect('back');
            };

            succesMessage = 'Making event was succesfull';
            res.redirect('back');
        });
    });

    app.post('/event/addComment/:eventID', (req, res, next) => {
        const eventID = req.params.eventID;
        const formData = {comment: req.body.comment, token: process.env.USER_TOKEN};

        request('http://' +host+ '/api/event/addComment/' + eventID,  {method: 'PUT', form: formData }, (error, response, body) => {
            const data = JSON.parse(body);
            const succesMsg = succesMessage;
            const errorMsg = errorMessage;
            succesMessage = null;
            errorMessage = null;

            if(data.error){
                errorMessage = data.error;
                return res.redirect('back');
            };

            succesMessage = 'Placing comment was succesfull';
            res.redirect('back');
        });
    });

    app.get('/event/attending/:eventID', (req, res, next) => {
        const eventID = req.params.eventID;
        const formData = {token: process.env.USER_TOKEN};

        request('http://' +host+ '/api/event/attendingAdd/' + eventID,  {method: 'PUT', form: formData }, (error, response, body) => {
            const data = JSON.parse(body);
            const succesMsg = succesMessage;
            const errorMsg = errorMessage;
            succesMessage = null;
            errorMessage = null;

            if(data.error){
                errorMessage = data.error;
                return res.redirect('back');
            };

            succesMessage = 'Changin attending status has succesfully changed!';
            res.redirect('back');
        });
    });

    app.get('/event/delete/:eventID', (req, res, next) => {
        const eventID = req.params.eventID;
        const formData = {token: process.env.USER_TOKEN};

        request('http://' +host+ '/api/event/delete/' + eventID,  {method: 'DELETE', form: formData }, (error, response, body) => {
            const data = JSON.parse(body);
            const succesMsg = succesMessage;
            const errorMsg = errorMessage;
            succesMessage = null;
            errorMessage = null;

            if(data.error){
                errorMessage = data.error;
                return res.redirect('back');
            };

            succesMessage = 'Succesfully deleted event';
            res.redirect('back');
        });
    });

    app.get('/deleteUser', (req, res, next) => {
        const formData = {token: process.env.USER_TOKEN};
        console.log('detele user')

        request('http://' +host+ '/api/user/delete',  {method: 'DELETE', form: formData }, (error, response, body) => {
            const data = JSON.parse(body);
            const succesMsg = succesMessage;
            const errorMsg = errorMessage;
            succesMessage = null;
            errorMessage = null;

            if(data.error){
                errorMessage = data.error;
                return res.redirect('back');
            };

            loggedIn = null;
            succesMessage = 'Succesfully deleted account';
            res.redirect('/');
        });
    });


};
