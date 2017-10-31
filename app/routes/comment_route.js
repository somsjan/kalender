const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const validator = require('validator');

const User = require('./../models/user');
const EventModel = require('./../models/event');
const Comment = require('./../models/comment');
const authenticate = require('./../controllers/authentication');

module.exports = (app) => {

    //add a comment to event with eventID
    app.put('/api/event/addComment/:eventID', authenticate, (req, res, next) => {
        const trimmedComment = _.trim(req.body.comment);
        const newComment = {
            userID: req.user._id,
            comment: trimmedComment
        };

        let updatedEvent;
        if (!newComment.comment || newComment.comment.length <= 2) {
            return next({error: 'comment has to be atleast 3 characters long'});
        }
        User.findOne({'events._id' : req.params.eventID}, `email events`)
            .then((userWithEvent) => {
                for (var i=0; i < userWithEvent.events.length; i++) {
                    if (userWithEvent.events[i]._id == req.params.eventID) {
                        userWithEvent.events[i].comments.push(newComment);
                        updatedEvent = userWithEvent.events[i];
                        userWithEvent.save().then(() => {
                            return res.json(updatedEvent);
                        }).catch(next);
                    }
                }
            }).catch((e) => {
                return next({error: 'event not found'});
            });
    });

    // Delete own made comment with commentID from eventID
    app.delete('/api/event/deleteComment/:eventID/:commentID', authenticate, async (req, res, next) => {
        const eventID = req.params.eventID;
        const commentID = req.params.commentID;
        let userWithEvent;
        let eventWithoutComment;

        const foundUser = await User.findById(req.user._id);

        for (var i=0; i < foundUser.events.length; i++) {
            if (foundUser.events[i]._id == req.params.eventID) userWithEvent = foundUser.events[i];
            else {
                return res.json({error: 'event not found'});
            };
        };

        for (var i=0; i < userWithEvent.comments.length; i++) {
            if (userWithEvent.comments[i]._id == req.params.commentID) eventWithoutComment = _.pull(userWithEvent.comments, userWithEvent.comments[i]);
            else {
                return res.json({error: 'comment not found in given eventID'});
            };
        };

        User.findByIdAndUpdate( req.user._id, {'$set': {events: userWithEvent}}, {new: true} )
            .then((result) => res.json(result))
            .catch(next);
    });


};
