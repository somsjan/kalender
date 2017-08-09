const mongoose = require('mongoose');
const Schema = mongoose.Schema;
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
         testUser01.save().then(() => done());
    });
});
