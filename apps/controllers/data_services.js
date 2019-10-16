var express = require("express");
var jsonParser = require("body-parser").json();
var router = express.Router();

var db_model = require("../models/db_models");

router.get("/", function (req, res) {
    res.json({ "mess": "VFL Data Api services" });
});

router.get("/countries", (req, res) => {
    if (req.query.orderBy) { var orderBy = 'ORDER BY ' + req.query.orderBy; } else { var orderBy = ''; }
    if (req.query.limit) { } else { var limit = ''; }
    var fields = '*';
    var where = 'WHERE hien_thi = 1';
    var db = 'mryu_currencies';
    db_model.getData(db, fields, where, orderBy, limit)
        .then(rs => {
            let data = [];
            rs.forEach(e => {
                data.push(e);
            });
            res.json({ "mess": "ok", "data": data });
        })
        .catch(err => res.json({ "mess": "fail", "err": err }));
});

module.exports = router;