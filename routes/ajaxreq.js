var express = require('express');
var session = require('express-session');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var path = require('path');
var multer  = require('multer');
const { read } = require('fs');
const { type } = require('os');
const { count, Console } = require('console');
const nodemailer = require('nodemailer');
const { send } = require('process');
var MemoryStore = require('memorystore')(session)
var connection
var db_config = {
	host     : 'us-cdbr-east-02.cleardb.com',
	user     : 'bbc5aa79adb978',
	password : 'bc3f80a0',
	database : 'heroku_967c364b1d024e2'
  };
  
  
  function handleDisconnect() {
	connection = mysql.createConnection(db_config); // Recreate the connection, since
													// the old one cannot be reused.
  
	connection.connect(function(err) {              // The server is either down
	  if(err) {                                     // or restarting (takes a while sometimes).
		console.log('error when connecting to db:', err);
		setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
	  }                                     // to avoid a hot loop, and to allow our node script to
	});                                     // process asynchronous requests in the meantime.
											// If you're also serving http, display a 503 error.
	connection.on('error', function(err) {
	  console.log('db error', err);
	  if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
		handleDisconnect();                         // lost due to either server restart, or a
	  } else {                                      // connnection idle timeout (the wait_timeout
		throw err;                                  // server variable configures this)
	  }
	});
  }
  
  handleDisconnect();

  const pool = mysql.createPool({
	host     : 'us-cdbr-east-02.cleardb.com',
	user     : 'bbc5aa79adb978',
	password : 'bc3f80a0',
	database : 'heroku_967c364b1d024e2'
  });
  
  // ... later
  setInterval(function () {
	connection.query("SET time_zone = '+07:00'", function(err, results, field) {})
	pool.query('select 1 + 1', (err, rows) => { /* */ });
}, 5000);


// var connection = mysql.createConnection({
// 	host     : 'localhost',
// 	user     : 'root',
// 	password : '',
// 	database : 'notification'
// });

// setup router
router.use(express.static("public"));
router.use(express.static("img"));
router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());
router.use(session({
	secret: 'secret',
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: true,
	secret: 'keyboard cat',
	saveUninitialized: true,

}))
//Middle ware that is specific to this router
router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
  next();
});

// setup email auth for send
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: 'yourmail@gmail.com', // your email
	  pass: 'password' // your email password
	}
  });


// path router
router.get("/updatelistnew",(req,res)=>{
	if(req.session.loggedin && req.session.user_usertype == 2){
	var typereq = req.session.user_departmentID;
	var requestlists = [];
	var sql = "";
	if(req.session.user_departmentID == 4){
		sql = 'select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des, CONCAT(m.user_firstname," ",m.user_lastname) as createby from request r,member m, request_status s WHERE m.user_id = r.req_createdby AND r.req_status_id = 3 AND r.req_status_id=s.req_status_id order by r.req_created DESC'
	}
	else{
		sql = 'select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des, CONCAT(m.user_firstname," ",m.user_lastname) as createby from request r,member m, request_status s WHERE m.user_id = r.req_createdby AND r.req_type_id = '+typereq+' AND r.req_status_id = 1 AND r.req_status_id=s.req_status_id order by r.req_created DESC';
	}
	connection.query(sql, function(err, results, field) {
		if(err){
			throw err;
		}
		if (results) 
		{	
			for(var i=0; i<results.length; i++){
				var createdat = timeforreqlist(results[i].req_created)
					requestlists.push(
						{
							id: results[i].req_ID,
							title: results[i].req_title,
							status: results[i].req_status_title,
							createdat : createdat,
							createdby : results[i].createby,
							statusid : results[i].req_status_id,
							des : results[i].req_des
						}
					)
				createdat = "";
			}
		}
		var listupdate = requestlists;
    	res.send(listupdate);
	})
	}
	else{
		var listupdate = [];
    	res.send(listupdate);
	}
})

router.get("/updatecountlist",(req,res)=>{
	if(req.session.loggedin && req.session.user_usertype == 2){
	updatecountlist(req,res).then( (value) =>{
		var numonheader = value;
		res.send(numonheader)
	})
	}
	else{
	res.send(false)
	}
})

// update header number on menu function
async function updatecountlist(req,res){
	var listscount;
	if(req.session.loggedin && req.session.user_usertype == 2){
	var news = await new Promise(function(resolve, reject) {
		var sql = ""
		if(req.session.user_departmentID == 4){
			var sql = "select COUNT(*) as 'count' from request where req_status_id = 3 AND req_createdby != ?";
			connection.query(sql,[req.session.userID], function(err, results, field) {
			if(err){
				throw err
			}
			if(results){
			if(results.length > 0){
			resolve(results);
			}
			else{
				resolve(0);
			}
			}
			})
		}
		else{
			var sql = "select COUNT(*) as 'count' from request where req_status_id = 1 AND req_type_id = ? AND req_createdby != ?";
			connection.query(sql,[req.session.user_departmentID , req.session.userID], function(err, results, field) {
			
			if(err){
				throw err;
			}
			if(results){
			if(results.length > 0){
			resolve(results);
			}
			else{
				resolve(0);
			}
			}
		})
		}
	})
	

	return news[0]
	}
	else{
		return []
	}
}

