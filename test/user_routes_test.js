const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./../models/user');

const app = require('../app');

describe('GET /api/user', () => {
    it('should return list of users', (done) => {
        request(app)
            .get('/api/user')
            .end((err, res) => {
                assert(res.body[0]);
                done();
            });
    });
});

describe('GET /api/user/:ID', () => {
    xit('should return an existing user', (done) => {
        const testUser = new User({email: "test@test.nl", password: "wachtwoord"});
        testUser.save().then(() => {
            request(app)
                .get('/api/user/' + testUser._id)
                .end((err, res) => {
                    assert(res.body._id == testUser._id);
                    assert(res.body.email === testUser.email);
                    done();
                });
        });
    });
    xit('should NOT return a user', (done) => {
        request(app)
            .get('/api/user/' + 1122)
            .end((err, res) => {
                assert(res.body.error);
                done();
            });
    });
});

describe('POST /api/login, login a user', () => {
    it('should login user', (done) => {
        const testUser = new User({
            email: "test@test.nl",
            password: "$2a$10$F8Ukp2dwzJKvXwWa0CLRp.1kn4x/cy4Rrwo2RxTp94A4j8eyL1HFa"
        });
        //password === "tester"

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
});

describe('POST /api/register, register a new user', () => {
    it('should register a new user', (done) => {
        const testUser = new User({email: "test@gmail.com", password: "jezus"});
        request(app)
            .post('/api/register')
            .send( testUser )
            .end((err, res) => {
                User.findById(testUser._id)
                    .then((user) => done());
            });
    });
    it('deny duplicate email adresses', (done) => {
        const testUser = new User({email: "test01@test.nl", password: "jezus"});
        request(app)
            .post('/api/register')
            .send( testUser )
            .end((err, res) => {
                assert(res.status === 422);
                assert(res.error);
                done();
            });
    });
    it('deny faulty email', (done) => {
        const testUser = new User({email: "1212", password: "jezus"});
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
        const testUser = new User({email: undefined, password: "jezus"});
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
        const testUser = new User({email: "email@test.nl", password: undefined});
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

describe('PUT /api/user/ID', () => {
    it('should update user info', (done) => {
        const oldUserInfo = new User({email: 'old@email.com', password: 'oldPassword'});
        oldUserInfo.save().then(() => {
            request(app)
                .put('/api/user/' + oldUserInfo._id)
                .send( {email: 'new@email.com', password: 'newPassword'} )
                .end((err, res) => {
                    User.findById(oldUserInfo._id)
                        .then((user) => {
                            assert(user.email === 'new@email.com');
                            assert(user.password === 'newPassword');
                            done();
                        });
                });
        }).catch((e) => console.log(e));
    });
});

describe('DELETE /api/user/:ID', () => {
    it('should delete a user from the DB', (done) => {
        const deleteUser = new User({email: 'delete@email.com', password: 'delete'});
        deleteUser.save().then(() => {
            request(app)
                .delete('/api/user/' + deleteUser._id)
                .end((err, res) => {
                    assert(res.status === 200);
                    assert(!res.error);
                    done();
                });
        });
    });
    it('should NOT find and delete a user from the DB', (done) => {
        request(app)
            .delete('/api/user/' + 020202)
            .end((err, res) => {
                assert(res.status === 422);
                assert(res.error);
                done();
            });
    });
});
