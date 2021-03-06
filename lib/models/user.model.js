// external modules
var md5 = require("blueimp-md5");
var Sequelize = require("sequelize");
var scrypt = require('scrypt');
var fs = require('fs');

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
        accessToken: {
            type: DataTypes.STRING
        },
        refreshToken: {
            type: DataTypes.STRING
        },
        nickname: {
            type: Sequelize.STRING,
        },
        gender: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        age: {
            type: DataTypes.INTEGER,
            defaultValue: 0
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
        voicePath: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        photoPath: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        card1: {
            type: DataTypes.UUID,
            defaultValue: null
        },
        card2: {
            type: DataTypes.UUID,
            defaultValue: null
        }
    }, {
            charset: 'utf8',
            collate: 'utf8_unicode_ci'
    });
    
    User.associate = function (models) {
        User.belongsToMany(models.User, {
            as: "Friend",
            through: 'Friendship',
            constraints: false
        })
    }

    User.prototype.verifyPassword = function (attempt) {
        if (scrypt.verifyKdfSync(new Buffer(this.password, "hex"), attempt)) {
            return this;
        } else {
            return false;
        }
    }

    User.prototype.createOrModifyVoicePath = function (newVoicePath) {
        try {
            if (this.voicePath) {
                try {
                    fs.unlink(__dirname + "/../.." + this.voicePath);
                } catch (err) {
                    logger.error(err);
                    return false;
                }
            }
            this.update({
                voicePath: '/mp3/' + newVoicePath
            }).then(function (result) {
                console.log("update mp3 successfully");
            }).catch(function (err) {
                logger.error(err);
                return false;
            });
            return this;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    User.prototype.createOrModifyPhotoPath = function (newPhotoPath) {
        try {
            if (this.photoPath) {
                try {
                    fs.unlink(__dirname + "/../.." + this.photoPath);
                } catch (err) {
                    logger.error(err);
                    return false;
                }
            }
            this.update({
                photoPath: '/photo/' + newPhotoPath
            }).then(function (result) {
                console.log("update photo successfully");
            }).catch(function (err) {
                logger.error(err);
                return false;
            });
            return this;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    return User;
}