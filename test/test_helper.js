const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const User = require('./../models/user');

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

    const testUser01 = new User({
        email: "test01@test.nl",
        password: "wachtwoord",
        events: {
            title: "Test event",
            time: "12:45",
            location: {
                name: "Belgie",
                coordinates: {
                    lat: 1234,
                    lng: 4321
                }
            }
        }
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
