var config = require("config");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host     : config.get("mysql_visitors.host"),
    user     : config.get("mysql_visitors.user"),
    password : config.get("mysql_visitors.password"),
    database : config.get("mysql_visitors.database"),
    port     : config.get("mysql_visitors.port")
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