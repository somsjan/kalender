const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const dateTime = require('date-time');

const User = require('./../models/user');

const app = require('../app');

beforeEach(() => {
    templateUser = JSON.parse(JSON.stringify( require('./templates/test_templates').templateUser));
    templateEvent = JSON.parse(JSON.stringify( require('./templates/test_templates').templateEvent));
});


describe('EVENT route tests', () => {

    describe('GET /api/event', () => {
        it('should return a list of users with events', (done) => {
            request(app)
                .get('/api/event/')
                .end((err, res) => {
                    assert(res.body[0].events);
                    done();
                });
        });
    });

    describe('GET /api/event/:eventID', () => {
        it('should return an event', (done) => {
            const eventID = '012345678910111213141516';
            request(app)
                .get('/api/event/' + eventID)
                .end((err, res) => {
                    assert(res.body._id === eventID);
                    done();
                });
        });
        it('should fail and return error', (done) => {
            const eventID = 'nonExistingID';
            request(app)
                .get('/api/event/' + eventID)
                .end((err, res) => {
                    assert(res.body.error === 'event not found');
                    done();
                });
        });
    });

    describe('PUT /api/event/add', () => {
        it('should push new event to user', (done) => {
            const testUser = new User (templateUser);
            testEvent = templateEvent;

            testUser.save().then(() => {
                request(app)
                    .put('/api/event/add/')
                    .set('x-auth', testUser.tokens[0].token)
                    .send(testEvent)
                    .end((err, res) => {
                        assert(res.body.events[0].title === "Test event");
                        assert(res.status === 200);
                        done();
                    });
            });
        });

        it('should deny event if not logged in', (done) => {
            const testUser = new User (templateUser);
            testEvent = templateEvent;

            testUser.save().then(() => {
                request(app)
                    .put('/api/event/add/')
                    // .set('x-auth', 'undefined')
                    .send(testEvent)
                    .end((err, res) => {
                        assert(res.body.error === 'you need to be logged in to continue');
                        assert(res.status === 401);
                        done();
                    });
            });
        });

        it('should deny event without a title', (done) => {
            const testUser = new User (templateUser);
            testEvent = templateEvent;
            testEvent.title = undefined;
            testUser.save().then(() => {
                request(app)
                    .put('/api/event/add/')
                    .set('x-auth', testUser.tokens[0].token)
                    .send(testEvent)
                    .end((err, res) => {
                        assert(res.body.error === 'missing event information');
                        assert(res.status === 422);
                        done();
                    });
            });
        });

        it('should deny event without a date', (done) => {
            const testUser = new User (templateUser);
            testEvent = templateEvent;
            testEvent.date = undefined;
            testUser.save().then(() => {
                request(app)
                    .put('/api/event/add/')
                    .set('x-auth', testUser.tokens[0].token)
                    .send(testEvent)
                    .end((err, res) => {
                        assert(res.body.error === 'missing event information');
                        assert(res.status === 422);
                        done();
                    });
            });
        });

        it('should deny event without a location', (done) => {
            const testUser = new User (templateUser);
            testEvent = templateEvent;
            testEvent.location = undefined;
            testUser.save().then(() => {
                request(app)
                    .put('/api/event/add/')
                    .set('x-auth', testUser.tokens[0].token)
                    .send(testEvent)
                    .end((err, res) => {
                        assert(res.body.error === 'missing event information');
                        assert(res.status === 422);
                        done();
                    });
            });
        });

        it('should deny old date event', (done) => {
            const testUser = new User (templateUser);
            testEvent = templateEvent;
            testEvent.date = (1980,24,04);
            testUser.save().then(() => {
                request(app)
                    .put('/api/event/add/')
                    .set('x-auth', testUser.tokens[0].token)
                    .send(testEvent)
                    .end((err, res) => {
                        assert(res.body.error === 'date has already passed');
                        assert(res.status === 422);
                        done();
                    });
            });
        });
    });

    describe('DELETE /api/event/delete/:eventID', () => {
        it('should delete event by eventID', (done) => {
            const testUser = new User (templateUser);
            testEvent = templateEvent;
            testUser.events = testEvent;
            testUser.save().then(() => {
                request(app)
                    .delete('/api/event/delete/' + testEvent._id)
                    .set('x-auth', testUser.tokens[0].token)
                    .end((err, res) => {
                        User.findById(testUser._id)
                            .then((userWithEvent) => {
                                assert(userWithEvent.events.length === 0);
                                assert(res.body._id == testUser._id);
                                done();
                            });
                    });
            });
        });
        it('should NOT delete if not logged in', (done) => {
            const testUser = new User (templateUser);
            testEvent = templateEvent;
            testUser.events = testEvent;
            testUser.save().then(() => {
                request(app)
                    .delete('/api/event/delete/' + testEvent._id)
                    // .set('x-auth', testUser.tokens[0].token)
                    .end((err, res) => {
                        assert(res.body.error === 'you need to be logged in to continue');
                        done();
                    });
            });
        });
        it('should NOT delete event with wrong ID', (done) => {
            const testUser = new User (templateUser);
            testEvent = templateEvent;
            testUser.events = testEvent;
            testUser.save().then(() => {
                request(app)
                    .delete('/api/event/delete/' + '012345678910111213141516')
                    .set('x-auth', testUser.tokens[0].token)
                    .end((err, res) => {
                        assert(res.body.events.length === 1);
                        assert(res.body.events[0]._id == testUser.events[0]._id);
                        done();
                    });
            });
        });
    });

    describe('PUT /api/event/update', () => {
        it('should update event by eventID', (done) => {
            const testUser = new User (templateUser);
            testEvent = templateEvent;
            testUser.events = testEvent;
            const updateObject = {
                title: 'nieuwe titel',
                description: 'De descriptione',
                date: '2018,09,24',
                time: '14:45',
                location: 'Vlaanderen',
                coordinatesLocation: {
                    lat: 15,
                    lng: 16
                }
            };
            testUser.save().then(() => {
                request(app)
                    .put('/api/event/update/' + testEvent._id)
                    .set('x-auth', testUser.tokens[0].token)
                    .send(updateObject)
                    .end((err, res) => {
                        const resObj = res.body.events[0];
                        assert(resObj.title === updateObject.title);
                        assert(resObj.description === updateObject.description);
                        assert(resObj.date === '2018-09-23T22:00:00.000Z');
                        assert(resObj.time === updateObject.time);
                        assert(resObj.location === updateObject.location);
                        assert(resObj.coordinatesLocation.lat === updateObject.coordinatesLocation.lat);
                        assert(resObj.coordinatesLocation.lng === updateObject.coordinatesLocation.lng);
                        done();
                    });
            });
        });
    });

    describe.only('PUT /api/event/attending/:eventID', () => {

        it('should attend by putting userID in attendingUsers array', (done) => {
            const testUser = new User (templateUser);
            const testEventID = '012345678910111213141516';

            testUser.save().then(() => {
                request(app)
                    .put('/api/event/attending/' + testEventID)
                    .set('x-auth', testUser.tokens[0].token)
                    .end((err, res) => {
                        assert(res.body.events[0]._id === testEventID);
                        assert(res.body.events[0].attendingUsers[0].userID == testUser._id);
                        assert(res.body.events[0].attendingUsers.length === 1);
                        done();
                    });
            });
        });
    });

});
