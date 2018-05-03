var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors=require('cors');
var mysql=require('mysql');
const fileUpload = require('express-fileupload');
var session = require('client-sessions');
var index = require('./routes/index');
var users = require('./routes/users');
var login = require('./routes/login');
var testworld=require('./routes/testworld');
var myjs = require('./routes/myjs');
var app = express();
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
/*var kafka = require('./routes/kafka/client');*/
/*require('./routes/login').login(passport);*/


var mongoSessionURL = "mongodb://Sunil:sunil@ds045242.mlab.com:45242/freelancer";
var expressSessions = require("express-session");
var mongoStore = require("connect-mongo")(expressSessions);


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSessions({
    secret: "CMPE273_passport",
    resave: false,
    //Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false, //force to save uninitialized session to db.
    //A session is uninitialized when it is new but not modified.
    duration: 60 * 60 * 1000,
    activeDuration: 5 * 6 * 1000,
    store: new mongoStore({
        url: mongoSessionURL
    })
}));
app.use(passport.initialize());

/*app.use(require('express-session')({
    secret: 'This is a secret',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    // Boilerplate options, see:
    // * https://www.npmjs.com/package/express-session#resave
    // * https://www.npmjs.com/package/express-session#saveuninitialized
    resave: true,
    saveUninitialized: true
}));*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    cookieName: 'session',
    secret: 'cmpe_272_sportshub',
    duration: 60 * 60 * 1000,    //setting the time for active session
    activeDuration: 5 * 60 * 1000,  }));

app.use(cors());
app.use('/', index);
app.use('/users', users);
app.use('/myjs',myjs);
/*app.post('/login', function(req, res) {
    passport.authenticate('login', function(err, user) {
        if(err) {
            res.status(500).send();
        }

        if(!user) {
            res.status(401).send();
        }
        req.session.user = user.username;
        console.log(req.session.user);
        console.log("session initilized");
        var answer="loggedIn";
        json_responses = {statusCode: 205, "answer": answer,"username":req.session.user, result:user};
        return res.send(json_responses);

    })(req, res);
});*/

app.post('/logout', function(req,res) {
    console.log(req.session.user);
    req.session.destroy();
    console.log('Session Destroyed');
    var answer = "loggedOut";
    json_responses = {statusCode: 205, "answer": answer, "username": "sunil"}
    res.send(json_responses);

});

app.use('/login',login.login);
app.use('/signup',login.signup);
app.use('/playGame',login.playGame);
app.use('/letsPlay',login.letsPlay);
app.use('/matchStateWon',login.matchStateWon);
app.use('/userStats',login.userStats);


app.use(fileUpload());
app.use('/public', express.static(__dirname + '/public'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
