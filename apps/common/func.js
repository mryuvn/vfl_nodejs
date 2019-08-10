var randomstring = require("randomstring");
var visitors_model = require("../models/db_visitors_models");

var getVnTime = function () {
    let time = new Date();
    var vnTime = time.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    var thisTime = new Date(vnTime);
    return thisTime;
}

var add = function (a, b) {
    return a + b
}

var accented_characters = function (string) {
    var string = string;
    string = string.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    string = string.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    string = string.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    string = string.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    string = string.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    string = string.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    string = string.replace(/đ/g, "d");
    string = string.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    string = string.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    string = string.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    string = string.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    string = string.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    string = string.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    string = string.replace(/Đ/g, "D");
    return string;
}

var getStringtify = function (string) {
    if (string) {
        var string = accented_characters(string);
        string = string.replace(/ /g, "");
        string = string.replace(/-/g, "");
        string = string.toLowerCase();
        return string;
    } else {
        return '';
    }
}

var randomString = function (length, charset, capitalization) {
    if (!length) { var setLength = 9; } else { var setLength = length; };
    if (!charset) { var setCharset = 'alphanumeric'; } else { var setCharset = charset; };
    if (!capitalization) { var setCapitalization = null; } else { var setCapitalization = capitalization; };
    return randomstring.generate({
        length: setLength,
        charset: setCharset,
        capitalization: setCapitalization
    });
}

var updateVisitorDisconnectTime = function (id, time) {
    let data_table = 'visitors';
    let set = 'disconnectTime = ?';
    let where = 'id';
    let params = [ time, id ];
    visitors_model.editData(data_table, set, where, params)
        .then(rs => console.log(rs))
        .catch(err => console.log(err))
}

module.exports = {
    add: add,
    accented_characters: accented_characters,
    getStringtify: getStringtify,
    randomString: randomString,
    getVnTime: getVnTime,
    updateVisitorDisconnectTime: updateVisitorDisconnectTime
};