//auth

//external modules
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var validator = require('validator');

//core
var config = require('./config.js');
var logger = require("./logger.js");
var models = require("./models");

function callback(accessToken, refreshToken, profile, done) {
    //logger.info(profile.displayName || profile.username);
    var stringifiedProfile = JSON.stringify(profile);
    models.User.findOrCreate({
        where: {
            profileid: profile.id.toString()
        },
        defaults: {
            profile: stringifiedProfile,
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    }).spread(function (user, created) {
        if (user) {
            var needSave = false;
            if (user.profile != stringifiedProfile) {
                user.profile = stringifiedProfile;
                needSave = true;
            }
            if (user.accessToken != accessToken) {
                user.accessToken = accessToken;
                needSave = true;
            }
            if (user.refreshToken != refreshToken) {
                user.refreshToken = refreshToken;
                needSave = true;
            }
            if (needSave) {
                user.save().then(function () {
                    if (config.debug)
                        logger.info('user login: ' + user.id);
                    return done(null, user);
                });
            } else {
                if (config.debug)
                    logger.info('user login: ' + user.id);
                return done(null, user);
            }
        }
    }).catch(function (err) {
        logger.error('auth callback failed: ' + err);
        return done(err, null);
    });
}

// email
if (config.email) {
    passport.use(new LocalStrategy({
        usernameField: 'email'
    },
    function(email, password, done) {
        if (!validator.isEmail(email)) return done(null, false);
        models.User.findOne({
            where: {
                email: email,
            }
        }).then(function (user) {
            if (!user) return done(null, false);
            if (!user.verifyPassword(password)) return done(null, false);
            console.log('auth success');
            return done(null, user);
        }).catch(function (err) {
            logger.error(err);
            return done(err);
        });
    }));
}