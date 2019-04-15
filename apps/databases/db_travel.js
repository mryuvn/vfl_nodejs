var config = require("config");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host     : config.get("mysql_travel.host"),
    user     : config.get("mysql_travel.user"),
    password : config.get("mysql_travel.password"),
    database : config.get("mysql_travel.database"),
    port     : config.get("mysql_travel.port")
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