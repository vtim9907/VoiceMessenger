// external modules
var md5 = require("blueimp-md5");
var Sequelize = require("sequelize");
var scrypt = require('scrypt');

//core
var logger = require("../logger.js");
var letterAvatars = require('../letter-avatars.js');

module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        profileid: {
            type: DataTypes.STRING,
            unique: true
        },
        profile: {
            type: DataTypes.TEXT
        },
        accessToken: {
            type: DataTypes.STRING
        },
        refreshToken: {
            type: DataTypes.STRING
        },
        nickname: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        email: {
            type: Sequelize.TEXT,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: Sequelize.TEXT,
            set: function (value) {
                var hash = scrypt.kdfSync(value, scrypt.paramsSync(0.1)).toString("hex");
                this.setDataValue('password', hash);
            }
        },
        card1: {
            type: DataTypes.UUID,
            defaultValue: null
        },
        card2: {
            type: DataTypes.UUID,
            defaultValue: null
        }
    });

    User.getProfile = function (user) {
        return user.profile ? User.parseProfile(user.profile) : (user.email ? User.parseProfileByEmail(user.email) : null);
    };

    User.parseProfile = function (profile) {
        try {
            var profile = JSON.parse(profile);
        } catch (err) {
            logger.error(err);
            profile = null;
        }
        if (profile) {
            profile = {
                name: profile.displayName || profile.username,
                photo: User.parsePhotoByProfile(profile),
                biggerphoto: User.parsePhotoByProfile(profile, true)
            }
        }
        return profile;
    };

    User.parseProfileByEmail = function (email) {
        var photoUrl = 'https://www.gravatar.com/avatar/' + md5(email);
        return {
            name: email.substring(0, email.lastIndexOf("@")),
            photo: photoUrl += '?s=96',
            biggerphoto: photoUrl += '?s=400'
        };
    };

    User.prototype.verifyPassword = function (attempt) {
        if (scrypt.verifyKdfSync(new Buffer(this.password, "hex"), attempt)) {
            return this;
        } else {
            return false;
        }
    }
    
    return User;
}