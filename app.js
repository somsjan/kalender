const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const bcrypt = require('bcryptjs');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

const {mongoose} = require('./db/mongoose');
const {User} = require('./models/userSchema');
const {EventS} = require('./models/eventSchema');

const app = express();

// middlewares
app.engine('handlebars', hbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(session({
    secret: 'swag',
    resave: true,
    saveUninitialized: true
}));
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

var loggedUser = null;

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
            console.log('Incorrect username');
            return done(null, false, { message: 'Incorrect username.' });
        } else {
            bcrypt.compare(password, user.password, function(err, result) {
                if (result === true) {
                    loggedUser = user;
                    console.log(`User: ${loggedUser.username} has logged in`);
                    return done (null, user)
                } else {
                    done(null, false, { message: 'Incorrect password.' });
                }
            });
        }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        next();
    } else {
        res.redirect('/');
    }
}

// index
app.get('/', (req, res, next) => {
    res.render('home', {
        title: "Homepage Kalender-app",
        bodyText: "bodyText"
    });
});

app.post('/login',
  passport.authenticate('local',{failureRedirect: '/'}),
  function(req, res) {
      req.checkBody('username', 'Username is required').notEmpty();
      req.checkBody('password', 'Password is required').notEmpty().isLength({min: 3, max: 10});

      var errors = req.validationErrors();
      if (errors) {
          return res.status(400).send(`Error: ${errors}`)
      } else {
          res.redirect('/user/' + req.body.username);
      }
  }
);

app.post('/registration', (req, res) => {
    req.checkBody('username' , 'Username is required').notEmpty().isLength({min: 3, max: 13});
    req.checkBody('password', 'Password is required').notEmpty().isLength({min: 3});

    var errors = req.validationErrors();
    if (errors || req.body.password !== req.body.passwordCheck) {
        res.status(400).send(errors);
    } else {
        const user = new User(req.body);
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                user.password = hash;
                user.save().then(() => {
                    res.send(`Saved new user ${user}`)
                }).catch((e) => {
                    return res.send(e).status(400);
                });
            });
        });
    };
});

// Userpage
app.get('/user/:user', ensureAuthenticated ,(req, res, next) => {
    var username = req.params.user;
    var user = User.findOne({username}).then((user) => {
        if (user === null){
            res.status(404).send(`User: ${username} not found`);
            // res.redirect('/');
        } else{
            EventS.find({}).then((events) => {
                if (loggedUser.username === username) {
                    res.render('ownUser', {
                        title: "Userpage",
                        username: `${user.username}`,
                        events: events
                    });
                } else {
                    res.render('otherUser', {
                        title: "Userpage",
                        username: `${user.username}`,
                        events: events
                    });
                }
            });
        }
    }).catch((e) => {
        console.log('Err: ', e);
    });
});

app.get('/logout', function(req, res){
    req.logout();
    console.log(`User: ${loggedUser.username} has logged out`);
    loggedUser = null;
    res.redirect('/');
});

app.post('/addEvent', async (req, res, next) => {
    req.checkBody('eventname').notEmpty();
    req.checkBody('date').notEmpty();
    req.checkBody('time').notEmpty();
    req.checkBody('location').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(`Error: ${errors[0].param}: ${errors[0].msg}`);
    }
    try {
        const event = new EventS(req.body);
        event.save().then((event) => {
            // console.log('Eventname: ', event.eventname);
            var eventname = event.eventname;
            console.log('loggedUserID', loggedUser._id);
            EventS.findAndUpdate({eventname}, {$push:{attending:loggedUser._id} }).then((foundEvent) => {
                console.log('Res findOne', foundEvent);
            }).catch((e) => {
                console.log(e);
            })
        }).then(() => {
            console.log('final then');
            res.redirect('/user/' + loggedUser.username);
        }).catch((e) => {
            return res.send(e).status(400);
        });
    } catch(e){
        return res.status(400).send(e);
    }
});

module.exports = {app};

// start server
app.listen(3000, () => {
    console.log('Listening to port: 3000');
});
