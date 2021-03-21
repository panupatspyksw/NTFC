"use strict";

var _session;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var mysql = require('mysql');

var express = require('express');

var session = require('express-session');

var bodyParser = require('body-parser');

var path = require('path');

var app = express();
var port = process.env.PORT || 8000;

var alert = require('alert');

var multer = require('multer');

var fs = require('fs');

var _require = require('fs'),
    read = _require.read;

var _require2 = require('os'),
    type = _require2.type;

var _require3 = require('console'),
    count = _require3.count;

var _require4 = require('http'),
    request = _require4.request;

var nodemailer = require('nodemailer');

var _require5 = require('crypto'),
    verify = _require5.verify;

var defaultimg = "defaultprofile.png";

var MemoryStore = require('memorystore')(session);

var bcrypt = require('bcryptjs');

var _require6 = require('net'),
    createConnection = _require6.createConnection;

app.use(session((_session = {
  secret: 'secret',
  cookie: {
    maxAge: 86400000
  },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h

  }),
  resave: true
}, _defineProperty(_session, "secret", 'keyboard cat'), _defineProperty(_session, "saveUninitialized", true), _session))); // var connection
// var db_config = {
// 	host     : 'us-cdbr-east-02.cleardb.com',
// 	user     : 'bbc5aa79adb978',
// 	password : 'bc3f80a0',
// 	database : 'heroku_967c364b1d024e2'
//   };
// var db_config = {
// 	host     : 'mysql-repaironlineservice-13336.nodechef.com',
// 	user     : 'ncuser_11731',
// 	password : 'ugMBcMnhJYLmEXyirVc0IhIxp55xMs',
// 	database : 'repaironlineservice',
// 	connectionLimit: 100,
// 	port: '2397'
// };

var db_config = {
  host: 'mysql-repaironlineservice2-13336.nodechef.com',
  user: 'ncuser_7811',
  password: 'pxkzWQuIEQV5kL8fECk6LjCQHqUCk4',
  database: 'repaironlineservice2',
  connectionLimit: 100,
  port: '2409'
}; // var connection = mysql.createConnection(db_config);

function handleDisconnect() {
  // Recreate the connection, since
  // the old one cannot be reused.
  var connection = mysql.createConnection(db_config);
  connection.connect(function (err) {
    // The server is either down
    if (err) {
      // or restarting (takes a while sometimes).
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    } // to avoid a hot loop, and to allow our node script to

  }); // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.

  connection.on('error', function (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      // Connection to the MySQL server is usually
      handleDisconnect(); // lost due to either server restart, or a
    } else {
      // connnection idle timeout (the wait_timeout
      throw err; // server variable configures this)
    }
  });
}

handleDisconnect(); // ... later
//   setInterval(function () {
// 	connection.query("SET time_zone = '+07:00'", function(err, results, field) {
// 	})
// 	db_config.query('select 1 + 1', (err, rows) => { /* */ });
// }, 5000);

app.use(require('./routes/ajaxreq.js'));
app.use(require('./routes/admin.js'));
app.use(express["static"]("public"));
app.use(express["static"]("img"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function filename(req, file, cb) {
    var filename = file.originalname.split(" ").join('');
    filename = filename.split("_").join('');
    filename = filename.split("-").join('');
    filename = filename.split(".");
    filename[0], filename[1];
    cb(null, filename[0] + Date.now() + "." + filename[1]);
  }
});
var upload = multer({
  storage: storage,
  fileFilter: function fileFilter(req, file, cb) {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Allowed only .png, .jpg, .jpeg and .gif'));
    }
  }
});
app.use(function (req, res, next) {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.

  res.setHeader("Pragma", "no-cache"); // HTTP 1.0.

  res.setHeader("Expires", "0"); // Proxies.

  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});
