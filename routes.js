"use strict";

var config = require("./config");


exports.setup = function (app) {
    console.log("Setting up routes.");

    // https://jwt.io/introduction/
    var jwt = require("express-jwt");

    //APIs without JWTtoken
    app.use(
        "/api/v1", function (req, res, next) {
            next();
        },
        jwt({
            secret: config.tokenSecret
        }).unless({
            path: [
                "/api/v1/user/signup",
                "/api/v1/user/login"
            ]
        })
    );

    var user = require("./server/apis/user/user.route");

    app.use("/api/v1/user/", user);
};

module.exports = exports;
