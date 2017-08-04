const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./../models/user');

const app = require('../app');

// beforeEach((done) => {
//     User.re({}).then(() => {
//         done()
//     }).catch((e) => console.log(e));
// });

describe('GET /api Routing test', () => {
    it('GET /api should return list of users', (done) => {
        request(app)
            .get('/api')
            .end((err, res) => {
                assert(res.body[0]);
                done();
            });
    });

});

describe('Register new user', () => {
    it('should register a new user', (done) => {
        const testUser = new User({email: "test@gmail.com", password: "jezus"});
        request(app)
            .post('/api')
            .send( testUser )
            .end((err, res) => {
                if(err) console.log(err);

                // console.log('bodyid: ', res.body);
                // console.log('userId: ', testUser);
                // assert(res.body.password === "jezus");
                done();
            });
    });

    // xit('should register a new user', (done) => {
    //
    // });

});