app.get("/", function (req, res) {
  if (req.session.userID != null && req.session.loggedin != null) {
    res.redirect("/request");
  } else {
    res.render("index", {
      aa: "helloworld"
    });
  }
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/transition", function (req, res) {
  res.render("transitionload");
});
app.get("/auth", function (req, res) {
  res.redirect("/");
});
app.post("/auth", function (req, res) {
  var connection = mysql.createConnection(db_config);
  var user_id = req.body.user_id;
  var user_password = req.body.user_password;
  var user_firstname, user_lastname, user_usertype, user_firstname, user_departmentID;

  if (user_id && user_password) {
    connection.query('SELECT * FROM member WHERE user_id = ?', [user_id], function (error, results, fields) {
      if (error) {
        console.log(error);
      } else if (results.length > 0) {
        bcrypt.compare(user_password, results[0].user_password, function (err, resultt) {
          if (resultt == true) {
            req.session.loggedin = true;
            req.session.loadlogin = true;
            user_id = results[0].user_id;
            user_firstname = results[0].user_firstname;
            user_firstname = results[0].user_firstname;
            user_lastname = results[0].user_lastname;
            user_usertype = results[0].user_typeID;
            user_departmentID = results[0].user_departmentID;
            req.session.userID = user_id;
            req.session.user_departmentID = user_departmentID;
            req.session.user_usertype = user_usertype;
            req.session.user_firstname = user_firstname;
            req.session.phone = results[0].user_phone;
            req.session.fname = user_firstname;
            req.session.lname = user_lastname;
            req.session.profileimage = results[0].profileimg;
            res.redirect("/");
          } else {
            res.render("login", {
              message: "Username or password not correct",
              user_id: user_id
            });
          }
        });
      } else {
        res.render("login", {
          message: "Username or password not correct",
          user_id: user_id
        });
      }

      connection.end();
    });
  } else {
    res.send('Please enter Username and Password!');
  }
});
app.get("/profile", function (req, res) {
  var connection = mysql.createConnection(db_config);

  if (req.session.loggedin && req.session.userID) {
    connection.query('SELECT * FROM member WHERE user_id = ?', [req.session.userID], function (error, results, fields) {
      var profiledata = results[0];
      var countstatus = [];
      getcountoflists(req, res).then(function (value) {
        countstatus = value;
        res.render("profile", {
          countstatus: countstatus,
          user_id: req.session.userID,
          logined: req.session.loggedin,
          user_usertype: req.session.user_usertype,
          user_firstname: req.session.user_firstname,
          profileimg: req.session.profileimage,
          profiledata: profiledata,
          notifyforreq: results[0].notifyforreq,
          currentpage: "profile"
        });
      });
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.post('/uploadprofileimage', upload.single('uploadFile'), function (req, res, next) {
  var connection = mysql.createConnection(db_config);
  var newimgpath = "";

  function deleteprofileimage() {
    var imgtodelete, settodefualt, imgpath;
    return regeneratorRuntime.async(function deleteprofileimage$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
              connection.query('SELECT profileimg from member WHERE user_id = ?', [req.session.userID], function (err, results, field) {
                resolve(results[0].profileimg);
              });
            }));

          case 2:
            imgtodelete = _context.sent;
            _context.next = 5;
            return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
              connection.query('UPDATE member SET profileimg = ? WHERE user_id = ?', [req.file.filename, req.session.userID], function (err, results, field) {
                if (results) {
                  resolve(results);
                  newimgpath = req.file.filename;
                  res.send(newimgpath);
                }

                if (err) {
                  res.send(false);
                }
              });
            }));

          case 5:
            settodefualt = _context.sent;
            imgpath = 'public/uploads/' + imgtodelete;

            if (fs.existsSync(imgpath) && imgtodelete != "defaultprofile.png") {
              fs.unlink(imgpath, function (err) {
                if (err) throw err; // if no error, file has been deleted successfully
              });
            } else {}

          case 8:
          case "end":
            return _context.stop();
        }
      }
    });
  }

  deleteprofileimage().then(function () {
    connection.end();
  });
});
app.post("/deleteprofileimage", function (req, res) {
  var connection = mysql.createConnection(db_config);

  function deleteprofileimage() {
    var imgtodelete, settodefualt, imgpath;
    return regeneratorRuntime.async(function deleteprofileimage$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
              connection.query('SELECT profileimg from member WHERE user_id = ?', [req.session.userID], function (err, results, field) {
                resolve(results[0].profileimg);
              });
            }));

          case 2:
            imgtodelete = _context2.sent;
            _context2.next = 5;
            return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
              connection.query('UPDATE member SET profileimg = "defaultprofile.png" WHERE user_id = ?', [req.session.userID], function (err, results, field) {
                resolve(results);
              });
            }));

          case 5:
            settodefualt = _context2.sent;
            imgpath = 'public/uploads/' + imgtodelete;

            if (fs.existsSync(imgpath) && imgpath != "defaultprofile.png") {
              fs.unlink(imgpath, function (err) {
                if (err) throw err; // if no error, file has been deleted successfully

                res.send(defaultimg);
              });
            } else {
              res.send(defaultimg);
            }

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    });
  }

  deleteprofileimage().then(function () {
    connection.end();
  });
});
app.post("/profile", upload.single('profile', 1), function (req, res, next) {
  var connection = mysql.createConnection(db_config);
  var profiledata = req.body || false;

  if (!profiledata.notify) {
    profiledata.notify = 0;
  }

  if (req.session.loggedin && req.session.userID && profiledata) {
    connection.query('UPDATE member SET user_email = ?, user_phone = ? ,notifyforreq = ? WHERE user_id = ?', [profiledata.email, profiledata.phone, profiledata.notify, profiledata.userid], function (error, results, fields) {
      if (error) {}

      if (results) {
        var countstatus = [];
        getcountoflists(req, res).then(function (value) {
          countstatus = value;
          res.redirect("/profile");
        });
      }

      connection.end();
    });
  } else {
    res.render("login", {
      aa: "helloworld"
    });
  }
});
app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
  res.end();
});
app.get("/request", function (req, res) {
  var check = req.session.loadlogin;
  req.session.loadlogin = false;

  if (req.session.loggedin) {
    var countstatus = [];
    getcountoflists(req, res).then(function (value) {
      countstatus = value;

      if (check == false) {
        res.render("request", {
          pageload: false,
          countstatus: countstatus,
          user_id: req.session.userID,
          logined: req.session.loggedin,
          user_usertype: req.session.user_usertype,
          user_firstname: req.session.user_firstname,
          departmentID: req.session.user_departmentID,
          profileimg: req.session.profileimage,
          currentpage: "request"
        });
      } else {
        res.render("request", {
          pageload: true,
          countstatus: countstatus,
          user_id: req.session.userID,
          logined: req.session.loggedin,
          user_usertype: req.session.user_usertype,
          user_firstname: req.session.user_firstname,
          departmentID: req.session.user_departmentID,
          profileimg: req.session.profileimage,
          currentpage: "request"
        });
      }
    });
  } else {
    res.redirect("/auth");
  }
});
var locationdata = [];
app.get("/requestIT", function (req, res) {
  if (req.session.loggedin && req.session.user_departmentID != 1 || req.session.loggedin && req.session.user_usertype == "3") {
    var listdata = function listdata() {
      var product, location, problemfortitle, countstatus;
      return regeneratorRuntime.async(function listdata$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM product WHERE product_typeID = 1', function (err, results, field) {
                  if (err) throw err;

                  if (results.length > 0) {
                    var arrayy = [];
                    var i = 0;

                    for (var i = 0; i < results.length; i++) {
                      arrayy.push(results[i]['product_name']);
                    }

                    resolve(arrayy);
                  }
                });
              }));

            case 2:
              product = _context3.sent;
              _context3.next = 5;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM location', function (err, results, field) {
                  if (err) throw err;

                  if (results.length > 0) {
                    var arrayy = [];
                    var i = 0;

                    for (var i = 0; i < results.length; i++) {
                      arrayy.push(results[i]['location_id']);
                    }

                    resolve(arrayy);
                  }
                });
              }));

            case 5:
              location = _context3.sent;
              _context3.next = 8;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM problem WHERE req_type_id = 1', function (err, results, field) {
                  resolve(results);
                });
              }));

            case 8:
              problemfortitle = _context3.sent;
              countstatus = [];
              getcountoflists(req, res).then(function (value) {
                countstatus = value;
                res.render("requestIT", {
                  countstatus: countstatus,
                  user_id: req.session.userID,
                  logined: req.session.loggedin,
                  user_usertype: req.session.user_usertype,
                  user_firstname: req.session.user_firstname,
                  locations: location,
                  products: product,
                  problem: problemfortitle,
                  profileimg: req.session.profileimage,
                  currentpage: "request"
                });
              });

            case 11:
            case "end":
              return _context3.stop();
          }
        }
      });
    };

    var connection = mysql.createConnection(db_config);
    listdata().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.post('/requestIT', upload.array('images', 10), function (req, res, next) {
  var description = req.body.description;

  if (req.session.loggedin && req.session.user_departmentID != 1 || req.session.loggedin && req.session.user_usertype == "3") {
    var requesttodatabase = function requesttodatabase() {
      var mailsofdepartment, requestkey, requestimages, requesthistory, requestproduct;
      return regeneratorRuntime.async(function requesttodatabase$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('select m.user_email from member m where m.user_departmentID = 1 AND notifyforreq = 1', function (err, results, field) {
                  resolve(results);

                  if (results.length > 0) {
                    var emails = [];

                    for (var i = 0; i < results.length; i++) {
                      emails.push(results[i].user_email);
                    }

                    var subject = "รายการแจ้งซ่อมเข้ามาใหม่";
                    var html = "คุณ" + req.session.fname + " " + req.session.lname + " ได้ทำการแจ้งซ่อมเข้ามา<br>หมายเหตุจากผู้แจ้ง : " + description + "<br>หมายเลขไอดีรายการแจ้ง : " + requestID + "<br><br> ติดต่อผู้แจ้ง : " + req.session.phone;
                    sendmail(emails, subject, html);
                  }
                });
              }));

            case 2:
              mailsofdepartment = _context4.sent;
              _context4.next = 5;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request SET req_ID=?,req_title=?,req_status_id=1,req_type_id=1,req_createdby=?,req_des=?,req_end=now()', [requestID, req.body.title, req.session.userID, req.body.description], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 5:
              requestkey = _context4.sent;
              _context4.next = 8;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_image(req_ID , image_name) VALUES ?', [dataimages], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 8:
              requestimages = _context4.sent;
              _context4.next = 11;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_history SET req_ID=?,req_status_id=1,history_createdby=?', [requestID, req.session.userID], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 11:
              requesthistory = _context4.sent;
              _context4.next = 14;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_it_product(req_ID, product_ID, product_name, product_location_id, product_des) VALUES ?', [dataproducts], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 14:
              requestproduct = _context4.sent;
              res.redirect("/requestlist");

            case 16:
            case "end":
              return _context4.stop();
          }
        }
      });
    };

    var requestID = "IT" + Date.now();
    var dataimages = [],
        dataproducts = [];
    req.files.forEach(function (element) {
      dataimages.push([requestID, element.filename]);
    });

    if (Array.isArray(req.body.productid)) {
      for (var x = 0; x < req.body.productid.length; x++) {
        dataproducts.push([requestID, req.body.productid[x], req.body.productname[x], req.body.position[x], req.body.des[x]]);
      }
    } else {
      dataproducts.push([requestID, req.body.productid, req.body.productname, req.body.position, req.body.des]);
    }

    var connection = mysql.createConnection(db_config);
    requesttodatabase().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.get("/requestMD", function (req, res) {
  if (req.session.loggedin && req.session.user_departmentID != 2 || req.session.loggedin && req.session.user_usertype == "3") {
    var listdata = function listdata() {
      var product, location, problemfortitle, countstatus;
      return regeneratorRuntime.async(function listdata$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM product WHERE product_typeID = 2', function (err, results, field) {
                  if (err) throw err;

                  if (results.length > 0) {
                    var arrayy = [];
                    var i = 0;

                    for (var i = 0; i < results.length; i++) {
                      arrayy.push(results[i]['product_name']);
                    }

                    resolve(arrayy);
                  }
                });
              }));

            case 2:
              product = _context5.sent;
              _context5.next = 5;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM location', function (err, results, field) {
                  if (err) throw err;

                  if (results.length > 0) {
                    var arrayy = [];
                    var i = 0;

                    for (var i = 0; i < results.length; i++) {
                      arrayy.push(results[i]['location_id']);
                    }

                    resolve(arrayy);
                  }
                });
              }));

            case 5:
              location = _context5.sent;
              _context5.next = 8;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM problem WHERE req_type_id = 2', function (err, results, field) {
                  resolve(results);
                });
              }));

            case 8:
              problemfortitle = _context5.sent;
              countstatus = [];
              getcountoflists(req, res).then(function (value) {
                countstatus = value;
                res.render("requestMD", {
                  countstatus: countstatus,
                  user_id: req.session.userID,
                  logined: req.session.loggedin,
                  user_usertype: req.session.user_usertype,
                  user_firstname: req.session.user_firstname,
                  locations: location,
                  products: product,
                  problem: problemfortitle,
                  profileimg: req.session.profileimage,
                  currentpage: "request"
                });
              });

            case 11:
            case "end":
              return _context5.stop();
          }
        }
      });
    };

    var connection = mysql.createConnection(db_config);
    listdata().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.post('/requestMD', upload.array('images', 10), function (req, res, next) {
  if (req.session.loggedin && req.session.user_departmentID != 2 || req.session.loggedin && req.session.user_usertype == "3") {
    var requesttodatabase = function requesttodatabase() {
      var mailsofdepartment, requestkey, requestimages, requesthistory, requestproduct;
      return regeneratorRuntime.async(function requesttodatabase$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('select m.user_email from member m where m.user_departmentID = 2 AND notifyforreq = 1', function (err, results, field) {
                  resolve(results);

                  if (results.length > 0) {
                    var emails = [];

                    for (var i = 0; i < results.length; i++) {
                      emails.push(results[i].user_email);
                    }

                    var subject = "รายการแจ้งซ่อมเข้ามาใหม่";
                    var html = "คุณ" + req.session.fname + " " + req.session.lname + " ได้ทำการแจ้งซ่อมเข้ามา<br>หมายเหตุจากผู้แจ้ง : " + description + "<br>หมายเลขไอดีรายการแจ้ง : " + requestID + "<br><br> ติดต่อผู้แจ้ง : " + req.session.phone;
                    sendmail(emails, subject, html);
                  }
                });
              }));

            case 2:
              mailsofdepartment = _context6.sent;
              _context6.next = 5;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request SET req_ID=?,req_title=?,req_status_id=1,req_type_id=2,req_createdby=?,req_des=?', [requestID, req.body.title, req.session.userID, req.body.description], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 5:
              requestkey = _context6.sent;
              _context6.next = 8;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_image(req_ID , image_name) VALUES ?', [dataimages], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 8:
              requestimages = _context6.sent;
              _context6.next = 11;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_history SET req_ID=?,req_status_id=1,history_createdby=?', [requestID, req.session.userID], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 11:
              requesthistory = _context6.sent;
              _context6.next = 14;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_md_product(req_ID, product_name, product_location_id, product_des) VALUES ?', [dataproducts], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 14:
              requestproduct = _context6.sent;
              res.redirect("/requestlist");

            case 16:
            case "end":
              return _context6.stop();
          }
        }
      });
    };

    var description = req.body.description;
    var requestID = "MD" + Date.now();
    var dataimages = [],
        dataproducts = [];
    req.files.forEach(function (element) {
      dataimages.push([requestID, element.filename]);
    });

    if (Array.isArray(req.body.productname)) {
      for (var x = 0; x < req.body.productname.length; x++) {
        dataproducts.push([requestID, req.body.productname[x], req.body.position[x], req.body.des[x]]);
      }
    } else {
      dataproducts.push([requestID, req.body.productname, req.body.position, req.body.des]);
    }

    var connection = mysql.createConnection(db_config);
    requesttodatabase().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.get("/requestBD", function (req, res) {
  if (req.session.loggedin && req.session.user_departmentID != 3 || req.session.loggedin && req.session.user_usertype == "3") {
    var listdata = function listdata() {
      var product, location, problemfortitle, countstatus;
      return regeneratorRuntime.async(function listdata$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM product WHERE product_typeID = 3', function (err, results, field) {
                  if (err) throw err;

                  if (results.length > 0) {
                    var arrayy = [];
                    var i = 0;

                    for (var i = 0; i < results.length; i++) {
                      arrayy.push(results[i]['product_name']);
                    }

                    resolve(arrayy);
                  }
                });
              }));

            case 2:
              product = _context7.sent;
              _context7.next = 5;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM location', function (err, results, field) {
                  if (err) throw err;

                  if (results.length > 0) {
                    var arrayy = [];
                    var i = 0;

                    for (var i = 0; i < results.length; i++) {
                      arrayy.push(results[i]['location_id']);
                    }

                    resolve(arrayy);
                  }
                });
              }));

            case 5:
              location = _context7.sent;
              _context7.next = 8;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM problem WHERE req_type_id = 3', function (err, results, field) {
                  resolve(results);
                });
              }));

            case 8:
              problemfortitle = _context7.sent;
              countstatus = [];
              getcountoflists(req, res).then(function (value) {
                countstatus = value;
                res.render("requestBD", {
                  countstatus: countstatus,
                  user_id: req.session.userID,
                  logined: req.session.loggedin,
                  user_usertype: req.session.user_usertype,
                  user_firstname: req.session.user_firstname,
                  locations: location,
                  products: product,
                  problem: problemfortitle,
                  profileimg: req.session.profileimage,
                  currentpage: "request"
                });
              });

            case 11:
            case "end":
              return _context7.stop();
          }
        }
      });
    };

    var connection = mysql.createConnection(db_config);
    listdata().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.post('/requestBD', upload.array('images', 10), function (req, res, next) {
  var description = req.body.description;

  if (req.session.loggedin && req.session.user_departmentID != 3 || req.session.loggedin && req.session.user_usertype == "3") {
    var requesttodatabase = function requesttodatabase() {
      var mailsofdepartment, requestkey, requestimages, requesthistory, requestproduct;
      return regeneratorRuntime.async(function requesttodatabase$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('select m.user_email from member m where m.user_departmentID = 3 AND notifyforreq = 1', function (err, results, field) {
                  resolve(results);

                  if (results.length > 0) {
                    var emails = [];

                    for (var i = 0; i < results.length; i++) {
                      emails.push(results[i].user_email);
                    }

                    var subject = "รายการแจ้งซ่อมเข้ามาใหม่";
                    var html = "คุณ" + req.session.fname + " " + req.session.lname + " ได้ทำการแจ้งซ่อมเข้ามา<br>หมายเหตุจากผู้แจ้ง : " + description + "<br>หมายเลขไอดีรายการแจ้ง : " + requestID + "<br><br> ติดต่อผู้แจ้ง : " + req.session.phone;
                    sendmail(emails, subject, html);
                  }
                });
              }));

            case 2:
              mailsofdepartment = _context8.sent;
              _context8.next = 5;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request SET req_ID=?,req_title=?,req_status_id=1,req_type_id=3,req_createdby=?,req_des=?', [requestID, req.body.title, req.session.userID, req.body.description], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 5:
              requestkey = _context8.sent;
              _context8.next = 8;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_image(req_ID , image_name) VALUES ?', [dataimages], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 8:
              requestimages = _context8.sent;
              _context8.next = 11;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_history SET req_ID=?,req_status_id=1,history_createdby=?', [requestID, req.session.userID], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 11:
              requesthistory = _context8.sent;
              _context8.next = 14;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_bd_product(req_ID, product_name, product_location_id, product_des) VALUES ?', [dataproducts], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 14:
              requestproduct = _context8.sent;
              res.redirect("/requestlist");

            case 16:
            case "end":
              return _context8.stop();
          }
        }
      });
    };

    var requestID = "BD" + Date.now();
    var dataimages = [],
        dataproducts = [];
    req.files.forEach(function (element) {
      dataimages.push([requestID, element.filename]);
    });

    if (Array.isArray(req.body.productname)) {
      for (var x = 0; x < req.body.productname.length; x++) {
        dataproducts.push([requestID, req.body.productname[x], req.body.position[x], req.body.des[x]]);
      }
    } else {
      dataproducts.push([requestID, req.body.productname, req.body.position, req.body.des]);
    }

    var connection = mysql.createConnection(db_config);
    requesttodatabase().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.get("/requestlist", function (req, res) {
  if (req.session.loggedin) {
    var countstatus = [];
    getcountoflists(req, res).then(function (value) {
      countstatus = value;
      var connection = mysql.createConnection(db_config);
      var requestlists = [];
      connection.query('select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des, CONCAT(m.user_firstname," ",m.user_lastname) as createby from request r,member m, request_status s WHERE m.user_id = r.req_createdby AND r.req_createdby=? AND r.req_status_id=s.req_status_id order by r.req_created DESC', [req.session.userID], function (err, results, field) {
        if (results.length > 0) {
          for (var i = 0; i < results.length; i++) {
            var createdat = timeforreqlist(results[i].req_created);
            requestlists.push({
              id: results[i].req_ID,
              title: results[i].req_title,
              status: results[i].req_status_title,
              createdat: createdat,
              createdby: results[i].createby,
              statusid: results[i].req_status_id,
              des: results[i].req_des,
              profileimg: req.session.profileimage
            });
            createdat = "";
          }

          res.render("listrequest", {
            countstatus: countstatus,
            user_id: req.session.userID,
            logined: req.session.loggedin,
            user_usertype: req.session.user_usertype,
            user_firstname: req.session.user_firstname,
            departmentID: req.session.user_departmentID,
            requestlists: requestlists,
            profileimg: req.session.profileimage,
            currentpage: "yourequest"
          });
        } else {
          res.render("listrequest", {
            countstatus: countstatus,
            user_id: req.session.userID,
            logined: req.session.loggedin,
            user_usertype: req.session.user_usertype,
            user_firstname: req.session.user_firstname,
            departmentID: req.session.user_departmentID,
            requestlists: requestlists,
            profileimg: req.session.profileimage,
            currentpage: "yourequest"
          });
        }

        connection.end();
      });
    });
  } else {
    res.redirect("/");
  }
});
app.get("/requestlist/:id", function (req, res) {
  if (req.session.loggedin) {
    var requestdetail = function requestdetail() {
      var checkreqgetby, req_ID, sql, reqkeydata, getauthor, getby, getrequestkey, getreqhistory, getreqimages, producttype, getreqproduct, title, type, des, requester, receiver, products, images, history, countstatus;
      return regeneratorRuntime.async(function requestdetail$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              checkreqgetby = true;
              req_ID = req.params.id;
              sql = "";
              reqkeydata = {};
              _context9.next = 6;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select m.user_firstname, m.user_lastname, m.user_typeID, m.user_email, m.user_phone from member m, request r where r.req_ID = ? and r.req_createdby = m.user_id";
                connection.query(sql, [req_ID], function (err, results, field) {
                  resolve(results[0]);
                });
              }));

            case 6:
              getauthor = _context9.sent;
              _context9.next = 9;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select m.user_firstname, m.user_lastname, m.user_typeID, m.user_email, m.user_phone from member m, request r where r.req_ID = ? and r.req_getby = m.user_id";
                connection.query(sql, [req_ID], function (err, results, field) {
                  if (results.length > 0) {
                    resolve(results[0]);
                  } else {
                    resolve("รอเจ้าหน้าที่รับเรื่อง");
                  }
                });
              }));

            case 9:
              getby = _context9.sent;
              _context9.next = 12;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select * from request r, requesttype rt where r.req_ID = ? and r.req_type_id = rt.req_type_id";
                connection.query(sql, [req_ID], function (err, results, field) {
                  resolve(results[0]);
                });
              }));

            case 12:
              getrequestkey = _context9.sent;
              _context9.next = 15;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select h.req_ID, h.req_status_id, rs.req_status_title , h.history_des, h.history_createdby, h.history_created,IFNULL((select CONCAT(user_firstname,' ',user_lastname) from member where h.history_createdby = user_id ),'นิสิต') as 'history_createdbyn' from request_history h, request_status rs where req_ID = ? and h.req_status_id = rs.req_status_id order by h.history_created DESC";
                connection.query(sql, [req_ID], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 15:
              getreqhistory = _context9.sent;
              _context9.next = 18;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select * from request_image where req_ID = ?";
                connection.query(sql, [req_ID], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 18:
              getreqimages = _context9.sent;
              producttype = {
                1: "request_it_product",
                2: "request_md_product",
                3: "request_bd_product"
              };
              _context9.next = 22;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select * from " + producttype[getrequestkey.req_type_id] + " where req_ID = ?";
                connection.query(sql, [req_ID], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 22:
              getreqproduct = _context9.sent;
              title = getrequestkey.req_title;
              type = getrequestkey.req_type_title;
              des = getrequestkey.req_des;
              requester = getauthor;

              if (!requester) {
                requester = getrequestkey.req_createdby;
              }

              receiver = getby;
              products = getreqproduct;
              images = getreqimages;
              history = getreqhistory;
              countstatus = [];
              getcountoflists(req, res).then(function (value) {
                countstatus = value;
                res.render("detail", {
                  countstatus: countstatus,
                  user_id: req.session.userID,
                  logined: req.session.loggedin,
                  user_usertype: req.session.user_usertype,
                  user_firstname: req.session.user_firstname,
                  title: title,
                  type: type,
                  des: des,
                  requester: requester,
                  receiver: receiver,
                  products: products,
                  images: images,
                  history: history,
                  profileimg: req.session.profileimage,
                  currentpage: "yourequest"
                });
              });

            case 34:
            case "end":
              return _context9.stop();
          }
        }
      });
    };

    var connection = mysql.createConnection(db_config);
    requestdetail().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.get("/newlist", function (req, res) {
  if (req.session.loggedin) {
    var requestlists = [];
    var typereq = req.session.user_departmentID;
    var countstatus = [];
    getcountoflists(req, res).then(function (value) {
      countstatus = value;
      var sql = "";

      if (req.session.user_departmentID == 4) {
        sql = 'select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des from request r , request_status s WHERE r.req_status_id = 3 AND r.req_status_id=s.req_status_id order by r.req_created DESC';
      } else {
        sql = 'select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des from request r , request_status s WHERE r.req_type_id = "' + typereq + '" AND r.req_status_id = 1 AND r.req_status_id=s.req_status_id order by r.req_created DESC';
      }

      var connection = mysql.createConnection(db_config);
      connection.query(sql, function (err, results, field) {
        if (results.length > 0) {
          for (var i = 0; i < results.length; i++) {
            var createdat = timeforreqlist(results[i].req_created);
            requestlists.push({
              id: results[i].req_ID,
              title: results[i].req_title,
              status: results[i].req_status_title,
              createdat: createdat,
              statusid: results[i].req_status_id,
              des: results[i].req_des
            });
            createdat = "";
          }

          res.render("listnew", {
            countstatus: countstatus,
            user_id: req.session.userID,
            logined: req.session.loggedin,
            user_usertype: req.session.user_usertype,
            user_firstname: req.session.user_firstname,
            departmentID: req.session.user_departmentID,
            requestlists: requestlists,
            profileimg: req.session.profileimage,
            currentpage: "newrequest"
          });
        } else {
          res.render("listnew", {
            countstatus: countstatus,
            user_id: req.session.userID,
            logined: req.session.loggedin,
            user_usertype: req.session.user_usertype,
            user_firstname: req.session.user_firstname,
            departmentID: req.session.user_departmentID,
            requestlists: requestlists,
            profileimg: req.session.profileimage,
            currentpage: "new"
          });
        }

        connection.end();
      });
    });
  } else {
    res.redirect("/");
  }
});
app.get("/newlist/:id", function (req, res) {
  if (req.session.loggedin && req.session.user_usertype == "2") {
    var requestdetail = function requestdetail() {
      var checkreqgetby, req_ID, sql, reqkeydata, getauthor, getby, getrequestkey, getreqhistory, getreqimages, producttype, getreqproduct, title, type, des, requester, receiver, products, images, history, countstatus;
      return regeneratorRuntime.async(function requestdetail$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              checkreqgetby = true;
              req_ID = req.params.id;
              sql = "";
              reqkeydata = {};
              _context10.next = 6;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select m.user_firstname, m.user_lastname, m.user_typeID, m.user_email, m.user_phone from member m, request r where r.req_ID = ? and r.req_createdby = m.user_id";
                connection.query(sql, [req_ID], function (err, results, field) {
                  resolve(results[0]);
                });
              }));

            case 6:
              getauthor = _context10.sent;
              _context10.next = 9;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select m.user_firstname, m.user_lastname, m.user_typeID, m.user_email, m.user_phone from member m, request r where r.req_ID = ? and r.req_getby = m.user_id";
                connection.query(sql, [req_ID], function (err, results, field) {
                  if (results.length > 0) {
                    resolve(results[0]);
                  } else {
                    resolve("รอเจ้าหน้าที่รับเรื่อง");
                  }
                });
              }));

            case 9:
              getby = _context10.sent;
              _context10.next = 12;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select * from request r, requesttype rt where r.req_ID = ? and r.req_type_id = rt.req_type_id";
                connection.query(sql, [req_ID], function (err, results, field) {
                  resolve(results[0]);
                });
              }));

            case 12:
              getrequestkey = _context10.sent;
              _context10.next = 15;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select h.req_ID, h.req_status_id, rs.req_status_title , h.history_des, h.history_createdby, h.history_created,IFNULL((select CONCAT(user_firstname,' ',user_lastname) from member where h.history_createdby = user_id ),'นิสิต') as 'history_createdbyn' from request_history h, request_status rs where req_ID = ? and h.req_status_id = rs.req_status_id order by h.history_created DESC";
                connection.query(sql, [req_ID], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 15:
              getreqhistory = _context10.sent;
              _context10.next = 18;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select * from request_image where req_ID = ?";
                connection.query(sql, [req_ID], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 18:
              getreqimages = _context10.sent;
              producttype = {
                1: "request_it_product",
                2: "request_md_product",
                3: "request_bd_product"
              };
              _context10.next = 22;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select * from " + producttype[getrequestkey.req_type_id] + " where req_ID = ?";
                connection.query(sql, [req_ID], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 22:
              getreqproduct = _context10.sent;
              title = getrequestkey.req_title;
              type = getrequestkey.req_type_title;
              des = getrequestkey.req_des;
              requester = getauthor;

              if (!requester) {
                requester = getrequestkey.req_createdby;
              }

              receiver = getby;
              products = getreqproduct;
              images = getreqimages;
              history = getreqhistory;
              countstatus = [];
              getcountoflists(req, res).then(function (value) {
                countstatus = value;

                if (getrequestkey.req_status_id == "1" || getrequestkey.req_status_id == "3") {
                  res.render("receive", {
                    countstatus: countstatus,
                    user_id: req.session.userID,
                    logined: req.session.loggedin,
                    user_usertype: req.session.user_usertype,
                    user_firstname: req.session.user_firstname,
                    user_department: req.session.user_departmentID,
                    profileimg: req.session.profileimage,
                    title: title,
                    type: type,
                    des: des,
                    requester: requester,
                    receiver: receiver,
                    products: products,
                    images: images,
                    history: history,
                    currentpage: "new"
                  });
                } else {
                  res.redirect("/newlist");
                }
              });

            case 34:
            case "end":
              return _context10.stop();
          }
        }
      });
    };

    var connection = mysql.createConnection(db_config);
    requestdetail().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.post("/newlist/:id", function (req, res) {
  if (req.session.loggedin && req.session.user_usertype == "2") {
    var getorcancel = function getorcancel() {
      var requester, forkey, timeused, forhistory, _requester, _timeused, _forkey, _timeused2, _forkey2;

      return regeneratorRuntime.async(function getorcancel$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              if (!(status == "รับเรื่อง")) {
                _context11.next = 27;
                break;
              }

              if (!(req.session.user_departmentID == 4)) {
                _context11.next = 16;
                break;
              }

              _context11.next = 4;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select r.req_createdby,m.user_firstname,m.user_lastname,m.user_email,m.notifyforreq from request r,member m WHERE m.user_id = r.req_getby AND r.req_ID=? AND r.requestfrom = 'บุคลากร'";
                connection.query(sql, [req_ID], function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      if (results[0].notifyforreq == 1) {
                        var toemails = results[0].user_email;
                        var subject = "เจ้าหน้าที่พัสดุรับเรื่องรายการที่คุณทำเรื่องพัสดุแล้ว";
                        var html = "เจ้าหน้าที่พัสดุ คุณ" + req.session.fname + " " + req.session.lname + " ได้รับเรื่องแจ้งทำเรื่องพัสดุของคุณแล้ว<br>หมายเหตุจากเจ้าหน้าที่ : " + des + "<br>หมายเลขไอดีรายการแจ้ง : " + req_ID + "<br><br> ติดต่อเจ้าหน้าที่ : " + req.session.phone;
                        sendmail(toemails, subject, html);
                      } // resolve(results.affectedRows);

                    }

                    resolve(results);
                  }
                });
              }));

            case 4:
              requester = _context11.sent;
              _context11.next = 7;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "UPDATE request SET req_status_id = 5, req_end = CURRENT_TIMESTAMP, req_repairby = ? WHERE req_ID = ?";
                connection.query(sql, [req.session.userID, req_ID], function (err, results, field) {
                  resolve(results.affectedRows);
                });
              }));

            case 7:
              forkey = _context11.sent;
              _context11.next = 10;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select ROUND(TIME_TO_SEC(TIMEDIFF(now(), history_created))/60) AS 'timeused' from request_history where req_ID = ? ORDER BY history_created DESC LIMIT 1";
                connection.query(sql, [req_ID], function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      resolve(results[0].timeused);
                    }
                  } else {}
                });
              }));

            case 10:
              timeused = _context11.sent;
              _context11.next = 13;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "INSERT INTO request_history SET req_ID = ?, req_status_id = ?, history_des = ?, history_createdby = ?, timeused = ?";
                connection.query(sql, [req_ID, 5, des, req.session.userID, timeused], function (err, results, field) {
                  resolve(results.affectedRows);
                });
              }));

            case 13:
              forhistory = _context11.sent;
              _context11.next = 25;
              break;

            case 16:
              _context11.next = 18;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select r.req_createdby,m.user_firstname,m.user_lastname,m.user_email,m.notifyforreq from request r,member m WHERE m.user_id = r.req_createdby AND r.req_ID=? AND r.requestfrom = 'บุคลากร'";
                connection.query(sql, [req_ID], function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      if (results[0].notifyforreq == 1) {
                        var toemails = results[0].user_email;
                        var subject = "เจ้าหน้าที่รับเรื่องรายการแจ้งซ่อมของคุณแล้ว";
                        var html = "เจ้าหน้าที่ คุณ" + req.session.fname + " " + req.session.lname + " ได้รับเรื่องรายการแจ้งซ่อมของคุณแล้ว<br>หมายเหตุจากเจ้าหน้าที่ : " + des + "<br>หมายเลขไอดีรายการแจ้ง : " + req_ID + "<br><br> ติดต่อเจ้าหน้าที่ : " + req.session.phone;
                        sendmail(toemails, subject, html);
                      }
                    }

                    resolve(results);
                  }
                });
              }));

            case 18:
              _requester = _context11.sent;
              _context11.next = 21;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select ROUND(TIME_TO_SEC(TIMEDIFF(now(), history_created))/60) AS 'timeused' from request_history where req_ID = ? ORDER BY history_created DESC LIMIT 1";
                connection.query(sql, [req_ID], function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      resolve(results[0].timeused);
                    }
                  } else {}
                });
              }));

            case 21:
              _timeused = _context11.sent;
              _context11.next = 24;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "UPDATE request SET req_status_id = 2, req_getby = ?, req_end = CURRENT_TIMESTAMP WHERE req_ID = ? AND req_status_id = 1";
                connection.query(sql, [req.session.userID, req_ID], function (err, results, field) {
                  resolve(results.affectedRows);

                  if (results.affectedRows == 1) {
                    var sql = "INSERT INTO request_history SET req_ID = ?, req_status_id = ?, history_des = ?, history_createdby = ?, timeused = ?";
                    connection.query(sql, [req_ID, 2, des, req.session.userID, _timeused], function (err, results, field) {});
                  }
                });
              }));

            case 24:
              _forkey = _context11.sent;

            case 25:
              _context11.next = 37;
              break;

            case 27:
              if (!(req.session.user_departmentID == 4)) {
                _context11.next = 31;
                break;
              }

              alert("ฝ่ายพัสดุไม่สามารถยกเลิกรายการแจ้งได้");
              _context11.next = 37;
              break;

            case 31:
              _context11.next = 33;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select ROUND(TIME_TO_SEC(TIMEDIFF(now(), history_created))/60) AS 'timeused' from request_history where req_ID = ? ORDER BY history_created DESC LIMIT 1";
                connection.query(sql, [req_ID], function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      resolve(results[0].timeused);
                    }
                  } else {}
                });
              }));

            case 33:
              _timeused2 = _context11.sent;
              _context11.next = 36;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "UPDATE request SET req_status_id = 0, req_getby = ?, req_end = CURRENT_TIMESTAMP WHERE req_ID = ? AND req_status_id = 1";
                connection.query(sql, [req.session.userID, req_ID], function (err, results, field) {
                  resolve(results.affectedRows);

                  if (results.affectedRows == 1) {
                    var sqlforhitory = "INSERT INTO request_history SET req_ID = ?, req_status_id = ?, history_des = ?, history_createdby = ?, timeused = ?";
                    connection.query(sqlforhitory, [req_ID, 0, des, req.session.userID, _timeused2], function (err, results, field) {});
                  }
                });
              }));

            case 36:
              _forkey2 = _context11.sent;

            case 37:
            case "end":
              return _context11.stop();
          }
        }
      });
    };

    var body = req.body;
    var req_ID = req.params.id;
    var status = req.body.status;
    var des = req.body.des;
    var connection = mysql.createConnection(db_config);
    getorcancel().then(function () {
      connection.end();
    });
    res.redirect("/receivelist");
    res.end();
  } else {
    res.redirect("/");
  }
});
app.get("/receivelist?", function (req, res) {
  if (req.session.loggedin && req.session.user_usertype == "2") {
    var countstatus = [];
    getcountoflists(req, res).then(function (value) {
      countstatus = value;
      var requestlists = [];
      var sql = "";

      if (req.session.user_departmentID == 4) {
        sql = 'select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des from request r, request_status s WHERE r.req_repairby=? AND r.req_status_id=s.req_status_id order by CAST(r.req_status_id AS UNSIGNED), r.req_created DESC';
      } else {
        sql = 'select r.req_ID, r.req_title , s.req_status_title, r.req_created,r.req_status_id, r.req_des from request r, request_status s WHERE r.req_getby=? AND r.req_status_id=s.req_status_id order by CAST(r.req_status_id AS UNSIGNED), r.req_created DESC';
      }

      var connection = mysql.createConnection(db_config);
      connection.query(sql, [req.session.userID], function (err, results, field) {
        if (results.length > 0) {
          for (var i = 0; i < results.length; i++) {
            var createdat = timeforreqlist(results[i].req_created);
            requestlists.push({
              id: results[i].req_ID,
              title: results[i].req_title,
              status: results[i].req_status_title,
              createdat: createdat,
              statusid: results[i].req_status_id,
              des: results[i].req_des
            });
            createdat = "";
          }
        }

        res.render("listreceive", {
          countstatus: countstatus,
          user_id: req.session.userID,
          logined: req.session.loggedin,
          user_usertype: req.session.user_usertype,
          profileimg: req.session.profileimage,
          user_firstname: req.session.user_firstname,
          departmentID: req.session.user_departmentID,
          requestlists: requestlists,
          currentpage: "recieve"
        });
        connection.end();
      });
    });
  } else {
    res.redirect("/");
  }
});
app.get("/receivelist/:id", function (req, res) {
  if (req.session.loggedin && req.session.user_usertype == "2") {
    var requestdetail = function requestdetail() {
      var checkreqgetby, req_ID, sql, reqkeydata, getauthor, getby, getrequestkey, getreqhistory, getreqimages, producttype, getreqproduct, requeststatus, title, type, des, requester, receiver, products, images, history, countstatus;
      return regeneratorRuntime.async(function requestdetail$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              checkreqgetby = true;
              req_ID = req.params.id;
              sql = "";
              reqkeydata = {};
              _context12.next = 6;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select m.user_firstname, m.user_lastname, m.user_typeID, m.user_email, m.user_phone from member m, request r where r.req_ID = ? and r.req_createdby = m.user_id";
                connection.query(sql, [req_ID], function (err, results, field) {
                  resolve(results[0]);
                });
              }));

            case 6:
              getauthor = _context12.sent;
              _context12.next = 9;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select m.user_firstname, m.user_lastname, m.user_typeID, m.user_email, m.user_phone from member m, request r where r.req_ID = ? and r.req_getby = m.user_id";
                connection.query(sql, [req_ID], function (err, results, field) {
                  if (results.length > 0) {
                    resolve(results[0]);
                  } else {
                    resolve("รอเจ้าหน้าที่รับเรื่อง");
                  }
                });
              }));

            case 9:
              getby = _context12.sent;
              _context12.next = 12;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "";

                if (req.session.user_departmentID == 4) {
                  sql = "select * from request r, requesttype rt where r.req_ID = ? and r.req_type_id = rt.req_type_id and r.req_repairby = ? ";
                } else {
                  sql = "select * from request r, requesttype rt where r.req_ID = ? and r.req_type_id = rt.req_type_id and r.req_getby = ?";
                }

                connection.query(sql, [req_ID, req.session.userID], function (err, results, field) {
                  if (results.length < 1) {
                    res.status(404).send("รายการนี้คุณไม่ได้เป็นผู้รับ");
                    res.end();
                  }

                  resolve(results[0]);
                });
              }));

            case 12:
              getrequestkey = _context12.sent;

              if (req.session.user_departmentID == 4) {
                if (getrequestkey.req_status_id < 5 && getrequestkey.req_status_id > 8) {
                  res.send("รายการนี้คุณยังไม่ได้รับ");
                  res.end();
                }
              } else {
                if (getrequestkey.req_status_id == 1) {
                  res.send("รายการนี้คุณยังไม่ได้รับ");
                  res.end();
                }
              }

              _context12.next = 16;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select h.req_ID, h.req_status_id, rs.req_status_title , h.history_des, h.history_createdby, h.history_created,IFNULL((select CONCAT(user_firstname,' ',user_lastname) from member where h.history_createdby = user_id ),'นิสิต') as 'history_createdbyn' from request_history h, request_status rs where req_ID = ? and h.req_status_id = rs.req_status_id order by h.history_created DESC";
                connection.query(sql, [req_ID], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 16:
              getreqhistory = _context12.sent;
              _context12.next = 19;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select * from request_image where req_ID = ?";
                connection.query(sql, [req_ID], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 19:
              getreqimages = _context12.sent;
              producttype = {
                1: "request_it_product",
                2: "request_md_product",
                3: "request_bd_product"
              };
              _context12.next = 23;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select * from " + producttype[getrequestkey.req_type_id] + " where req_ID = ?";
                connection.query(sql, [req_ID], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 23:
              getreqproduct = _context12.sent;
              _context12.next = 26;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "";

                if (req.session.user_departmentID == 4) {
                  if (getrequestkey.req_status_id != 5) {
                    sql = "select * from request_status where 0";
                  } else if (getrequestkey.req_status_id == 5) {
                    sql = "select * from request_status where req_status_id > 5 and req_status_id < 9 ";
                  } else {
                    sql = "select * from request_status where 0 ";
                  }
                } else {
                  if (getrequestkey.req_status_id == 2) {
                    sql = "select * from request_status where req_status_id = 3 or req_status_id = 4";
                  } else if (getrequestkey.req_status_id >= 6 && getrequestkey.req_status_id <= 8) {
                    sql = "select * from request_status where req_status_id = 9 or req_status_id = 10";
                  } else {
                    sql = "select * from request_status where 0";
                  }
                }

                connection.query(sql, [getrequestkey.req_status_id], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 26:
              requeststatus = _context12.sent;

              if (getrequestkey.req_status_id == 0 || getrequestkey.req_status_id == "4") {
                requeststatus = [];
              }

              title = getrequestkey.req_title;
              type = getrequestkey.req_type_title;
              des = getrequestkey.req_des;
              requester = getauthor;

              if (!requester) {
                requester = getrequestkey.req_createdby;
              }

              receiver = getby;
              products = getreqproduct;
              images = getreqimages;
              history = getreqhistory;
              countstatus = [];
              getcountoflists(req, res).then(function (value) {
                countstatus = value;
                res.render("update", {
                  countstatus: countstatus,
                  user_id: req.session.userID,
                  logined: req.session.loggedin,
                  user_usertype: req.session.user_usertype,
                  user_firstname: req.session.user_firstname,
                  profileimg: req.session.profileimage,
                  title: title,
                  type: type,
                  des: des,
                  requester: requester,
                  receiver: receiver,
                  products: products,
                  images: images,
                  history: history,
                  statuss: requeststatus,
                  currentpage: "recieve"
                });
              });

            case 39:
            case "end":
              return _context12.stop();
          }
        }
      });
    };

    var connection = mysql.createConnection(db_config);
    requestdetail().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.post("/receivelist/:id", function (req, res) {
  if (req.session.loggedin && req.session.user_usertype == "2") {
    var updatestatus = function updatestatus() {
      var requester, toreceiver, mailsofdepartment, forkey, timeused, forhistory;
      return regeneratorRuntime.async(function updatestatus$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select r.req_createdby,m.user_firstname,m.user_lastname,m.user_email,(select req_status_title from request_status where req_status_id = ?) as status, m.notifyforreq from request r,member m WHERE m.user_id = r.req_createdby AND r.req_ID=?";
                connection.query(sql, [status, req_ID], function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      if (results[0].notifyforreq == 1) {
                        if (status == 0 || status == 4 || status == 9 || status == 10) {
                          var toemails = results[0].user_email;
                          var subject = "เจ้าหน้าได้อัพเดทสถานะรายการแจ้งซ่อมของคุณแล้ว";
                          var html = "เจ้าหน้าที่ คุณ" + req.session.fname + " " + req.session.lname + "  ได้อัพเดทสถานะรายการแจ้งซ๋อมของคุณเป็น" + results[0].status + "<br>หมายเหตุจากเจ้าหน้าที่ : " + des + "<br>หมายเลขไอดีรายการแจ้ง : " + req_ID + "<br><br> ติดต่อเจ้าหน้าที่ : " + req.session.phone;
                          sendmail(toemails, subject, html);
                        }
                      }
                    }

                    resolve(results);
                  }
                });
              }));

            case 2:
              requester = _context13.sent;

              if (!(status == 6 || status == 7 || status == 8)) {
                _context13.next = 7;
                break;
              }

              _context13.next = 6;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select r.req_getby,m.user_firstname,m.user_lastname,m.user_email,(select req_status_title from request_status where req_status_id = ?) as status, m.notifyforreq from request r,member m WHERE m.user_id = r.req_getby AND r.req_ID=?";
                connection.query(sql, [status, req_ID], function (err, results, field) {
                  if (results[0].notifyforreq == 1) {
                    var toemails = results[0].user_email;
                    var subject = "เจ้าหน้าที่พัสดุอัพเดทสถานะรายการที่คุณทำเรื่องพัสดุแล้ว";
                    var html = "เจ้าหน้าที่พัสดุ คุณ" + req.session.fname + " " + req.session.lname + "  ได้อัพเดทสถานะรายการที่คุณทำเรื่องพัสดุเป็น" + results[0].status + "<br>หมายเหตุจากเจ้าหน้าที่ : " + des + "<br>หมายเลขไอดีรายการแจ้ง : " + req_ID + "<br><br> ติดต่อเจ้าหน้าที่ : " + req.session.phone;
                    sendmail(toemails, subject, html);
                  }

                  resolve(results.affectedRows);
                });
              }));

            case 6:
              toreceiver = _context13.sent;

            case 7:
              if (!(status == 3 && req.session.user_departmentID != 4)) {
                _context13.next = 11;
                break;
              }

              _context13.next = 10;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('select m.user_email from member m where m.user_departmentID = 4 AND notifyforreq = 1', function (err, results, field) {
                  resolve(results);

                  if (results.length > 0) {
                    var emails = [];

                    for (var i = 0; i < results.length; i++) {
                      emails.push(results[i].user_email);
                    }

                    var subject = "รายการทำเรื่องพัสดุเข้ามาใหม่";
                    var html = "เจ้าหน้าที่ คุณ" + req.session.fname + " " + req.session.lname + " ได้ทำการแจ้งทำเรื่องพัสดุเข้ามา<br>หมายเหตุจากผู้แจ้ง : " + des + "<br>หมายเลขไอดีรายการแจ้ง : " + req_ID + "<br><br> ติดต่อผู้แจ้ง : " + req.session.phone;
                    sendmail(emails, subject, html);
                  }
                });
              }));

            case 10:
              mailsofdepartment = _context13.sent;

            case 11:
              _context13.next = 13;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                if (status == '0' || status == '4' || status == '9' || status == '10') {
                  var sql = "UPDATE request SET req_status_id = ? , req_end = CURRENT_TIMESTAMP WHERE req_getby = ? AND req_ID = ?";
                  connection.query(sql, [status, req.session.userID, req_ID], function (err, results, field) {
                    resolve(results.affectedRows);
                  });
                } else {
                  var sql = "UPDATE request SET req_status_id = ?, req_end = CURRENT_TIMESTAMP  WHERE req_ID = ?";
                  connection.query(sql, [status, req_ID], function (err, results, field) {
                    resolve(results.affectedRows);
                  });
                }
              }));

            case 13:
              forkey = _context13.sent;
              _context13.next = 16;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select ROUND(TIME_TO_SEC(TIMEDIFF(now(), history_created))/60) AS 'timeused' from request_history where req_ID = ? ORDER BY history_created DESC LIMIT 1";
                connection.query(sql, [req_ID], function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      resolve(results[0].timeused);
                    }
                  } else {}
                });
              }));

            case 16:
              timeused = _context13.sent;
              _context13.next = 19;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "INSERT INTO request_history SET req_ID = ?, req_status_id = ?, history_des = ?, history_createdby = ?, timeused = ?";
                connection.query(sql, [req_ID, status, des, req.session.userID, timeused], function (err, results, field) {
                  resolve(results.affectedRows);
                });
              }));

            case 19:
              forhistory = _context13.sent;

            case 20:
            case "end":
              return _context13.stop();
          }
        }
      });
    };

    var req_ID = req.params.id;
    var status = req.body.updatestatus;
    var des = req.body.description || "-";
    var connection = mysql.createConnection(db_config);
    updatestatus().then(function () {
      connection.end();
    });
    res.redirect("/receivelist/" + req_ID);
    res.end();
  } else {
    res.redirect("/");
  }
});

