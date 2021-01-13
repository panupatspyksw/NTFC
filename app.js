var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var port = process.env.PORT || 8000;
var alert = require('alert')
var multer  = require('multer');
var fs = require('fs');
const { read } = require('fs');
const { type } = require('os');
const { count } = require('console');
const { request } = require('http');
const nodemailer = require('nodemailer');
var defaultimg = "defaultprofile.png";


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

// var connection = mysql.createConnection({
// 	host     : 'localhost',
// 	user     : 'root',
// 	password : '',
// 	database : 'notification'
// });
app.use(require('./routes/ajaxreq.js')); 
app.use(require('./routes/admin.js')); 

app.use(express.static("public"));
app.use(express.static("img"));
app.set("view engine","ejs");
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true,
	cookie : { secure: false }
}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
		var filename = file.originalname.split(" ").join('')
		filename = filename.split("_").join('')
		filename = filename.split("-").join('')
        filename = filename.split(".")
        filename[0],filename[1];
        cb(null, filename[0]+Date.now()+"."+filename[1])
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Allowed only .png, .jpg, .jpeg and .gif'));
        }
    }
});






app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());



app.use(function(req, res, next) {
	res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
	res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
	res.setHeader("Expires", "0"); // Proxies.
	res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	next();
  });

app.get("/",function(req,res){
    if(req.session.userID != null && req.session.loggedin != null){
        res.redirect("/request")

    }
    else{
        res.render("login",{
			aa : "helloworld"
		});
    }
})


app.get("/transition",function(req,res){
	res.render("transitionload")
})


app.get("/auth",function(req,res){
	res.redirect("/");
})

