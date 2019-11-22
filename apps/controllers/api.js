var express = require("express");
var jsonParser = require("body-parser").json();
var router = express.Router();

var geoip = require('geoip-lite');
var md5 = require('md5');
var func = require('../common/func');
var api_secur = require("../common/api_secur");
var db_model = require("../models/db_models");
var data_tables = {
    users: 'mryu_users',
}

var countries = require('../common/countries_data');
var languages = require('../common/languages_data');

router.use("/demo", require(__dirname + "/sqls_api/vflco_demo"));
router.use("/visitors", require(__dirname + "/sqls_api/vflco_visitors"));
router.use("/visas", require(__dirname + "/sqls_api/vflco_visas"));
router.use("/traveldocs", require(__dirname + "/sqls_api/vflco_traveldocs"));
router.use("/vfl-admin", require(__dirname + "/sqls_api/vflco_vfladmin"));
router.use("/booking", require(__dirname + "/sqls_api/vflco_booking"));
router.use("/leevisa", require(__dirname + "/sqls_api/vflco_leevisa"));
router.use("/visahcm", require(__dirname + "/sqls_api/vflco_visahcm"));

router.get("/", function (req, res) {
    res.json({ "mess": "This is APIs page" });
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
                if (req.query.limit) {
                    var limit = req.query.limit;
                } else {
                    var limit = '';
                }
                db_model.getData(db, fields, where, orderBy, limit)
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
            db_model.getData(data_table, 'id', where, '', '')
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
                .then(result => res.json({
                    "mess": "ok",
                    "result": result,
                    "code": fields.code,
                    "reference": fields.reference,
                    "year": fields.year,
                    "month": fields.month,
                    "date": fields.date,
                    "createdTime": fields.createdTime
                }))
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

router.get("/get-client-data", (req, res) => {
    var ip = (req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress).split(",")[0];

    var geo = geoip.lookup(ip);
    res.json({
        ip: ip,
        domain: req.headers.origin,
        url: req.headers.referer,
        userAgent: req.headers['user-agent'],
        ipData: geo
    });
});

router.get("/get-countries-data", (req, res) => {
    let countriesData = countries.countries;
    res.json(countriesData);
});

router.get("/get-languages-data", (req, res) => {
    let db = 'mryu_languages';
    let fields = '*';
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
    let limit = '';
    db_model.getData(db, fields, where, orderBy, limit)
            .then(data => {
                res.json({ "mess": "ok", "data": data });
            })
            .catch(err => res.json({ "mess": "fail", "err": err }));
});

router.get("/get-currency-data", (req, res) => {
    var db = 'mryu_currencies';
    var fields = '*';
    var where = '';
    var orderBy = '';
    db_model.getData(db, fields, where, orderBy, '')
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
                    res.json({ "mess": "fail", "err": "noContent" });
                }
            } else {
                res.json({ "mess": "fail", "err": "dataNotFound" });
            }
        })
        .catch(err => res.json({ "mess": "fail", "err": err }));
});

router.get("/get-visa-order-types", (req, res) => {
    db_model.getData('mryu_visa_order_types', '*', '', '', '')
        .then(data => {
            res.json({ mess: 'ok', data: data });
        }).catch(err => res.json({ mess: 'fail', err: err }));
});

router.get("/get-site-values", (req, res) => {
    var secur_key = req.query.secur_key;
    if (secur_key == api_secur.secur) {
        var db = 'webs_site_value';
        var fields = '*';
        var where = req.query.where;
        var orderBy = '';
        db_model.getData(db, fields, where, orderBy, '')
            .then(data => {
                if (data.length > 0) {
                    var values = data[0];
                    if (values.tels) {
                        values.telArr = values.tels.split(' | ');
                    } else {
                        values.telArr = [];
                    }
                    if (values.emails) {
                        values.emailArr = values.emails.split(' | ');
                    } else {
                        values.emailArr = [];
                    }
                    if (values.hotlines) {
                        values.hotlineArr = values.hotlines.split(' | ');
                    } else {
                        values.hotlineArr = [];
                    }
                    if (values.contacts) {
                        values.contactArr = [];
                        const ctArr = values.contacts.split(' | ');
                        ctArr.forEach(ct => {
                            const arr = ct.split(':');
                            if (arr.length > 0) {
                                values.contactArr.push({
                                    type: arr[0],
                                    value: arr[1]
                                });
                            }
                        });
                    }
                    res.json({ "mess": "ok", "data": values });
                } else {
                    res.json({ "mess": "noData" });
                }

            }).catch(err => res.json({ "mess": "fail", "err": err }));
    } else {
        res.json({
            "mess": "fail",
            "err": "Fail or missing Security key!"
        });
    }
});


