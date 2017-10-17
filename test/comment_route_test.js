const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');

const User = require('./../models/user');

// load templates
const templateUser = require('./helpers/test_templates').templateUser;
const templateEvent = require('./helpers/test_templates').templateEvent;
const templateComment = require('./helpers/test_templates').templateComment;
const templateComment2 = require('./helpers/test_templates').templateComment2;

const app = require('../app');


describe('COMMENT route tests', () => {
    describe('PUT /api/event/addComment/:eventID', () => {
        it('put a comment on event', (done) => {
            const testUser = new User (templateUser);
            const eventID = '012345678910111213141516';
            const comment = 'Test comment';

            testUser.save().then(() => {
                request(app)
                    .put('/api/event/addComment/' + eventID)
                    .set('x-auth', testUser.tokens[0].token)
                    .send({comment})
                    .end((err, res) => {
                        assert(res.body._id === eventID);
                        assert(res.body.comments[0].comment === comment);
                        done();
                    });
            });

        });

        it('should deny comment that is to short', (done) => {
            const testUser = new User (templateUser);
            const eventID = '012345678910111213141516';
            const comment = '02';

            testUser.save().then(() => {
                request(app)
                    .put('/api/event/addComment/' + eventID)
                    .set('x-auth', testUser.tokens[0].token)
                    .send({comment})
                    .end((err, res) => {
                        assert(res.body.error === 'comment has to be atleast 3 characters long');
                        done();
                    });
            });

        });

        it('should deny comment only has spaces', (done) => {
            const testUser = new User (templateUser);
            const eventID = '012345678910111213141516';
            const comment = '    ';

            testUser.save().then(() => {
                request(app)
                    .put('/api/event/addComment/' + eventID)
                    .set('x-auth', testUser.tokens[0].token)
                    .send({comment})
                    .end((err, res) => {
                        assert(res.body.error === 'comment has to be atleast 3 characters long');
                        done();
                    });
            });

        });

        it('should trim comment', (done) => {
            const testUser = new User (templateUser);
            const eventID = '012345678910111213141516';
            const comment = '  trim  ';

            testUser.save().then(() => {
                request(app)
                    .put('/api/event/addComment/' + eventID)
                    .set('x-auth', testUser.tokens[0].token)
                    .send({comment})
                    .end((err, res) => {
                        assert(res.body.comments[0].comment === 'trim');
                        done();
                    });
            });

        });

        it('should not comment on non existing event', (done) => {
            const testUser = new User (templateUser);
            const eventID = '123456';
            const comment = 'Test comment';

            testUser.save().then(() => {
                request(app)
                    .put('/api/event/addComment/' + eventID)
                    .set('x-auth', testUser.tokens[0].token)
                    .send({comment})
                    .end((err, res) => {
                        assert(res.body.error === 'event not found');
                        done();
                    });
            });

        });
    });

    describe('DELETE /api/event/deleteComment/eventID/:commentID', () => {
        it('should delete comment from event', (done) => {
            const testUser = new User(templateUser);
            testUser.events = [templateEvent];
            testUser.events[0].comments[0] = templateComment;
            testUser.events[0].comments[1] = templateComment2;
            const eventID = testUser.events[0]._id;
            const commentID = testUser.events[0].comments[0]._id;

            testUser.save().then(() => {
                request(app)
                    .delete('/api/event/deleteComment/' + eventID + '/' + commentID)
                    .set('x-auth', testUser.tokens[0].token)
                    .end((err, res) => {
                        assert(res.body.events[0].comments.length === 1);
                        assert(!res.body.error);
                        done();
                    });
            });
        });

        it('should not find wrong commentID in event', (done) => {
            const testUser = new User(templateUser);
            testUser.events = [templateEvent];
            testUser.events[0].comments[0] = templateComment;
            testUser.events[0].comments[1] = templateComment2;
            const eventID = testUser.events[0]._id;
            const commentID = '14141414';

            testUser.save().then(() => {
                request(app)
                    .delete('/api/event/deleteComment/' + eventID + '/' + commentID)
                    .set('x-auth', testUser.tokens[0].token)
                    .end((err, res) => {
                        assert(res.body.error === 'comment not found in given eventID');
                        done();
                    });
            });
        });

        it('should not find find event within User', (done) => {
            const testUser = new User(templateUser);
            testUser.events = [templateEvent];
            testUser.events[0].comments[0] = templateComment;
            testUser.events[0].comments[1] = templateComment2;
            const eventID = '131313';
            const commentID = testUser.events[0].comments[0]._id;

            testUser.save().then(() => {
                request(app)
                    .delete('/api/event/deleteComment/' + eventID + '/' + commentID)
                    .set('x-auth', testUser.tokens[0].token)
                    .end((err, res) => {
                        assert(res.body.error === 'event not found');
                        done();
                    });
            });
        });

        it('should delete anything while user not logged in', (done) => {
            const testUser = new User(templateUser);
            testUser.events = [templateEvent];
            testUser.events[0].comments[0] = templateComment;
            testUser.events[0].comments[1] = templateComment2;
            const eventID = testUser.events[0]._id;
            const commentID = testUser.events[0].comments[0]._id;

            testUser.save().then(() => {
                request(app)
                    .delete('/api/event/deleteComment/' + eventID + '/' + commentID)
                    // .set('x-auth', testUser.tokens[0].token)
                    .end((err, res) => {
                        assert(res.body.error === 'you need to be logged in to continue');
                        done();
                    });
            });
        });

    });

});
