//response

//external modules
var fs = require('fs');
var path = require('path');

//core
var config = require("./config.js");
var logger = require("./logger.js");
var models = require("./models");

//public
var response = {
    // errorForbidden: function (res) {
    //     responseError(res, "403", "Forbidden", "oh no.");
    // },
    // errorNotFound: function (res) {
    //     responseError(res, "404", "Not Found", "oops.");
    // },
    // errorBadRequest: function (res) {
    //     responseError(res, "400", "Bad Request", "something not right.");
    // },
    // errorInternalError: function (res) {
    //     responseError(res, "500", "Internal Error", "wtf.");
    // },
    // errorServiceUnavailable: function (res) {
    //     res.status(503).send("I'm busy right now, try again later.");
    // },
    showIndex: showIndex,
};

// function responseError(res, code, detail, msg) {
//     res.status(code).render(config.errorpath, {
//         url: config.serverurl,
//         title: code + ' ' + detail + ' ' + msg,
//         code: code,
//         detail: detail,
//         msg: msg,
// 		useCDN: config.usecdn
//     });
// }

module.exports = response;