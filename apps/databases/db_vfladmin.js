var config = require("config");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host     : config.get("mysql_vfladmin.host"),
    user     : config.get("mysql_vfladmin.user"),
    password : config.get("mysql_vfladmin.password"),
    database : config.get("mysql_vfladmin.database"),
    port     : config.get("mysql_vfladmin.port")
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