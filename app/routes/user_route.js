const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const validator = require('validator');

const User = require('./../models/user');
const authenticate = require('./../controllers/authentication');


module.exports = (app) => {

    // Get all users data (_id, email, events)
    app.get('/api/users/all', (req, res, next) => {
        User.find({}).then((user) => {
            // const userObj = _.pick(user[], ['email', '_id', 'events']);
            res.json(user);
        }).catch(next);
    });

    // Get logged-in user data
    app.get('/api/user/me', authenticate, (req, res, next) => {
        return res.json(req.user);
    });

    // user data of specific user with userID
    app.get('/api/user/:userID', (req, res, next) => {
        User.findById(req.params.userID).then((user) => {
            if(user == undefined){
                return res.json({error: 'user not found'});
            };
            const userObj = _.pick(user, ['email', '_id', 'events']);
            res.json(userObj);
        }).catch(next);
    });

    // login user
    app.post('/api/login', (req, res, next) => {
        User.findOne({ email: req.body.email }).then((user) => {
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if(result) {
                    user.generateAuthToken().then((token) => {
                        userObj = _.pick(user, ['email', '_id', 'events']);
                        process.env.USER_TOKEN = token;
                        return res.header('x-auth', token).json(userObj);
                    });
                }
                else if(!result) res.status(401).json({ error: 'password is incorrect'});
                else if (err)    next(err);
            });
        }).catch((e) => res.status(401).json({ error: `No user was found with email: ${req.body.email}`} ));
    });

    // logout user, remove token
    app.delete('/api/logout', authenticate, (req, res, next) => {
        const token = req.token;
        User.findByIdAndUpdate(req.user._id, { $pull: { tokens: { token }}})
            .then(() => {
                return res.json({message: 'logged out'})
            }).catch(next);
    });

    // register new user
    app.post('/api/register', (req, res, next) => {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                if(!req.body.password === req.body.password2) {
                    return next({error: 'passwords are not the same'});
                }
                req.body.password = hash;
                const pickBody = _.pick(req.body, ['email', '_id', 'password']);
                const newUser = new User(pickBody);
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

    // user delete deletes himself from db
    app.delete('/api/user/delete', authenticate, (req, res, next) => {
        User.findByIdAndRemove(req.user._id, {new: false})
            .then((removedUser) => {
                return res.json(_.pick(removedUser, ['_id', 'email', 'events']));
            }).catch(next);
    });

    // change logged-in users email or/and email
    app.put('/api/user/update', authenticate, (req, res, next) => {
        const updateObj = _.pick(req.body, ['email', 'password']);

        // bcrypt .genSalt/hash hasing to password
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                if (!err) {
                    updateObj.password = hash;

                    if (updateObj.email) {
                        if(!validator.isEmail(updateObj.email)) next({message: 'email is not a valid email'});
                    };
                    if(!validator.isLength(updateObj.password, {min: 5})) {
                        return next({error: 'password has to be atleast 5 characters long'});
                    };

                    User.findByIdAndUpdate(req.user._id, updateObj, {new: true})
                        .then((updatedUser) => {
                            return res.json(updatedUser);
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
