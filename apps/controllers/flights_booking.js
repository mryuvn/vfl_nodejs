var express = require("express");
var jsonParser = require("body-parser").json();
var router = express.Router();

router.get("/", function (req, res) {
    res.json({ "mess": "Flight booking api" });
});

module.exports = router;