function getcountoflists(req, res) {
  var listscount, connection, news, receives, requests;
  return regeneratorRuntime.async(function getcountoflists$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          connection = mysql.createConnection(db_config);
          _context14.next = 3;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            var sql = "";

            if (req.session.user_departmentID == 4) {
              var sql = "select COUNT(*) as 'count' from request where req_status_id = 3";
              connection.query(sql, function (err, results, field) {
                if (results) {
                  resolve(results);
                } else {
                  resolve(0);
                }
              });
            } else {
              var sql = "select COUNT(*) as 'count' from request where req_status_id = 1 AND req_type_id = ? AND req_createdby != ?";
              connection.query(sql, [req.session.user_departmentID, req.session.userID], function (err, results, field) {
                if (results) {
                  resolve(results);
                } else {
                  resolve(0);
                }
              });
            }
          }));

        case 3:
          news = _context14.sent;
          _context14.next = 6;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            if (req.session.user_departmentID == 4) {
              var sql = "select COUNT(*) as 'count' from request where req_repairby = ? and req_status_id = 5";
              connection.query(sql, [req.session.userID], function (err, results, field) {
                if (results) {
                  resolve(results);
                } else {
                  resolve(0);
                }
              });
            } else {
              var sql = "select COUNT(*) as 'count' from request where req_status_id = 2 AND req_type_id = ? AND req_createdby != ? AND req_getby = ?";
              connection.query(sql, [req.session.user_departmentID, req.session.userID, req.session.userID], function (err, results, field) {
                if (results) {
                  resolve(results);
                } else {
                  resolve(0);
                }
              });
            }
          }));

        case 6:
          receives = _context14.sent;
          _context14.next = 9;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            var sql = "select COUNT(*) as 'count' from request where req_status_id = 1 AND req_createdby = ?";
            connection.query(sql, [req.session.userID], function (err, results, field) {
              if (results) {
                resolve(results);
              } else {
                resolve(0);
              }
            });
          }));

        case 9:
          requests = _context14.sent;

          if (requests[0].count, receives[0].count, news[0].count) {
            listscount = [requests[0].count, receives[0].count, news[0].count];
          } else {
            listscount = [0, 0, 0];
          }

          connection.end();
          return _context14.abrupt("return", listscount);

        case 13:
        case "end":
          return _context14.stop();
      }
    }
  });
} // for student


