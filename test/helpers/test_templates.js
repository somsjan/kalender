
const jwt = require('jsonwebtoken');
const {ObjectId} = require('mongodb');

const token_key = process.env.TOKEN_KEY;

const testUserId = new ObjectId();

const templateUser = {
    _id: testUserId,
    email: "test@test.nl",
    password: "$2a$10$F8Ukp2dwzJKvXwWa0CLRp.1kn4x/cy4Rrwo2RxTp94A4j8eyL1HFa",
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: testUserId, access: 'auth'}, token_key).toString()
    }]
};

const templateEvent = {
    _id: new ObjectId(),
    title: "Test event",
    time: "15:41",
    date: '2022,09,12',
    location: "Belgie",
    coordinatesLocation: {
        lat: 1234,
        lng: 4321
    }
};

const templateComment = {
    _id: new ObjectId(),
    userID: testUserId,
    comment: "comment test text"
};

const templateComment2 = {
    _id: new ObjectId(),
    userID: testUserId,
    comment: "second comment test text"
};

module.exports = { templateUser, templateEvent, templateComment, templateComment2};
