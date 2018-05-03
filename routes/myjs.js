var mysql=require('mysql');
var express = require('express');
var md5=require('md5');
var router = express.Router();
var multer =require('multer');
var app = express();

var mongo = require('./mongo');



router.post('/login', function(req, res, next) {


    var flag=false;
    var answer="";
    var username = req.body.username;
    var password=req.body.password;



    if(!(username==null) && !(username==""))
    {
        if(!(password==null) && !(password==""))
        {
            if(req.session.username)
            {
                username:req.session.username;
            }
            else {
                password = md5(password);

                var con = mysql.createConnection({
                    host: "localhost",
                    user: "root",
                    password: "1111",
                    database: "freelancer"
                });


                con.connect(function (err) {
                    var flag = false;
                    if (err)
                        throw err;
                    var json_responses;
                    var sql = "Select * from users where email = ? and password = ?";
                    //var records =[username,password];
                    con.query(sql, [username, password], function (err, result, fields) {
                        if (err)
                            throw err;
                        if (result.length >= 1) {
                            req.session.username = username;
                            console.log("Session initialized");
                            answer = "Login Successfull";
                            json_responses = {statusCode: 200, "answer": answer}
                            res.json(json_responses);
                        }
                        else {
                            answer = "Please Enter Correct Username and Password";
                            json_responses = {"statusCode": 401,"answer":answer};
                            res.json(json_responses);
                        }
                    });

                });

            }
        }
        else
        {
            answer="Please provide password";
            res.json({"answer":answer});
        }
    }
    else
    {
        answer="Please provide email";
        res.json({"answer":answer});
    }

});





router.post('/logout', function(req, res, next) {
    req.session.destroy();
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, req.headers.path)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg')
        var fname=file.originalname;
        console.log(fname);
    }
});

var upload = multer({ storage: storage});

/*router.post('/postProjects',upload.any(), function(req, res, next) {

    var name = req.body.name;
    var description = req.body.description;
    var skillsRequired = req.body.skillsRequired;
    var budgetRange = req.body.budgetRange;
    var files = req.headers.path;
    var status = req.body.status;
    var estimateProjectCompletionDate = req.body.estimateProjectCompletionDate;
    var convertedDate=new Date(estimateProjectCompletionDate);
    var owner = req.body.owner;
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "1111",
        database: "freelancer"
    });

    con.connect(function (err) {
        var flag = false;
        if (err)
            throw err;
        var json_responses;
        var sql = "insert into projects values (0,?,?,?,?,?,?,?,?)";
        con.query(sql, [name,description,skillsRequired,budgetRange,files,status,convertedDate,owner], function (err, result, fields) {
            if (err)
                throw err;
            else {
                json_responses = {result: "Done and Dusted"};
                res.json(json_responses);
            }
        });

    });
});*/






module.exports = router;