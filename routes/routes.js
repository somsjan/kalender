const User = require('./../models/user');

module.exports = (app) => {
    app.get('/api/user', (req, res, next) => {
        User.find({}).then((users) => {
            res.send(users);
        }).catch(next);
    });

    app.get('/api/user/:id', (req, res, next) => {
        // console.log(req.params.id);
        User.findById(req.params.id).then((user) => {
            res.send(user);
        }).catch(next);
    });

    app.post('/api/user', (req, res, next) => {
        const newUser = new User(req.body);

        req.assert('email', 'valid email required').isEmail();
        req.getValidationResult().then((result) => {
            if(result.isEmpty()){
                newUser.save()
                    .then((user) => res.send(user))
                    .catch(next);
            } else {
                res.status(422).send(result.array());
            }
        }).catch(next);
    });

    app.delete('/api/user/:id', (req, res, next) => {
        User.findByIdAndRemove(req.params.id)
            .then((removedUser) => res.send(removedUser))
            .catch(next);
    });

    app.put('/api/user/:id', (req, res, next) => {
        req.assert('email', 'valid email required').isEmail();
        req.getValidationResult().then((result) => {
            if(result.isEmpty()){
                User.findByIdAndUpdate(req.params.id, req.body, {new: true})
                    .then((updatedUser) => res.send(updatedUser))
                    .catch(next);
            } else {
                res.status(422).send(result.array());
            }
        }).catch(next);
    });

};
