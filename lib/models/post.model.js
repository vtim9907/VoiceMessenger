module.exports = function (sequelize, DataTypes) {
    var Post = sequelize.define('Post', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        content: { 
            type: DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
    });

    Post.associate = function (models) {
        Post.belongsTo(models.User, {
            as: "author"
        });

        Post.belongsToMany(models.User, {
            through: 'Likers'
        });
    };

    return Post;
}