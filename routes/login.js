var mysql=require('mysql');
var md5=require('md5');
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime=require('mime-types');
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
/*var kafka = require('./kafka/client');*/
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: 'sunillalwani1@live.com',
        pass: 'Qazwsx@1'
    }
});

var mongo = require('./mongo');

var session = require('client-sessions');
var url='mongodb://Team22:team22@ds159866.mlab.com:59866/sportshub';


exports.logout=function (req,res) {
    req.session.destroy();
    var answer = "loggedOut";
    json_responses = {statusCode: 205, "answer": answer, "username": req.session.username}
    res.json(json_responses);
};



exports.login=function (req,res) {

    var flag=false;
    var email = req.body.email;
    var password=req.body.password;
    console.log("reached login");


    mongo.connect(function (db) {
        var coll = db.collection('users');
        coll.findOne({email: email,password:password}, function (err, user) {
            if (err) {
                res.json({
                    status: '401'
                });
            }
            if (!user) {
                answer = "Please Enter Correct Username and Password";
                json_responses = {statusCode: 401};
                res.json(json_responses);
            }
            else {
                if(user.password==password)
                {
                    res.json({statusCode: 205,result:user,loggedIn:"logInUser"});

                }

            }
        });
    });
};


exports.signup=function (req,res) {

    console.log("i am here and output is "+ req.body);
    var json_responses;
    var email = req.body.email;
    var name = req.body.name;
    var password=req.body.password;
    var phone=req.body.phone;



            if(!(password==null) && !(password==""))
            {
                var myobj = { email: email, username: name, password: password, phone_no: phone};

                mongo.connect(function (db) {
                    var coll = db.collection('users');
                    coll.insertOne(myobj, function(err, res) {
                        if (err) throw err;
                        console.log("1 document inserted");
                    });
                });
                json_responses = {"statusCode": 401,"result":"Signup Successfull"};
                res.json(json_responses);

            }
    else
    {
        //answer="Please provide Name";
        //res.json({"answer":answer});
    }
};


exports.playGame=function (req,res) {

    console.log("i am here and output is "+ req.body);
    var result="";
    var email = req.body.email;
    var game = req.body.game;
    var level=req.body.level;
    var time=req.body.time;
    var zip_code=req.body.zip_code;
    var data={
        email:email,
        game:game,
        level:level,
        time:time,
        zip_code:zip_code,
        occupied:'false',
        match_id:null,
        match_won:'false'
    };
    var data2={
        email:email,
        game:game,
        matches_played:0,
        matches_won:0
    };


        mongo.connect(function (db) {
            var coll = db.collection('play');
            coll.insertOne(data, function(err, res) {
                if (err) throw err;
                console.log("1 document inserted");
                db.close();
            });

            coll.find({level: level, zip_code: zip_code, occupied: 'false', email: {$ne : email}}).toArray(function(err, result) {
                if (err)
                {
                    throw err;
                }
                else if(!result)
                {
                    console.log("documents not found");
                }
                else
                {
                    json_responses = {"statusCode": 401,"result":result};
                    res.json(json_responses);
                    console.log("documents found"+ result);
                }

            });

        });
    mongo.connect(function (db) {

    var coll3 = db.collection('Stats');

    coll3.findOne({email: email, game: game}, function(err, result) {
        if (err){
            throw err;
        }
        else if(!result)
        {
            coll3.insertOne(data2, function(err, res) {
                if (err) throw err;
                console.log("1 document inserted");
                db.close();
            });
        }
        else{
            console.log("Nothing to insert");
        }

        console.log("1 document inserted");
        db.close();
    });
    });
};


exports.letsPlay=function (req,res) {

    var opponentEmail = req.body.opponentEmail;
    var userEmail = req.body.userEmail;
    var match_id=Math.floor(Math.random() * Math.floor(9999));


    mongo.connect(function (db) {
        var myquery = { email: userEmail };
        var newvalues = { $set: {occupied: "true", match_id: match_id } };
        var coll = db.collection('play');
        coll.updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });
        var opponentquery = { email: opponentEmail };
        coll.updateOne(opponentquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });

        json_responses = {"match_id": match_id};
        res.json(json_responses);


    });
};


exports.matchStateWon=function (req,res) {

    var match_won = req.body.match_won;
    var userEmail = req.body.userEmail;
    var opponentEmail = req.body.opponentEmail;
    var match_id = Number(req.body.match_id);
    var myquery1 = { email: userEmail};



    mongo.connect(function (db) {
        var myquery = { email: userEmail,match_id:match_id };
        var newvalues = { $set: {match_won: match_won, match_id: match_id } };
        var coll = db.collection('play');


        coll.findOne({email: opponentEmail, match_id: match_id}, function(err, result) {
            if (err)
            {
                throw err;
            }
            else if(!result)
            {
                console.log("documents not found");
            }
            else
            {
                if(result.match_won!==match_won)
                {
                    var matches_won=0;
                    var matches_played=0;
                    coll.updateOne(myquery, newvalues, function(err, res) {
                        if (err) throw err;
                        console.log("1 document updated");
                    });
                    var coll2 = db.collection('Stats');
                    coll2.findOne({email: userEmail}, function(err, result) {

                        if (err){
                            throw err;
                        }
                        else if(!result)
                        {
                            console.log("No Documents Found");
                        }
                        else
                        {
                            console.log(result);
                            matches_won=result.matches_won;
                            matches_played=result.matches_played + 1;
                            if(match_won==="true")
                            {
                                matches_won++;
                            }
                            var newvalues1 = { $set: {matches_won: matches_won, matches_played: matches_won } };
                            var coll3 = db.collection('Stats');
                            coll3.updateOne(myquery1, newvalues1, function(err, res) {
                                if (err) throw err;
                                console.log("1 document updated");
                                db.close();
                            });
                        }
                        console.log(matches_won);

                    });
                    json_responses = {"statusCode": 401,"result":"No Conflict"};
                    res.json(json_responses);
                }
            }

        });

    });
};





exports.userStats=function (req,res) {

    var userEmail = req.body.userEmail;
    mongo.connect(function (db) {

        var coll = db.collection('Stats');
        var badmintonStatsWon,badmantonStatsLoss,tennisStatsWon,tennisStatsLoss;

        coll.find({email: userEmail}).toArray(function(err, result) {
            if (err)
            {
                throw err;
            }
            else if(!result)
            {
                console.log("documents not found");
            }
            else
            {
                for(var i=0;i<result.length;i++)
                {
                    if(result[i].game==="Badminton")
                    {
                        badmintonStatsWon=result[i].matches_won;
                        badmintonStatsLoss=result[i].matches_played-result[i].matches_won;
                    }
                    else if(result[i].game==="Tennis")
                    {
                        tennisStatsWon=result[i].matches_won;
                        tennisStatsLoss=result[i].matches_played-result[i].matches_won;
                    }

                }
                json_responses = {"badmintonStatsWon": badmintonStatsWon,"badmintonStatsLoss":badmintonStatsLoss,"tennisStatsWon":tennisStatsWon,"tennisStatsLoss":tennisStatsLoss};
                res.json(json_responses);
            }

        });

    });
};
















