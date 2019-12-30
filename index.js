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
var portSSL = config.get("server.portSSL");
var httpsOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}

var server = http.createServer(app).listen(port, host, function () {
    console.log("lee_nodejs: Server HTTP is listening in PORT ", port);
});

var serverHttps = https.createServer(httpsOptions, app).listen(portSSL, host, function() {
    console.log("lee_nodejs: Server HTTPS is listening in PORT ", portSSL);
});

var io = socketio(server);
var socketio = require("./apps/common/socketio")(io);