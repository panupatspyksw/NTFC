"use strict";

var express = require('express');

var session = require('express-session');

var router = express.Router();

var mysql = require('mysql');

var bodyParser = require('body-parser');

var path = require('path');

var multer = require('multer');

var _require = require('fs'),
    read = _require.read;

var _require2 = require('os'),
    type = _require2.type;

var _require3 = require('console'),
    count = _require3.count;

var nodemailer = require('nodemailer');

var _require4 = require('process'),
    send = _require4.send;

var _require5 = require('./ajaxreq'),
    route = _require5.route; // var connection = mysql.createConnection({
// 	host     : 'us-cdbr-east-02.cleardb.com',
// 	user     : 'bbc5aa79adb978',
// 	password : 'bc3f80a0',
// 	database : 'heroku_967c364b1d024e2'
// });


var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'notification'
});
var d = new Date();
var month = d.getMonth() + 1;
router.get("/admin", function (req, res) {
  res.send("ADMIN DASHBOARD");
}); // setup router

router.use(express["static"]("public"));
router.use(express["static"]("img"));
router.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
})); //Middle ware that is specific to this router

router.use(function timeLog(req, res, next) {
  //   console.log('Time: ', Date.now());
  next();
});
router.get("/admin", function (req, res) {
  res.send("ADMIN DASHBOARD");
});
module.exports = router;