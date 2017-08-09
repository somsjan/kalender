const User = require('./../models/user');
// const Events = require('./../models/event');

module.exports = (app) => {
    app.get('/api/user', (req, res, next) => {
        User.find({}).then((users) => {
            res.json(users);
        }).catch(next);
    });

    app.get('/api/user/:id', (req, res, next) => {
        User.findById(req.params.id).then((user) => {
            res.json(user);
        }).catch(next);
    });

    app.post('/api/user', (req, res, next) => {
        const newUser = new User(req.body);

        req.assert('email', 'valid email required').isEmail();
        req.getValidationResult().then((result) => {
            if(result.isEmpty()){
                newUser.save()
                    .then((user) => res.json(user))
                    .catch(next);
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
