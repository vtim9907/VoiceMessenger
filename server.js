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
var flash = require('connect-flash');
var expressVue = require('express-vue');
var validator = require('validator');

//core
var models = require('./lib/models');
var register = require('./lib/register');
var config = require('./lib/config');
var logger = require('./lib/logger');
var auth = require('./lib/auth');
// var response = require('./lib/response');

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

app.use(express.static(path.join(__dirname, 'public', 'assets')));
app.use('/service_worker.js', express.static(path.join(__dirname, 'public', 'service_worker.js')));
app.use('/manifest.json', express.static(path.join(__dirname, 'public', 'manifest.json')));
app.use('/notConnect.html', express.static(path.join(__dirname, 'public', 'notConnect.html')));

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

// //express Vue
// var vueOptions = {
//     rootPath: path.join(__dirname,  'public', 'views'),
//     layout: {
//         start: '<div id="app">',
//         end: '</div>'
//     }
// };
// var expressVueMiddleware = expressVue.init(vueOptions);
// app.use(expressVueMiddleware);

//passport 
app.use(passport.initialize());
app.use(passport.session());

//serialize and deserialize
passport.serializeUser(function (user, done) {
    logger.info('serializeUser: ' + user.id);
    return done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    models.User.findOne({
        where: {
            id: id
        }
    }).then(function (user) {
        logger.info('deserializeUser: ' + user.id);
        return done(null, user);
    }).catch(function (err) {
        logger.error(err);
        return done(err, null);
    });
});

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

function checkAuthentication(req, res, next) {
	if(req.isAuthenticated()){
		next();
	} else {
		console.log('not login');
		return res.redirect('/login');
	}
}

app.get("/givename", function(req, res, next) {
	models.User.findOne({
		where: {
			id: req.session.passport.user
		}
	}).then(function (user) {
		return res.send("Welcome, " + user.nickname + " !!");
	}).catch(function (err) {
		logger.error(err);
		return done(err);
	});
});

app.get("/login", function(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/');
	}
	return res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get("/register", checkAuthentication, function(req, res, next) {
	return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/', checkAuthentication, function(req, res, next) {
	return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/index.html', checkAuthentication, function(req, res, next) {
  return res.sendFile(path.join(__dirname, 'public', 'index.html'));
}); 

function setReturnToFromReferer(req) {
    var referer = req.get('referer');
    if (!req.session) req.session = {};
    req.session.returnTo = referer;
}

// email auth
if (config.email) {
    if (config.allowemailregister)
        app.post('/register', function (req, res, next) {
            if (!req.body.email || !req.body.password) return res.redirect('/login');
            if (!validator.isEmail(req.body.email)) return res.redirect('/login');
            models.User.findOrCreate({
                where: {
                    email: req.body.email
                },
                defaults: {
					password: req.body.password,
					nickname: req.body.nickname
                }
            }).spread(function (user, created) {
                if (user) {
                    if (created) {
                        if (config.debug) logger.info('user registered: ' + user.id);
						req.flash('info', "You've successfully registered, please signin.");
						console.log('register successfully.');
                    } else {
                        if (config.debug) logger.info('user found: ' + user.id);
						req.flash('error', "This email has been used, please try another one.");
						console.log('This email has been used.');
                    }
                    return res.redirect('/login');
				}
				console.log('fail to register');
                req.flash('error', "Failed to register your account, please try again.");
                return res.redirect('/login');
            }).catch(function (err) {
                logger.error('auth callback failed: ' + err);
				// return response.errorInternalError(res);
				return res.send('internal error');
            });
        });

    app.post('/login', function (req, res, next) {
        if (!req.body.email || !req.body.password) return res.send('empty field occured');
		if (!validator.isEmail(req.body.email)) return res.send('not email');
		setReturnToFromReferer(req);
		next()},
        passport.authenticate('local', {
            failureRedirect: '/login',
            failureFlash: 'Invalid email or password.'
		}),
		function(req, res, next) {
			req.session.save(() => {
				return res.redirect('/');
			});
		}
    );
}


//logout
app.get('/logout', function (req, res) {
	console.log('hello');
    if (config.debug && req.isAuthenticated())
		logger.info('user logout: ' + req.user.id);
    req.logout();
    return res.redirect('/login');
});

app.get('/chat',function(req,res){
    console.log(req.query);
    console.log(req.session);
    models.User.findOne({
        where: {
            nickname : req.query.toUser
        }
    }).then(function(user){
        console.log(user.id);
        models.Chat.create({
            fromId: req.session.passport.user,
            toId: user.id,
            content: req.query.msg,
            time: new Date
        });
    });
    /*
    models.Chat.create({
        fromId: req.session.passport.user,
        toId: models.User.findAll({
            where:
        }),
    });
    */
    res.send(200);
});

app.get('/userList',function(req,res){
    
    models.User.findAll().then(function(users){
        var userList = [];
        for(var i in users){//users is a list
            console.log('session '+req.session.passport.user);
            if(req.session.passport.user !== users[i].id){
                userList.push(users[i].nickname);
            }
            console.log(users[i].nickname);
            console.log(userList);
        }
        res.send(userList);
    });
    
});
var Sequelize = require('sequelize');
app.get('/chatMsg',function(req,res){
    var Op = Sequelize.Op;
    models.User.findOne({
        where:{
            nickname: req.query.to
        }
    }).then(function(user){
        models.Chat.findAll({
            where: {
                //toId : req.session.passport.user
                [Op.or]:[{fromId:req.session.passport.user,toId:user.id},
                    {fromId:user.id,toId:req.session.passport.user}]
            }
        }).then(function(msgs){
            var contents = [];
            for(var i in msgs){
                console.log(msgs[i].content);
                contents.push(msgs[i].content);
            }
            res.send(contents);
        });
    });
    /*
    models.Chat.findAll({
        where: {
            //toId : req.session.passport.user
            [Op.or]:[{fromId:req.session.passport.user},
                {toId:req.session.passport.user}]
        }
    }).then(function(msgs){
        var contents = [];
        for(var i in msgs){
            console.log(msgs[i].content);
            contents.push(msgs[i].content);
        }
        res.send(contents);
    });
    */
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
models.sequelize.sync({ force: false }).then(function () {//change true to false for debug
	startListen();
});
