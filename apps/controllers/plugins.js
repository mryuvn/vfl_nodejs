var express = require("express");
var jsonParser = require("body-parser").json();
var router = express.Router();

var api_secur = require('../common/api_secur');
var func = require('../common/func');
var md5 = require('md5');
var writtenNumber = require('written-number');

var db_model = require('../models/db_models');

var request = require("request");
var cheerio = require("cheerio");

router.get("/", (req, res) => res.send("This is Plugins API"));

router.get("/random-string", (req, res) => {
    // length - the length of the random string. (default: 32) [OPTIONAL]
    // readable - exclude poorly readable chars: 0OIl. (default: false) [OPTIONAL]
    // charset - define the character set for the string. (default: 'alphanumeric') [OPTIONAL]
    //     alphanumeric - [0-9 a-z A-Z]
    //     alphabetic - [a-z A-Z]
    //     numeric - [0-9]
    //     hex - [0-9 a-f]
    //     custom - any given characters
    // capitalization - define whether the output should be lowercase / uppercase only. (default: null) [OPTIONAL]
    //     lowercase
    //     uppercase

    if (req.query.number) { var number = req.query.number; } else { var number = 9; }

    if (req.query.charset) { var charset = req.query.charset; } else { var charset = 'alphanumeric'; }

    if (req.query.capitalization) { var capitalization = req.query.capitalization; } else { var capitalization = 'lowercase'; }

    // var string = random.new(number, charset, capitalization);
    var string = func.randomString(number, charset, capitalization);
    res.json({ "result": string });
});

router.get("/md5-string/:string", (req, res) => {
    var string = req.params.string;
    var result = md5(string);
    res.json({ "result": result });
});

router.get("/written-number/:number/:lang", (req, res) => {
    var number = req.params.number;
    var lang = req.params.lang;
    var text = writtenNumber(number, { lang: lang });
    res.json({
        result: text
    });

    // English 	en
    // Portuguese (Brazil) 	pt
    // Portuguese (Portugal) 	ptPT
    // Spanish 	es
    // French 	fr
    // Esperanto 	eo
    // Vietnamese 	vi
    // Arabic 	ar
    // Turkish 	tr
    // English (Indian) 	enIndian
    // Ukrainian 	uk
    // Indonesian 	id
});

router.get("/get-currencies-online", (req, res) => {
    var secur_key = req.query.secur_key;
    if (!secur_key) {
        if (secur_key == api_secur.secur) {
            var url = 'http://www.vietcombank.com.vn/exchangerates/ExrateXML.aspx';
            request(url, (err, response, body) => {
                if (err) {
                    res.json({
                        "mess": "fail",
                        "err": err
                    });
                } else {
                    var data = [];
                    $ = cheerio.load(body);
                    let dataList = $(body).find("exrate");
                    dataList.each((i, e) => {
                        let currencyData = {
                            code: e["attribs"]["currencycode"],
                            name: e["attribs"]["currencyname"],
                            buy: e["attribs"]["buy"],
                            transfer: e["attribs"]["transfer"],
                            sell: e["attribs"]["sell"]
                        }
                        data.push(currencyData);
                    });
                    res.json(data);
                }
            });
        } else {
            res.json({
                "mess": "fail",
                "err": "Security key not right!"
            });
        }
    } else {
        res.json({
            "mess": "fail",
            "err": "No security key!"
        });
    }
});

router.get("/get-currencies-data", (req, res) => {
    var db = 'app_currencies';
    var fields = '*';
    var where = '';
    var orderBy = '';
    db_model.getData(db, fields, where, orderBy)
        .then(resData => {
            if (resData == '') {
                res.json({ "mess": "fail", "err": "dataNotFound" });
            } else {
                var data = resData[0];
                var currencies = data.content.split(' || ');
                data.currenciesData = [];
                currencies.forEach(e => {
                    let arr = e.split(' | ');
                    let newData = {
                        code: arr[0],
                        name: arr[1],
                        buy: arr[2],
                        transfer: arr[3],
                        sell: arr[4]
                    }
                    data.currenciesData.push(newData);
                });
                res.json({ "mess": "ok", "data": data });
            }
        }).catch(err => res.json({ "mess": "fail", "err": err }));
});

router.get("/update-currencies", (req, res) => {
    if (req.query.secur_key == api_secur.secur) {
        var url = 'http://www.vietcombank.com.vn/exchangerates/ExrateXML.aspx';
        request(url, (err, response, body) => {
            if (err) {
                res.json({
                    "mess": "fail",
                    "err": err
                });
            } else {
                var data = [];
                $ = cheerio.load(body);
                let dataList = $(body).find("exrate");
                dataList.each((i, e) => {
                    let currencyData = [
                        e["attribs"]["currencycode"],
                        e["attribs"]["currencyname"],
                        e["attribs"]["buy"],
                        e["attribs"]["transfer"],
                        e["attribs"]["sell"]
                    ]
                    let currencyDataString = currencyData.join(' | ');
                    data.push(currencyDataString);
                });
                let content = data.join(' || ');
                let time = new Date();
                var vnTime = time.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
                var thisTime = new Date(vnTime);
                let id = 1;
                let data_table = 'app_currencies';
                let set = 'content = ?, updateTime = ?';
                let where = 'id';
                let params = [content, thisTime, id];
                db_model.editData(data_table, set, where, params)
                    .then(result => res.json({ "mess": "ok", "data": content }))
                    .catch(err => res.json({
                        "mess": "fail",
                        "err": err
                    }));
            }
        });
    } else {
        res.json({
            "mess": "fail",
            "err": "Security key not right!"
        });
    }
});

router.get("/test", (req, res) => {
    var time = new Date();
    var vnTime = time.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    var thisTime = new Date(vnTime);

    var result = time;
    res.json({
        "result": result
    });
});

module.exports = router;