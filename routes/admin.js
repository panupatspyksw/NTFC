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

router.get("/amountandtime",(req,res)=>{
    if(req.session.loggedin){
		const department = req.session.user_departmentID;
            var sql = "select concat(m.user_firstname,' ',m.user_lastname) as name, (select count(*) from request where req_getby = m.user_id AND req_status_id = 4 AND req_type_id = "+department+" AND MONTH(req_created) = "+month+") as received , COALESCE((select SUM(TIME_TO_SEC(TIMEDIFF(req_created, req_end))) from request where req_status_id = 4 AND req_getby = m.user_id AND MONTH(req_created) = "+month+"),0) as timeused from member m where m.user_departmentID = "+department+" AND m.user_typeID = 2";
            connection.query(sql, function(err, results, field) {
			if(err) throw err
			var amountandtime = results
			console.log(amountandtime)
            res.send(amountandtime)
	});
	}
	else{
	res.redirect("/")
}

})

router.get("/reqcountbyday",(req,res)=>{
    const department = req.session.user_departmentID;
            var sql = "SELECT DAY(req_created) as day, COUNT(*) as amount FROM request WHERE MONTH(req_created) = "+month+" AND req_type_id = "+department+" AND req_status_id = 4 GROUP BY DATE(req_created) ";
            connection.query(sql, function(err, results, field) {
            var reqcountbyday = results
            res.send(reqcountbyday)
    })

})

router.get("/reqcountbytype",(req,res)=>{
    const department = req.session.user_departmentID;
   
            var sql = "SELECT (select count(*) from request WHERE MONTH(req_created) = "+month+" AND req_type_id = "+department+") as ALLREQ,"+
            "(select count(*) from request WHERE MONTH(req_created) = "+month+" AND req_type_id = "+department+" AND req_status_id = 0) as CANCEL,"+
            "(select count(*) from request WHERE MONTH(req_created) = "+month+" AND req_type_id = "+department+" AND req_status_id = 1) as NEWREQ,"+
            "(select count(*) from request WHERE MONTH(req_created) = "+month+" AND req_type_id = "+department+" AND req_status_id = 2) as RECIEVE,"+
            "(select count(*) from request WHERE MONTH(req_created) = "+month+" AND req_type_id = "+department+" AND req_status_id = 3) as PASSADU,"+
            "(select count(*) from request WHERE MONTH(req_created) = "+month+" AND req_type_id = "+department+" AND req_status_id = 4) as SUCCESS,"+
            "(select count(*) from request WHERE MONTH(req_created) = "+month+" AND req_type_id = "+department+" AND req_status_id = 5) as DISAPPROVE";
            connection.query(sql, function(err, results, field) {
            var reqcountbytype = results
            res.send(reqcountbytype)
    })

})


router.get("/dashboard",(req,res) => {
    const department = req.session.user_departmentID;
    if(req.session.loggedin && req.session.user_usertype == "3"){
		async function requestdetail()
		{
			
			const reqcountbyday = await new Promise(function(resolve, reject) {
				var sql = "SELECT * FROM request WHERE MONTH(req_end) = "+month+" AND req_type_id = "+department;
				connection.query(sql, function(err, results, field) {
				resolve(results)
				})})

				if(reqcountbyday.length < 1){
					console.log("NO REQUEST THIS MONTH")
				}

				var countstatus = [];
				getcountoflists(req,res).then( (value) =>{
				countstatus = value;

				res.render("dashboard",{
					countstatus : countstatus,
					user_id : req.session.userID,
					logined : req.session.loggedin,
					user_usertype : req.session.user_usertype,
					user_username : req.session.user_username,
					reqcountbyday : reqcountbyday,
					profileimg : req.session.profileimage,

				})

			})
		}
		requestdetail()
        
	}
	else{
		res.redirect("/")
	}
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


async function getcountoflists(req,res){
	var listscount;

	var news = await new Promise(function(resolve, reject) {
		var sql = "select COUNT(*) as 'count' from request where req_status_id = 1 AND req_type_id = ? AND req_createdby != ?";
		connection.query(sql,[req.session.user_departmentID , req.session.userID], function(err, results, field) {
		if(results){
		resolve(results);
		}
		else{
			resolve(0);
		}
		})})
	
	var receives = await new Promise(function(resolve, reject) {
		var sql = "select COUNT(*) as 'count' from request where req_status_id = 2 AND req_type_id = ? AND req_createdby != ? AND req_getby = ?";
		connection.query(sql,[req.session.user_departmentID , req.session.userID, req.session.userID], function(err, results, field) {
		if(results){
		resolve(results);
		}
		else{
			resolve(0);
		}
	})})


	var requests = await new Promise(function(resolve, reject) {
		var sql = "select COUNT(*) as 'count' from request where req_status_id = 1 AND req_createdby = ?";
		connection.query(sql,[req.session.userID], function(err, results, field) {
		if(results){
		resolve(results);
		}
		else{
			resolve(0);
		}
	})})

	listscount = [requests[0].count, receives[0].count, news[0].count]

	return listscount
}

module.exports = router;