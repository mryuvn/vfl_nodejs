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
            if (req.query.limit) {
                var limit = req.query.limit;
            } else {
                var limit = '';
            }
            db_model.getData(data_table, fields, where, orderBy, limit).then(rs => {
                var data = [];
                rs.forEach(e => {
                    if (e.num < 10) {
                        var num = '00' + e.num;
                    } else if (e.num < 100) {
                        var num = '0' + e.num;
                    } else {
                        var num = '' + e.num;
                    }
                    e.number = 'VFL-' + e.year.slice(2) + num;

                    e.tels = [];
                    if (e.tel) {
                        var tels = e.tel.split(' | ');
                        tels.forEach(tel => {
                            let telArr = tel.split('-');
                            if (telArr.length > 1) {
                                var telData = {
                                    code: telArr[0] + '',
                                    number: telArr[1] + '',
                                }
                            } else {
                                var telData = {
                                    code: '',
                                    number: telArr[0] + ''
                                }
                            }
                            e.tels.push(telData);
                        });
                    }

                    e.emails = [];
                    if (e.email) {
                        var emails = e.email.split(' | ');
                        emails.forEach(em => {
                            e.emails.push({
                                mail: em
                            });
                        });
                    }

                    e.otherContacts = [];
                    if (e.other_contact) {
                        var contacts = e.other_contact.split(' | ');
                        contacts.forEach(ct => {
                            const ctArr = ct.split(' : ');
                            if (ctArr.length > 0) {
                                var contact = {
                                    type: ctArr[0] + '',
                                    name: ctArr[1] + ''
                                }
                            } else {
                                var contact = {
                                    type: '',
                                    name: ''
                                }
                            }
                            e.otherContacts.push(contact);
                        });
                    }

                    data.push(e);
                });
                res.json({ "mess": "ok", "data": data });
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

        fields.code = func.randomString(9, 'alphanumeric', 'uppercase');

        var defaultPassword = func.randomString();
        fields.password = md5(defaultPassword + fields.username);
        fields.defaultPassword = defaultPassword;

        fields.createdTime = func.getVnTime();
        fields.year = fields.createdTime.getFullYear();

        var where = 'WHERE year = "' + fields.year + '"';
        db_model.getData(data_table, 'id', where, '', '').then(rs => {
            fields.num = rs.length + 1;
            db_model.addData(data_table, fields).then(result => {
                res.json({ "mess": "ok", "result": result });
            }).catch(error => {
                res.json({ "mess": '"fail', "err": error });
            })
        }).catch(er => {
            res.json({ "mess": "fail", "err": er });
        });
    } else {
        res.json({ "mess": "fail", "err": "No data post received!" });
    }
});

module.exports = router;