app.post("/auth",function(req,res){
    var user_id = req.body.user_id;
	var user_password = req.body.user_password;
	var user_firstname, user_lastname, user_usertype, user_username,user_departmentID;
    if (user_id && user_password) {
		connection.query('SELECT * FROM member WHERE user_id = ? AND user_password = ?', [user_id, user_password], function(error, results, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.loadlogin = true;

                var i = 0;
                for (var i = 0; i< results.length; i++) {
                   user_id = results[i].user_id;
                   user_username = results[i].user_username;
                   user_firstname = results[i].user_firstname;
                   user_lastname = results[i].user_lastname;
                   user_usertype = results[i].user_typeID;
				   user_departmentID = results[i].user_departmentID;
				   
				   req.session.userID = user_id;
				   req.session.user_departmentID = user_departmentID;
				   req.session.user_usertype = user_usertype;
				   req.session.user_username = user_username;
				   req.session.phone = results[i].user_phone;
				   req.session.fname = user_firstname;
				   req.session.lname = user_lastname;
				   req.session.profileimage = results[i].profileimg
				}
				res.redirect("/")
				
                
			} else {
				res.render("login",{
					message : "Username or password not correct",
					user_id  : user_id
				})
				
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
})



app.get("/profile",function(req,res){
	
	if(req.session.loggedin && req.session.userID)
	{
		connection.query('SELECT * FROM member WHERE user_id = ?', [req.session.userID], function(error, results, fields) 
		{

				var profiledata = results[0]
				var countstatus = [];
				getcountoflists(req,res).then( (value) =>{
				countstatus = value;
					res.render("profile",{
						countstatus : countstatus,
						user_id : req.session.userID,
						logined : req.session.loggedin,
						user_usertype : req.session.user_usertype,
						user_username : req.session.user_username,
						profileimg : req.session.profileimage,
						profiledata : profiledata,
						notifyforreq : results[0].notifyforreq
						
					})
				})
		});
	}
	else{
		res.redirect("/")
	}
})

app.post('/uploadprofileimage', upload.single('uploadFile'), (req, res, next) => {
	var newimgpath = "";
	async function deleteprofileimage(){
		const imgtodelete = await new Promise(function(resolve, reject) {
			connection.query('SELECT profileimg from member WHERE user_id = ?',[req.session.userID], function(err, results, field) {
				
				resolve(results[0].profileimg);
			})
		});
		
		const settodefualt = await new Promise(function(resolve, reject) {
			connection.query('UPDATE member SET profileimg = ? WHERE user_id = ?',[req.file.filename,req.session.userID], function(err, results, field) {
				if(results){
				resolve(results);
				newimgpath = req.file.filename;
				res.send(newimgpath);
				}
				if(err){
					console.log(err)
					res.send(false)
				}

			})
		});
		var imgpath = 'public/uploads/'+imgtodelete;
		if (fs.existsSync(imgpath)) {
			fs.unlink(imgpath, function (err) {
				if (err) throw err;
				// if no error, file has been deleted successfully

			}); 
		}
		else{
		}
	}
	deleteprofileimage()
})


app.post("/deleteprofileimage",(req,res)=>{
	async function deleteprofileimage(){
	const imgtodelete = await new Promise(function(resolve, reject) {
		connection.query('SELECT profileimg from member WHERE user_id = ?',[req.session.userID], function(err, results, field) {
			
			resolve(results[0].profileimg);
		})
	});
	const settodefualt = await new Promise(function(resolve, reject) {
		connection.query('UPDATE member SET profileimg = "defaultprofile.png" WHERE user_id = ?',[req.session.userID], function(err, results, field) {
			resolve(results);
		})
	});
	var imgpath = 'public/uploads/'+imgtodelete;
	if (fs.existsSync(imgpath)) {
		fs.unlink(imgpath, function (err) {
			if (err) throw err;
			// if no error, file has been deleted successfully
			res.send(defaultimg)

		}); 
	}
	else{
		res.send(defaultimg)
	}
	}
	deleteprofileimage();
})

app.post("/profile",upload.single('profile', 1), (req, res, next) => {
	
	var profiledata = req.body || false;
	if(!profiledata.notify){
		profiledata.notify = 0
	}

	if(req.session.loggedin && req.session.userID && profiledata)
	{
		connection.query('UPDATE member SET user_username = ?, user_email = ?, user_phone = ?, user_password = ? ,notifyforreq = ? WHERE user_id = ?', [profiledata.username,profiledata.email,profiledata.phone,profiledata.password,profiledata.notify,profiledata.userid], function(error, results, fields) 
		{
			if(error){
				console.log(error)
			}
			if(results){
				var countstatus = [];
				getcountoflists(req,res).then( (value) =>{
				countstatus = value;
				res.redirect("/profile");
			})
			}

			
		});
	}
	else{
		res.render("login",{
			aa : "helloworld"
		});
	}
})


app.get("/logout",function(req,res){
	req.session.destroy();
	res.redirect("/")
	res.end()
})


app.get("/request",function(req,res){
	var check = req.session.loadlogin;
	req.session.loadlogin = false;

	if(req.session.loggedin){
		var countstatus = [];
		getcountoflists(req,res).then( (value) =>{
			countstatus = value;

		if(check == false){
			res.render("request",{
				pageload : false,
				countstatus : countstatus,
				user_id : req.session.userID,
				logined : req.session.loggedin,
				user_usertype : req.session.user_usertype,
				user_username : req.session.user_username,
				departmentID : req.session.user_departmentID,
				profileimg : req.session.profileimage,

			})
		}
		else{
			res.render("request",{
				pageload : true,
				countstatus : countstatus,
				user_id : req.session.userID,
				logined : req.session.loggedin,
				user_usertype : req.session.user_usertype,
				user_username : req.session.user_username,
				departmentID : req.session.user_departmentID,
				profileimg : req.session.profileimage,

			})
		}

	});
	}
	else{
		res.redirect("/auth")
	}
})

var locationdata = [];
app.get("/requestIT",function(req,res){


	if((req.session.loggedin && req.session.user_departmentID != 1) | (req.session.loggedin && req.session.user_usertype == "3")){
		async function listdata()
		{
			const product = await new Promise(function(resolve, reject) {
				connection.query('SELECT * FROM product WHERE product_typeID = 1', function(err, results, field) {
					if (err) throw err
					if (results.length > 0) 
					{
						var arrayy = [];
						var i = 0;
						for (var i = 0; i< results.length; i++) {
							arrayy.push(results[i]['product_name'])
						}
						resolve(arrayy);
					}
				})
			});
			const location = await new Promise(function(resolve, reject) {
				connection.query('SELECT * FROM location', function(err, results, field) {
					if (err) throw err
					if (results.length > 0) 
					{
						var arrayy = [];
						var i = 0;
						for (var i = 0; i< results.length; i++) {
							arrayy.push(results[i]['location_id'])
						}
						resolve(arrayy);
					}
				})
			});
			const problemfortitle = await new Promise(function(resolve, reject) {
				connection.query('SELECT * FROM problem WHERE req_type_id = 1', function(err, results, field) {
					resolve(results)
				})
			});
				var countstatus = [];
				getcountoflists(req,res).then( (value) =>{
					countstatus = value;
		
			
				res.render("requestIT",
				{
				countstatus : countstatus,
				user_id : req.session.userID,
				logined : req.session.loggedin,
				user_usertype : req.session.user_usertype,
				user_username : req.session.user_username,
				locations : location,
				products : product,
				problem : problemfortitle,
				profileimg : req.session.profileimage,

				})
		
			});

		}

		listdata();

	}
	else{
		res.redirect("/")
	}
})
app.post('/requestIT', upload.array('images', 10), (req, res, next) => {
	var description = req.body.description;
	if((req.session.loggedin && req.session.user_departmentID != 1) | (req.session.loggedin && req.session.user_usertype == "3")){
		var requestID = "IT" + Date.now();		
		var dataimages = [], dataproducts = [];
		req.files.forEach(element => {
			dataimages.push([requestID, element.filename])
		});
		if(Array.isArray(req.body.productid)){
			for(var x=0; x<req.body.productid.length; x++){
				dataproducts.push([requestID, req.body.productid[x], req.body.productname[x], req.body.position[x], req.body.des[x]])
			}
		}
		else{
			dataproducts.push([requestID, req.body.productid, req.body.productname, req.body.position, req.body.des])
		}
		
		async function requesttodatabase()
		{

			const mailsofdepartment = await new Promise(function(resolve, reject) {
				connection.query('select m.user_email from member m where m.user_departmentID = 1 AND notifyforreq = 1', function(err, results, field) {
					resolve(results);
					if(results.length > 0){
					const emails = []
					for(var i = 0; i < results.length;i++){
						emails.push(results[i].user_email)
					}
					var subject = "รายการแจ้งซ่อมเข้ามาใหม่";
					var html = "คุณ"+req.session.fname+" "+req.session.lname+" ได้ทำการแจ้งซ่อมเข้ามา<br>หมายเหตุจากผู้แจ้ง : "+description+"<br>หมายเลขไอดีรายการแจ้ง : "+requestID+"<br><br> ติดต่อผู้แจ้ง : "+req.session.phone;
					sendmail(emails,subject,html)
					}
				})
			});

			const requestkey = await new Promise(function(resolve, reject) {
				connection.query('INSERT INTO request SET req_ID=?,req_title=?,req_status_id=1,req_type_id=1,req_createdby=?,req_des=?',[requestID,req.body.title,req.session.userID,req.body.description], function(err, results, field) {
					resolve(results);
				})
			});
			const requestimages = await new Promise(function(resolve, reject) {
				connection.query('INSERT INTO request_image(req_ID , image_name) VALUES ?',[dataimages], function(err, results, field) {
					resolve(results);
				})
			});
			const requesthistory = await new Promise(function(resolve, reject) {
				connection.query('INSERT INTO request_history SET req_ID=?,req_status_id=1,history_createdby=?',[requestID,req.session.userID], function(err, results, field) {
					resolve(results);
				})
			});
			const requestproduct = await new Promise(function(resolve, reject) {
				connection.query('INSERT INTO request_it_product(req_ID, product_ID, product_name, product_location_id, product_des) VALUES ?',[dataproducts], function(err, results, field) {
					resolve(results);

				})
			});

			res.redirect("/requestlist")
		}

		requesttodatabase();
	}
	else{
		res.redirect("/")
	}

})

app.get("/requestMD",function(req,res){
	if(req.session.loggedin && req.session.user_departmentID != 2){
		async function listdata()
		{
			const product = await new Promise(function(resolve, reject) {
				connection.query('SELECT * FROM product WHERE product_typeID = 2', function(err, results, field) {
					if (err) throw err
					if (results.length > 0) 
					{
						var arrayy = [];
						var i = 0;
						for (var i = 0; i< results.length; i++) {
							arrayy.push(results[i]['product_name'])
						}
						resolve(arrayy);
					}
				})
			});
			const location = await new Promise(function(resolve, reject) {
				connection.query('SELECT * FROM location', function(err, results, field) {
					if (err) throw err
					if (results.length > 0) 
					{
						var arrayy = [];
						var i = 0;
						for (var i = 0; i< results.length; i++) {
							arrayy.push(results[i]['location_id'])
						}
						resolve(arrayy);
					}
				})
			});
			const problemfortitle = await new Promise(function(resolve, reject) {
				connection.query('SELECT * FROM problem WHERE req_type_id = 2', function(err, results, field) {
					resolve(results)
				})
			});
				var countstatus = [];
				getcountoflists(req,res).then( (value) =>{
					countstatus = value;
		
			
				res.render("requestMD",
				{
				countstatus : countstatus,
				user_id : req.session.userID,
				logined : req.session.loggedin,
				user_usertype : req.session.user_usertype,
				user_username : req.session.user_username,
				locations : location,
				products : product,
				problem : problemfortitle,
				profileimg : req.session.profileimage,

				})
		
			});

		}

		listdata();

	}
	else{
		res.redirect("/")
	}
})



app.post('/requestMD', upload.array('images', 10), (req, res, next) => {
	if(req.session.loggedin && req.session.user_departmentID != 2){
		var description = req.body.description;
		var requestID = "MD" + Date.now();		
		var dataimages = [], dataproducts = [];
		req.files.forEach(element => {
			dataimages.push([requestID, element.filename])
		});
		if(Array.isArray(req.body.productname)){
			for(var x=0; x<req.body.productname.length; x++){
				dataproducts.push([requestID, req.body.productname[x], req.body.position[x], req.body.des[x]])
			}
		}
		else{
			dataproducts.push([requestID, req.body.productname, req.body.position, req.body.des])
		}
		
		async function requesttodatabase()
		{
			const mailsofdepartment = await new Promise(function(resolve, reject) {
				connection.query('select m.user_email from member m where m.user_departmentID = 2 AND notifyforreq = 1', function(err, results, field) {
					resolve(results);
					if(results.length > 0){
					const emails = []
					for(var i = 0; i < results.length;i++){
						emails.push(results[i].user_email)
					}
					var subject = "รายการแจ้งซ่อมเข้ามาใหม่";
					var html = "คุณ"+req.session.fname+" "+req.session.lname+" ได้ทำการแจ้งซ่อมเข้ามา<br>หมายเหตุจากผู้แจ้ง : "+description+"<br>หมายเลขไอดีรายการแจ้ง : "+requestID+"<br><br> ติดต่อผู้แจ้ง : "+req.session.phone;
					sendmail(emails,subject,html)
					}
				})
			});
			const requestkey = await new Promise(function(resolve, reject) {
				connection.query('INSERT INTO request SET req_ID=?,req_title=?,req_status_id=1,req_type_id=2,req_createdby=?,req_des=?',[requestID,req.body.title,req.session.userID,req.body.description], function(err, results, field) {
					resolve(results);
				})
			});
			const requestimages = await new Promise(function(resolve, reject) {
				connection.query('INSERT INTO request_image(req_ID , image_name) VALUES ?',[dataimages], function(err, results, field) {
					resolve(results);
				})
			});
			const requesthistory = await new Promise(function(resolve, reject) {
				connection.query('INSERT INTO request_history SET req_ID=?,req_status_id=1,history_createdby=?',[requestID,req.session.userID], function(err, results, field) {
					resolve(results);
				})
			});
			const requestproduct = await new Promise(function(resolve, reject) {
				connection.query('INSERT INTO request_md_product(req_ID, product_name, product_location_id, product_des) VALUES ?',[dataproducts], function(err, results, field) {
					resolve(results);

				})
			});
			res.redirect("/requestlist")
		}

		requesttodatabase();
	}
	else{
		res.redirect("/")
	}

})

app.get("/requestBD",function(req,res){
	if(req.session.loggedin && req.session.user_departmentID != 3){
		async function listdata()
		{
			const product = await new Promise(function(resolve, reject) {
				connection.query('SELECT * FROM product WHERE product_typeID = 3', function(err, results, field) {
					if (err) throw err
					if (results.length > 0) 
					{
						var arrayy = [];
						var i = 0;
						for (var i = 0; i< results.length; i++) {
							arrayy.push(results[i]['product_name'])
						}
						resolve(arrayy);
					}
				})
			});
			const location = await new Promise(function(resolve, reject) {
				connection.query('SELECT * FROM location', function(err, results, field) {
					if (err) throw err
					if (results.length > 0) 
					{
						var arrayy = [];
						var i = 0;
						for (var i = 0; i< results.length; i++) {
							arrayy.push(results[i]['location_id'])
						}
						resolve(arrayy);
					}
				})
			});
			const problemfortitle = await new Promise(function(resolve, reject) {
				connection.query('SELECT * FROM problem WHERE req_type_id = 2', function(err, results, field) {
					resolve(results)
				})
			});
				var countstatus = [];
				getcountoflists(req,res).then( (value) =>{
					countstatus = value;
		
			
				res.render("requestBD",
				{
				countstatus : countstatus,
				user_id : req.session.userID,
				logined : req.session.loggedin,
				user_usertype : req.session.user_usertype,
				user_username : req.session.user_username,
				locations : location,
				products : product,
				problem : problemfortitle,
				profileimg : req.session.profileimage,

				})
		
			});

		}

		listdata();

	}
	else{
		res.redirect("/")
	}
})

app.post('/requestBD', upload.array('images', 10), (req, res, next) => {
	var description = req.body.description;
	if(req.session.loggedin && req.session.user_departmentID != 3){
		var requestID = "BD" + Date.now();		
		var dataimages = [], dataproducts = [];
		req.files.forEach(element => {
			dataimages.push([requestID, element.filename])
		});
		if(Array.isArray(req.body.productname)){
			for(var x=0; x<req.body.productname.length; x++){
				dataproducts.push([requestID, req.body.productname[x], req.body.position[x], req.body.des[x]])
			}
		}
		else{
			dataproducts.push([requestID, req.body.productname, req.body.position, req.body.des])
		}
		
		async function requesttodatabase()
		{
			const mailsofdepartment = await new Promise(function(resolve, reject) {
				connection.query('select m.user_email from member m where m.user_departmentID = 3 AND notifyforreq = 1', function(err, results, field) {
					resolve(results);
					if(results.length > 0){
					const emails = []
					for(var i = 0; i < results.length;i++){
						emails.push(results[i].user_email)
					}
					var subject = "รายการแจ้งซ่อมเข้ามาใหม่";
					var html = "คุณ"+req.session.fname+" "+req.session.lname+" ได้ทำการแจ้งซ่อมเข้ามา<br>หมายเหตุจากผู้แจ้ง : "+description+"<br>หมายเลขไอดีรายการแจ้ง : "+requestID+"<br><br> ติดต่อผู้แจ้ง : "+req.session.phone;
					sendmail(emails,subject,html)
					}
				})
			});
			const requestkey = await new Promise(function(resolve, reject) {
				connection.query('INSERT INTO request SET req_ID=?,req_title=?,req_status_id=1,req_type_id=3,req_createdby=?,req_des=?',[requestID,req.body.title,req.session.userID,req.body.description], function(err, results, field) {
					resolve(results);
				})
			});
			const requestimages = await new Promise(function(resolve, reject) {
				connection.query('INSERT INTO request_image(req_ID , image_name) VALUES ?',[dataimages], function(err, results, field) {
					resolve(results);
				})
			});
			const requesthistory = await new Promise(function(resolve, reject) {
				connection.query('INSERT INTO request_history SET req_ID=?,req_status_id=1,history_createdby=?',[requestID,req.session.userID], function(err, results, field) {
					resolve(results);
				})
			});
			const requestproduct = await new Promise(function(resolve, reject) {
				connection.query('INSERT INTO request_bd_product(req_ID, product_name, product_location_id, product_des) VALUES ?',[dataproducts], function(err, results, field) {
					resolve(results);

				})
			});
			res.redirect("/requestlist")
		}

		requesttodatabase();
	}
	else{
		res.redirect("/")
	}

})

app.get("/requestlist",function(req,res){
	
	if(req.session.loggedin){
		var countstatus = [];
		getcountoflists(req,res).then( (value) =>{
			countstatus = value;

	

		var requestlists = [];
		connection.query('select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des, CONCAT(m.user_firstname," ",m.user_lastname) as createby from request r,member m, request_status s WHERE m.user_id = r.req_createdby AND r.req_createdby=? AND r.req_status_id=s.req_status_id order by r.req_created DESC',[req.session.userID], function(err, results, field) {
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
							des : results[i].req_des,
							profileimg : req.session.profileimage,

						}
					)
				createdat = "";
				}


				res.render("listrequest",{
					countstatus : countstatus,
					user_id : req.session.userID,
					logined : req.session.loggedin,
					user_usertype : req.session.user_usertype,
					user_username : req.session.user_username,
					departmentID : req.session.user_departmentID,
					requestlists : requestlists,
					profileimg : req.session.profileimage,

				})
			}
			else{
				res.render("listrequest",{
					countstatus : countstatus,
					user_id : req.session.userID,
					logined : req.session.loggedin,
					user_usertype : req.session.user_usertype,
					user_username : req.session.user_username,
					departmentID : req.session.user_departmentID,
					requestlists : requestlists,
					profileimg : req.session.profileimage,

				})
			}
		})
	});
	}
	else{
		res.redirect("/")
	}
})
app.get("/requestlist/:id",function(req,res){
	if(req.session.loggedin){
		
		async function requestdetail()
		{
			var checkreqgetby = true;
			var req_ID = req.params.id;
			var sql = "";
			var reqkeydata = {};
			const getauthor = await new Promise(function(resolve, reject) {
				var sql = "select m.user_firstname, m.user_lastname, m.user_typeID, m.user_email, m.user_phone from member m, request r where r.req_ID = ? and r.req_createdby = m.user_id";
				connection.query(sql,[req_ID], function(err, results, field) {
				resolve(results[0])
				})})
			
			const getby = await new Promise(function(resolve, reject) {
				var sql = "select m.user_firstname, m.user_lastname, m.user_typeID, m.user_email, m.user_phone from member m, request r where r.req_ID = ? and r.req_getby = m.user_id";
				connection.query(sql,[req_ID], function(err, results, field) {
					if(results.length > 0){
						resolve(results[0])
					}
					else{
						resolve("รอเจ้าหน้าที่รับเรื่อง")
					}
				})})

			
			const getrequestkey = await new Promise(function(resolve, reject) {
				var sql = "select * from request r, requesttype rt where r.req_ID = ? and r.req_type_id = rt.req_type_id";
				connection.query(sql,[req_ID], function(err, results, field) {
				resolve(results[0])
				})})

			const getreqhistory = await new Promise(function(resolve, reject) {
				var sql = "select h.req_ID, h.req_status_id, rs.req_status_title , h.history_des, CONCAT(m.user_firstname ,' ', m.user_lastname) as 'history_createdbyn', h.history_createdby, h.history_created from request_history h, member m, request_status rs where req_ID = ? and h.req_status_id = rs.req_status_id and m.user_id = h.history_createdby ORDER BY h.history_created DESC";
				connection.query(sql,[req_ID], function(err, results, field) {
				resolve(results)
				})})

			
			const getreqimages = await new Promise(function(resolve, reject) {
				var sql = "select * from request_image where req_ID = ?";
				connection.query(sql,[req_ID], function(err, results, field) {
				resolve(results)
				})})


			var producttype = {1:"request_it_product",2:"request_md_product",3:"request_bd_product"}

			const getreqproduct = await new Promise(function(resolve, reject) {
				var sql = "select * from "+ producttype[getrequestkey.req_type_id] +" where req_ID = ?";
				connection.query(sql,[req_ID], function(err, results, field) {
				resolve(results)
				})})



				
				var title,type,des,requester,receiver,products,images,history
				title = getrequestkey.req_title;
				type = getrequestkey.req_type_title;
				des = getrequestkey.req_des;
				requester = getauthor;
				receiver = getby;
				products = getreqproduct;
				images = getreqimages;
				history = getreqhistory;

				var countstatus = [];
				getcountoflists(req,res).then( (value) =>{
					countstatus = value;
		

				res.render("detail",{
					countstatus : countstatus,
					user_id : req.session.userID,
					logined : req.session.loggedin,
					user_usertype : req.session.user_usertype,
					user_username : req.session.user_username,
					title: title,
					type : type,
					des : des,
					requester : requester,
					receiver : receiver,
					products : products,
					images : images,
					history : history,
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

app.get("/newlist",function(req,res){
	if(req.session.loggedin){
		var requestlists = [];
		var typereq = req.session.user_departmentID;
		var countstatus = [];
		getcountoflists(req,res).then( (value) =>{
		countstatus = value;
		var sql = "";
		if(req.session.user_departmentID == 4){
		sql = 'select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des, CONCAT(m.user_firstname," ",m.user_lastname) as createby from request r,member m, request_status s WHERE m.user_id = r.req_createdby AND r.req_status_id = 3 AND r.req_status_id=s.req_status_id order by r.req_created DESC';
		}
		else{
		sql = 'select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des, CONCAT(m.user_firstname," ",m.user_lastname) as createby from request r,member m, request_status s WHERE m.user_id = r.req_createdby AND r.req_type_id = "'+typereq+'" AND r.req_status_id = 1 AND r.req_status_id=s.req_status_id order by r.req_created DESC';
		}
		connection.query(sql, function(err, results, field) {
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
	
	
					res.render("listnew",{
						countstatus : countstatus,
						user_id : req.session.userID,
						logined : req.session.loggedin,
						user_usertype : req.session.user_usertype,
						user_username : req.session.user_username,
						departmentID : req.session.user_departmentID,
						requestlists : requestlists,
						profileimg : req.session.profileimage,

					})
			}
			else{
				res.render("listnew",{
					countstatus : countstatus,
					user_id : req.session.userID,
					logined : req.session.loggedin,
					user_usertype : req.session.user_usertype,
					user_username : req.session.user_username,
					departmentID : req.session.user_departmentID,
					requestlists : requestlists,
					profileimg : req.session.profileimage,

				})
			}
		})
		})
	}
	else{
		res.redirect("/")
	}
})

app.get("/newlist/:id",function(req,res){
	if(req.session.loggedin && req.session.user_usertype == "2"){
		async function requestdetail()
		{
			var checkreqgetby = true;
			var req_ID = req.params.id;
			var sql = "";
			var reqkeydata = {};
			const getauthor = await new Promise(function(resolve, reject) {
				var sql = "select m.user_firstname, m.user_lastname, m.user_typeID, m.user_email, m.user_phone from member m, request r where r.req_ID = ? and r.req_createdby = m.user_id";
				connection.query(sql,[req_ID], function(err, results, field) {
				resolve(results[0])
				})})
			
			const getby = await new Promise(function(resolve, reject) {
				var sql = "select m.user_firstname, m.user_lastname, m.user_typeID, m.user_email, m.user_phone from member m, request r where r.req_ID = ? and r.req_getby = m.user_id";
				connection.query(sql,[req_ID], function(err, results, field) {
					if(results.length > 0){
						resolve(results[0])
					}
					else{
						resolve("รอเจ้าหน้าที่รับเรื่อง")
					}
				})})

			
			const getrequestkey = await new Promise(function(resolve, reject) {
				var sql = "select * from request r, requesttype rt where r.req_ID = ? and r.req_type_id = rt.req_type_id";
				connection.query(sql,[req_ID], function(err, results, field) {
				resolve(results[0])
				})})



			const getreqhistory = await new Promise(function(resolve, reject) {
				var sql = "select h.req_ID, h.req_status_id, rs.req_status_title , h.history_des, CONCAT(m.user_firstname ,' ', m.user_lastname) as 'history_createdbyn', h.history_createdby, h.history_created from request_history h, member m, request_status rs where req_ID = ? and h.req_status_id = rs.req_status_id and m.user_id = h.history_createdby order by h.history_created DESC";
				connection.query(sql,[req_ID], function(err, results, field) {
				resolve(results)
				})})

			
			const getreqimages = await new Promise(function(resolve, reject) {
				var sql = "select * from request_image where req_ID = ?";
				connection.query(sql,[req_ID], function(err, results, field) {
				resolve(results)
				})})
		

			var producttype = {1:"request_it_product",2:"request_md_product",3:"request_bd_product"}
			const getreqproduct = await new Promise(function(resolve, reject) {
				var sql = "select * from "+ producttype[getrequestkey.req_type_id] +" where req_ID = ?";
				connection.query(sql,[req_ID], function(err, results, field) {
				resolve(results)
				})})


				
				var title,type,des,requester,receiver,products,images,history
				title = getrequestkey.req_title;
				type = getrequestkey.req_type_title;
				des = getrequestkey.req_des;
				requester = getauthor;
				receiver = getby;
				products = getreqproduct;
				images = getreqimages;
				history = getreqhistory;

				var countstatus = [];
				getcountoflists(req,res).then( (value) =>{
				countstatus = value;
				
				res.render("receive",{
					countstatus : countstatus,
					user_id : req.session.userID,
					logined : req.session.loggedin,
					user_usertype : req.session.user_usertype,
					user_username : req.session.user_username,
					user_department : req.session.user_departmentID,
					profileimg : req.session.profileimage,
					title: title,
					type : type,
					des : des,
					requester : requester,
					receiver : receiver,
					products : products,
					images : images,
					history : history
				})
			
			})
				
		}
		requestdetail()
        
	}
	else{
		res.redirect("/")
	}
})

app.post("/newlist/:id",function(req,res){
	if(req.session.loggedin && req.session.user_usertype == "2"){
		var body = req.body;
		var req_ID = req.params.id;
		var status = req.body.status;
		var des = req.body.des;


		async function getorcancel()
		{

			if(status=="รับเรื่อง")
			{

				if(req.session.user_departmentID == 4){
					const requester = await new Promise(function(resolve, reject) {
						var sql = "select r.req_createdby,m.user_firstname,m.user_lastname,m.user_email,m.notifyforreq from request r,member m WHERE m.user_id = r.req_getby AND r.req_ID=?";
						connection.query(sql,[req_ID], function(err, results, field) {
						if(results[0].notifyforreq == 1){
						var toemails = results[0].user_email;
						var subject = "เจ้าหน้าที่พัสดุรับเรื่องรายการที่คุณทำเรื่องพัสดุแล้ว";
						var html = "เจ้าหน้าที่พัสดุ คุณ"+req.session.fname+" "+req.session.lname+" ได้รับเรื่องแจ้งทำเรื่องพัสดุของคุณแล้ว<br>หมายเหตุจากเจ้าหน้าที่ : "+des+"<br>หมายเลขไอดีรายการแจ้ง : "+req_ID+"<br><br> ติดต่อเจ้าหน้าที่ : "+req.session.phone;
						sendmail(toemails,subject,html)
						}
						resolve(results.affectedRows);
						})
					})
					const forkey = await new Promise(function(resolve, reject) {
						var sql = "UPDATE request SET req_status_id = 5, req_repairby = ? WHERE req_ID = ?";
						connection.query(sql,[req.session.userID , req_ID], function(err, results, field) {
						resolve(results.affectedRows);

						})
					})
					const forhistory = await new Promise(function(resolve, reject) {
						var sql = "INSERT INTO request_history SET req_ID = ?, req_status_id = ?, history_des = ?, history_createdby = ?";
						connection.query(sql,[req_ID, 5, des, req.session.userID], function(err, results, field) {
						resolve(results.affectedRows);
						})
					})
				}
				else{
					//if department not passadu receive request
					const requester = await new Promise(function(resolve, reject) {
						var sql = "select r.req_createdby,m.user_firstname,m.user_lastname,m.user_email,m.notifyforreq from request r,member m WHERE m.user_id = r.req_createdby AND r.req_ID=?";
						connection.query(sql,[req_ID], function(err, results, field) {
						if(results[0].notifyforreq == 1){
						var toemails = results[0].user_email;
						var subject = "เจ้าหน้าที่รับเรื่องรายการแจ้งซ่อมของคุณแล้ว";
						var html = "เจ้าหน้าที่ คุณ"+req.session.fname+" "+req.session.lname+" ได้รับเรื่องรายการแจ้งซ่อมของคุณแล้ว<br>หมายเหตุจากเจ้าหน้าที่ : "+des+"<br>หมายเลขไอดีรายการแจ้ง : "+req_ID+"<br><br> ติดต่อเจ้าหน้าที่ : "+req.session.phone;
						sendmail(toemails,subject,html)
						}
						resolve(results.affectedRows);
						})
					})
					const forkey = await new Promise(function(resolve, reject) {
						var sql = "UPDATE request SET req_status_id = 2, req_getby = ? WHERE req_ID = ?";
						connection.query(sql,[req.session.userID , req_ID], function(err, results, field) {
						resolve(results.affectedRows);

						})
					})
					const forhistory = await new Promise(function(resolve, reject) {
						var sql = "INSERT INTO request_history SET req_ID = ?, req_status_id = ?, history_des = ?, history_createdby = ?";
						connection.query(sql,[req_ID, 2, des, req.session.userID], function(err, results, field) {
						resolve(results.affectedRows);
						})
					})
				}
			}
			else{
				if(req.session.user_departmentID == 4){
					alert("ฝ่ายพัสดุไม่สามารถยกเลิกรายการแจ้งได้")
				}
				else{
					// if other department not passadu cancel
					const forkey = await new Promise(function(resolve, reject) {
						var sql = "UPDATE request SET req_status_id = 0, req_getby = ? WHERE req_ID = ?";
						connection.query(sql,[req.session.userID , req_ID], function(err, results, field) {
						resolve(results.affectedRows);

						})
					})
					const forhistory = await new Promise(function(resolve, reject) {
						var sql = "INSERT INTO request_history SET req_ID = ?, req_status_id = ?, history_des = ?, history_createdby = ?";
						connection.query(sql,[req_ID, 0, des, req.session.userID], function(err, results, field) {
						resolve(results.affectedRows);

						})
					})

				}
			}
		}
		getorcancel();
		res.redirect("/receivelist")
		res.end()
	
	}
	else{
		res.redirect("/")
	}
})

app.get("/receivelist?",function(req,res){
	
	if(req.session.loggedin){
		var countstatus = [];
		getcountoflists(req,res).then( (value) =>{
			countstatus = value;

	

		var requestlists = [];
		var sql = "";
		if(req.session.user_departmentID == 4){
			sql = 'select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des, CONCAT(m.user_firstname," ",m.user_lastname) as createby from request r,member m, request_status s WHERE m.user_id = r.req_createdby AND r.req_repairby=? AND r.req_status_id=s.req_status_id order by r.req_created DESC'
		}
		else{
			sql = 'select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des, CONCAT(m.user_firstname," ",m.user_lastname) as createby from request r,member m, request_status s WHERE m.user_id = r.req_createdby AND r.req_getby=? AND r.req_status_id=s.req_status_id order by r.req_created DESC'
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

			}
				res.render("listreceive",{
					countstatus : countstatus,
					user_id : req.session.userID,
					logined : req.session.loggedin,
					user_usertype : req.session.user_usertype,
					profileimg : req.session.profileimage,
					user_username : req.session.user_username,
					departmentID : req.session.user_departmentID,
					requestlists : requestlists
				})
		})
	});
	}
	else{
		res.redirect("/")
	}
})

app.get("/receivelist/:id",function(req,res){
	if(req.session.loggedin && req.session.user_usertype == "2"){
		async function requestdetail()
		{
			var checkreqgetby = true;
			var req_ID = req.params.id;
			var sql = "";
			var reqkeydata = {};
			const getauthor = await new Promise(function(resolve, reject) {
				var sql = "select m.user_firstname, m.user_lastname, m.user_typeID, m.user_email, m.user_phone from member m, request r where r.req_ID = ? and r.req_createdby = m.user_id";
				connection.query(sql,[req_ID], function(err, results, field) {
				resolve(results[0])
				})})
			
			const getby = await new Promise(function(resolve, reject) {
				var sql = "select m.user_firstname, m.user_lastname, m.user_typeID, m.user_email, m.user_phone from member m, request r where r.req_ID = ? and r.req_getby = m.user_id";
				connection.query(sql,[req_ID], function(err, results, field) {
					if(results.length > 0){
						resolve(results[0])
					}
					else{
						resolve("รอเจ้าหน้าที่รับเรื่อง")
					}
				})})

			
			const getrequestkey = await new Promise(function(resolve, reject) {
				var sql = ""
				if(req.session.user_departmentID == 4){
				sql = "select * from request r, requesttype rt where r.req_ID = ? and r.req_type_id = rt.req_type_id and r.req_repairby = ?";
				}
				else{
			    sql = "select * from request r, requesttype rt where r.req_ID = ? and r.req_type_id = rt.req_type_id and r.req_getby = ?";
				}
				connection.query(sql,[req_ID,req.session.userID], function(err, results, field) {
				if(results.length < 1){
					res.status(404).send("รายการนี้คุณไม่ได้เป็นผู้รับ"); 
					res.end()
				}
				resolve(results[0])
				})})
			if(req.session.user_departmentID == 4){
				if(getrequestkey.req_status_id < 5 && getrequestkey.req_status_id > 8){
					res.send("รายการนี้คุณยังไม่ได้รับ")
					res.end()
				}
			}
			else{
				if(getrequestkey.req_status_id == 1){
					res.send("รายการนี้คุณยังไม่ได้รับ")
					res.end()
				}
			}
			

			const getreqhistory = await new Promise(function(resolve, reject) {
				var sql = "select h.req_ID, h.req_status_id, rs.req_status_title , h.history_des, CONCAT(m.user_firstname ,' ', m.user_lastname) as 'history_createdbyn', h.history_createdby, h.history_created from request_history h, member m, request_status rs where req_ID = ? and h.req_status_id = rs.req_status_id and m.user_id = h.history_createdby ORDER BY h.history_created DESC";
				connection.query(sql,[req_ID], function(err, results, field) {
				resolve(results)
				})})

			
			const getreqimages = await new Promise(function(resolve, reject) {
				var sql = "select * from request_image where req_ID = ?";
				connection.query(sql,[req_ID], function(err, results, field) {
				resolve(results)
				})})


			var producttype = {1:"request_it_product",2:"request_md_product",3:"request_bd_product"}
			const getreqproduct = await new Promise(function(resolve, reject) {
				var sql = "select * from "+ producttype[getrequestkey.req_type_id] +" where req_ID = ?";
				connection.query(sql,[req_ID], function(err, results, field) {
				resolve(results)
				})})


			var requeststatus = await new Promise(function(resolve, reject) {
				var sql = "";
				if(req.session.user_departmentID == 4){
					if(getrequestkey.req_status_id != 5){
					sql = "select * from request_status where 0";
					}
					else if(getrequestkey.req_status_id == 5){
					sql = "select * from request_status where req_status_id > 5 and req_status_id < 9 ";
					}
					else{
						sql = "select * from request_status where 0 ";	
					}
				}
				else{
					if(getrequestkey.req_status_id == 2){
					sql = "select * from request_status where req_status_id = 3 or req_status_id = 4";
					}
					else if(getrequestkey.req_status_id >= 6 && getrequestkey.req_status_id <= 8 ){
					sql = "select * from request_status where req_status_id = 9 or req_status_id = 10";
					}
					else{
					sql = "select * from request_status where 0";	
					}

				}
				connection.query(sql,[getrequestkey.req_status_id], function(err, results, field) {
				resolve(results)
				})})
				

				if(getrequestkey.req_status_id == 0 || getrequestkey.req_status_id == "4"){
					requeststatus = [];
				}

				var title,type,des,requester,receiver,products,images,history
				title = getrequestkey.req_title;
				type = getrequestkey.req_type_title;
				des = getrequestkey.req_des;
				requester = getauthor;
				receiver = getby;
				products = getreqproduct;
				images = getreqimages;
				history = getreqhistory;

				var countstatus = [];
				getcountoflists(req,res).then( (value) =>{
				countstatus = value;

				res.render("update",{
					countstatus : countstatus,
					user_id : req.session.userID,
					logined : req.session.loggedin,
					user_usertype : req.session.user_usertype,
					user_username : req.session.user_username,
					profileimg : req.session.profileimage,
					title: title,
					type : type,
					des : des,
					requester : requester,
					receiver : receiver,
					products : products,
					images : images,
					history : history,
					statuss : requeststatus
				})

			})
		}
		requestdetail()
        
	}
	else{
		res.redirect("/")
	}
})

app.post("/receivelist/:id",function(req,res){
	if(req.session.loggedin && req.session.user_usertype == "2"){
		var req_ID = req.params.id;
		var status = req.body.updatestatus;
		var des = req.body.description || "-";
		async function updatestatus()
		{
			const requester = await new Promise(function(resolve, reject) {
				var sql = "select r.req_createdby,m.user_firstname,m.user_lastname,m.user_email,(select req_status_title from request_status where req_status_id = ?) as status, m.notifyforreq from request r,member m WHERE m.user_id = r.req_createdby AND r.req_ID=?";
				connection.query(sql,[status,req_ID], function(err, results, field) {
				if(results[0].notifyforreq == 1){
				if(status == 0 || status == 4 || status == 9 || status == 10)
				var toemails = results[0].user_email;
				var subject = "เจ้าหน้าได้อัพเดทสถานะรายการแจ้งซ่อมของคุณแล้ว";
				var html = "เจ้าหน้าที่ คุณ"+req.session.fname+" "+req.session.lname+"  ได้อัพเดทสถานะรายการแจ้งซ๋อมของคุณเป็น"+results[0].status+"<br>หมายเหตุจากเจ้าหน้าที่ : "+des+"<br>หมายเลขไอดีรายการแจ้ง : "+req_ID+"<br><br> ติดต่อเจ้าหน้าที่ : "+req.session.phone;
				sendmail(toemails,subject,html)
				}
				resolve(results.affectedRows);
				})
			})
			if(status == 6 || status == 7 || status == 8 ){
			const toreceiver = await new Promise(function(resolve, reject) {
				var sql = "select r.req_getby,m.user_firstname,m.user_lastname,m.user_email,(select req_status_title from request_status where req_status_id = ?) as status, m.notifyforreq from request r,member m WHERE m.user_id = r.req_getby AND r.req_ID=?";
				connection.query(sql,[status,req_ID], function(err, results, field) {
				if(results[0].notifyforreq == 1){
				var toemails = results[0].user_email;
				var subject = "เจ้าหน้าที่พัสดุอัพเดทสถานะรายการที่คุณทำเรื่องพัสดุแล้ว";
				var html = "เจ้าหน้าที่พัสดุ คุณ"+req.session.fname+" "+req.session.lname+"  ได้อัพเดทสถานะรายการที่คุณทำเรื่องพัสดุเป็น"+results[0].status+"<br>หมายเหตุจากเจ้าหน้าที่ : "+des+"<br>หมายเลขไอดีรายการแจ้ง : "+req_ID+"<br><br> ติดต่อเจ้าหน้าที่ : "+req.session.phone;
				sendmail(toemails,subject,html)
				}
				resolve(results.affectedRows);
				})
			})
			}
			if(status == 3 && req.session.user_departmentID != 4){
				const mailsofdepartment = await new Promise(function(resolve, reject) {
					connection.query('select m.user_email from member m where m.user_departmentID = 4 AND notifyforreq = 1', function(err, results, field) {
						resolve(results);
						if(results.length > 0){
						const emails = []
						for(var i = 0; i < results.length;i++){
							emails.push(results[i].user_email)
						}
						var subject = "รายการทำเรื่องพัสดุเข้ามาใหม่";
						var html = "เจ้าหน้าที่ คุณ"+req.session.fname+" "+req.session.lname+" ได้ทำการแจ้งทำเรื่องพัสดุเข้ามา<br>หมายเหตุจากผู้แจ้ง : "+des+"<br>หมายเลขไอดีรายการแจ้ง : "+req_ID+"<br><br> ติดต่อผู้แจ้ง : "+req.session.phone;
						sendmail(emails,subject,html)
						}
					})
				});
			}
			
				const forkey = await new Promise(function(resolve, reject) {
					if(status == '0' || status == '4' || status == '9' || status == '10'){
						var sql = "UPDATE request SET req_status_id = ? , req_end = CURRENT_TIMESTAMP WHERE req_getby = ? AND req_ID = ?";
						connection.query(sql,[status, req.session.userID , req_ID], function(err, results, field) {
							resolve(results.affectedRows);
						})
					}
					else{
					var sql = "UPDATE request SET req_status_id = ? WHERE req_ID = ?";
					connection.query(sql,[status,req_ID], function(err, results, field) {
					resolve(results.affectedRows);
					})
					}
				})
				const forhistory = await new Promise(function(resolve, reject) {
					var sql = "INSERT INTO request_history SET req_ID = ?, req_status_id = ?, history_des = ?, history_createdby = ?";
					connection.query(sql,[req_ID, status, des, req.session.userID], function(err, results, field) {
					resolve(results.affectedRows);
					})
				})

				
		}
		
		updatestatus()

		res.redirect("/receivelist/" + req_ID)
		res.end()
	
	}
	else{
		res.redirect("/")
	}
})



async function getcountoflists(req,res){
	var listscount;

	var news = await new Promise(function(resolve, reject) {
		var sql = ""
		if(req.session.user_departmentID == 4){
			var sql = "select COUNT(*) as 'count' from request where req_status_id = 3";
			connection.query(sql, function(err, results, field) {
			if(results){
			resolve(results);
			}
			else{
				resolve(0);
			}
			})
		}
		else{
			var sql = "select COUNT(*) as 'count' from request where req_status_id = 1 AND req_type_id = ? AND req_createdby != ?";
			connection.query(sql,[req.session.user_departmentID , req.session.userID], function(err, results, field) {
			if(results){
			resolve(results);
			}
			else{
				resolve(0);
			}
		})
		}
	})
	
	var receives = await new Promise(function(resolve, reject) {
		if(req.session.user_departmentID == 4){
			var sql = "select COUNT(*) as 'count' from request where req_repairby = ? and req_status_id = 5";
			connection.query(sql,[req.session.userID], function(err, results, field) {
				if(results){
				resolve(results);
				}
				else{
					resolve(0);
				}
			})
		}
		else{
			var sql = "select COUNT(*) as 'count' from request where req_status_id = 2 AND req_type_id = ? AND req_createdby != ? AND req_getby = ?";
			connection.query(sql,[req.session.user_departmentID , req.session.userID, req.session.userID], function(err, results, field) {
				if(results){
				resolve(results);
				}
				else{
					resolve(0);
				}
			})
		}
})


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

app.get("/checktimezone",(req,res)=>{
	connection.query("select now()", function(err, results, field) {
	if(results){
		res.send(results," ",new Date())
	}
	else{
		res.send(new Date())
	}
	})

})

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

	function sendmail(toemail,subject,html){
	
		let transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			service: 'gmail',
			port: 587,
			secure: false,
			requireTLS: true,
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
				console.log("send email fail");
				console.log*error
				return console.log(error);

			}
			else{
				console.log("send email successful");
			}
		});
	}

app.get("*",function(req,res){
	res.send("page not found.")
	res.end()
})


app.listen(port, () => {
	connection.query("SET time_zone = '+07:00'", function(err, results, field) {
	})
   console.log("Server Connected!!");
})