//USER API
router.get("/check-login/:username/:login_code/:onStatus/:secur_key", (req, res) => {
    var secur_key = req.params.secur_key;
    if (secur_key === api_secur.secur) {
        var username = req.params.username;
        var login_code = req.params.login_code;
        var onStatus = req.params.onStatus;
        var where = 'WHERE username = "' + username + '"';
        db_model.getData(data_tables.users, '*', where, '', '').then(rs => {
            if (rs.length > 0) {
                var user = rs[0];
                if (!user.enabled) {
                    res.json({ "mess": "fail", "err": "This User has been removed!" });
                } else if (user.level === 'locked') {
                    res.json({ "mess": "fail", "err": "This User has been locked!" });
                } else if (user.login_code !== login_code) {
                    res.json({ "mess": 'fail', "err": "Your password has been changed at " + user.changePassTime + ' !' });
                } else {
                    res.json({
                        "mess": "ok",
                        "userData": {
                            "id": user.id,
                            "login_code": user.login_code,
                            "username": user.username,
                            "avatar": user.avatar,
                            "nickname": user.nickname,
                            "fullname": user.fullname,
                            "tels": user.tels,
                            "emails": user.emails,
                            "level": user.level
                        },
                        "onStatus": onStatus
                    });
                }
            } else {
                res.json({ "mess": 'fail', "err": "This User not exists!" });
            }
        }).catch(er => res.json({ "mess": "fail", "err": er }));
    } else {
        res.json({ "mess": "fail", "err": 'Please provide the correct API Security key!' });
    }
});

router.get("/login/:onStatus/:username/:password/:secur_key", (req, res) => {
    var secur_key = req.params.secur_key;
    if (secur_key === api_secur.secur) {
        var onStatus = req.params.onStatus;
        var username = req.params.username;
        var password = req.params.password;
        password = md5(password + username);
        var where = 'WHERE username = "' + username + '"';
        db_model.getData(data_tables.users, '*', where, '', '').then(rs => {
            if (rs.length > 0) {
                let user = rs[0];
                if (!user.enabled) {
                    res.json({ "mess": "fail", "err": "This User has been removed!" });
                } else if (user.level === 'locked') {
                    res.json({ "mess": "fail", "err": "This User has been locked!" });
                } else if (user.password !== password) {
                    res.json({
                        "mess": "fail", "err": "Password is not right!",
                        "userPass": user.password,
                        "inputPass": password
                    });
                } else {
                    res.json({
                        "mess": "ok",
                        "userData": {
                            "id": user.id,
                            "login_code": user.login_code,
                            "username": user.username,
                            "avatar": user.avatar,
                            "nickname": user.nickname,
                            "fullname": user.fullname,
                            "tels": user.tels,
                            "emails": user.emails,
                            "level": user.level
                        },
                        "onStatus": onStatus
                    });
                }
            } else {
                res.json({ "mess": "fail", "err": "This User not exists!" });
            }
        }).catch(err => res.json({ "mess": "fail", "err": err }));
    } else {
        res.json({ "mess": "fail", "err": 'Please provide the correct API Security key!' });
    }
});

router.get("/unlock/:username/:password/:secur_key", (req, res) => {
    var secur_key = req.params.secur_key;
    if (secur_key === api_secur.secur) {
        var username = req.params.username;
        var password = req.params.password;
        password = md5(password + username);
        var where = 'WHERE username = "' + username + '"';
        db_model.getData(data_tables.users, '*', where, '', '').then(rs => {
            if (rs.length > 0) {
                let user = rs[0];
                if (user.password === password) {
                    res.json({ "mess": "ok" });
                } else {
                    res.json({ "mess": "fail", "err": "Incorrect password!" });
                }
            } else {
                res.json({ "mess": "fail", "err": "This User not exists!" });
            }
        }).catch(err => res.json({ "mess": "fail", "err": err }));
    } else {
        res.json({ "mess": "fail", "err": 'Please provide the correct API Security key!' });
    }
});

router.post("/add-user", jsonParser, (req, res) => {
    if (req.body) {
        var secur_key = req.body.secur_key;
        if (secur_key == api_secur.secur) {
            const fields = req.body.fields;
            if (!fields.password) {
                var newPassword = func.randomString(20);

            } else {
                var newPassword = fields.password;
            }
            var password = newPassword + fields.username;
            fields.password = md5(password);

            fields.login_code = func.randomString(20);

            db_model.addData(data_tables.users, fields).then(result => {
                res.json({
                    "mess": "ok",
                    "data": {
                        id: result.insertId,
                        username: fields.username,
                        password: newPassword
                    }
                })
            }).catch(err => res.json({ "mess": "fail", "err": err }));
        } else {
            res.json({
                "mess": "fail",
                "err": "Security key is not right!"
            });
        }
    } else {
        res.json({ "mess": "fail", "err": "No data posted!" });
    }
});

