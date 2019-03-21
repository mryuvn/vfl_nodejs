var config = require("config");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host     : config.get("mysql_demo.host"),
    user     : config.get("mysql_demo.user"),
    password : config.get("mysql_demo.password"),
    database : config.get("mysql_demo.database"),
    port     : config.get("mysql_demo.port")
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