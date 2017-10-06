const User = require('./../models/user');
const _ = require('lodash');

module.exports = function isAuthenticated(req, res, next) {
    const token = req.header('x-auth');

    User.findByToken(token).then((user) => {
        if(!user){
            return Promise.reject();
        }
        req.user = _.pick(user, ['email', '_id', 'events']);
        req.token = token;
        next();
    }).catch((error) => {
        res.status(401).json({error: 'you need to be logged in to continue'});
    });
};