router.post("/reset-password", jsonParser, (req, res) => {
    if (req.body) {
        let secur_key = req.body.secur_key;
        if (secur_key === api_secur.secur) {
            var username = req.body.username;
            var changePassTime = req.body.changePassTime;
            var newPass = func.randomString(20);
            var password = md5(newPass + username);
            var login_code = func.randomString(20);

            var db = data_tables.users;
            var set = 'password = ?, login_code = ?, changePassTime = ?';
            var where = 'username';
            var params = [password, login_code, changePassTime, username];
            db_model.editData(db, set, where, params)
                .then(result => res.json({
                    "mess": "ok",
                    "newPass": newPass,
                    "login_code": login_code
                })).catch(err => res.json({
                    "mess": "fail",
                    "err": err
                }));
        } else {
            res.json({
                "mess": "fail",
                "err": "Please provide the correct API Security key!"
            });
        }
    } else {
        res.json({
            "mess": "fail",
            "err": "No data post received!"
        });
    }
});

router.post("/change-password", jsonParser, (req, res) => {
    if (req.body) {
        let secur_key = req.body.secur_key;
        if (secur_key == api_secur.secur) {
            var username = req.body.username;
            var password = req.body.password;
            password = md5(password + username);
            var login_code = func.randomString(20);
            var changePassTime = req.body.changePassTime;

            var db = data_tables.users;
            var set = 'password = ?, login_code = ?, changePassTime = ?';
            var where = 'username';
            var params = [password, login_code, changePassTime, username];
            db_model.editData(db, set, where, params)
                .then(result => res.json({
                    "mess": "ok",
                    "login_code": login_code,
                    "changePassTime": changePassTime
                })).catch(err => res.json({
                    "mess": "fail",
                    "err": err
                }));
        } else {
            res.json({
                "mess": "fail",
                "err": "Please provide the correct API Security key!"
            });
        }
    } else {
        res.json({
            "mess": "fail",
            "err": "No data post received!"
        });
    }
});

//database: vflco_db
router.get("/db/get-data", (req, res) => {
    var secur_key = req.query.secur_key;
    if (secur_key === api_secur.secur) {
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
            if (req.query.limit) {
                var limit = req.query.limit;
            } else {
                var limit = '';
            }
            db_model.getData(db, fields, where, orderBy, limit)
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
            "err": "Please provide the correct API Security key!"
        });
    }
});

router.post("/db/add-data", jsonParser, (req, res) => {
    if (req.body) {
        var secur_key = req.body.secur_key;
        if (secur_key === api_secur.secur) {
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
                    var where = 'WHERE year = "' + fields.year + '"';
                } else if (options.setNum == 'month') {
                    var where = 'WHERE month = "' + fields.month + '"';
                } else {
                    var where = 'WHERE date = "' + fields.date + '"';
                }
                db_model.getData(data_table, 'id', where, '', '')
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
                    .then(result => res.json({
                        "mess": "ok",
                        "result": result,
                        "code": fields.code,
                        "reference": fields.reference,
                        "year": fields.year,
                        "month": fields.month,
                        "date": fields.date,
                        "createdTime": fields.createdTime
                    }))
                    .catch(err => res.json({ "mess": "fail", "err": err }));
            }
        } else {
            res.json({
                "mess": "fail",
                "err": "Please provide the correct API Security key!"
            });
        }
    } else {
        res.json({
            "mess": "fail",
            "err": "No data post received!"
        });
    }
});

router.post("/db/edit-data", jsonParser, (req, res) => {
    if (req.body) {
        let secur_key = req.body.secur_key;
        if (secur_key === api_secur.secur) {
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
                "err": "Please provide the correct API Security key!"
            });
        }
    } else {
        res.json({
            "mess": "fail",
            "err": "No data post received!"
        });
    }
});

router.post("/db/delete-data", jsonParser, (req, res) => {
    if (req.body) {
        let secur_key = req.body.secur_key;
        if (secur_key === api_secur.secur) {
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
                "err": "Please provide the correct API Security key!"
            });
        }
    } else {
        res.json({
            "mess": "fail",
            "err": "No data post received!"
        });
    }
});

module.exports = router;