var q = require("q");
var db = require("../common/database");

var conn = db.getConnection();

function getData(db, fields, where, orderBy) {
    return new Promise((resolve, reject) => {
        var query = conn.query('SELECT ' + fields + ' FROM ' + db + ' ' + where + ' ' + orderBy, (err, result) => {
            if (err) {
                return reject(err + '');
            } return resolve(result);
        })
    })
}

function addData(db, fields) {
    var defer = q.defer();
    var query = conn.query('INSERT INTO ' + db + ' SET ?', fields, (err, result) => {
        if (err) {
            defer.reject(err + '');
        } defer.resolve(result);
    });
    return defer.promise;
}

function editData(db, set, where, params) {
    var defer = q.defer();
    var query = conn.query('UPDATE '+ db + ' SET ' + set + ' WHERE ' + where + ' = ?', params, (err, result) => {
        if (err) {
            return defer.reject(err + '');
        } return defer.resolve(result);
    });
    return defer.promise;
}

function deleteData(db, where) {
    var defer = q.defer();
    var query = conn.query('DELETE FROM ' + db + ' WHERE ' + where, (err, result) => {
        if (err) {
            return defer.reject(err + '');
        } return defer.resolve(result);
    });
    return defer.promise;
}

module.exports = {
    getData: getData,
    addData: addData,
    editData: editData,
    deleteData: deleteData
}