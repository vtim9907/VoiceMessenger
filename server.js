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
var Sequelize = require('sequelize');
var Vue = require('vue').default;
var multer = require('multer');
var flash = require('connect-flash');
var expressVue = require('express-vue');
var validator = require('validator');
var schedule = require('node-schedule');
var shuffle = require('shuffle-array');
var io = require('socket.io');

//core
var models = require('./lib/models');
var register = require('./lib/register');
var config = require('./lib/config');
var logger = require('./lib/logger');
var auth = require('./lib/auth');
// var response = require('./lib/response');

// internal variable
// card:
const CARD_SUCCESS = 0;
const CARD_NOT_FOUND = 1;
const CARD_IMCOMPLETED_DATA = 2;
//const CARD_PERMISSION_DENIED = 101;
//const CARD_INTERNEL_ERROR = 500;

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
app.use('/mp3', express.static(path.join(__dirname, 'mp3')));
app.use('/photo', express.static(path.join(__dirname, 'photo')));

//session
var sessionMiddleware = session({
	secret: config.sessionsecret,
	store: sessionStore,
	resave: false, //don't save session if unmodified
	saveUninitialized: true, //always create session to ensure the origin
	rolling: true, // reset maxAge on every response
	cookie: {
		maxAge: config.sessionlife
	}
});
app.use(sessionMiddleware);

app.use(flash());

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

app.get('/userList', function (req, res) {
    models.User.findAll().then(function (users) {
        var userList = [];
        for (var i in users) {//users is a list
            console.log('session ' + req.session.passport.user);
            if (req.session.passport.user !== users[i].id) {
                userList.push(users[i].nickname);
            }
            console.log(users[i].nickname);
            console.log(userList);
        }
        res.send(userList);
    });
});

//logout
app.get('/logout', function (req, res) {
    console.log('hello');
    if (config.debug && req.isAuthenticated())
        logger.info('user logout: ' + req.user.id);
    req.logout();
    return res.redirect('/login');
});

// voice
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
            user.addFriend(user.card1);
        } else {
            user.addFriend(user.card2);
        }
        return res.redirect('/');
    }).catch(function (err) {
        logger.error(err);
        return done(err);
    });
});

