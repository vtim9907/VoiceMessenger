module.exports = function (sequelize, DataTypes) {
    var Post = sequelize.define('Post', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        title: {
            type: DataTypes.STRING
        },
        content: { 
            type: DataTypes.STRING
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