var config = require("config");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host     : config.get("mysql_visas.host"),
    user     : config.get("mysql_visas.user"),
    password : config.get("mysql_visas.password"),
    database : config.get("mysql_visas.database"),
    port     : config.get("mysql_visas.port")
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