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
var schedule = require('node-schedule');
var shuffle = require('shuffle-array');

//core
var models = require('./lib/models');
var register = require('./lib/register');
var config = require('./lib/config');
var logger = require('./lib/logger');
var auth = require('./lib/auth');
// var response = require('./lib/response');

var dailyCardSwitch = true;

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
app.use('/mp3', express.static(path.join(__dirname, 'mp3')));
app.use('/photo', express.static(path.join(__dirname, 'photo')));

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
app.use(function (req, res, next) {
    try {
        decodeURIComponent(req.path);
    } catch (err) {
        logger.error(err);
        return response.errorBadRequest(res);
    }
    next();
});

function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        console.log('not login');
        return res.redirect('/login');
    }
}

app.get("/givename", checkAuthentication, function (req, res, next) {
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

app.get("/login", function (req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    return res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get("/register", checkAuthentication, function (req, res, next) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/', checkAuthentication, function (req, res, next) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/index.html', checkAuthentication, function (req, res, next) {
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
        next()
    },
        passport.authenticate('local', {
            failureRedirect: '/login',
            failureFlash: 'Invalid email or password.'
        }),
        function (req, res, next) {
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

// voice
var wav = multer({ dest: 'wav/' });
app.post('/wav', wav.single('wav'), function (req, res) {
    console.log(req.headers);
    console.log(req.file);
    res.sendStatus(200);
});

var mp3 = multer({ dest: 'mp3/' });
app.post('/mp3', mp3.single('mp3'), function (req, res) {
    models.User.findOne({
        where: {
            id: req.session.passport.user
        }
    }).then(function (user) {
        if (user.createOrModifyVoicePath(req.file.filename)) {
            return res.redirect('/');
        }
        return res.send('an error occurred!');
    }).catch(function (err) {
        logger.error(err);
        return done(err);
    });
});

//photo
var uploadPhoto = multer({ dest: 'photo/' });
app.post('/photo', uploadPhoto.single('myphoto'), function (req, res) {
    models.User.findOne({
        where: {
            id: req.session.passport.user
        }
    }).then(function (user) {
        if (user.createOrModifyPhotoPath(req.file.filename)) {
            return res.redirect('/');
        }
        return res.send('an error occurred!');
    }).catch(function (err) {
        logger.error(err);
        return done(err);
    });
})

app.get('/getPhoto', checkAuthentication, function (req, res, next) {
    models.User.findOne({
        where: {
            id: req.session.passport.user
        }
    }).then(function (user) {
        if (user.photoPath) {
            return res.send(user.photoPath);
        }
        return res.send();
    }).catch(function (err) {
        logger.error(err);
        return done(err);
    });
})

//friendship
app.get("/friendRequest", checkAuthentication, function (req, res, next) {
    models.User.findOne({
        where: {
            id: req.session.passport.user
        }
    }).then(function (user) {
        if (!dailyCardSwitch) {
            user.addFriend(user.card1).then(function () {
                user.getFriend().then(function (friends) {
                    friends.forEach(element => {
                        console.log("okokokok" + element.id);
                    });
                });
            });
        } else {
            user.addFriend(user.card2).then(function () {
                user.getFriend().then(function (friends) {
                    friends.forEach(element => {
                        console.log("okokokok" + element.id);
                    });
                });
            });
        }
        return res.redirect('/');
    }).catch(function (err) {
        logger.error(err);
        return done(err);
    });
});

//get card
app.post('/card', checkAuthentication, function (req, res) {
    models.User.findOne({
        where: {
            id: req.session.passport.user
        }
    }).then(function (user) {
        if (!dailyCardSwitch) {
            return models.User.findOne({
                where: {
                    id: user.card1
                }
            })
        } else {
            return models.User.findOne({
                where: {
                    id: user.card2
                }
            })
        }
    }).then(function (user) {
        res.json({
            status: "success",
            name: user.nickname
        })
    }).catch(function (reason) {
        res.json({
            status: "fail",
            name: ""
        })
    })
})

//missing routing handle
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

// big matching: prebuild cards of next day;
schedule.scheduleJob("*/2 * * * *", function prebuildCard() {
    models.User.findAll().then(function (users) {
        shuffle(users);
        var group1 = users.slice(0, users.length / 2);
        var group2 = users.slice(users.length / 2);

        console.log("\ntotel users: ", users.length);
        console.log("group1 length: ", group1.length);
        console.log("group2 length: ", group2.length);

        if (dailyCardSwitch) {
            console.log("card1");
            for (let i = 0; i < group1.length; i++) {
                console.log("\n", group1[i].email, "<--->", group2[i].email, "\n");
                group1[i].update({
                    card1: group2[i].id
                });
                group2[i].update({
                    card1: group1[i].id
                })
            }
        } else {
            console.log("card2")
            for (let i = 0; i < group1.length; i++) {
                console.log("\n", group1[i].email, "<--->", group2[i].email, "\n");
                group1[i].update({
                    card2: group2[i].id
                });
                group2[i].update({
                    card2: group1[i].id
                })
            }
        }
    })
})

/*
// small matching
schedule.scheduleJob("* * 12-23 * * *", function() {

})
*/

// ready to update cards
schedule.scheduleJob("*/5 * * * *", function switchToNextDay() {
    console.log("Switch to next day !!");
    console.log("dailyCardSwitch: ", dailyCardSwitch);
    dailyCardSwitch = !dailyCardSwitch;
})
