var config = require("config");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host     : config.get("mysql_leevisa.host"),
    user     : config.get("mysql_leevisa.user"),
    password : config.get("mysql_leevisa.password"),
    database : config.get("mysql_leevisa.database"),
    port     : config.get("mysql_leevisa.port")
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