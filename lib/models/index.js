var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(module.filename);
var env = 'development';
var config = require('../config');

var dbconfig = config.db;
var db = {};

var sequelize = new Sequelize(dbconfig.database, dbconfig.username, dbconfig.password, dbconfig.options);

fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file !== basename) && (file.slice(-8) === 'model.js');
    })
    .forEach(function (file) {
        console.info(file);
        var model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;