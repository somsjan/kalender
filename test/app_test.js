const expect = require('expect');
const request = require('supertest');
const bcrypt = require('bcryptjs');

const {mongoose} = require('./../db/mongoose');
const ObjectId =  mongoose.Types.ObjectId;
const {User} = require('./../models/userSchema');


var {app} = require('./../app');

const populateUsers = async () => {
    var user = {
        _id: new ObjectId,
        username: 'Christus',
        password: '$2a$10$oxbupDNBRIy/6hTFK3YJ0eUvVMr7BRpOf1FeTTgUOUdFigebpKuyq',
        passwordCheck: '$2a$10$oxbupDNBRIy/6hTFK3YJ0eUvVMr7BRpOf1FeTTgUOUdFigebpKuyq',
    };

    await User.remove({});
    new User(user).save();
};


beforeEach(populateUsers);

describe('POST /login', () => {
    it('should login user', (done) => {
        var username = 'Christus';
        var password = 'Jezus';

        request(app)
        .post('/login')
        .send({username, password})
        .expect(302) //FOUND (URI)
        .expect((res) =>{
            expect(res.text).toExist();
        })
        .end((err) => {
            if (err){
                return done(err);
            } else {
                done();
            }
        });
    });

    it('should deny faulty login credentials', (done) => {
        var username = 'kut';
        var password = 'Jezus';

        request(app)
        .post('/login')
        .send({username, password})
        .expect(302)
        .expect((res) =>{
            expect(res.text).toExist();
            // console.log(res);
        })
        .end((err) => {
            if (err){
                return done(err);
            } else {
                done();
            }
        });
    });

});

describe('POST /register', () => {
    it('should register a new user', (done) => {
        var username = 'andereUser';
        var password = 'wachtwoord';
        var passwordCheck = 'wachtwoord';

        request(app)
        .post('/registration')
        .send({username, password, passwordCheck})
        .expect(200)
        .end((err) => {
            if (err){
                return done(err);
            } else {
                User.findOne({username}).then((user) => {
                    expect(user).toExist();
                    bcrypt.compare(password, user.password, function(err, res) {
                        expect(res).toBe(true);
                        return done();
                    });
                }).catch((e) => {
                    return done(e);
                });
            }
        });
    });

    it('should deny faulty user to register', (done) => {
        var username = 'andereUser';
        var password = 'wac';
        var passwordCheck = 'wach';

        request(app)
        .post('/registration')
        .send({username, password, passwordCheck})
        .expect(400)
        .end((err) => {
            if (err) {
                return done(err);
            } else {
                User.findOne({username}).then((user) => {
                    expect(user).toNotExist();
                    return done();
                }).catch((e) => {
                    return done(e);
                });
            }
        })
    });

});
