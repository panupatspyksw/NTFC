var express = require('express');
var session = require('express-session');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var path = require('path');
var multer  = require('multer');
const { read } = require('fs');
const { type } = require('os');
const { count } = require('console');
const nodemailer = require('nodemailer');
const { send } = require('process');
const { route } = require('./ajaxreq');

// var connection = mysql.createConnection({
// 	host     : 'us-cdbr-east-02.cleardb.com',
// 	user     : 'bbc5aa79adb978',
// 	password : 'bc3f80a0',
// 	database : 'heroku_967c364b1d024e2'
// });
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'notification'
});
const d = new Date();
const month = d.getMonth() + 1;


router.get("/admin",(req,res)=>{
    res.send("ADMIN DASHBOARD")
})


// setup router
router.use(express.static("public"));
router.use(express.static("img"));

router.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
//Middle ware that is specific to this router
router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
  next();
});




router.get("/admin",(req,res)=>{
    res.send("ADMIN DASHBOARD")
})




module.exports = router;