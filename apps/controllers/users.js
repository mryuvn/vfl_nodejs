var express = require("express");
var jsonParser = require("body-parser").json();
var router = express.Router();

var func = require("../common/func");
var md5 = require('md5');
var api_secur = require("../common/api_secur");
var db_model = require("../models/db_models");
var data_tables = {
    users: 'mryu_users',
}

router.get("/", function (req, res) {
    res.json({ "mess": "This is Users API" });
});

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
        res.json({ "mess": "fail", "err": 'Security key not right!' });
    }
});

router.post("/login", jsonParser, (req, res) => {
    if (req.body) {
        var onStatus = req.body.onStatus;
        var username = req.body.username;
        var password = req.body.password;
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
                    res.json({ "mess": "fail", "err": "Password is not right!" });
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
        }).catch(er => res.json({ "mess": "fail", "err": er }));
    } else {
        res.json({ "mess": "fail", "err": "No data posted!" });
    }
});

router.post("/unlock", jsonParser, (req, res) => {
    if (req.body) {
        var username = req.body.username;
        var password = req.body.password;
        password = md5(password + username);
        var where = 'WHERE username = "' + username + '"';
        db_model.getData(data_tables.users, '*', where, '', '').then(rs => {
            if (rs.length > 0) {
                let user = rs[0];
                if (user.password === password) {
                    res.json({"mess": "ok"});
                } else {
                    res.json({ "mess": "fail", "err": "Incorrect password!" });
                }
            } else {
                res.json({ "mess": "fail", "err": "This User not exists!" });
            }
        }).catch(err => res.json({ "mess": "fail", "err": er }));
    } else {
        res.json({ "mess": "fail", "err": "No data posted!" });
    }
});

router.post("/add-user", jsonParser, (req, res) => {
    if (req.body) {
        const fields = req.body;
        if (!fields.password) {
            var newPassword = func.randomString(20);
            
        } else {
            var newPassword = fields.password;
        }
        var password = newPassword + fields.username;
        fields.password = md5(password);

        fields.login_code = func.randomString(20);
        fields.createdTime = func.getVnTime();

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
        res.json({ "mess": "fail", "err": "No data posted!" });
    }
});

router.post("/reset-password", jsonParser, (req, res) => {
    if (req.body) {
        var username = req.body.username;
        var newPass = func.randomString(20);
        var password = md5(newPass + username);
        var login_code = func.randomString(20);
        var changePassTime = func.getVnTime();

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
            "err": "No data post received!"
        });
    }
});

router.post("/change-password", jsonParser, (req, res) => {
    if (req.body) {
        var username = req.body.username;
        var password = req.body.password;
        password = md5(password + username);
        var login_code = func.randomString(20);
        var changePassTime = func.getVnTime();

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
            "err": "No data post received!"
        });
    }
});

module.exports = router;