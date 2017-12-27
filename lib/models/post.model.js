module.exports = function (sequelize, DataTypes) {
    var Post = sequelize.define('Post', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        title: {
            type: DataTypes.STRING,
            defaultValue: ""
        },
        who: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: { 
            type: DataTypes.STRING,
            allowNull: false
        },
        likes: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        liker: {
            type: DataTypes.STRING,
            defaultValue: ""
        }
    }, {
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
    });

    return Post;
}