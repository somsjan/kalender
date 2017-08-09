const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./../models/user');

const app = require('../app');


describe('GET /api/event', () => {
    it('should return a list of users with events', (done) => {
        request(app)
            .get('/api/event')
            .end((err, res) => {
                assert(res.body[0].events);
                done();
            });
    });
});

describe('PUT /api/event/:ID', () => {
    it('should push new event to user', (done) => {
        const testUser = new User({
            email: "tester@test.nl",
            password: "wachtwoord",
        });

        testUser.save().then(() => {
            request(app)
                .put('/api/event/' + testUser._id )
                .send({
                    title: "Test event",
                    time: "12:45",
                    location: {
                        name: "Belgie",
                        coordinates: {
                            lat: 1234,
                            lng: 4321
                        }
                    }
                })
                .end((err, res) => {
                    assert(res.body.events[0].title === "Test event");
                    done();
                });
        });
    });
    it('should deny faulty event data', (done) => {
        const testUser = new User({
            email: "tester@test.nl",
            password: "wachtwoord",
        });

        testUser.save().then(() => {
            request(app)
                .put('/api/event/' + testUser._id )
                .send({
                    title: undefined,
                    time: "12:45",
                    location: {
                        name: "Belgie",
                        coordinates: {
                            lat: 1234,
                            lng: 4321
                        }
                    }
                })
                .end((err, res) => {
                    assert(res.error.status === 422);
                    done();
                });
        });
    });
});
