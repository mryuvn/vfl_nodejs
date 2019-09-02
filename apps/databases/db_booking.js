var config = require("config");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host     : config.get("mysql_booking.host"),
    user     : config.get("mysql_booking.user"),
    password : config.get("mysql_booking.password"),
    database : config.get("mysql_booking.database"),
    port     : config.get("mysql_booking.port")
});

connection.connect();

function getConnection(){
    if(!connection){
        connection.connect();
    }

    return connection;
}
module.exports = {
    getConnection: getConnection
}