app.get("/requeststd", function (req, res) {
  res.render("requestforstudent", {
    header: "student",
    backbutton: ""
  });
});
app.get("/requeststd/IT", function (req, res) {
  if (!req.session.loggedin) {
    var listdata = function listdata() {
      var product, location, problemfortitle, countstatus;
      return regeneratorRuntime.async(function listdata$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              _context15.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM product WHERE product_typeID = 1', function (err, results, field) {
                  if (err) throw err;

                  if (results.length > 0) {
                    var arrayy = [];
                    var i = 0;

                    for (var i = 0; i < results.length; i++) {
                      arrayy.push(results[i]['product_name']);
                    }

                    resolve(arrayy);
                  }
                });
              }));

            case 2:
              product = _context15.sent;
              _context15.next = 5;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM location', function (err, results, field) {
                  if (err) throw err;

                  if (results.length > 0) {
                    var arrayy = [];
                    var i = 0;

                    for (var i = 0; i < results.length; i++) {
                      arrayy.push(results[i]['location_id']);
                    }

                    resolve(arrayy);
                  }
                });
              }));

            case 5:
              location = _context15.sent;
              _context15.next = 8;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM problem WHERE req_type_id = 1', function (err, results, field) {
                  resolve(results);
                });
              }));

            case 8:
              problemfortitle = _context15.sent;
              countstatus = [];
              getcountoflists(req, res).then(function (value) {
                countstatus = value;
                res.render("requestIT", {
                  countstatus: countstatus,
                  user_id: req.session.userID,
                  logined: req.session.loggedin,
                  user_usertype: req.session.user_usertype,
                  user_firstname: req.session.user_firstname,
                  locations: location,
                  products: product,
                  problem: problemfortitle,
                  profileimg: req.session.profileimage,
                  header: "student",
                  backbutton: "requeststd"
                });
              });

            case 11:
            case "end":
              return _context15.stop();
          }
        }
      });
    };

    var connection = mysql.createConnection(db_config);
    listdata().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.get("/requeststd/MD", function (req, res) {
  if (!req.session.loggedin) {
    var listdata = function listdata() {
      var product, location, problemfortitle, countstatus;
      return regeneratorRuntime.async(function listdata$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              _context16.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM product WHERE product_typeID = 2', function (err, results, field) {
                  if (err) throw err;

                  if (results.length > 0) {
                    var arrayy = [];
                    var i = 0;

                    for (var i = 0; i < results.length; i++) {
                      arrayy.push(results[i]['product_name']);
                    }

                    resolve(arrayy);
                  }
                });
              }));

            case 2:
              product = _context16.sent;
              _context16.next = 5;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM location', function (err, results, field) {
                  if (err) throw err;

                  if (results.length > 0) {
                    var arrayy = [];
                    var i = 0;

                    for (var i = 0; i < results.length; i++) {
                      arrayy.push(results[i]['location_id']);
                    }

                    resolve(arrayy);
                  }
                });
              }));

            case 5:
              location = _context16.sent;
              _context16.next = 8;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM problem WHERE req_type_id = 2', function (err, results, field) {
                  resolve(results);
                });
              }));

            case 8:
              problemfortitle = _context16.sent;
              countstatus = [];
              getcountoflists(req, res).then(function (value) {
                countstatus = value;
                res.render("requestMD", {
                  countstatus: countstatus,
                  user_id: req.session.userID,
                  logined: req.session.loggedin,
                  user_usertype: req.session.user_usertype,
                  user_firstname: req.session.user_firstname,
                  locations: location,
                  products: product,
                  problem: problemfortitle,
                  profileimg: req.session.profileimage,
                  header: "student",
                  backbutton: "requeststd"
                });
              });

            case 11:
            case "end":
              return _context16.stop();
          }
        }
      });
    };

    var connection = mysql.createConnection(db_config);
    listdata().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.get("/requeststd/BD", function (req, res) {
  if (!req.session.loggedin) {
    var listdata = function listdata() {
      var product, location, problemfortitle, countstatus;
      return regeneratorRuntime.async(function listdata$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              _context17.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM product WHERE product_typeID = 3', function (err, results, field) {
                  if (err) throw err;

                  if (results.length > 0) {
                    var arrayy = [];
                    var i = 0;

                    for (var i = 0; i < results.length; i++) {
                      arrayy.push(results[i]['product_name']);
                    }

                    resolve(arrayy);
                  }
                });
              }));

            case 2:
              product = _context17.sent;
              _context17.next = 5;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM location', function (err, results, field) {
                  if (err) throw err;

                  if (results.length > 0) {
                    var arrayy = [];
                    var i = 0;

                    for (var i = 0; i < results.length; i++) {
                      arrayy.push(results[i]['location_id']);
                    }

                    resolve(arrayy);
                  }
                });
              }));

            case 5:
              location = _context17.sent;
              _context17.next = 8;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM problem WHERE req_type_id = 3', function (err, results, field) {
                  resolve(results);
                });
              }));

            case 8:
              problemfortitle = _context17.sent;
              countstatus = [];
              getcountoflists(req, res).then(function (value) {
                countstatus = value;
                res.render("requestBD", {
                  countstatus: countstatus,
                  user_id: req.session.userID,
                  logined: req.session.loggedin,
                  user_usertype: req.session.user_usertype,
                  user_firstname: req.session.user_firstname,
                  locations: location,
                  products: product,
                  problem: problemfortitle,
                  profileimg: req.session.profileimage,
                  header: "student",
                  backbutton: "requeststd"
                });
              });

            case 11:
            case "end":
              return _context17.stop();
          }
        }
      });
    };

    var connection = mysql.createConnection(db_config);
    listdata().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.post('/requeststd/IT', upload.array('images', 10), function (req, res, next) {
  var verify = req.body.checkverify;
  var email = req.body.email;
  var description = req.body.description;

  if (!req.session.loggedin && verify) {
    var requesttodatabase = function requesttodatabase() {
      var mailsofdepartment, requestkey, requestimages, requesthistory, requestproduct;
      return regeneratorRuntime.async(function requesttodatabase$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              _context18.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('select m.user_email from member m where m.user_departmentID = 1 AND notifyforreq = 1', function (err, results, field) {
                  resolve(results);

                  if (results.length > 0) {
                    var emails = [];

                    for (var i = 0; i < results.length; i++) {
                      emails.push(results[i].user_email);
                    }

                    var subject = "รายการแจ้งซ่อมเข้ามาใหม่";
                    var html = "นิสิตได้ทำการแจ้งซ่อมเข้ามา<br>หมายเหตุจากผู้แจ้ง : " + description + "<br>หมายเลขไอดีรายการแจ้ง : " + requestID + "<br><br> ติดต่อผู้แจ้ง : " + email;
                    sendmail(emails, subject, html);
                  }
                });
              }));

            case 2:
              mailsofdepartment = _context18.sent;
              _context18.next = 5;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request SET req_ID=?,req_title=?,req_status_id=1,req_type_id=1,req_createdby=?,req_des=?,requestfrom="นิสิต",req_end=now()', [requestID, req.body.title, email, req.body.description], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 5:
              requestkey = _context18.sent;
              _context18.next = 8;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_image(req_ID , image_name) VALUES ?', [dataimages], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 8:
              requestimages = _context18.sent;
              _context18.next = 11;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_history SET req_ID=?,req_status_id=1,history_createdby=?', [requestID, email], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 11:
              requesthistory = _context18.sent;
              _context18.next = 14;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_it_product(req_ID, product_ID, product_name, product_location_id, product_des) VALUES ?', [dataproducts], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 14:
              requestproduct = _context18.sent;
              res.redirect("/requeststd");

            case 16:
            case "end":
              return _context18.stop();
          }
        }
      });
    };

    var requestID = "IT" + Date.now();
    var dataimages = [],
        dataproducts = [];
    req.files.forEach(function (element) {
      dataimages.push([requestID, element.filename]);
    });

    if (Array.isArray(req.body.productid)) {
      for (var x = 0; x < req.body.productid.length; x++) {
        dataproducts.push([requestID, req.body.productid[x], req.body.productname[x], req.body.position[x], req.body.des[x]]);
      }
    } else {
      dataproducts.push([requestID, req.body.productid, req.body.productname, req.body.position, req.body.des]);
    }

    var connection = mysql.createConnection(db_config);
    requesttodatabase().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.post('/requeststd/MD', upload.array('images', 10), function (req, res, next) {
  var verify = req.body.checkverify;
  var email = req.body.email;

  if (!req.session.loggedin && verify) {
    var requesttodatabase = function requesttodatabase() {
      var mailsofdepartment, requestkey, requestimages, requesthistory, requestproduct;
      return regeneratorRuntime.async(function requesttodatabase$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              _context19.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('select m.user_email from member m where m.user_departmentID = 2 AND notifyforreq = 1', function (err, results, field) {
                  resolve(results);

                  if (results.length > 0) {
                    var emails = [];

                    for (var i = 0; i < results.length; i++) {
                      emails.push(results[i].user_email);
                    }

                    var subject = "รายการแจ้งซ่อมเข้ามาใหม่";
                    var html = "นิสิตได้ทำการแจ้งซ่อมเข้ามา<br>หมายเหตุจากผู้แจ้ง : " + description + "<br>หมายเลขไอดีรายการแจ้ง : " + requestID + "<br><br> ติดต่อผู้แจ้ง : " + email;
                    sendmail(emails, subject, html);
                  }
                });
              }));

            case 2:
              mailsofdepartment = _context19.sent;
              _context19.next = 5;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request SET req_ID=?,req_title=?,req_status_id=1,req_type_id=2,req_createdby=?,req_des=?,requestfrom="นิสิต",req_end=now()', [requestID, req.body.title, email, req.body.description], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 5:
              requestkey = _context19.sent;
              _context19.next = 8;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_image(req_ID , image_name) VALUES ?', [dataimages], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 8:
              requestimages = _context19.sent;
              _context19.next = 11;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_history SET req_ID=?,req_status_id=1,history_createdby=?', [requestID, email], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 11:
              requesthistory = _context19.sent;
              _context19.next = 14;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_md_product(req_ID, product_name, product_location_id, product_des) VALUES ?', [dataproducts], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 14:
              requestproduct = _context19.sent;
              res.redirect("/requeststd");

            case 16:
            case "end":
              return _context19.stop();
          }
        }
      });
    };

    var description = req.body.description;
    var requestID = "MD" + Date.now();
    var dataimages = [],
        dataproducts = [];
    req.files.forEach(function (element) {
      dataimages.push([requestID, element.filename]);
    });

    if (Array.isArray(req.body.productname)) {
      for (var x = 0; x < req.body.productname.length; x++) {
        dataproducts.push([requestID, req.body.productname[x], req.body.position[x], req.body.des[x]]);
      }
    } else {
      dataproducts.push([requestID, req.body.productname, req.body.position, req.body.des]);
    }

    var connection = mysql.createConnection(db_config);
    requesttodatabase().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.post('/requeststd/BD', upload.array('images', 10), function (req, res, next) {
  var description = req.body.description;
  var verify = req.body.checkverify;
  var email = req.body.email;

  if (!req.session.loggedin && verify) {
    var requesttodatabase = function requesttodatabase() {
      var mailsofdepartment, requestkey, requestimages, requesthistory, requestproduct;
      return regeneratorRuntime.async(function requesttodatabase$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              _context20.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('select m.user_email from member m where m.user_departmentID = 3 AND notifyforreq = 1', function (err, results, field) {
                  resolve(results);

                  if (results.length > 0) {
                    var emails = [];

                    for (var i = 0; i < results.length; i++) {
                      emails.push(results[i].user_email);
                    }

                    var subject = "รายการแจ้งซ่อมเข้ามาใหม่";
                    var html = "นิสิตได้ทำการแจ้งซ่อมเข้ามา<br>หมายเหตุจากผู้แจ้ง : " + description + "<br>หมายเลขไอดีรายการแจ้ง : " + requestID + "<br><br> ติดต่อผู้แจ้ง : " + email;
                    sendmail(emails, subject, html);
                  }
                });
              }));

            case 2:
              mailsofdepartment = _context20.sent;
              _context20.next = 5;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request SET req_ID=?,req_title=?,req_status_id=1,req_type_id=3,req_createdby=?,req_des=?,requestfrom="นิสิต",req_end=now()', [requestID, req.body.title, email, req.body.description], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 5:
              requestkey = _context20.sent;
              _context20.next = 8;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_image(req_ID , image_name) VALUES ?', [dataimages], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 8:
              requestimages = _context20.sent;
              _context20.next = 11;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_history SET req_ID=?,req_status_id=1,history_createdby=?', [requestID, email], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 11:
              requesthistory = _context20.sent;
              _context20.next = 14;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query('INSERT INTO request_bd_product(req_ID, product_name, product_location_id, product_des) VALUES ?', [dataproducts], function (err, results, field) {
                  resolve(results);
                });
              }));

            case 14:
              requestproduct = _context20.sent;
              res.redirect("/requeststd");

            case 16:
            case "end":
              return _context20.stop();
          }
        }
      });
    };

    var requestID = "BD" + Date.now();
    var dataimages = [],
        dataproducts = [];
    req.files.forEach(function (element) {
      dataimages.push([requestID, element.filename]);
    });

    if (Array.isArray(req.body.productname)) {
      for (var x = 0; x < req.body.productname.length; x++) {
        dataproducts.push([requestID, req.body.productname[x], req.body.position[x], req.body.des[x]]);
      }
    } else {
      dataproducts.push([requestID, req.body.productname, req.body.position, req.body.des]);
    }

    var connection = mysql.createConnection(db_config);
    requesttodatabase().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
