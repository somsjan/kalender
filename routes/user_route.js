const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const validator = require('validator');

const User = require('./../models/user');
const authenticate = require('./../controllers/authentication');


module.exports = (app) => {
    app.get('/api/user', (req, res, next) => {
        User.find({}).then((user) => {
            // const userObj = _.pick(user[], ['email', '_id', 'events']);
            res.json(user);
        }).catch(next);
    });

    app.get('/api/user/me', authenticate, (req, res, next) => {
        res.json(req.user);
    });

    app.post('/api/login', (req, res, next) => {
        User.findOne({ email: req.body.email }).then((user) => {
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if(result) {
                    user.generateAuthToken().then((token) => {
                        userObj = _.pick(user, ['email', '_id', 'events']);
                        res.header('x-auth', token).json(userObj);
                    });
                }
                else if(!result) res.status(401).json({ message: 'password is incorrect'});
                else if (err)    next(err);
            });
        }).catch((e) => res.status(401).json({
            message: `No user was found with email: ${req.body.email}`
        } ));
    });

    app.delete('/api/logout', authenticate, (req, res, next) => {
        const token = req.token;
        User.findByIdAndUpdate(req.user._id, { $pull: { tokens: { token }}})
            .then(() => {
                return res.json({message: 'logged out'})
            }).catch(next);
    });

    app.post('/api/register', (req, res, next) => {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                req.body.password = hash;
                const newUser = new User(req.body);
                newUser.save()
                    .then((user) => {
                        return user.generateAuthToken();
                    }).then((token) => {
                        const userObj = _.pick(newUser, ['email', '_id']);
                        res.header('x-auth', token).json(userObj);
                    }).catch(next);
            });
        });
    });

    app.delete('/api/user/delete', authenticate, (req, res, next) => {
        User.findByIdAndRemove(req.user._id, {new: false})
            .then((removedUser) => {
                res.json(_.pick(removedUser, ['_id', 'email', 'events']));
            }).catch(next);
    });

    app.put('/api/user/update', authenticate, (req, res, next) => {
        const updateObj = _.pick(req.body, ['email', 'password']);

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                if (!err) {
                    updateObj.password = hash;

                    if (updateObj.email) {
                        if(!validator.isEmail(updateObj.email)) next({message: 'email is not a valid email'});
                    }
                    if(!validator.isLength(updateObj.password, {min: 5})) {
                        return next({error: 'password has to be atleast 5 characters long'});
                    }

                    User.findByIdAndUpdate(req.user._id, updateObj, {new: true})
                        .then((updatedUser) => {
                            return res.json(updatedUser)
                        }).catch(next);
                }

                else {
                    if (updateObj === undefined) next({error: 'nothing to update'})
                    if(!validator.isEmail(updateObj.email)) next({message: 'email is not a valid email'});

                    User.findByIdAndUpdate(req.user._id, updateObj, {new: true})
                        .then((updatedUser) => {
                            return res.json(updatedUser)
                        }).catch(next);
                };

            });
        });

    });
};
