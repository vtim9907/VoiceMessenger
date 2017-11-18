var models = require('./models');

var register = {
    registerAuth: registerAuth
};

function registerAuth(req, res, next) {
    models.User.find({
        where: {
            account: req.body.account
        }
    }).then(function (result) {
        if (result) {
            console.log("Accound has been registered");
            res.redirect('/register');
        }
        console.log("start registeration ...");
        return next();
    })
};

module.exports = register;