//app

//external modules
var express = require('express');
var fs = require('fs');
var path = require('path');
var helmet = require('helmet');
var passport = require('passport');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var Vue = require('vue').default;
var multer = require('multer');
var flash = flash = require('connect-flash');
var expressVue = require('express-vue');


//core
var models = require('./lib/models');
var register = require('./lib/register');
var config = require('./lib/config');
var logger = require('./lib/logger')

//server setup
if (config.usessl) {
    var options = {
		ca: fs.readFileSync(config.sslcapath, 'utf8'),
		key: fs.readFileSync(config.sslkeypath, 'utf8'),
		cert: fs.readFileSync(config.sslcertpath, 'utf8'),
        requestCert: false,
        rejectUnauthorized: false
    };
    var app = express();
    var server = require('https').createServer(options, app);
} else {
    var app = express();
    var server = require('http').createServer(app);
}

//logger
app.use(morgan('combined', {
    "stream": logger.stream
}));

//json parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//session store
var sessionStore = new SequelizeStore({
    db: models.sequelize
});

//compression
app.use(compression());

//for security
app.use(helmet());

app.use(cookieParser());

//route without 'html' extension
app.use(express.static(path.join(__dirname, 'public'), { index: false, extensions: ['html'] }));

//session
app.use(session({
	secret: config.sessionsecret,
	store: sessionStore,
	resave: false, //don't save session if unmodified
	saveUninitialized: true, //always create session to ensure the origin
	rolling: true, // reset maxAge on every response
	cookie: {
		maxAge: config.sessionlife
	}
}));

app.use(flash());

//express Vue
var vueOptions = {
    rootPath: path.join(__dirname,  'public', 'views'),
    layout: {
        start: '<div id="app">',
        end: '</div>'
    }
};
var expressVueMiddleware = expressVue.init(vueOptions);
app.use(expressVueMiddleware);

//passport ****(future feature)****
// app.use(passport.initialize());
// app.use(passport.session());

// check uri is valid before going further
app.use(function(req, res, next) {
    try {
        decodeURIComponent(req.path);
    } catch (err) {
        logger.error(err);
        return response.errorBadRequest(res);
    }
    next();
});

app.post('/register', register.registerAuth, function (req, res, next) {
	models.User.findOrCreate({
		where: {
			account: req.body.account
		},
		defaults: {
			nick: req.body.nick,
			password: req.body.password,
			firstname: req.body.firstname,
			lastname: req.body.lastname
		}
	}).spread(function (user, created) {
		if (user) {
			if (created) {
				if (config.debug) logger.info('user registered: ' + user.id);
				req.flash('info', "You've successfully registered, please signin.");
			} else {
				if (config.debug) logger.info('user found: ' + user.id);
				req.flash('error', "This account has been used, please try another one.");
			}
			return res.redirect('/');
		}
		req.flash('error', "Failed to register your account, please try again.");
		return res.redirect(config.serverurl + '/register');
	}).catch(function (err) {
		logger.error('auth callback failed: ' + err);
		return res.redirect('/register');
	});
	// models.User.create({
	// 	nick: req.body.nick,
	// 	account: req.body.account,
	// 	password: req.body.password,
	// 	firstname: req.body.firstname,
	// 	lastname: req.body.lastname
	// }).then(function (result) {
	// 	console.log("success");
	// 	res.redirect('/');
	// }).catch(function(err){
	// 	console.log(err);
	// 	res.redirect('/register.html');
	// });
});

var wav = multer({ dest: 'wav/' });
app.post('/wav', wav.single('wav'), function (req, res) {
	console.log(req.headers);
	console.log(req.file);
	res.sendStatus(200);
});

var mp3 = multer({ dest: 'mp3/' });
app.post('/mp3', mp3.single('mp3'), function (req, res) {
	console.log(req.headers);
	console.log(req.file);
	res.sendStatus(200);
});

app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.send(err.status + " " + err.message)
});

//listen
function startListen() {
	server.listen(config.port, function () {
        var schema = config.usessl ? 'HTTPS' : 'HTTP';
        logger.info('%s Server listening at port %d', schema, config.port);
        config.maintenance = false;
    });
}

// sync db then start listen
models.sequelize.sync({ force: true }).then(function () {
	startListen();
});