app.post("/OTPforrequest", function (req, res) {
  var x = generateOTP();
  var email = req.body.email;
  var subject = "รหัสยืนยันการแจ้งซ่อมสำหรับนิสิต";
  var html = "รหัสยืนยัน : " + x;
  sendmail(email, subject, html);
  res.send(x);
});
app.post("/OTPforsignup", function (req, res) {
  if (req.body.fromweb, req.body.email) {
    var x = generateOTP();
    var email = req.body.email;
    var subject = "รหัสยืนยันสำหรับลงทะเบียน";
    var html = "รหัสยืนยัน : " + x;
    sendmail(email, subject, html);
    res.send(x);
  } else {
    res.status(404);
  }
});
app.post("/testOTP", function (req, res) {});
app.post("/seachuser", function (req, res) {
  var search = req.body.searchuser;

  if (search, req.body.fromweb) {
    var connection = mysql.createConnection(db_config);
    connection.query('SELECT user_id FROM member where user_id = ? OR user_email = ?', [search, search], function (err, results, field) {
      if (results.length > 0) {
        res.send(true);
      } else {
        res.send(false);
      }

      connection.end();
    });
  } else {
    res.status(404);
  }
});
app.post("/searchsignup", function (req, res) {
  var search = req.body.searchuser;

  if (search, req.body.fromweb) {
    var connection = mysql.createConnection(db_config);
    connection.query("select us.user_id, us.user_firstname, us.user_lastname, us.user_typeID, us.user_departmentID, d.user_departmentDES, ut.user_typeTITLE from usertype ut, userdatasignup us, department d where us.user_id = ? and user_id NOT IN (select user_id from member) and  us.user_typeID = ut.user_typeID and us.user_departmentID = d.user_departmentID", [search], function (err, results, field) {
      if (results.length > 0) {
        res.send(results[0]);
      } else {
        var warning = "ไม่พบสิทธิการเข้าใช้งานของคุณ";
        res.send(warning);
      }

      connection.end();
    });
  } else {
    res.status(404);
  }
});
app.post("/signupsuccess", function (req, res) {
  if (req.body.signupdata, req.body.fromweb) {
    var signupdata = req.body.signupdata;
    var connection = mysql.createConnection(db_config);
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(signupdata.password, salt, function (err, hash) {
        var sql = "INSERT INTO member SET user_id = ?, user_firstname = ?, user_lastname = ?, user_typeID = ?, user_departmentID = ?, user_email = ?, user_password = ?, user_phone = ?, user_created = now(), user_status = 1, user_modified = now()";
        connection.query(sql, [signupdata.user_id, signupdata.user_firstname, signupdata.user_lastname, signupdata.user_typeID, signupdata.user_departmentID, signupdata.email, hash, signupdata.phone], function (err, results, field) {
          if (err) {
            res.send(false);
            console.log("signup failed");
          } else {
            console.log("signup success");
            res.send(true);
          }

          connection.end();
        });
      });
    });
  } else {
    res.status(404);
  }
});
app.post("/seachmailtosendOTP", function (req, res) {
  var search = req.body.searchuser;

  if (search, req.body.fromweb) {
    var connection = mysql.createConnection(db_config);
    connection.query('SELECT user_email FROM member where user_id = ? OR user_email = ?', [search, search], function (err, results, field) {
      if (err) {
        res.send("wrong formatted");
      } else if (results.length > 0) {
        var x = generateOTP();
        var email = results[0].user_email;
        var subject = "รหัสยืนยันสำหรับเปลี่ยนรหัสผ่าน";
        var html = "รหัสยืนยัน : " + x;
        sendmail(email, subject, html);
        res.send(x);
      } else {
        res.send("ไม่พบอีเมลที่จะส่งรหัสยืนยัน กรุณาติดต่อเจ้าหน้าที่");
      }

      connection.end();
    });
  } else {
    res.status(404);
  }
});
app.post("/changepassword", function (req, res) {
  var user = req.body.user;

  if (user, req.body.fromweb && req.body.password) {
    var changepassword = function changepassword() {
      var newpassword, updateuserpass;
      return regeneratorRuntime.async(function changepassword$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              _context21.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                bcrypt.genSalt(10, function (err, salt) {
                  bcrypt.hash(req.body.password, salt, function (err, hash) {
                    // Store hash in your password DB.
                    resolve(hash);
                  });
                });
              }));

            case 2:
              newpassword = _context21.sent;
              _context21.next = 5;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query("UPDATE member SET user_password = ? where user_id = ? OR user_email = ?", [newpassword, user, user], function (err, results, field) {
                  if (err) {
                    resolve("success");
                  } else if (results.affectedRows == 1) {
                    resolve("success");
                  } else {
                    resolve("success");
                  }
                });
              }));

            case 5:
              updateuserpass = _context21.sent;
              res.send(true);

            case 7:
            case "end":
              return _context21.stop();
          }
        }
      });
    };

    var connection = mysql.createConnection(db_config);
    changepassword().then(function () {
      connection.end();
    });
  } else {
    res.status(404);
  }
});
app.get("/policy", function (req, res) {
  res.render("policy");
});
app.get("/recoverlogin", function (req, res) {
  res.render("recoverlogin");
});
app.get("/signup", function (req, res) {
  res.render("signup");
});
app.get("/checktimezone", function (req, res) {
  var connection = mysql.createConnection(db_config);
  connection.query("select now()", function (err, results, field) {
    if (results) {
      res.send(results, " ", new Date());
    } else {
      res.send(new Date());
    }

    connection.end();
  });
});

