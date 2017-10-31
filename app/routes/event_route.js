const bcrypt = require('bcryptjs');
const dateTime = require('date-time');
const validator = require('validator');
const _ = require('lodash');

const User = require('./../models/user');
const authenticate = require('./../controllers/authentication');

module.exports = (app) => {

    // Get all events
    app.get('/api/event', (req, res, next) => {
        User.find({$where: 'this.events.length > 0'}, 'email events')
            .then((events) => res.json(events))
            .catch(next);
    });

    // Get event by eventID
    app.get('/api/event/:eventID', (req, res, next) => {
        User.findOne({'events._id' : req.params.eventID}, `email events`)
            .then((userWithEvent) => {
                for (var i=0; i < userWithEvent.events.length; i++) {
                    if (userWithEvent.events[i]._id == req.params.eventID) {
                        return res.json(userWithEvent.events[i]);
                    };
                };
            }).catch((e) => {
                return next({error: 'event not found'});
            });
    });

    // Make a new event
    app.put('/api/event/add', authenticate, (req, res, next) => {
        if (!req.body.title || !req.body.time || !req.body.date || !req.body.location){
            console.log(req.body);
            return next({error: 'missing event information'});
        };

        req.body.date = new Date(req.body.date);

        if (req.body.date <= new Date()) {
            return next({error: `date has already passed`});
        };

        const newEvent = _.pick(req.body, ['title','description', 'date', 'location', 'coordinatesLocation']);

        User.findById(req.user._id).then((user) => {
            user.events.push(newEvent);
            user.save().then((result) => {
                res.json(result);
            }).catch(next);
        }).catch(next);
    });

    // Delete event with eventID from logged-in user
    app.delete('/api/event/delete/:eventID', authenticate, (req, res, next) => {
        const eventID = req.params.eventID;
        User.findByIdAndUpdate(req.user._id,
            {$pull: {'events': {_id: eventID}}}, { new: true })
                .then((result) => {
                    res.json(result);
                }).catch(next);
    });

    app.put('/api/event/update/:eventID', authenticate, async(req, res, next) => {
        const updateEvent = _.pick(req.body, ['title','description', 'date', 'time', 'location', 'coordinatesLocation']);
        const eventID = req.params.eventID;
        let newEvent;

        if(_.isEmpty(updateEvent)) {
            return next({error: `nothing to update`});
        };

        if(req.body.date){
            updateEvent.date = new Date(req.body.date);
            if (updateEvent.date <= new Date()) {
                return next({error: `date has already passed`});
            };
        };

        await User.findByIdAndUpdate(req.user._id,
            {$pull: {'events': {_id: eventID}}}, { new: false })
                .then((userWithEvent) => {
                    for (var i=0; i < userWithEvent.events.length; i++) {
                        if (userWithEvent.events[i]._id == req.params.eventID) newEvent = userWithEvent.events[i]
                    };
                }).catch(next);

        // updateEvent object contains an item, push them in to the obj
        if(updateEvent.title) newEvent.title = updateEvent.title;
        if(updateEvent.description) newEvent.description = updateEvent.description;
        if(updateEvent.description) newEvent.time = updateEvent.time;
        if(updateEvent.date) newEvent.date = updateEvent.date;
        if(updateEvent.location) newEvent.location = updateEvent.location;
        if(updateEvent.coordinatesLocation) newEvent.coordinatesLocation = updateEvent.coordinatesLocation;

        await User.findById(req.user._id).then((user) => {
            user.events.push(newEvent);
            user.save().then((result) => {
                res.json(result);
            }).catch(next);
        }).catch(next);
    });

    // attent event if not already attending,
    // if already attending leave from attendings list
    app.put('/api/event/attendingAdd/:eventID', authenticate, async(req, res, next) => {
        User.findOne({'events._id' : req.params.eventID}, `email events`)
            .then((userWithEvent) => {
                for (var i=0; i < userWithEvent.events.length; i++) {
                    if (userWithEvent.events[i]._id == req.params.eventID) {
                        const foundEvent = userWithEvent.events[i];
                        const attendingList = foundEvent.attendingUsers.filter(e => e.userID.toString() === req.user._id.toString())

                        if (attendingList.length === 1) {
                            foundEvent.attendingUsers.pull({ userID: req.user._id});
                            userWithEvent.save().then((newEvent) => {
                               return res.json(newEvent);
                            });
                        };

                        if(attendingList.length === 0){
                            foundEvent.attendingUsers.push({ userID: req.user._id});
                            userWithEvent.save().then((newEvent) => {
                                return res.json(newEvent);
                            });
                        };
                    };
                };
            }).catch((e) => {
                return next({error: 'event not found'});
            });

    });
};
