var express = require("express");

var router = express.Router();

router.use("/api", require(__dirname + "/api"));
router.use("/plugins", require(__dirname + "/plugins"));
router.use("/nodemailer", require(__dirname + "/nodemailer"));
router.use("/flights-booking", require(__dirname + "/flights_booking"));
router.use("/users", require(__dirname + "/users"));
router.use("/customers", require(__dirname + "/customers"));
router.use("/visa-orders", require(__dirname + "/visa_orders"));
router.use("/data-services", require(__dirname + "/data_services"));

router.get("/", function (req, res) {
    res.json({"mess": "<vfl_nodejs> Welcome to Nodejs Application!"});
});

module.exports = router;