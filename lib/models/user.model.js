var Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define('User', {
        nick: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        account: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: Sequelize.STRING,
            // set: function (val) {
            //     hmac.update(val);
            //     this.setDataValue('password', hmac.digest('hex'));
            // }
        },
        firstname: {
            type: Sequelize.STRING,
            field: 'first_name',
            validate: {
                len: {
                    args: [2, 10],
                    msg: "length of firstname is not allowed"
                }
            },
            get: function () {
                return this.getDataValue('firstname').toUpperCase();
            },
        },
        lastname: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: true
            }
        }
    }, {
            freezeTableName: true,
            timestamps: false,
            getterMethods: {
                fullName: function () { return this.firstname + ' ' + this.lastname }
            },
            setterMethods: {
                fullName: function (value) {
                    var names = value.split(' ');
                    this.setDataValue('firstname', names.slice(0, -1).join(' '));
                    this.setDataValue('lastname', names.slice(-1).join(' '));
                },
            }
        });
    
    return User;
}