const bcrypt = require('bcryptjs');
const session = require('express-session');

const User = require('./../models/user');


module.exports = (app) => {
    app.get('/api/user', (req, res, next) => {
        User.find({}).then((users) => {
            res.json(users);
        }).catch(next);
    });

    app.get('/api/user/:id', (req, res, next) => {
        if(!req.session.user){
            return res.status(401).send('Need to be logged in')
        }
        if (req.session.user._id === req.params.id) {
            User.findById(req.params.id).then((user) => {
                return res.json(user);
            }).catch(next);
        } else {
            res.status(401).send('not authorized')
        }

    });

    app.post('/api/login', (req, res, next) => {
        User.findOne({ email: req.body.email }).then((user) => {
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if(result) {
                    req.session.user = user;
                    res.json(user);
                }
                else if(!result) res.status(401).send('password is incorrect');
                else if (err)    next(err);
            });
        }).catch((e) => res.status(401).send(`No user was found with email: ${req.body.email}` ));
    });

    app.post('/api/register', (req, res, next) => {
        req.assert('email', 'valid email required').isEmail();
        req.assert('password', 'valid password required').isNotEmpty();
        req.getValidationResult().then((result) => {
            if(result.isEmpty()){
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(req.body.password, salt, function(err, hash) {
                        req.body.password = hash;
                        const newUser = new User(req.body);
                        newUser.save()
                            .then((user) => res.json(user))
                            .catch(next);
                    });
                });
            } else {
                res.status(422).send(result.array());
            }
        }).catch(next);
    });

    app.delete('/api/user/:id', (req, res, next) => {
        User.findByIdAndRemove(req.params.id)
            .then((removedUser) => res.json(removedUser))
            .catch(next);
    });

    app.put('/api/user/:id', (req, res, next) => {
        req.assert('email', 'valid email required').isEmail();
        req.getValidationResult().then((result) => {
            if(result.isEmpty()){
                User.findByIdAndUpdate(req.params.id, req.body, {new: true})
                    .then((updatedUser) => res.json(updatedUser))
                    .catch(next);
            } else {
                res.status(422).send(result.array());
            }
        }).catch(next);
    });

    //////////
    // EVENTS
    //////////

    app.get('/api/event', (req, res, next) => {
        User.find({$where: 'this.events.length > 0'})
            .then((events) => res.json(events));
    });

    app.put('/api/event/:id', (req, res, next) => {
        User.findById(req.params.id).then((user) => {
            user.events.push(req.body);
            user.save().then((result) => {
                res.json(result);
            }).catch(next);
        }).catch(next);
    });

    // app.put('/api/event/:id/:eventId', (req, res, next) => {
    //     const eventId = req.params.eventId;
    //     User.findByIdAndUpdate(req.params.id,
    //         {$pull: {'events': eventId}})
    //             .then((result) => res.json(result))
    //             .catch((e) => console.log(e));
    // });

};
