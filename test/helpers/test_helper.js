const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const User = require('./../../app/models/user');

before((done) => {
    mongoose.connect('mongodb://localhost/kalender_test');
    mongoose.connection
        .once('open', () => {
            console.log('Running test server');
             done();
         })
        .on('error', err => {
            console.warn('Warning', err);
        });
});

beforeEach((done) => {
    //testUser01 is saved before each test
    const testUser01 = new User({
        _id: new ObjectId('012345678910111213146666'),
        email: "test01@test.nl",
        password: "wachtwoord",
        events: [{
            _id: new ObjectId('012345678910111213141516'),
            title: "FIRST Test helper event",
            description: 'First test helper description',
            date: '2020-03-12T14:45',
            location: "Vlaanderen",
            attendingUsers: [
                {
                    userID: '000345678910111213146666'
                },{
                    userID: '000345678910111213142222'
                }
            ],
            coordinatesLocation: {
                    lat: 1234,
                    lng: 4321
                }
            },
            {
                _id: new ObjectId('012345678910111213141599'),
                title: "SECOND Test helper event",
                description: 'Second test helper description',
                date: '2020-03-12T14:45',
                location: "Andere plek",
                coordinatesLocation: {
                        lat: 1234,
                        lng: 4321
                    },
                comments: [{
                    _id: new ObjectId('012345678910111213188899'),
                    userID: new ObjectId('012345678910111213146666'),
                    comment: 'Comment on second test helper'
                }]
            }]
    });

    User.remove({}).then(() => {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(testUser01.password, salt, function(err, hash) {
                testUser01.password = hash;
                testUser01.save().then(() => done());
            });
        });
    });
});
