var express = require("express");
var router = express.Router();

var jsonParser = require("body-parser").json();
var nodemailer = require("nodemailer");

router.get("/", function(req, res){
    res.json({"mess": "Welcome to NodeMailer Application!"});
});

router.post('/sendMail', jsonParser, (req, res) => {
    if (req.body) {
        var name = req.body.acc.name;
        var user = req.body.acc.user;
        var pass = req.body.acc.pass;

        var email = req.body.data.email;
        var subject = req.body.data.subject;
        var content = req.body.data.content;
    
        var transporter = nodemailer.createTransport({
            host:'smtp.zoho.com',
            port:'465',
            secure:true,
            auth:{
                user:user,
                pass:pass
            }
        })
        transporter.sendMail({
            from:name+'<'+user+'>',
            to:email,
            subject:subject,
            text:'',
            html:content
        }, (err, response) => {
            if (err) {
                res.json({
                    "mess": "fail",
                    "error": err,
                    "postData": req.body
                });
                console.log(err);
            } else {
                res.json({
                    "mess": "ok"
                });
            }
        })
    } else {
        res.json({
            "mess": "fail",
            "error": 'Data post is not found!'
        });
    }
})

module.exports = router;