function timeforreqlist(reqcreated){
	var current_datetime = new Date();
	var formatted_date = "";
	if(reqcreated.getDate() == current_datetime.getDate() && reqcreated.getMonth() == current_datetime.getMonth() && reqcreated.getFullYear() == current_datetime.getFullYear()){
		var min = "";
		if(reqcreated.getMinutes()<10){
		min = "0"+reqcreated.getMinutes();
		}
		else{
		min = reqcreated.getMinutes()
		}
		if(reqcreated.getHours() > 12){
			formatted_date = reqcreated.getHours()-12 + ":" + min + " PM";
		}
		else{
			formatted_date = reqcreated.getHours() + ":" + min + " AM";
		}
	
	}
	else{
			formatted_date = reqcreated.getDate() + "/" + (reqcreated.getMonth() + 1) + "/" + reqcreated.getFullYear()
	}
	return formatted_date;
	}

router.get("/sendupdate", (req,res) => {
	var subject = ""

	const output = "<style>@import url('https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap'); .message{font-family: 'Kanit', sans-serif;}.header{font-weight: 500;}</style> <div class='message'> <div class='header'> ศูนย์แจ้งซ่อมวิทยาลัยนวัติกรรมสื่อสารสังคม มศว </div><br><div class='msg'> ขณะนี้เจ้าหน้าที่ได้รับเรื่องรายการแจ้งซ่อมของคุณแล้ว <br><span class='header'>หมายเหตุจากเจ้าหน้าที่</span>(คุณ) : จะเข้าไปตรวจสอบภายในทันที </div><br><div> ติดต่อเจ้าหน้าที่ : 06666666666<br>ติดต่อศูนย์แจ้งซ่อม : 05151515151 </div></div>"

	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
		  user: 'ffs.fgdz@gmail.com', // generated ethereal user
		  pass: 'oneofakind0628184303', // generated ethereal password
		},
	  });
	
	  // send mail with defined transport object
	  let mailOptions = {
		from: '"ศูนย์แจ้งซ่อมวิทยาลัยนวัตกรรมสื่อสารสังคม มศว" <ffs.fgdz@gmail.com>', // sender address
		to: "panupat.sriphayakswet@g.swu.ac.th", // list of receivers
		subject: "รายการแจ้งซ่อมเข้ามาใหม่", // Subject line
		html: output, // html body
		dsn: {
			id: '61130010186',
			return: 'headers',
			notify: 'success',
			recipient: 'ffs.fgdz@gmail.com'
		}
	  };

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log(error);
		}
		else{
			res.send("ok")
		}
	});
});


router.get("/test",(req,res)=>{
	res.send("asdasdsad")
})

router.get("/refreshsession",(req,res)=>{
	if(req.session.userID && req.session.loggedin)
	{
			var sql = "select * from member where user_id = ?";
			connection.query(sql,[req.session.userID], function(err, results, field) 
			{
				req.session.user_departmentID = results[0].user_departmentID;
				req.session.user_usertype = results[0].user_typeID;
				req.session.user_username = results[0].user_username;
				req.session.phone = results[0].user_phone;
				req.session.fname = results[0].user_firstname;
				req.session.lname = results[0].user_lastname;
				req.session.profileimage = results[0].profileimg
				res.send("success")
			})
	}
	else{
		res.send("no found")
	}
})

