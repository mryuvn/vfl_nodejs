var express = require("express");
var jsonParser = require("body-parser").json();
var router = express.Router();

var func = require("../common/func");
var md5 = require('md5');
var api_secur = require("../common/api_secur");
var db_model = require("../models/db_models");

var data_table = 'mryu_customers';

router.get("/", (req, res) => {
    res.json({ "mess": "Hi, this is VFL's Customers API!" });
});

router.get("/get-data", (req, res) => {
    if (req.query.secur_key) {
        if (req.query.secur_key === api_secur.secur) {
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
            db_model.getData(data_table, fields, where, orderBy).then(rs => {
                res.json({ "mess": "ok", "data": rs });
            }).catch(er => res.json({ "mess": "fail", "err": er }));
        } else {
            res.json({ "mess": "fail", "err": "Security key not right!" });
        }
    } else {
        res.json({ "mess": "fail", "err": "No security key!" });
    }
});

router.post("/add-data", jsonParser, (req, res) => {
    if (req.body) {
        var fields = req.body;

        var defaultPassword = func.randomString();
        fields.password = md5(defaultPassword + fields.username);
        fields.defaultPassword = defaultPassword;

        fields.createdTime = func.getVnTime();
        fields.year = fields.createdTime.getFullYear();

        var where = 'WHERE year = "' + fields.year + '"';
        db_model.getData(data_table, 'id', where, '').then(rs => {
            fields.num = rs.length + 1;
            db_model.addData(data_table, fields).then(result => {
                res.json({"mess": "ok", "result": result});
            }).catch(error => {
                res.json({"mess": '"fail', "err": error});
            })
        }).catch(er => {
            res.json({ "mess": "fail", "err": er });
        });
    } else {
        res.json({ "mess": "fail", "err": "No data post received!" });
    }
});

module.exports = router;