function convertTZ(date, tzString) {
  return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
    timeZone: tzString
  }));
}

function timeforreqlist(reqcreated) {
  var current_datetime = new Date();
  var formatted_date = "";

  if (reqcreated.getDate() == current_datetime.getDate() && reqcreated.getMonth() == current_datetime.getMonth() && reqcreated.getFullYear() == current_datetime.getFullYear()) {
    var min = "";

    if (reqcreated.getMinutes() < 10) {
      min = "0" + reqcreated.getMinutes();
    } else {
      min = reqcreated.getMinutes();
    }

    if (reqcreated.getHours() > 12) {
      formatted_date = reqcreated.getHours() - 12 + ":" + min + " PM";
    } else {
      formatted_date = reqcreated.getHours() + ":" + min + " AM";
    }
  } else {
    formatted_date = reqcreated.getDate() + "/" + (reqcreated.getMonth() + 1) + "/" + reqcreated.getFullYear();
  }

  return formatted_date;
}

function generateOTP() {
  // Declare a digits variable  
  // which stores all digits 
  var digits = '0123456789';
  var OTP = '';

  for (var i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }

  return OTP;
}

function sendmail(toemail, subject, html) {
  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    service: 'gmail',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: 'ffs.fgdz@gmail.com',
      // generated ethereal user
      pass: 'oneofakind0628184303' // generated ethereal password

    }
  }); // send mail with defined transport object

  var mailOptions = {
    from: '"ศูนย์แจ้งซ่อมวิทยาลัยนวัตกรรมสื่อสารสังคม มศว" <ffs.fgdz@gmail.com>',
    // sender address
    to: toemail,
    // list of receivers
    subject: subject,
    // Subject line
    html: html,
    // html body
    dsn: {
      id: '61130010186',
      "return": 'headers',
      notify: 'success',
      recipient: 'ffs.fgdz@gmail.com'
    }
  }; // send mail with defined transport object

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    } else {
      // if(console.log(info))
      console.log("send email successful");
    }
  });
  transporter.verify(function (error) {
    if (error) {}
  });
}

app.get("*", function (req, res) {
  res.send("page not found.");
  res.end();
});
app.listen(port, function () {
  var connection = mysql.createConnection(db_config);
  connection.query("SET time_zone = '+07:00'", function (err, results, field) {
    connection.end();
  });
  console.log("Server Connected!!");
});