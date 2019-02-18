var express = require("express");
var jsonParser = require("body-parser").json();
var router = express.Router();

var md5 = require('md5');
var func = require('../common/func');
var api_secur = require("../common/api_secur");
var db_model = require("../models/db_models");

var countries_data = require('../common/countries_data');

router.get("/", function (req, res) {
    res.json({"mess": "This is APIs page"});
});

router.get("/get-data", (req, res) => {
    var secur_key = req.query.secur_key;
    if (secur_key) {
        if (secur_key == api_secur.secur) {
            var db = req.query.db;
            if (db) {
                if (req.query.fields) {
                    var fields = req.query.fields;
                } else {
                    var fields = '*';
                }
                if (req.query.where) {
                    var where = req.query.where;
                } else {
                    var where = '';
                }
                if (req.query.orderBy) {
                    var orderBy = req.query.orderBy;
                } else {
                    var orderBy = '';
                }
                db_model.getData(db, fields, where, orderBy)
                    .then(data => {
                        res.json({ "mess": "ok", "data": data });
                    })
                    .catch(err => res.json({ "mess": "fail", "err": err }));
            } else {
                res.json({ "mess": "fail", "err": "No dataTable!" });
            }
        } else {
            res.json({
                "mess": "fail",
                "err": "Security key is not right!"
            });
        }
    } else {
        res.json({
            "mess": "fail",
            "err": "No security key!"
        });
    }
});

router.post("/add-data", jsonParser, (req, res) => {
    if (req.body) {
        var data_table = req.body.data_table;
        var fields = req.body.fields;

        if (req.body.options) {
            var options = req.body.options;
        } else {
            var options = {}
        }

        if (options.setCode) {
            fields.code = func.randomString(options.setCode.length, options.setCode.charset, options.setCode.capitalization);
        }

        if (options.setReference) {
            fields.reference = func.randomString(options.setReference.length, options.setReference.charset, options.setReference.capitalization);
        }

        var time = new Date();
        var vnTime = time.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
        var thisTime = new Date(vnTime);
        var year = thisTime.getFullYear();
        var month = thisTime.getMonth() + 1;
        var date = thisTime.getDate();

        if (options.setTime) {
            fields.createdTime = thisTime;
        }

        if (options.setYear) {
            fields.year = year;
        }
        if (options.setMonth) {
            fields.month = month;
        }
        if (options.setDate) {
            fields.date = date;
        }

        if (options.setNum) {
            if (options.setNum == 'year') {
                var where = 'WHERE year = "' + year + '"';
            } else if (options.setNum == 'month') {
                var where = 'WHERE month = "' + month + '"';
            } else {
                var where = 'WHERE date = "' + date + '"';
            }
            db_model.getData(data_table, 'id', where, '')
                .then(data => {
                    fields.num = data.length + 1;
                    // res.json({fields: fields});
                    db_model.addData(data_table, fields)
                        .then(result => res.json({ 
                            "mess": "ok", 
                            "result": result, 
                            "code": fields.code,
                            "reference": fields.reference,
                            "year": fields.year,
                            "month": fields.month,
                            "date": fields.date,
                            "num": fields.num,
                            "createdTime": fields.createdTime 
                        }))
                        .catch(err => res.json({ "mess": "fail", "err": err }));
                }).catch(err => res.json({ "mess": "fail", "err": err }));
        } else {
            db_model.addData(data_table, fields)
                .then(result => res.json({ "mess": "ok", "result": result, "time": time }))
                .catch(err => res.json({ "mess": "fail", "err": err }));
        }
    } else {
        res.json({
            "mess": "fail",
            "err": "No data post received!"
        });
    }
});

router.post("/edit-data", jsonParser, (req, res) => {
    if (req.body) {
        let data_table = req.body.data_table;
        let set = req.body.set;
        let where = req.body.where;
        let params = req.body.params;
        db_model.editData(data_table, set, where, params)
            .then(result => res.json({ "mess": "ok", "result": result }))
            .catch(err => res.json({
                "mess": "fail",
                "err": err
            }));
    } else {
        res.json({
            "mess": "fail",
            "err": "No data post received!"
        });
    }
});

router.post("/delete-data", jsonParser, (req, res) => {
    if (req.body) {
        let data_table = req.body.data_table;
        let where = req.body.where;
        db_model.deleteData(data_table, where)
            .then(result => res.json({ "mess": "ok" }))
            .catch(err => res.json({
                "mess": 'fail',
                "err": err
            }));
    } else {
        res.json({
            "mess": "fail",
            "err": "No data post received!"
        });
    }
});

router.get("/get-countries-data", (req, res) => {
    var countriesData = countries_data.countries;
    res.json(countriesData);
});

router.get("/get-currency-data", (req, res) => {
    var db = 'mryu_currencies';
    var fields = '*';
    var where = '';
    var orderBy = '';
    db_model.getData(db, fields, where, orderBy)
        .then(data => {
            if (data.length > 0) {
                var currencies = data[0].content;
                if (currencies) {
                    var currenciesArr = currencies.split(' || ');
                    var currenciesData = [];
                    currenciesArr.forEach(e => {
                        let arr = e.split(' | ');
                        let newData = {
                            code: arr[0],
                            name: arr[1],
                            buy: arr[2],
                            transfer: arr[3],
                            sell: arr[4]
                        }
                        currenciesData.push(newData);
                    });
                    let vndData = {
                        code: 'VND',
                        name: 'VIETNAM DONG',
                        buy: '1',
                        transfer: '1',
                        sell: '1'
                    }
                    currenciesData.unshift(vndData);
                    res.json({ "mess": "ok", "data": currenciesData });
                } else {
                    res.json({"mess": "fail", "err": "noContent"});
                }
            } else {
                res.json({"mess": "fail", "err": "dataNotFound"});
            }
        })
        .catch(err => res.json({ "mess": "fail", "err": err }));
});

module.exports = router;