router.get("/searchreceivelist/:searchtext",(req,res)=>{
	if(req.session.userID && req.session.loggedin){
	var receivelists = []
	var sql = "";
	if(req.session.user_departmentID == 4){
		if(req.params.searchtext == "blank"){
		sql = "select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des, CONCAT(m.user_firstname,' ',m.user_lastname) as createby from request r,member m, request_status s WHERE m.user_id = r.req_createdby AND r.req_repairby=? AND r.req_status_id=s.req_status_id order by r.req_created DESC";
		}
		else{
		var searchtext = "%"+req.params.searchtext+"%";
		sql = "select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des, CONCAT(m.user_firstname,' ',m.user_lastname) as createby from request r,member m, request_status s WHERE m.user_id = r.req_createdby AND r.req_repairby=? AND r.req_status_id=s.req_status_id AND (r.req_ID like '"+searchtext+"' OR r.req_title like '"+searchtext+"') order by r.req_created DESC"
		}
	}
	else{
		if(req.params.searchtext == "blank"){
			sql = "select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des, CONCAT(m.user_firstname,' ',m.user_lastname) as createby from request r,member m, request_status s WHERE m.user_id = r.req_createdby AND r.req_getby=? AND r.req_status_id=s.req_status_id order by r.req_created DESC";
			}
			else{
			var searchtext = "%"+req.params.searchtext+"%";
			sql = "select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des, CONCAT(m.user_firstname,' ',m.user_lastname) as createby from request r,member m, request_status s WHERE m.user_id = r.req_createdby AND r.req_getby=? AND r.req_status_id=s.req_status_id AND (r.req_ID like '"+searchtext+"' OR r.req_title like '"+searchtext+"') order by r.req_created DESC"
			}	
	}

	connection.query(sql,[req.session.userID], function(err, results, field) {
		if (results.length > 0) 
		{	
			for(var i=0; i<results.length; i++){
			var createdat = timeforreqlist(results[i].req_created)
				receivelists.push(
					{
						id: results[i].req_ID,
						title: results[i].req_title,
						status: results[i].req_status_title,
						createdat : createdat,
						createdby : results[i].createby,
						statusid : results[i].req_status_id,
						des : results[i].req_des
					}
				)
			createdat = "";
			}
			res.send(receivelists)
		}
		else{
			res.send(receivelists)
		}
	})
	}
	else{
		var receivelists = []
		res.send(receivelists)
	}
})

router.get("/searchrequestlist/:searchtext",(req,res)=>{
	if(req.session.userID && req.session.loggedin){
	var requestlists = []
	var sql = "";
	if(req.params.searchtext == "blank"){
	sql = 'select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des, CONCAT(m.user_firstname," ",m.user_lastname) as createby from request r,member m, request_status s WHERE m.user_id = r.req_createdby AND r.req_createdby=? AND r.req_status_id=s.req_status_id order by r.req_created DESC';
	}
	else{
	var searchtext = "%"+req.params.searchtext+"%";
	sql = "select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des, CONCAT(m.user_firstname,' ',m.user_lastname) as createby from request r,member m, request_status s WHERE m.user_id = r.req_createdby AND r.req_createdby=? AND r.req_status_id=s.req_status_id and (r.req_ID like '"+searchtext+"' OR r.req_title like '"+searchtext+"') order by r.req_created DESC"
	}

	connection.query(sql,[req.session.userID], function(err, results, field) {
		if (results.length > 0) 
		{	
			for(var i=0; i<results.length; i++){
			var createdat = timeforreqlist(results[i].req_created)
			requestlists.push(
					{
						id: results[i].req_ID,
						title: results[i].req_title,
						status: results[i].req_status_title,
						createdat : createdat,
						createdby : results[i].createby,
						statusid : results[i].req_status_id,
						des : results[i].req_des
					}
				)
			createdat = "";
			}
			res.send(requestlists)
		}
		else{
			res.send(requestlists)
		}
	})
	}
	else{
		var requestlists = []
		res.send(requestlists)
	}
})

function sendmail(subject,toemail,subject,html){
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
		  user: 'ffs.fgdz@gmail.com', // generated ethereal user
		  pass: 'oneofakind0628184303', // generated ethereal password
		},
	  });
	
	  // send mail with defined transport object
	  let mailOptions = {
		from: '"ศูนย์แจ้งซ่อมวิทยาลัยนวัตกรรมสื่อสารสังคม มศว" <ffs.fgdz@gmail.com>', // sender address
		to: toemail, // list of receivers
		subject: subject, // Subject line
		html: html, // html body
		dsn: {
			id: '61130010186',
			return: 'headers',
			notify: 'success',
			recipient: 'ffs.fgdz@gmail.com'
		}
	  };

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		else{
			console.log("send email successful");
		}
	});


}

function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}



function timeforreqlist(reqcreated){
	console.log("date from mysql = "+reqcreated)
	var current_datetime = new Date();
	current_datetime = convertTZ(current_datetime, "Asia/Jakarta")
	console.log("date from newdate = "+current_datetime)

	var formatted_date = "";
	if(reqcreated.getDate() == current_datetime.getDate() && reqcreated.getMonth() == current_datetime.getMonth() && reqcreated.getFullYear() == current_datetime.getFullYear()){
		var min = "";
		if(reqcreated.getMinutes()<10){
		min = "0"+reqcreated.getMinutes();
		}
		else{
		min = reqcreated.getMinutes()
		}
		if(reqcreated.getHours() > 12){
			formatted_date = reqcreated.getHours()-12 + ":" + min + " PM";
		}
		else{
			formatted_date = reqcreated.getHours() + ":" + min + " AM";
		}
	}
	else{
			formatted_date = reqcreated.getDate() + "/" + (reqcreated.getMonth() + 1) + "/" + reqcreated.getFullYear()
	}
	return formatted_date;
	}


module.exports = router;