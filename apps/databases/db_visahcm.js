var config = require("config");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host     : config.get("mysql_visahcm.host"),
    user     : config.get("mysql_visahcm.user"),
    password : config.get("mysql_visahcm.password"),
    database : config.get("mysql_visahcm.database"),
    port     : config.get("mysql_visahcm.port")
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