module.exports = function (sequelize, DataTypes) {
    var Friendship = sequelize.define('Friendship', {
        UserId: { 
            type: DataTypes.UUID, 
            primaryKey: true, 
        },
        FriendId: { 
            type: DataTypes.UUID, 
            primaryKey: true,
        }
    });

    return Friendship;
}