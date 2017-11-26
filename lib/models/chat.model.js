var Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
    var Chat = sequelize.define('Chat', {
        fromId: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        toId: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        content: {
            type: Sequelize.STRING,
        }
    }, {
            freezeTableName: true,
            timestamps: true,
            getterMethods: {
            },
            setterMethods: {
            }
        });
    
    return Chat;
}