app.post('/getFriend', checkAuthentication, function (req, res, next) {
    models.User.findOne({
        where: {
            id: req.session.passport.user
        }
    }).then(function (user) {
        var friendArray = [];
        console.log('-------------------in----------------------')
        user.getFriend().then(function (friends) {
            let count = 0;
            console.log('-------------------friends----------------------')
            console.log(friends)
            console.log('-------------------friends----------------------')
            if (friends.length) {
                console.log('-------------------length>0----------------------')
                friends.forEach(function (friend) {
                    models.Friendship.findOne({
                        where: {
                            UserId: friend.id,
                            FriendId: user.id
                        }
                    }).then(function (mutualFriend) {
                        console.log('-------------------checkfriend----------------------')
                        if (mutualFriend) {
                            console.log('-------------------yes friend----------------------')
                            friendArray.push({
                                nickname: friend.nickname,
                                photoPath: friend.photoPath
                            });
                        }
                        count++;
                        if (count === friends.length) {
                            console.log('-------------------send friends----------------------')
                            if (friendArray.length === 0) {
                                return res.send("no");
                            } else {
                                return res.send(friendArray);
                            }
                        }
                    }).catch(function (err) {
                        logger.error(err);
                        return done(err);
                    });
                });
            } else {
                console.log('-------------------no friends length < 0----------------------')
                return res.send("no");
            }
            console.log('-------------------done----------------------')
        }).catch(function (err) {
            logger.error(err);
            return done(err);
        });
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
    }).then(function checkUserValid(user) {
        // if (!user) {
        //     return Promise.reject(CARD_PERMISSION_DENIED);
        // }
        console.log("Check user status:");
        console.log("User photo path: ", user.photoPath);
        console.log("User voice path: ", user.voicePath);
        if (/* !user.photoPath || */!user.voicePath) {
            return Promise.reject(CARD_IMCOMPLETED_DATA);
        }
        return user;
    }).then(function findMatching(user) {
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
    }).then(function checkCardValid(user) {
        // No user
        if (user == null) {
            return Promise.reject(CARD_NOT_FOUND);
        }
        return user;
    }).then(function sendRequest(user) {
        res.json({
            status: CARD_SUCCESS,
            name: user.nickname,
            photo: user.photoPath,
            voice: user.voicePath
        });
    }).catch(function (status) {
        switch (status) {
            //case CARD_PERMISSION_DENIED:
            case CARD_IMCOMPLETED_DATA:
            case CARD_NOT_FOUND:
                res.json({
                    status: status
                });
                break;
            default:
                res.sendStatus(403);
        }
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
    io_listen(server);
}

function io_listen(server) {
    var userMap = [];
    var server_io = io.listen(server);//socket.io listen
    server_io.use(function (socket, next) {
        sessionMiddleware(socket.request, socket.request.res, next);
    });
    server_io.sockets.on('connection', function (socket) {
        //console.log("sockets: "+server_io.sockets.connected);
        userMap.push({ userId: socket.request.session.passport.user, socketId: socket.id });
        userMap.forEach(function (item) {
            if (!server_io.sockets.connected[item.socketId]) {
                userMap.splice(userMap.indexOf(item), 1);
            }
        });
        console.log(userMap);
        console.log(socket.request.session.passport.user);
        //socket.emit('message',{'message':'hello world'});
        console.log("socket.id" + socket.id);
        socket.on('chat', function (data) {
            console.log(data);
            models.User.findOne({
                where: {
                    nickname: data.toUser
                }
            }).then(function (user) {
                console.log(user.id);
                models.Chat.create({
                    fromId: socket.request.session.passport.user,
                    toId: user.id,
                    content: data.msg,
                    time: new Date
                });
                /*
                var Op = Sequelize.Op;
                for(var i=0;i<userMap.length;i++){
                    if(userMap[i].userId === user.id || userMap[i].userId === socket.request.session.passport.user){
                    var sendId = userMap[i].socketId;
                    models.Chat.findAll({
                        where: {
                        //toId : req.session.passport.user
                        [Op.or]:[{fromId:socket.request.session.passport.user,toId:user.id},
                            {fromId:user.id,toId:socket.request.session.passport.user}]
                        }
                    }).then(function(msgs){
                        var contents = [];
                        for(var ii in msgs){
                        //console.log(msgs[i].content);
                        contents.push(msgs[ii].content);
                        }
                        server_io.sockets.connected[sendId].emit('chatContent',{content:contents});
                    });
                    }
                }
                */
                var Op = Sequelize.Op;
                models.User.findOne({
                    where: {
                        nickname: data.toUser
                    }
                }).then(function (user) {
                    //console.log('user.id:'+user.id);

                    models.Chat.findAll({
                        where: {
                            //toId : req.session.passport.user
                            [Op.or]: [{ fromId: socket.request.session.passport.user, toId: user.id },
                            { fromId: user.id, toId: socket.request.session.passport.user }]
                        }
                    }).then(function (msgs) {
                        var contents = [];
                        for (var i in msgs) {
                            //console.log(msgs[i].content);
                            contents.push(msgs[i].content);
                        }
                        //socket.emit('chatContent',{content:contents});
                        //server_io.sockets.connected[socket.id].emit('chatContent',{content:contents});
                        userMap.forEach(function (item) {
                            console.log(item);

                            if (item.userId === user.id || item.userId === socket.request.session.passport.user) {
                                if (server_io.sockets.connected[item.socketId]) {
                                    server_io.sockets.connected[item.socketId].emit('chatContent', { content: contents });
                                }
                                //server_io.sockets.connected[item.socketId].emit('chatContent',{content:contents});
                            }

                        });
                    });

                });
            });
        });
        socket.on('getChatContent', function (data) {
            //console.log(data);

            var Op = Sequelize.Op;
            models.User.findOne({
                where: {
                    nickname: data.toUser
                }
            }).then(function (user) {
                //console.log('user.id:'+user.id);

                models.Chat.findAll({
                    where: {
                        //toId : req.session.passport.user
                        [Op.or]: [{ fromId: socket.request.session.passport.user, toId: user.id },
                        { fromId: user.id, toId: socket.request.session.passport.user }]
                    }
                }).then(function (msgs) {
                    var contents = [];
                    for (var i in msgs) {
                        //console.log(msgs[i].content);
                        contents.push(msgs[i].content);
                    }
                    socket.emit('chatContent', { content: contents });
                });
            });
        });
    });
}

// sync db then start listen
models.sequelize.sync({ force: true }).then(function () {
    startListen();
});

// big matching: prebuild cards of next day;
schedule.scheduleJob("*/2 * * * *", function prebuildCard() {
    let card = dailyCardSwitch ? "card1" : "card2";

    let col = {};
    col[card] = null;

    models.User.findAll({
        where: {
            // photoPath: {
            //     [models.Sequelize.Op.ne]: null
            // },
            voicePath: {
                [models.Sequelize.Op.ne]: null
            }
        }
    }).then(function (users) {

        shuffle(users);

        var group1 = users.slice(0, users.length / 2);
        var group2 = users.slice(users.length / 2);

        console.log("\ntotel users: ", users.length);
        console.log("group1 length: ", group1.length);
        console.log("group2 length: ", group2.length);

        for (let i = 0; i < group1.length; i++) {
            console.log("\n", group1[i].email, "<--->", group2[i].email, "\n");
            col[card] = group2[i].id;
            group1[i].update(Object.assign({}, col));
            col[card] = group1[i].id;
            group2[i].update(Object.assign({}, col));
        }
    }).catch(function (reason) {
        console.log(reason);
    });

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
