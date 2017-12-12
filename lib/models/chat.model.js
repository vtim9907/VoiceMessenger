var Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
    var Chat = sequelize.define('Chat', {
        fromId: {
            type: Sequelize.UUID,
            //primaryKey: true
        },
        toId: {
            type: Sequelize.UUID,
            //primaryKey: true
        },
        content: {
            type: Sequelize.STRING,
        },
        time: {
            type: Sequelize.DATE
        }
    }, {
            charset: 'utf8',
            collate: 'utf8_unicode_ci',
            freezeTableName: true,
            timestamps: true,
            getterMethods: {
            },
            setterMethods: {
            }
        });

    return Chat;
}