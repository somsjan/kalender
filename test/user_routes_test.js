const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('./../models/user');

//load template
const templateUser = require('./helpers/test_templates').templateUser;

const app = require('../app');


describe('USER route tests', () => {
    describe('GET /api/user', () => {
        it('should return list of users', (done) => {
            const testUser = new User (templateUser);
            testUser.email = 'anderemail@email.nl';
            testUser.save().then(() => {
                request(app)
                    .get('/api/users/all')
                    .end((err, res) => {
                        assert(res.body[0]);
                        done();
                    });
            });
        });
    });

    describe('GET /api/user/me', () => {
        it('should return logged-in user', (done) => {
            const testUser = new User (templateUser);
            testUser.save().then(() => {
                request(app)
                    .get('/api/user/me')
                    .set('x-auth', testUser.tokens[0].token)
                    .end((err, res) => {
                        assert(res.body._id == testUser._id);
                        assert(res.body.email === testUser.email);
                        done();
                    });
            });
        });
        it('should NOT return a user', (done) => {
            request(app)
                .get('/api/user/me')
                .end((err, res) => {
                    assert(res.status === 401);
                    assert(res.error);
                    done();
                });
        });
    });

    describe('GET /api/user/:userID', () => {
        it('should return logged-in user', (done) => {
            const userID = '012345678910111213146666';
            request(app)
                .get('/api/user/' + userID)
                .end((err, res) => {
                    assert(res.body._id == userID);
                    assert(!res.body.password);
                    done();
                });
        });

        it('should NOT find a user', (done) => {
            //non existing user with userID
            const userID = '012345678910111213142222';
            request(app)
                .get('/api/user/' + userID)
                .end((err, res) => {
                    assert(res.body.error === 'user not found');
                    done();
                });
        });
    });

    describe('POST /api/login, login a user', () => {
        it('should login user', (done) => {
            const testUser = new User (templateUser);

            testUser.save().then(() => {
                request(app)
                    .post('/api/login')
                    .send({
                        email: "test@test.nl",
                        password: "tester"
                    })
                    .end((err, res) => {
                        assert(res.status == 200);
                        assert(res.body.email === "test@test.nl");
                        done();
                    });
            });
        });

        it('should deny faulty login info', (done) => {
            const testUser = new User (templateUser);

            testUser.save().then(() => {
                request(app)
                    .post('/api/login')
                    .send({
                        email: "test@test.nl",
                        password: "wrongPassword"
                    })
                    .end((err, res) => {
                        assert(res.status == 401);
                        done();
                    });
            });
        });
    });

    describe('DELETE /api/logout, logout user', () => {
        it('should logout user and remove token', (done) => {
            const testUser = new User (templateUser);
            testUser.save().then(() => {
                request(app)
                    .delete('/api/logout')
                    .set('x-auth', testUser.tokens[0].token)
                    .end((err, res) => {
                        assert(res.body.message === 'logged out');
                        done();
                    });
            });

        });

    });

    describe('POST /api/register, register a new user', () => {
        it('should register a new user', (done) => {
            const testUser = new User (templateUser);
            request(app)
                .post('/api/register')
                .send( testUser )
                .end((err, res) => {
                    User.findById(testUser._id)
                        .then((user) => done());
                });
        });
        it('should deny duplicate email adresses', (done) => {
            const testUser = new User (templateUser);
            testUser.email = 'test01@test.nl';

            request(app)
                .post('/api/register')
                .send( testUser )
                .end((err, res) => {
                    assert(res.status === 422);
                    assert(res.body.error);
                    done();
                });
        });
        it('should deny faulty email', (done) => {
            const testUser = new User (templateUser);
            testUser.email = '1313';

            request(app)
                .post('/api/register')
                .send( testUser )
                .end((err, res) => {
                    assert(res.status === 422);
                    assert(res.error);
                    done();
                });
        });
        it('deny missing email', (done) => {
            const testUser = new User (templateUser);
            testUser.email = undefined;

            request(app)
                .post('/api/register')
                .send( testUser )
                .end((err, res) => {
                    assert(res.status === 422);
                    assert(res.error);
                    done();
                });
        });
        it('deny missing password', (done) => {
            const testUser = new User (templateUser);
            testUser.password = undefined;
            request(app)
                .post('/api/register')
                .send( testUser )
                .end((err, res) => {
                    assert(res.status === 422);
                    assert(res.error);
                    done();
                });
        });
    });

    describe('PUT /api/user/update', () => {
        it('should update users email', (done) => {
            const testUser = new User (templateUser);
            testUser.save().then(() => {
                request(app)
                    .put('/api/user/update')
                    .set('x-auth', testUser.tokens[0].token)
                    .send( {email: "new@email.com"} )
                    .end((err, res) => {
                        User.findById(testUser._id)
                            .then((user) => {
                                assert(user.email === 'new@email.com');
                                done();
                            });
                    });
            });
        });
        it('should update and hash users password', (done) => {
            const testUser = new User (templateUser);
            testUser.save().then(() => {
                request(app)
                    .put('/api/user/update')
                    .set('x-auth', testUser.tokens[0].token)
                    .send( {password: "ietsAnders"} )
                    .end((err, res) => {
                        bcrypt.compare('ietsAnders', res.body.password, (err, result) => {
                            assert(result);
                            done();
                        });
                    });
            });
        });
        it('should update email and password', (done) => {
            const testUser = new User (templateUser);
            const newInfo = {
                email: 'ander@email.com',
                password: 'ietsAnders'
            }
            testUser.save().then(() => {
                request(app)
                    .put('/api/user/update')
                    .set('x-auth', testUser.tokens[0].token)
                    .send( newInfo )
                    .end((err, res) => {
                        bcrypt.compare( newInfo.password, res.body.password, (err, result) => {
                            assert(result);
                            assert(res.body.email === newInfo.email);
                            done();
                        });
                    });
            });
        });

        it('should deny update if not logged in', (done) => {
            const testUser = new User (templateUser);
            testUser.save().then(() => {
                request(app)
                    .put('/api/user/update')
                    // .set('x-auth', testUser.tokens[0].token)
                    .send( {email: "new@email.com"} )
                    .end((err, res) => {
                        assert(res.error);
                        assert(res.status == 401);
                        done();
                    });
            });
        });
    });

    describe('DELETE /api/user/delete', () => {
        it('should delete a user from the DB', (done) => {
            const testUser = new User (templateUser);
            testUser.save().then(() => {
                request(app)
                    .delete('/api/user/delete')
                    .set('x-auth', testUser.tokens[0].token)
                    .end((err, res) => {
                        User.findById(testUser._id)
                            .then((deletedUser) => {
                                assert(!deletedUser);
                                assert(res.status === 200);
                                done();
                            });
                    });
            });
        });
        it('should NOT find and delete a user from the DB', (done) => {
            request(app)
                .delete('/api/user/delete')
                // .set('x-auth', null)
                .end((err, res) => {
                    assert(res.status === 401);
                    assert(res.error);
                    done();
                });
        });
    });
});
