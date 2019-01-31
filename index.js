var express = require("express");
var config = require("config");
var bodyParser = require("body-parser");
var socketio = require("socket.io");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With');
    next();
});

var controllers = require(__dirname + "/apps/controllers");
app.use(controllers);

var host = config.get("server.host");
var port = config.get("server.port");
var server = app.listen(port, host, function () {
    console.log("vfl_nodejs: Serve is listening in PORT ", port);
    let time = new Date();
    let vnTime = time.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    let today = new Date(vnTime);
    console.log('To day is: ' + today);
});

var io = socketio(server);
var socketio = require("./apps/common/socketio")(io);