const User = require('./../models/user');

module.exports = (app) => {
    app.get('/api', (req, res, next) => {
        User.find({}).then((users) => {
            res.send(users);
        }).catch(next);
    });

    app.post('/api', (req, res, next) => {
        const newUser = new User(req.body);
        newUser.save()
            .then((user) => {
                // console.log('User: ', user);
                res.send(user);
            }).catch(next);
    });

};
