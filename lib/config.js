//config

//external modules
var fs = require('fs');
var path = require('path');

// configs
var env = process.env.NODE_ENV || 'development';
var config = require(path.join(__dirname, '..', 'config.json'))[env];
var debug = process.env.DEBUG ? (process.env.DEBUG === 'true') : ((typeof config.debug === 'boolean') ? config.debug : (env === 'development'));

//db
var db = config.db || {};

// ssl path
var sslkeypath = config.sslkeypath || '';
var sslcertpath = config.sslcertpath || '';
var sslcapath = config.sslcapath || '';

//session
var sessionname = config.sessionname || 'connect.sid';
var sessionsecret = config.sessionsecret || 'secret';
var sessionlife = config.sessionlife || 14 * 24 * 60 * 60 * 1000; //14 days

//url
var port = process.env.PORT || config.port || 9907;

var usessl = !!config.usessl;

var email = !!config.email;
var allowemailregister = (typeof config.allowemailregister === 'boolean') ? config.allowemailregister : true;

module.exports = {
    db: db,
    sslkeypath: sslkeypath,
    sslcertpath: sslcertpath,
    sslcapath: sslcapath,
    sessionname: sessionname,
    sessionsecret: sessionsecret,
    sessionlife: sessionlife,
    port: port,
    usessl: usessl,
    email: email,
    allowemailregister: allowemailregister
};