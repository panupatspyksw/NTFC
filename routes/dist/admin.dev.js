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
    route = _require5.route,
    all = _require5.all;

var _require6 = require('repl'),
    start = _require6.start;

var _require7 = require('assert'),
    _throws = _require7["throws"];

var e = require('express'); // var db_config = {
// 	host     : 'mysql-repaironlineservice-13336.nodechef.com',
// 	user     : 'ncuser_11731',
// 	password : 'ugMBcMnhJYLmEXyirVc0IhIxp55xMs',
// 	database : 'repaironlineservice',
// 	connectionLimit: 100,
// 	port: '2397'
// };


var db_config = {
  host: '34.101.180.99',
  user: 'root',
  password: '',
  database: 'notification',
  connectionLimit: 100
}; // setup router

router.use(express["static"]("public"));
router.use(express["static"]("img"));
router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(bodyParser.json());
router.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
})); //Middle ware that is specific to this router

router.use(function timeLog(req, res, next) {
  next();
});
router.get("/members", function (req, res) {
  if (req.session.user_usertype == "4") {
    getcountoflists(req, res).then(function (value) {
      countstatus = value;
      res.render("members", {
        countstatus: countstatus,
        user_id: req.session.userID,
        logined: req.session.loggedin,
        user_usertype: req.session.user_usertype,
        user_firstname: req.session.user_firstname,
        profileimg: req.session.profileimage
      });
    });
  } else {
    res.redirect("/");
  }
});
router.post("/dashboard/employee", function (req, res) {
  console.log("generate app");
  var message = false;
  var countstatus = [];

  if (req.body.check && req.session.loggedin && req.body.employeeID && (req.session.user_usertype == "3" || req.session.user_usertype == "4")) {
    var requesttodatabase = function requesttodatabase() {
      var requestemployeeworkinfo, tablecontent, all1, all2, all3, detailreqlist;
      return regeneratorRuntime.async(function requesttodatabase$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select CONCAT(m.user_firstname,' ',m.user_lastname) AS 'name',m.profileimg , r.req_getby, rs.req_status_title, r.req_ID, r.req_status_id, sum(rh.timeused) AS 'timeused', (select count(req_ID) from request where req_status_id = r.req_status_id and (req_getby = '" + employeeID + "' OR req_repairby = '" + employeeID + "')) AS amount from member m, request_status rs, request r, request_history rh where (r.req_getby = '" + employeeID + "' OR r.req_repairby = '" + employeeID + "') and m.user_id = '" + employeeID + "' and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_status_id = rs.req_status_id and r.req_ID = rh.req_ID and rh.history_createdby = '" + employeeID + "' group by r.req_getby, CAST(r.req_status_id AS UNSIGNED)";
                connection.query(sql, function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      name = results[0].name;
                      var location = [];
                      var personnames = [];
                      var data = [];

                      for (var i = 0; i < results.length; i++) {
                        if (personnames.indexOf(results[i].name) == -1) {
                          personnames.push(results[i].name);
                        }
                      }

                      var employees = [];

                      for (var x = 0; x < personnames.length; x++) {
                        var employee = [];
                        var profile = "";
                        var timeused = 0;
                        var amount = 0;
                        var lists = [];

                        for (var z = 0; z < results.length; z++) {
                          if (results[z].name == personnames[x]) {
                            if (profile == "") {
                              profile = results[z].profileimg;
                            }

                            timeused += results[z].timeused;
                            amount += results[z].amount;
                            lists.push([results[z].req_status_title, results[z].amount]);
                          }
                        }

                        var time = minuteconvert(timeused);
                        employees.push({
                          "name": personnames[x],
                          "profileimage": profile,
                          "timeused": time,
                          "receiveamount": amount,
                          "listsbystatus": lists
                        });
                      }

                      resolve(employees);
                    } else {
                      resolve(0);
                    }
                  } else if (err) {
                    console.log(err);
                  }
                });
              }));

            case 2:
              requestemployeeworkinfo = _context.sent;

              if (requestemployeeworkinfo == 0) {
                message = "ไม่พบรายการที่เจ้าหน้าที่คนนี้ดำเนินการ";
              }

              tablecontent = ["ข้อมูลเบื้องต้นของรายการ", "ข้อมูลการดำเนินการของรายการแจ้งซ่อม", "ข้อมูลรายการที่แจ้งซ่อมของรายการแจ้งซ่อม"];
              all1 = [];
              all2 = [];
              all3 = [];
              _context.next = 10;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select r.req_ID,r.req_des,r.req_title,CONCAT(r.req_created,' ถึง ',r.req_end) AS 'timerange', IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where r.req_createdby = user_id), r.req_createdby) AS 'req_created',IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where r.req_repairby = user_id), 'ไม่ได้แจ้งพัสดุ') AS 'req_repairby',IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where r.req_getby = user_id),'รอเจ้าหน้าที่รับเรื่อง') AS 'req_getby', rs.req_status_title from request r, request_status rs where (r.req_getby = '" + employeeID + "' OR r.req_repairby = '" + employeeID + "') and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_status_id = rs.req_status_id order by CAST(r.req_status_id AS UNSIGNED), r.req_ID";
                connection.query(sql, function (err, results, field) {
                  if (err) throw err;else if (results.length > 0) {
                    all1 = results;
                    var sql = "select rh.req_ID, rs.req_status_title, IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where rh.history_createdby = user_id), rh.history_createdby) AS 'createdby',rh.history_created ,rh.timeused from request r, request_status rs, request_history rh where (r.req_getby = '" + employeeID + "' OR r.req_repairby = '" + employeeID + "') and r.req_ID = rh.req_ID and rh.req_status_id = rs.req_status_id and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') order by r.req_status_id ,r.req_ID, rh.history_created";
                    connection.query(sql, function (err, results, field) {
                      if (err) throw err;else if (results.length > 0) {
                        all2 = results;
                        var sql = "select rp.req_ID,rp.product_ID as product_ID,rp.product_name,rp.product_location_id,rp.product_des from request_it_product rp,request r where (r.req_getby = '" + employeeID + "' OR r.req_repairby = '" + employeeID + "') and r.req_ID = rp.req_ID and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') union all select rp.req_ID,null as product_ID,rp.product_name,rp.product_location_id,rp.product_des from request_md_product rp,request r where (r.req_getby = '" + employeeID + "' OR r.req_repairby = '" + employeeID + "') and r.req_ID = rp.req_ID and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') union all select rp.req_ID,null as product_ID,rp.product_name,rp.product_location_id,rp.product_des from request_bd_product rp,request r where (r.req_getby = '" + employeeID + "' OR r.req_repairby = '" + employeeID + "') and r.req_ID = rp.req_ID and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59')";
                        connection.query(sql, function (err, results, field) {
                          if (err) {
                            console.log(err);
                          } else if (results.length > 0) {
                            all3 = results;
                            var listsdetail = [];

                            for (var ll = 0; ll < all1.length; ll++) {
                              var onelist = [];
                              var content1 = {
                                "title": tablecontent[0],
                                "data": []
                              };
                              var content2 = {
                                "title": tablecontent[1],
                                "data": [["สถานะ", "วันที่บันทึก", "ผู้บันทึก", "เวลาที่ใช้"]]
                              };

                              if (String(all1[ll].req_ID).match(/IT/g)) {
                                var content3 = {
                                  "title": tablecontent[2],
                                  "data": [["รหัสเครื่อง", "ชื่ออุปกรณ์", "ที่ตั้ง", "หมายเหตุ"]]
                                };
                              } else if (String(all1[ll].req_ID).match(/MD/g)) {
                                var content3 = {
                                  "title": tablecontent[2],
                                  "data": [["ชื่ออุปกรณ์", "ที่ตั้ง", "หมายเหตุ"]]
                                };
                              } else {
                                var content3 = {
                                  "title": tablecontent[2],
                                  "data": [["ชื่อรายการ", "ที่ตั้ง", "หมายเหตุ"]]
                                };
                              }

                              var reqID = ["หมายเลขการแจ้ง", all1[ll].req_ID];
                              var problem = ["ปัญหา", all1[ll].req_title];
                              var des = ["หมายเหตุ", all1[ll].req_des];
                              var timerange = ["ช่วงเวลาที่ดำเนินการ", all1[ll].timerange];
                              var status = ["สถานะรายการแจ้งซ่อม", all1[ll].req_status_title];
                              var timeusedall = ["เวลาที่ใช้ในการดำเนินการ"];
                              var requester = ["ผู้แจ้ง", all1[ll].req_created];
                              var receiver = ["เจ้าหน้าที่ผู้รับเรื่อง", all1[ll].req_getby];
                              var receivertimeused = ["ระยะเวลาที่เจ้าหน้าที่ใช้", ""];
                              var repairer = ["เจ้าหน้าที่พัสดุที่รับเรื่องซ่อม", all1[ll].req_repairby];
                              var repairertimeused = ["ระยะเวลาที่เจ้าหน้าที่ใช้", ""];
                              var timereceiveruse = 0;
                              var timerepaireruse = 0;

                              for (var tl = 0; tl < all2.length; tl++) {
                                if (all2[tl].req_ID == reqID[1]) {
                                  if (all2[tl].createdby == receiver[1]) {
                                    timereceiveruse += all2[tl].timeused;
                                  } else if (all2[tl].createdby == repairer[1]) {
                                    timerepaireruse += all2[tl].timeused;
                                  }

                                  var history_created = all2[tl].history_created.getFullYear() + "-" + (all2[tl].history_created.getMonth() + 1) + "-" + all2[tl].history_created.getDate() + " " + all2[tl].history_created.getHours() + ":" + all2[tl].history_created.getMinutes() + ":" + all2[tl].history_created.getSeconds();
                                  content2.data.push([all2[tl].req_status_title, history_created, all2[tl].createdby, minuteconvert(all2[tl].timeused)]);
                                }
                              }

                              receivertimeused[1] = minuteconvert(timereceiveruse);
                              repairertimeused[1] = minuteconvert(timerepaireruse);
                              timeusedall.push(minuteconvert(timereceiveruse + timerepaireruse));

                              for (var pl = 0; pl < all3.length; pl++) {
                                if (all3[pl].req_ID == reqID[1]) {
                                  if (String(all1[ll].req_ID).match(/IT/g)) {
                                    content3.data.push([all3[pl].product_ID, all3[pl].product_name, all3[pl].product_location_id, all3[pl].product_des]);
                                  } else {
                                    content3.data.push([all3[pl].product_name, all3[pl].product_location_id, all3[pl].product_des]);
                                  }
                                }
                              }

                              if (receiver[1] == "รอเจ้าหน้าที่รับเรื่อง" && repairer[1] == "ไม่ได้แจ้งพัสดุ") {
                                content1.data.push(reqID, problem, des, timerange, status, timeusedall);
                              } else if (receiver[1] != "รอเจ้าหน้าที่รับเรื่อง" && repairer[1] == "ไม่ได้แจ้งพัสดุ") {
                                content1.data.push(reqID, problem, des, timerange, status, timeusedall, receiver, receivertimeused);
                              } else if (receiver[1] != "รอเจ้าหน้าที่รับเรื่อง" && repairer[1] != "ไม่ได้แจ้งพัสดุ") {
                                content1.data.push(reqID, problem, des, timerange, status, timeusedall, receiver, receivertimeused, repairer, repairertimeused);
                              }

                              onelist.push(content1, content2, content3);
                              listsdetail.push(onelist);
                            }

                            resolve(listsdetail);
                          } else {
                            resolve(0);
                          }
                        });
                      }
                    });
                  } else {
                    resolve(0);
                  }
                });
              }));

            case 10:
              detailreqlist = _context.sent;
              getcountoflists(req, res).then(function (value) {
                countstatus = value;
                res.render("dashboardemp", {
                  name: name,
                  start: startdate,
                  end: enddate,
                  message: message,
                  countstatus: countstatus,
                  user_id: req.session.userID,
                  logined: req.session.loggedin,
                  user_usertype: req.session.user_usertype,
                  user_firstname: req.session.user_firstname,
                  profileimg: req.session.profileimage,
                  chart: chart,
                  employeedata: requestemployeeworkinfo,
                  listsdetail: detailreqlist
                });
              });

            case 12:
            case "end":
              return _context.stop();
          }
        }
      });
    };

    var startdate = req.body.start;
    var enddate = req.body.end;
    var employeeID = req.body.employeeID;
    var chart = ["asd", "asdasdasd"];
    var work = [];
    var name = "";
    var connection = mysql.createConnection(db_config);
    requesttodatabase().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
router.get("/dashboard/IT", function (req, res) {
  var countstatus = [];

  if (req.session.loggedin && (req.session.user_usertype == "3" && req.session.user_departmentID == "1" || req.session.user_usertype == "4")) {
    var connection = mysql.createConnection(db_config);
    var listemployee;
    var sql = "select user_firstname,user_lastname,user_id from member where user_departmentID = '1' and user_typeID = '2'";
    connection.query(sql, function (err, results, field) {
      if (err) {} else if (results.length > 0) {
        listemployee = results;
      } else {
        listemployee = [];
      }

      getcountoflists(req, res).then(function (value) {
        countstatus = value;
        res.render("dashboard", {
          title: "ไอที",
          listemployee: listemployee,
          countstatus: countstatus,
          user_id: req.session.userID,
          logined: req.session.loggedin,
          user_usertype: req.session.user_usertype,
          user_firstname: req.session.user_firstname,
          profileimg: req.session.profileimage
        });
      });
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
router.post("/dashboard/IT", function (req, res) {
  var message = false;
  var countstatus = [];

  if (req.body.check && req.session.loggedin && (req.session.user_usertype == "3" && req.session.user_departmentID == "1" || req.session.user_usertype == "4")) {
    var requesttodatabase = function requesttodatabase() {
      var requestamountbystatus, requestitembyroom, requestemployeeworkinfo, tablecontent, all1, all2, all3, detailreqlist;
      return regeneratorRuntime.async(function requesttodatabase$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select rs.req_status_title,COUNT(*) as 'amount' from request r, request_status rs where r.req_type_id = '1' AND r.req_status_id = rs.req_status_id  AND (req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') group by r.req_status_id order by CAST(r.req_status_id AS UNSIGNED)";
                connection.query(sql, function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      var chartamountbystatus = [['สถานะ', 'จำนวนรายการ']];
                      var amountrequest = 0;

                      for (var i = 0; i < results.length; i++) {
                        var arr = [];
                        arr.push(results[i].req_status_title);
                        arr.push(results[i].amount);
                        amountrequest += results[i].amount;
                        chartamountbystatus.push(arr);
                      }

                      resolve([chartamountbystatus, amountrequest]);
                    } else {
                      resolve(0);
                    }
                  }

                  if (err) {}
                });
              }));

            case 2:
              requestamountbystatus = _context2.sent;

              if (requestamountbystatus == 0) {
                message = "ไม่มีการแจ้งซ่อมในช่วงเวลาที่กำหนด";
              } else {
                chart.push({
                  "title": "จำนวนรายการแจ้งซ่อมแบ่งตามสถานะการดำเนินการ (ทั้งหมด " + requestamountbystatus[1] + " รายการ)",
                  "data": requestamountbystatus[0]
                });
              }

              _context2.next = 6;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select rh.product_name,rh.product_location_id,count(rh.product_name) as 'amount' from request_it_product rh, request r where r.req_ID = rh.req_ID and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_type_id = '1' group by rh.product_name , rh.product_location_id order by rh.product_name, rh.product_location_id";
                connection.query(sql, function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      var location = [];
                      var product = [];
                      var data = [];

                      for (var i = 0; i < results.length; i++) {
                        if (location.indexOf(results[i].product_location_id) == -1) {
                          location.push(results[i].product_location_id);
                        }

                        if (product.indexOf(results[i].product_name) == -1) {
                          product.push(results[i].product_name);
                        }
                      }

                      for (var i = 0; i < product.length; i++) {
                        var dataforloop = [product[i]];
                        var sumforloop = 0;

                        for (var y = 0; y < location.length; y++) {
                          for (var x = 0; x < results.length; x++) {
                            if (results[x].product_name == product[i] && results[x].product_location_id == location[y]) {
                              dataforloop.push(results[x].amount);
                              sumforloop += results[x].amount;
                            } // else if(results[x].product_name == product[i] && results[x].product_location_id != location[y]){
                            // 	dataforloop.push(0)
                            // }

                          }

                          if (!dataforloop[y + 1]) {
                            dataforloop.push(0);
                          }
                        }

                        var text = sumforloop;
                        dataforloop.push(text);
                        data.push(dataforloop);
                      }

                      data = data.sort(function (a, b) {
                        return b[data[0].length - 1] - a[data[0].length - 1];
                      });

                      for (var z = 0; z < data.length; z++) {
                        data[z][data[0].length - 1] = data[z][data[0].length - 1] + " รายการ";
                      }

                      location.unshift("");
                      location.push({
                        role: 'annotation'
                      });
                      data.unshift(location);
                      resolve(data);
                    } else {
                      resolve(0);
                    }
                  }

                  if (err) {}
                });
              }));

            case 6:
              requestitembyroom = _context2.sent;

              if (requestitembyroom == 0) {
                message = "ไม่มีการแจ้งซ่อมในช่วงเวลาที่กำหนด";
              } else {
                chart.push({
                  "title": "อันดับรายการที่ได้รับการแจ้งซ่อมแบ่งตามระดับชั้นหรือห้องจากมากไปน้อย",
                  "data": requestitembyroom
                });
              }

              _context2.next = 10;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select CONCAT(m.user_firstname,' ',m.user_lastname) AS 'name',m.profileimg , r.req_getby, rs.req_status_title, r.req_ID, r.req_status_id, sum(rh.timeused) AS 'timeused', (select count(req_ID) from request where req_status_id = r.req_status_id and req_getby = r.req_getby) AS amount from member m, request_status rs, request r, request_history rh where r.req_type_id = '1' and m.user_id = r.req_getby and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_status_id = rs.req_status_id and r.req_ID = rh.req_ID and rh.history_createdby = r.req_getby group by r.req_getby, r.req_status_id";
                connection.query(sql, function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      var location = [];
                      var personnames = [];
                      var data = [];

                      for (var i = 0; i < results.length; i++) {
                        if (personnames.indexOf(results[i].name) == -1) {
                          personnames.push(results[i].name);
                        }
                      }

                      var employees = [];

                      for (var x = 0; x < personnames.length; x++) {
                        var employee = [];
                        var profile = "";
                        var timeused = 0;
                        var amount = 0;
                        var lists = [];

                        for (var z = 0; z < results.length; z++) {
                          if (results[z].name == personnames[x]) {
                            if (profile == "") {
                              profile = results[z].profileimg;
                            }

                            timeused += results[z].timeused;
                            amount += results[z].amount;
                            lists.push([results[z].req_status_title, results[z].amount]);
                          }
                        }

                        var time = minuteconvert(timeused);
                        employees.push({
                          "name": personnames[x],
                          "profileimage": profile,
                          "timeused": time,
                          "receiveamount": amount,
                          "listsbystatus": lists
                        });
                      }

                      resolve(employees);
                    } else {
                      resolve(0);
                    }
                  }

                  if (err) {}
                });
              }));

            case 10:
              requestemployeeworkinfo = _context2.sent;
              tablecontent = ["ข้อมูลเบื้องต้นของรายการ", "ข้อมูลการดำเนินการของรายการแจ้งซ่อม", "ข้อมูลรายการที่แจ้งซ่อมของรายการแจ้งซ่อม"];
              all1 = [];
              all2 = [];
              all3 = [];
              _context2.next = 17;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select r.req_ID,r.req_des,r.req_title,CONCAT(r.req_created,' ถึง ',r.req_end) AS 'timerange', IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where r.req_createdby = user_id), r.req_createdby) AS 'req_created',IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where r.req_repairby = user_id), 'ไม่ได้แจ้งพัสดุ') AS 'req_repairby',IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where r.req_getby = user_id),'รอเจ้าหน้าที่รับเรื่อง') AS 'req_getby', rs.req_status_title from request r, request_status rs where r.req_type_id = '1' and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_status_id = rs.req_status_id order by r.req_status_id, r.req_ID";
                connection.query(sql, function (err, results, field) {
                  if (err) throw err;else if (results.length > 0) {
                    all1 = results;
                    var sql = "select rh.req_ID, rs.req_status_title, IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where rh.history_createdby = user_id), rh.history_createdby) AS 'createdby',rh.history_created ,rh.timeused from request r, request_status rs, request_history rh where r.req_type_id = '1' and r.req_ID = rh.req_ID and rh.req_status_id = rs.req_status_id and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') order by r.req_status_id ,r.req_ID, rh.history_created";
                    connection.query(sql, function (err, results, field) {
                      if (err) throw err;else if (results.length > 0) {
                        all2 = results;
                        var sql = "select rp.req_ID,rp.product_ID,rp.product_name,rp.product_location_id,rp.product_des from request_it_product rp,request r where r.req_ID = rp.req_ID and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') order by r.req_status_id, r.req_ID";
                        connection.query(sql, function (err, results, field) {
                          if (err) throw err;else if (results.length > 0) {
                            all3 = results;
                            var listsdetail = [];

                            for (var ll = 0; ll < all1.length; ll++) {
                              var onelist = [];
                              var content1 = {
                                "title": tablecontent[0],
                                "data": []
                              };
                              var content2 = {
                                "title": tablecontent[1],
                                "data": [["สถานะ", "วันที่บันทึก", "ผู้บันทึก", "เวลาที่ใช้"]]
                              };
                              var content3 = {
                                "title": tablecontent[2],
                                "data": [["รหัสเครื่อง", "ชื่ออุปกรณ์", "ที่ตั้ง", "หมายเหตุ"]]
                              };
                              var reqID = ["หมายเลขการแจ้ง", all1[ll].req_ID];
                              var problem = ["ปัญหา", all1[ll].req_title];
                              var des = ["หมายเหตุ", all1[ll].req_des];
                              var timerange = ["ช่วงเวลาที่ดำเนินการ", all1[ll].timerange];
                              var status = ["สถานะรายการแจ้งซ่อม", all1[ll].req_status_title];
                              var timeusedall = ["เวลาที่ใช้ในการดำเนินการ"];
                              var requester = ["ผู้แจ้ง", all1[ll].req_created];
                              var receiver = ["เจ้าหน้าที่ผู้รับเรื่อง", all1[ll].req_getby];
                              var receivertimeused = ["ระยะเวลาที่เจ้าหน้าที่ใช้", ""];
                              var repairer = ["เจ้าหน้าที่พัสดุที่รับเรื่องซ่อม", all1[ll].req_repairby];
                              var repairertimeused = ["ระยะเวลาที่เจ้าหน้าที่ใช้", ""];
                              var timereceiveruse = 0;
                              var timerepaireruse = 0;

                              for (var tl = 0; tl < all2.length; tl++) {
                                if (all2[tl].req_ID == reqID[1]) {
                                  if (all2[tl].createdby == receiver[1]) {
                                    timereceiveruse += all2[tl].timeused;
                                  } else if (all2[tl].createdby == repairer[1]) {
                                    timerepaireruse += all2[tl].timeused;
                                  }

                                  var history_created = all2[tl].history_created.getFullYear() + "-" + (all2[tl].history_created.getMonth() + 1) + "-" + all2[tl].history_created.getDate() + " " + all2[tl].history_created.getHours() + ":" + all2[tl].history_created.getMinutes() + ":" + all2[tl].history_created.getSeconds();
                                  content2.data.push([all2[tl].req_status_title, history_created, all2[tl].createdby, minuteconvert(all2[tl].timeused)]);
                                }
                              }

                              receivertimeused[1] = minuteconvert(timereceiveruse);
                              repairertimeused[1] = minuteconvert(timerepaireruse);
                              timeusedall.push(minuteconvert(timereceiveruse + timerepaireruse));

                              for (var pl = 0; pl < all3.length; pl++) {
                                if (all3[pl].req_ID == reqID[1]) {
                                  content3.data.push([all3[pl].product_ID, all3[pl].product_name, all3[pl].product_location_id, all3[pl].product_des]);
                                }
                              }

                              if (receiver[1] == "รอเจ้าหน้าที่รับเรื่อง" && repairer[1] == "ไม่ได้แจ้งพัสดุ") {
                                content1.data.push(reqID, problem, des, timerange, status, timeusedall);
                              } else if (receiver[1] != "รอเจ้าหน้าที่รับเรื่อง" && repairer[1] == "ไม่ได้แจ้งพัสดุ") {
                                content1.data.push(reqID, problem, des, timerange, status, timeusedall, receiver, receivertimeused);
                              } else if (receiver[1] != "รอเจ้าหน้าที่รับเรื่อง" && repairer[1] != "ไม่ได้แจ้งพัสดุ") {
                                content1.data.push(reqID, problem, des, timerange, status, timeusedall, receiver, receivertimeused, repairer, repairertimeused);
                              }

                              onelist.push(content1, content2, content3);
                              listsdetail.push(onelist);
                            }

                            resolve(listsdetail);
                          } else {
                            resolve(0);
                          }
                        });
                      }
                    });
                  } else {
                    resolve(0);
                  }
                });
              }));

            case 17:
              detailreqlist = _context2.sent;
              getcountoflists(req, res).then(function (value) {
                countstatus = value;
                res.render("dashboardshow", {
                  title: "ไอที",
                  start: startdate,
                  end: enddate,
                  message: message,
                  countstatus: countstatus,
                  user_id: req.session.userID,
                  logined: req.session.loggedin,
                  user_usertype: req.session.user_usertype,
                  user_firstname: req.session.user_firstname,
                  profileimg: req.session.profileimage,
                  chart: chart,
                  employeedata: requestemployeeworkinfo,
                  listsdetail: detailreqlist
                });
              });

            case 19:
            case "end":
              return _context2.stop();
          }
        }
      });
    };

    var startdate = req.body.start;
    var enddate = req.body.end;
    var chart = [];
    var work = [];
    var connection = mysql.createConnection(db_config);
    requesttodatabase().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
router.get("/dashboard/MD", function (req, res) {
  var countstatus = [];

  if (req.session.loggedin && (req.session.user_usertype == "3" && req.session.user_departmentID == "2" || req.session.user_usertype == "4")) {
    var connection = mysql.createConnection(db_config);
    var listemployee;
    var sql = "select user_firstname,user_lastname,user_id from member where user_departmentID = '2' and user_typeID = '2'";
    connection.query(sql, function (err, results, field) {
      if (err) {} else if (results.length > 0) {
        listemployee = results;
      } else {
        listemployee = [];
      }

      getcountoflists(req, res).then(function (value) {
        countstatus = value;
        res.render("dashboard", {
          title: "สื่อ",
          listemployee: listemployee,
          countstatus: countstatus,
          user_id: req.session.userID,
          logined: req.session.loggedin,
          user_usertype: req.session.user_usertype,
          user_firstname: req.session.user_firstname,
          profileimg: req.session.profileimage
        });
      });
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
router.post("/dashboard/MD", function (req, res) {
  var message = false;
  var countstatus = [];

  if (req.body.check && req.session.loggedin && (req.session.user_usertype == "3" && req.session.user_departmentID == "2" || req.session.user_usertype == "4")) {
    var requesttodatabase = function requesttodatabase() {
      var requestamountbystatus, requestitembyroom, requestemployeeworkinfo, tablecontent, all1, all2, all3, detailreqlist;
      return regeneratorRuntime.async(function requesttodatabase$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select rs.req_status_title,COUNT(*) as 'amount' from request r, request_status rs where r.req_type_id = '2' AND r.req_status_id = rs.req_status_id  AND (req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') group by r.req_status_id order by CAST(r.req_status_id AS UNSIGNED)";
                connection.query(sql, function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      var chartamountbystatus = [['สถานะ', 'จำนวนรายการ']];
                      var amountrequest = 0;

                      for (var i = 0; i < results.length; i++) {
                        var arr = [];
                        arr.push(results[i].req_status_title);
                        arr.push(results[i].amount);
                        amountrequest += results[i].amount;
                        chartamountbystatus.push(arr);
                      }

                      resolve([chartamountbystatus, amountrequest]);
                    } else {
                      resolve(0);
                    }
                  }

                  if (err) {}
                });
              }));

            case 2:
              requestamountbystatus = _context3.sent;

              if (requestamountbystatus == 0) {
                message = "ไม่มีการแจ้งซ่อมในช่วงเวลาที่กำหนด";
              } else {
                chart.push({
                  "title": "จำนวนรายการแจ้งซ่อมแบ่งตามสถานะการดำเนินการ (ทั้งหมด " + requestamountbystatus[1] + " รายการ)",
                  "data": requestamountbystatus[0]
                });
              }

              _context3.next = 6;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select rh.product_name,rh.product_location_id,count(rh.product_name) as 'amount' from request_md_product rh, request r where r.req_ID = rh.req_ID and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_type_id = '2' group by rh.product_name , rh.product_location_id order by rh.product_name, rh.product_location_id";
                connection.query(sql, function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      var location = [];
                      var product = [];
                      var data = [];

                      for (var i = 0; i < results.length; i++) {
                        if (location.indexOf(results[i].product_location_id) == -1) {
                          location.push(results[i].product_location_id);
                        }

                        if (product.indexOf(results[i].product_name) == -1) {
                          product.push(results[i].product_name);
                        }
                      }

                      for (var i = 0; i < product.length; i++) {
                        var dataforloop = [product[i]];
                        var sumforloop = 0;

                        for (var y = 0; y < location.length; y++) {
                          for (var x = 0; x < results.length; x++) {
                            if (results[x].product_name == product[i] && results[x].product_location_id == location[y]) {
                              dataforloop.push(results[x].amount);
                              sumforloop += results[x].amount;
                            } // else if(results[x].product_name == product[i] && results[x].product_location_id != location[y]){
                            // 	dataforloop.push(0)
                            // }

                          }

                          if (!dataforloop[y + 1]) {
                            dataforloop.push(0);
                          }
                        }

                        var text = sumforloop;
                        dataforloop.push(text);
                        data.push(dataforloop);
                      }

                      data = data.sort(function (a, b) {
                        return b[data[0].length - 1] - a[data[0].length - 1];
                      });

                      for (var z = 0; z < data.length; z++) {
                        data[z][data[0].length - 1] = data[z][data[0].length - 1] + " รายการ";
                      }

                      location.unshift("");
                      location.push({
                        role: 'annotation'
                      });
                      data.unshift(location);
                      resolve(data);
                    } else {
                      resolve(0);
                    }
                  }

                  if (err) {}
                });
              }));

            case 6:
              requestitembyroom = _context3.sent;

              if (requestitembyroom == 0) {
                message = "ไม่มีการแจ้งซ่อมในช่วงเวลาที่กำหนด";
              } else {
                chart.push({
                  "title": "อันดับรายการที่ได้รับการแจ้งซ่อมแบ่งตามระดับชั้นหรือห้องจากมากไปน้อย",
                  "data": requestitembyroom
                });
              }

              _context3.next = 10;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select CONCAT(m.user_firstname,' ',m.user_lastname) AS 'name',m.profileimg , r.req_getby, rs.req_status_title, r.req_ID, r.req_status_id, sum(rh.timeused) AS 'timeused', (select count(req_ID) from request where req_status_id = r.req_status_id and req_getby = r.req_getby) AS amount from member m, request_status rs, request r, request_history rh where r.req_type_id = '2' and m.user_id = r.req_getby and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_status_id = rs.req_status_id and r.req_ID = rh.req_ID and rh.history_createdby = r.req_getby group by r.req_getby, r.req_status_id";
                connection.query(sql, function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      var location = [];
                      var personnames = [];
                      var data = [];

                      for (var i = 0; i < results.length; i++) {
                        if (personnames.indexOf(results[i].name) == -1) {
                          personnames.push(results[i].name);
                        }
                      }

                      var employees = [];

                      for (var x = 0; x < personnames.length; x++) {
                        var employee = [];
                        var profile = "";
                        var timeused = 0;
                        var amount = 0;
                        var lists = [];

                        for (var z = 0; z < results.length; z++) {
                          if (results[z].name == personnames[x]) {
                            if (profile == "") {
                              profile = results[z].profileimg;
                            }

                            timeused += results[z].timeused;
                            amount += results[z].amount;
                            lists.push([results[z].req_status_title, results[z].amount]);
                          }
                        }

                        var time = minuteconvert(timeused);
                        employees.push({
                          "name": personnames[x],
                          "profileimage": profile,
                          "timeused": time,
                          "receiveamount": amount,
                          "listsbystatus": lists
                        });
                      }

                      resolve(employees);
                    } else {
                      resolve(0);
                    }
                  }

                  if (err) {}
                });
              }));

            case 10:
              requestemployeeworkinfo = _context3.sent;
              tablecontent = ["ข้อมูลเบื้องต้นของรายการ", "ข้อมูลการดำเนินการของรายการแจ้งซ่อม", "ข้อมูลรายการที่แจ้งซ่อมของรายการแจ้งซ่อม"];
              all1 = [];
              all2 = [];
              all3 = [];
              _context3.next = 17;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select r.req_ID,r.req_des,r.req_title,CONCAT(r.req_created,' ถึง ',r.req_end) AS 'timerange', IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where r.req_createdby = user_id), r.req_createdby) AS 'req_created',IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where r.req_repairby = user_id), 'ไม่ได้แจ้งพัสดุ') AS 'req_repairby',IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where r.req_getby = user_id),'รอเจ้าหน้าที่รับเรื่อง') AS 'req_getby', rs.req_status_title from request r, request_status rs where r.req_type_id = '2' and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_status_id = rs.req_status_id order by r.req_status_id, r.req_ID";
                connection.query(sql, function (err, results, field) {
                  if (err) throw err;else if (results.length > 0) {
                    all1 = results;
                    var sql = "select rh.req_ID, rs.req_status_title, IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where rh.history_createdby = user_id), rh.history_createdby) AS 'createdby',rh.history_created ,rh.timeused from request r, request_status rs, request_history rh where r.req_type_id = '2' and r.req_ID = rh.req_ID and rh.req_status_id = rs.req_status_id and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') order by r.req_status_id ,r.req_ID, rh.history_created";
                    connection.query(sql, function (err, results, field) {
                      if (err) throw err;else if (results.length > 0) {
                        all2 = results;
                        var sql = "select rp.req_ID,rp.product_name,rp.product_location_id,rp.product_des from request_md_product rp,request r where r.req_ID = rp.req_ID and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') order by r.req_status_id, r.req_ID";
                        connection.query(sql, function (err, results, field) {
                          if (err) throw err;else if (results.length > 0) {
                            all3 = results;
                            var listsdetail = [];

                            for (var ll = 0; ll < all1.length; ll++) {
                              var onelist = [];
                              var content1 = {
                                "title": tablecontent[0],
                                "data": []
                              };
                              var content2 = {
                                "title": tablecontent[1],
                                "data": [["สถานะ", "วันที่บันทึก", "ผู้บันทึก", "เวลาที่ใช้"]]
                              };
                              var content3 = {
                                "title": tablecontent[2],
                                "data": [["ชื่ออุปกรณ์", "ที่ตั้ง", "หมายเหตุ"]]
                              };
                              var reqID = ["หมายเลขการแจ้ง", all1[ll].req_ID];
                              var problem = ["ปัญหา", all1[ll].req_title];
                              var des = ["หมายเหตุ", all1[ll].req_des];
                              var timerange = ["ช่วงเวลาที่ดำเนินการ", all1[ll].timerange];
                              var status = ["สถานะรายการแจ้งซ่อม", all1[ll].req_status_title];
                              var timeusedall = ["เวลาที่ใช้ในการดำเนินการ"];
                              var requester = ["ผู้แจ้ง", all1[ll].req_created];
                              var receiver = ["เจ้าหน้าที่ผู้รับเรื่อง", all1[ll].req_getby];
                              var receivertimeused = ["ระยะเวลาที่เจ้าหน้าที่ใช้", ""];
                              var repairer = ["เจ้าหน้าที่พัสดุที่รับเรื่องซ่อม", all1[ll].req_repairby];
                              var repairertimeused = ["ระยะเวลาที่เจ้าหน้าที่ใช้", ""];
                              var timereceiveruse = 0;
                              var timerepaireruse = 0;

                              for (var tl = 0; tl < all2.length; tl++) {
                                if (all2[tl].req_ID == reqID[1]) {
                                  if (all2[tl].createdby == receiver[1]) {
                                    timereceiveruse += all2[tl].timeused;
                                  } else if (all2[tl].createdby == repairer[1]) {
                                    timerepaireruse += all2[tl].timeused;
                                  }

                                  var history_created = all2[tl].history_created.getFullYear() + "-" + (all2[tl].history_created.getMonth() + 1) + "-" + all2[tl].history_created.getDate() + " " + all2[tl].history_created.getHours() + ":" + all2[tl].history_created.getMinutes() + ":" + all2[tl].history_created.getSeconds();
                                  content2.data.push([all2[tl].req_status_title, history_created, all2[tl].createdby, minuteconvert(all2[tl].timeused)]);
                                }
                              }

                              receivertimeused[1] = minuteconvert(timereceiveruse);
                              repairertimeused[1] = minuteconvert(timerepaireruse);
                              timeusedall.push(minuteconvert(timereceiveruse + timerepaireruse));

                              for (var pl = 0; pl < all3.length; pl++) {
                                if (all3[pl].req_ID == reqID[1]) {
                                  content3.data.push([all3[pl].product_name, all3[pl].product_location_id, all3[pl].product_des]);
                                }
                              }

                              if (receiver[1] == "รอเจ้าหน้าที่รับเรื่อง" && repairer[1] == "ไม่ได้แจ้งพัสดุ") {
                                content1.data.push(reqID, problem, des, timerange, status, timeusedall);
                              } else if (receiver[1] != "รอเจ้าหน้าที่รับเรื่อง" && repairer[1] == "ไม่ได้แจ้งพัสดุ") {
                                content1.data.push(reqID, problem, des, timerange, status, timeusedall, receiver, receivertimeused);
                              } else if (receiver[1] != "รอเจ้าหน้าที่รับเรื่อง" && repairer[1] != "ไม่ได้แจ้งพัสดุ") {
                                content1.data.push(reqID, problem, des, timerange, status, timeusedall, receiver, receivertimeused, repairer, repairertimeused);
                              }

                              onelist.push(content1, content2, content3);
                              listsdetail.push(onelist);
                            }

                            resolve(listsdetail);
                          } else {
                            resolve(0);
                          }
                        });
                      }
                    });
                  } else {
                    resolve(0);
                  }
                });
              }));

            case 17:
              detailreqlist = _context3.sent;
              getcountoflists(req, res).then(function (value) {
                countstatus = value;
                res.render("dashboardshow", {
                  title: "สื่อ",
                  start: startdate,
                  end: enddate,
                  message: message,
                  countstatus: countstatus,
                  user_id: req.session.userID,
                  logined: req.session.loggedin,
                  user_usertype: req.session.user_usertype,
                  user_firstname: req.session.user_firstname,
                  profileimg: req.session.profileimage,
                  chart: chart,
                  employeedata: requestemployeeworkinfo,
                  listsdetail: detailreqlist
                });
              });

            case 19:
            case "end":
              return _context3.stop();
          }
        }
      });
    };

    var startdate = req.body.start;
    var enddate = req.body.end;
    var chart = [];
    var work = [];
    var connection = mysql.createConnection(db_config);
    requesttodatabase().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
router.get("/dashboard/BD", function (req, res) {
  var countstatus = [];

  if (req.session.loggedin && (req.session.user_usertype == "3" && req.session.user_departmentID == "3" || req.session.user_usertype == "4")) {
    var connection = mysql.createConnection(db_config);
    var listemployee;
    var sql = "select user_firstname,user_lastname,user_id from member where user_departmentID = '3' and user_typeID = '2'";
    connection.query(sql, function (err, results, field) {
      if (err) {} else if (results.length > 0) {
        listemployee = results;
      } else {
        listemployee = [];
      }

      getcountoflists(req, res).then(function (value) {
        countstatus = value;
        res.render("dashboard", {
          title: "อาคาร",
          listemployee: listemployee,
          countstatus: countstatus,
          user_id: req.session.userID,
          logined: req.session.loggedin,
          user_usertype: req.session.user_usertype,
          user_firstname: req.session.user_firstname,
          profileimg: req.session.profileimage
        });
      });
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
router.post("/dashboard/BD", function (req, res) {
  var message = false;
  var countstatus = [];

  if (req.body.check && req.session.loggedin && (req.session.user_usertype == "3" && req.session.user_departmentID == "3" || req.session.user_usertype == "4")) {
    var requesttodatabase = function requesttodatabase() {
      var requestamountbystatus, requestitembyroom, requestemployeeworkinfo, tablecontent, all1, all2, all3, detailreqlist;
      return regeneratorRuntime.async(function requesttodatabase$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select rs.req_status_title,COUNT(*) as 'amount' from request r, request_status rs where r.req_type_id = '3' AND r.req_status_id = rs.req_status_id  AND (req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') group by r.req_status_id order by CAST(r.req_status_id AS UNSIGNED)";
                connection.query(sql, function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      var chartamountbystatus = [['สถานะ', 'จำนวนรายการ']];
                      var amountrequest = 0;

                      for (var i = 0; i < results.length; i++) {
                        var arr = [];
                        arr.push(results[i].req_status_title);
                        arr.push(results[i].amount);
                        amountrequest += results[i].amount;
                        chartamountbystatus.push(arr);
                      }

                      resolve([chartamountbystatus, amountrequest]);
                    } else {
                      resolve(0);
                    }
                  }

                  if (err) {}
                });
              }));

            case 2:
              requestamountbystatus = _context4.sent;

              if (requestamountbystatus == 0) {
                message = "ไม่มีการแจ้งซ่อมในช่วงเวลาที่กำหนด";
              } else {
                chart.push({
                  "title": "จำนวนรายการแจ้งซ่อมแบ่งตามสถานะการดำเนินการ (ทั้งหมด " + requestamountbystatus[1] + " รายการ)",
                  "data": requestamountbystatus[0]
                });
              }

              _context4.next = 6;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select rh.product_name,rh.product_location_id,count(rh.product_name) as 'amount' from request_bd_product rh, request r where r.req_ID = rh.req_ID and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_type_id = '3' group by rh.product_name , rh.product_location_id order by rh.product_name, rh.product_location_id";
                connection.query(sql, function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      var location = [];
                      var product = [];
                      var data = [];

                      for (var i = 0; i < results.length; i++) {
                        if (location.indexOf(results[i].product_location_id) == -1) {
                          location.push(results[i].product_location_id);
                        }

                        if (product.indexOf(results[i].product_name) == -1) {
                          product.push(results[i].product_name);
                        }
                      }

                      for (var i = 0; i < product.length; i++) {
                        var dataforloop = [product[i]];
                        var sumforloop = 0;

                        for (var y = 0; y < location.length; y++) {
                          for (var x = 0; x < results.length; x++) {
                            if (results[x].product_name == product[i] && results[x].product_location_id == location[y]) {
                              dataforloop.push(results[x].amount);
                              sumforloop += results[x].amount;
                            } // else if(results[x].product_name == product[i] && results[x].product_location_id != location[y]){
                            // 	dataforloop.push(0)
                            // }

                          }

                          if (!dataforloop[y + 1]) {
                            dataforloop.push(0);
                          }
                        }

                        var text = sumforloop;
                        dataforloop.push(text);
                        data.push(dataforloop);
                      }

                      data = data.sort(function (a, b) {
                        return b[data[0].length - 1] - a[data[0].length - 1];
                      });

                      for (var z = 0; z < data.length; z++) {
                        data[z][data[0].length - 1] = data[z][data[0].length - 1] + " รายการ";
                      }

                      location.unshift("");
                      location.push({
                        role: 'annotation'
                      });
                      data.unshift(location);
                      resolve(data);
                    } else {
                      resolve(0);
                    }
                  }

                  if (err) {}
                });
              }));

            case 6:
              requestitembyroom = _context4.sent;

              if (requestitembyroom == 0) {
                message = "ไม่มีการแจ้งซ่อมในช่วงเวลาที่กำหนด";
              } else {
                chart.push({
                  "title": "อันดับรายการที่ได้รับการแจ้งซ่อมแบ่งตามระดับชั้นหรือห้องจากมากไปน้อย",
                  "data": requestitembyroom
                });
              }

              _context4.next = 10;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select CONCAT(m.user_firstname,' ',m.user_lastname) AS 'name',m.profileimg , r.req_getby, rs.req_status_title, r.req_ID, r.req_status_id, sum(rh.timeused) AS 'timeused', (select count(req_ID) from request where req_status_id = r.req_status_id and req_getby = r.req_getby) AS amount from member m, request_status rs, request r, request_history rh where r.req_type_id = '3' and m.user_id = r.req_getby and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_status_id = rs.req_status_id and r.req_ID = rh.req_ID and rh.history_createdby = r.req_getby group by r.req_getby, r.req_status_id";
                connection.query(sql, function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      var location = [];
                      var personnames = [];
                      var data = [];

                      for (var i = 0; i < results.length; i++) {
                        if (personnames.indexOf(results[i].name) == -1) {
                          personnames.push(results[i].name);
                        }
                      }

                      var employees = [];

                      for (var x = 0; x < personnames.length; x++) {
                        var employee = [];
                        var profile = "";
                        var timeused = 0;
                        var amount = 0;
                        var lists = [];

                        for (var z = 0; z < results.length; z++) {
                          if (results[z].name == personnames[x]) {
                            if (profile == "") {
                              profile = results[z].profileimg;
                            }

                            timeused += results[z].timeused;
                            amount += results[z].amount;
                            lists.push([results[z].req_status_title, results[z].amount]);
                          }
                        }

                        var time = minuteconvert(timeused);
                        employees.push({
                          "name": personnames[x],
                          "profileimage": profile,
                          "timeused": time,
                          "receiveamount": amount,
                          "listsbystatus": lists
                        });
                      }

                      resolve(employees);
                    } else {
                      resolve(0);
                    }
                  }

                  if (err) {}
                });
              }));

            case 10:
              requestemployeeworkinfo = _context4.sent;

              if (requestemployeeworkinfo == 0) {// message = "ไม่มีเจ้าหน้าที่ในแผนกรับเรื่อง"
              }

              tablecontent = ["ข้อมูลเบื้องต้นของรายการ", "ข้อมูลการดำเนินการของรายการแจ้งซ่อม", "ข้อมูลรายการที่แจ้งซ่อมของรายการแจ้งซ่อม"];
              all1 = [];
              all2 = [];
              all3 = [];
              _context4.next = 18;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select r.req_ID,r.req_des,r.req_title,CONCAT(r.req_created,' ถึง ',r.req_end) AS 'timerange', IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where r.req_createdby = user_id), r.req_createdby) AS 'req_created',IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where r.req_repairby = user_id), 'ไม่ได้แจ้งพัสดุ') AS 'req_repairby',IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where r.req_getby = user_id),'รอเจ้าหน้าที่รับเรื่อง') AS 'req_getby', rs.req_status_title from request r, request_status rs where r.req_type_id = '3' and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_status_id = rs.req_status_id order by r.req_status_id, r.req_ID";
                connection.query(sql, function (err, results, field) {
                  if (err) throw err;else if (results.length > 0) {
                    all1 = results;
                    var sql = "select rh.req_ID, rs.req_status_title, IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where rh.history_createdby = user_id), rh.history_createdby) AS 'createdby',rh.history_created ,rh.timeused from request r, request_status rs, request_history rh where r.req_type_id = '3' and r.req_ID = rh.req_ID and rh.req_status_id = rs.req_status_id and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') order by r.req_status_id ,r.req_ID, rh.history_created";
                    connection.query(sql, function (err, results, field) {
                      if (err) throw err;else if (results.length > 0) {
                        all2 = results;
                        var sql = "select rp.req_ID,rp.product_name,rp.product_location_id,rp.product_des from request_bd_product rp,request r where r.req_ID = rp.req_ID and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') order by r.req_status_id, r.req_ID";
                        connection.query(sql, function (err, results, field) {
                          if (err) throw err;else if (results.length > 0) {
                            all3 = results;
                            var listsdetail = [];

                            for (var ll = 0; ll < all1.length; ll++) {
                              var onelist = [];
                              var content1 = {
                                "title": tablecontent[0],
                                "data": []
                              };
                              var content2 = {
                                "title": tablecontent[1],
                                "data": [["สถานะ", "วันที่บันทึก", "ผู้บันทึก", "เวลาที่ใช้"]]
                              };
                              var content3 = {
                                "title": tablecontent[2],
                                "data": [["ชื่อรายการ", "ที่ตั้ง", "หมายเหตุ"]]
                              };
                              var reqID = ["หมายเลขการแจ้ง", all1[ll].req_ID];
                              var problem = ["ปัญหา", all1[ll].req_title];
                              var des = ["หมายเหตุ", all1[ll].req_des];
                              var timerange = ["ช่วงเวลาที่ดำเนินการ", all1[ll].timerange];
                              var status = ["สถานะรายการแจ้งซ่อม", all1[ll].req_status_title];
                              var timeusedall = ["เวลาที่ใช้ในการดำเนินการ"];
                              var requester = ["ผู้แจ้ง", all1[ll].req_created];
                              var receiver = ["เจ้าหน้าที่ผู้รับเรื่อง", all1[ll].req_getby];
                              var receivertimeused = ["ระยะเวลาที่เจ้าหน้าที่ใช้", ""];
                              var repairer = ["เจ้าหน้าที่พัสดุที่รับเรื่องซ่อม", all1[ll].req_repairby];
                              var repairertimeused = ["ระยะเวลาที่เจ้าหน้าที่ใช้", ""];
                              var timereceiveruse = 0;
                              var timerepaireruse = 0;

                              for (var tl = 0; tl < all2.length; tl++) {
                                if (all2[tl].req_ID == reqID[1]) {
                                  if (all2[tl].createdby == receiver[1]) {
                                    timereceiveruse += all2[tl].timeused;
                                  } else if (all2[tl].createdby == repairer[1]) {
                                    timerepaireruse += all2[tl].timeused;
                                  }

                                  var history_created = all2[tl].history_created.getFullYear() + "-" + (all2[tl].history_created.getMonth() + 1) + "-" + all2[tl].history_created.getDate() + " " + all2[tl].history_created.getHours() + ":" + all2[tl].history_created.getMinutes() + ":" + all2[tl].history_created.getSeconds();
                                  content2.data.push([all2[tl].req_status_title, history_created, all2[tl].createdby, minuteconvert(all2[tl].timeused)]);
                                }
                              }

                              receivertimeused[1] = minuteconvert(timereceiveruse);
                              repairertimeused[1] = minuteconvert(timerepaireruse);
                              timeusedall.push(minuteconvert(timereceiveruse + timerepaireruse));

                              for (var pl = 0; pl < all3.length; pl++) {
                                if (all3[pl].req_ID == reqID[1]) {
                                  content3.data.push([all3[pl].product_name, all3[pl].product_location_id, all3[pl].product_des]);
                                }
                              }

                              if (receiver[1] == "รอเจ้าหน้าที่รับเรื่อง" && repairer[1] == "ไม่ได้แจ้งพัสดุ") {
                                content1.data.push(reqID, problem, des, timerange, status, timeusedall);
                              } else if (receiver[1] != "รอเจ้าหน้าที่รับเรื่อง" && repairer[1] == "ไม่ได้แจ้งพัสดุ") {
                                content1.data.push(reqID, problem, des, timerange, status, timeusedall, receiver, receivertimeused);
                              } else if (receiver[1] != "รอเจ้าหน้าที่รับเรื่อง" && repairer[1] != "ไม่ได้แจ้งพัสดุ") {
                                content1.data.push(reqID, problem, des, timerange, status, timeusedall, receiver, receivertimeused, repairer, repairertimeused);
                              }

                              onelist.push(content1, content2, content3);
                              listsdetail.push(onelist);
                            }

                            resolve(listsdetail);
                          } else {
                            resolve(0);
                          }
                        });
                      }
                    });
                  } else {
                    resolve(0);
                  }
                });
              }));

            case 18:
              detailreqlist = _context4.sent;
              getcountoflists(req, res).then(function (value) {
                countstatus = value;
                res.render("dashboardshow", {
                  title: "อาคาร",
                  start: startdate,
                  end: enddate,
                  message: message,
                  countstatus: countstatus,
                  user_id: req.session.userID,
                  logined: req.session.loggedin,
                  user_usertype: req.session.user_usertype,
                  user_firstname: req.session.user_firstname,
                  profileimg: req.session.profileimage,
                  chart: chart,
                  employeedata: requestemployeeworkinfo,
                  listsdetail: detailreqlist
                });
              });

            case 20:
            case "end":
              return _context4.stop();
          }
        }
      });
    };

    var startdate = req.body.start;
    var enddate = req.body.end;
    var chart = [];
    var work = [];
    var connection = mysql.createConnection(db_config);
    requesttodatabase().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
router.post("/dashboard/PS", function (req, res) {
  var message = false;
  var countstatus = [];

  if (req.body.check && req.session.loggedin && (req.session.user_usertype == "3" && req.session.user_departmentID == "4" || req.session.user_usertype == "4")) {
    var requesttodatabase = function requesttodatabase() {
      var requestamountbystatus, requestitembyroom, requestemployeeworkinfo, tablecontent, all1, all2, all3, detailreqlist;
      return regeneratorRuntime.async(function requesttodatabase$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select rs.req_status_title,COUNT(*) as 'amount' from request r, request_status rs where (r.req_repairby != 'ไม่ได้แจ้งพัสดุ' OR r.req_status_id = '3') AND r.req_status_id = rs.req_status_id  AND (req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') group by r.req_status_id order by CAST(r.req_status_id AS UNSIGNED)";
                connection.query(sql, function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      var chartamountbystatus = [['สถานะ', 'จำนวนรายการ']];
                      var amountrequest = 0;

                      for (var i = 0; i < results.length; i++) {
                        var arr = [];
                        arr.push(results[i].req_status_title);
                        arr.push(results[i].amount);
                        amountrequest += results[i].amount;
                        chartamountbystatus.push(arr);
                      }

                      resolve([chartamountbystatus, amountrequest]);
                    } else {
                      resolve(0);
                    }
                  }

                  if (err) {}
                });
              }));

            case 2:
              requestamountbystatus = _context5.sent;

              if (requestamountbystatus == 0) {
                message = "ไม่มีการแจ้งซ่อมในช่วงเวลาที่กำหนด";
              } else {
                chart.push({
                  "title": "จำนวนรายการแจ้งซ่อมแบ่งตามสถานะการดำเนินการ (ทั้งหมด " + requestamountbystatus[1] + " รายการ)",
                  "data": requestamountbystatus[0]
                });
              }

              _context5.next = 6;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select rh.product_name,rh.product_location_id,count(rh.product_name) as 'amount' from request_it_product rh, request r where (r.req_status_id = 3 OR r.req_repairby != 'ไม่ได้แจ้งพัสดุ') and r.req_ID = rh.req_ID and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_type_id = '1' group by rh.product_name , rh.product_location_id  UNION ALL select rh.product_name,rh.product_location_id,count(rh.product_name) as 'amount' from request_md_product rh, request r where (r.req_status_id = 3 OR r.req_repairby != 'ไม่ได้แจ้งพัสดุ') and r.req_ID = rh.req_ID and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_type_id = '2' group by rh.product_name , rh.product_location_id  UNION ALL select rh.product_name,rh.product_location_id,count(rh.product_name) as 'amount' from request_bd_product rh, request r where (r.req_status_id = 3 OR r.req_repairby != 'ไม่ได้แจ้งพัสดุ') and r.req_ID = rh.req_ID and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_type_id = '3' group by rh.product_name , rh.product_location_id ";
                connection.query(sql, function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      var location = [];
                      var product = [];
                      var data = [];

                      for (var i = 0; i < results.length; i++) {
                        if (location.indexOf(results[i].product_location_id) == -1) {
                          location.push(results[i].product_location_id);
                        }

                        if (product.indexOf(results[i].product_name) == -1) {
                          product.push(results[i].product_name);
                        }
                      }

                      for (var i = 0; i < product.length; i++) {
                        var dataforloop = [product[i]];
                        var sumforloop = 0;

                        for (var y = 0; y < location.length; y++) {
                          for (var x = 0; x < results.length; x++) {
                            if (results[x].product_name == product[i] && results[x].product_location_id == location[y]) {
                              dataforloop.push(results[x].amount);
                              sumforloop += results[x].amount;
                            } // else if(results[x].product_name == product[i] && results[x].product_location_id != location[y]){
                            // 	dataforloop.push(0)
                            // }

                          }

                          if (!dataforloop[y + 1]) {
                            dataforloop.push(0);
                          }
                        }

                        var text = sumforloop;
                        dataforloop.push(text);
                        data.push(dataforloop);
                      }

                      data = data.sort(function (a, b) {
                        return b[data[0].length - 1] - a[data[0].length - 1];
                      });

                      for (var z = 0; z < data.length; z++) {
                        data[z][data[0].length - 1] = data[z][data[0].length - 1] + " รายการ";
                      }

                      location.unshift("");
                      location.push({
                        role: 'annotation'
                      });
                      data.unshift(location);
                      resolve(data);
                    } else {
                      resolve(0);
                    }
                  }

                  if (err) {}
                });
              }));

            case 6:
              requestitembyroom = _context5.sent;

              if (requestitembyroom == 0) {
                message = "ไม่มีการแจ้งซ่อมในช่วงเวลาที่กำหนด";
              } else {
                chart.push({
                  "title": "อันดับรายการที่ได้รับการแจ้งซ่อมแบ่งตามระดับชั้นหรือห้องจากมากไปน้อย",
                  "data": requestitembyroom
                });
              }

              _context5.next = 10;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select CONCAT(m.user_firstname,' ',m.user_lastname) AS 'name',m.profileimg , r.req_repairby, rs.req_status_title, r.req_ID, r.req_status_id, sum(rh.timeused) AS 'timeused', (select count(req_ID) from request where req_status_id = r.req_status_id and req_repairby = r.req_repairby) AS amount from member m, request_status rs, request r, request_history rh where m.user_id = r.req_repairby and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_status_id = rs.req_status_id and r.req_ID = rh.req_ID and rh.history_createdby = r.req_repairby group by r.req_repairby, r.req_status_id";
                connection.query(sql, function (err, results, field) {
                  if (results) {
                    if (results.length > 0) {
                      var location = [];
                      var personnames = [];
                      var data = [];

                      for (var i = 0; i < results.length; i++) {
                        if (personnames.indexOf(results[i].name) == -1) {
                          personnames.push(results[i].name);
                        }
                      }

                      var employees = [];

                      for (var x = 0; x < personnames.length; x++) {
                        var employee = [];
                        var profile = "";
                        var timeused = 0;
                        var amount = 0;
                        var lists = [];

                        for (var z = 0; z < results.length; z++) {
                          if (results[z].name == personnames[x]) {
                            if (profile == "") {
                              profile = results[z].profileimg;
                            }

                            timeused += results[z].timeused;
                            amount += results[z].amount;
                            lists.push([results[z].req_status_title, results[z].amount]);
                          }
                        }

                        var time = minuteconvert(timeused);
                        employees.push({
                          "name": personnames[x],
                          "profileimage": profile,
                          "timeused": time,
                          "receiveamount": amount,
                          "listsbystatus": lists
                        });
                      }

                      resolve(employees);
                    } else {
                      resolve(0);
                    }
                  }

                  if (err) {}
                });
              }));

            case 10:
              requestemployeeworkinfo = _context5.sent;

              if (requestemployeeworkinfo == 0) {// message = "ไม่มีเจ้าหน้าที่ในแผนกรับเรื่อง"
              }

              tablecontent = ["ข้อมูลเบื้องต้นของรายการ", "ข้อมูลการดำเนินการของรายการแจ้งซ่อม", "ข้อมูลรายการที่แจ้งซ่อมของรายการแจ้งซ่อม"];
              all1 = [];
              all2 = [];
              all3 = [];
              _context5.next = 18;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var sql = "select r.req_ID,r.req_des,r.req_title,CONCAT(r.req_created,' ถึง ',r.req_end) AS 'timerange', IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where r.req_createdby = user_id), r.req_createdby) AS 'req_created',IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where r.req_repairby = user_id), 'ไม่ได้แจ้งพัสดุ') AS 'req_repairby',IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where r.req_getby = user_id),'รอเจ้าหน้าที่รับเรื่อง') AS 'req_getby', rs.req_status_title from request r, request_status rs where (r.req_status_id = 3 OR r.req_repairby != 'ไม่ได้แจ้งพัสดุ') and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') and r.req_status_id = rs.req_status_id order by CAST(r.req_status_id AS UNSIGNED), r.req_ID";
                connection.query(sql, function (err, results, field) {
                  if (err) throw err;else if (results.length > 0) {
                    all1 = results;
                    var sql = "select rh.req_ID, rs.req_status_title, IFNULL((select CONCAT(user_firstname ,' ', user_lastname) from member where rh.history_createdby = user_id), rh.history_createdby) AS 'createdby',rh.history_created ,rh.timeused from request r, request_status rs, request_history rh where (r.req_status_id = 3 OR r.req_repairby != 'ไม่ได้แจ้งพัสดุ') and r.req_ID = rh.req_ID and rh.req_status_id = rs.req_status_id and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') order by r.req_status_id ,r.req_ID, rh.history_created";
                    connection.query(sql, function (err, results, field) {
                      if (err) throw err;else if (results.length > 0) {
                        all2 = results;
                        var sql = "select rp.req_ID,rp.product_ID as product_ID,rp.product_name,rp.product_location_id,rp.product_des from request_it_product rp,request r where (r.req_status_id = 3 OR r.req_repairby != 'ไม่ได้แจ้งพัสดุ') and r.req_ID = rp.req_ID and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') union all select rp.req_ID,null as product_ID,rp.product_name,rp.product_location_id,rp.product_des from request_md_product rp,request r where (r.req_status_id = 3 OR r.req_repairby != 'ไม่ได้แจ้งพัสดุ') and r.req_ID = rp.req_ID and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59') union all select rp.req_ID,null as product_ID,rp.product_name,rp.product_location_id,rp.product_des from request_bd_product rp,request r where (r.req_status_id = 3 OR r.req_repairby != 'ไม่ได้แจ้งพัสดุ') and r.req_ID = rp.req_ID and (r.req_created BETWEEN '" + startdate + " 00:00:00' AND '" + enddate + " 23:59:59')";
                        connection.query(sql, function (err, results, field) {
                          if (err) throw err;else if (results.length > 0) {
                            all3 = results;
                            var listsdetail = [];

                            for (var ll = 0; ll < all1.length; ll++) {
                              var onelist = [];
                              var content1 = {
                                "title": tablecontent[0],
                                "data": []
                              };
                              var content2 = {
                                "title": tablecontent[1],
                                "data": [["สถานะ", "วันที่บันทึก", "ผู้บันทึก", "เวลาที่ใช้"]]
                              };

                              if (String(all1[ll].req_ID).match(/IT/g)) {
                                var content3 = {
                                  "title": tablecontent[2],
                                  "data": [["รหัสเครื่อง", "ชื่ออุปกรณ์", "ที่ตั้ง", "หมายเหตุ"]]
                                };
                              } else if (String(all1[ll].req_ID).match(/MD/g)) {
                                var content3 = {
                                  "title": tablecontent[2],
                                  "data": [["ชื่ออุปกรณ์", "ที่ตั้ง", "หมายเหตุ"]]
                                };
                              } else {
                                var content3 = {
                                  "title": tablecontent[2],
                                  "data": [["ชื่อรายการ", "ที่ตั้ง", "หมายเหตุ"]]
                                };
                              }

                              var reqID = ["หมายเลขการแจ้ง", all1[ll].req_ID];
                              var problem = ["ปัญหา", all1[ll].req_title];
                              var des = ["หมายเหตุ", all1[ll].req_des];
                              var timerange = ["ช่วงเวลาที่ดำเนินการ", all1[ll].timerange];
                              var status = ["สถานะรายการแจ้งซ่อม", all1[ll].req_status_title];
                              var timeusedall = ["เวลาที่ใช้ในการดำเนินการ"];
                              var requester = ["ผู้แจ้ง", all1[ll].req_created];
                              var receiver = ["เจ้าหน้าที่ผู้รับเรื่อง", all1[ll].req_getby];
                              var receivertimeused = ["ระยะเวลาที่เจ้าหน้าที่ใช้", ""];
                              var repairer = ["เจ้าหน้าที่พัสดุที่รับเรื่องซ่อม", all1[ll].req_repairby];
                              var repairertimeused = ["ระยะเวลาที่เจ้าหน้าที่ใช้", ""];
                              var timereceiveruse = 0;
                              var timerepaireruse = 0;

                              for (var tl = 0; tl < all2.length; tl++) {
                                if (all2[tl].req_ID == reqID[1]) {
                                  if (all2[tl].createdby == receiver[1]) {
                                    timereceiveruse += all2[tl].timeused;
                                  } else if (all2[tl].createdby == repairer[1]) {
                                    timerepaireruse += all2[tl].timeused;
                                  }

                                  var history_created = all2[tl].history_created.getFullYear() + "-" + (all2[tl].history_created.getMonth() + 1) + "-" + all2[tl].history_created.getDate() + " " + all2[tl].history_created.getHours() + ":" + all2[tl].history_created.getMinutes() + ":" + all2[tl].history_created.getSeconds();
                                  content2.data.push([all2[tl].req_status_title, history_created, all2[tl].createdby, minuteconvert(all2[tl].timeused)]);
                                }
                              }

                              receivertimeused[1] = minuteconvert(timereceiveruse);
                              repairertimeused[1] = minuteconvert(timerepaireruse);
                              timeusedall.push(minuteconvert(timereceiveruse + timerepaireruse));

                              for (var pl = 0; pl < all3.length; pl++) {
                                if (all3[pl].req_ID == reqID[1]) {
                                  if (String(all1[ll].req_ID).match(/IT/g)) {
                                    content3.data.push([all3[pl].product_ID, all3[pl].product_name, all3[pl].product_location_id, all3[pl].product_des]);
                                  } else {
                                    content3.data.push([all3[pl].product_name, all3[pl].product_location_id, all3[pl].product_des]);
                                  }
                                }
                              }

                              if (receiver[1] == "รอเจ้าหน้าที่รับเรื่อง" && repairer[1] == "ไม่ได้แจ้งพัสดุ") {
                                content1.data.push(reqID, problem, des, timerange, status, timeusedall);
                              } else if (receiver[1] != "รอเจ้าหน้าที่รับเรื่อง" && repairer[1] == "ไม่ได้แจ้งพัสดุ") {
                                content1.data.push(reqID, problem, des, timerange, status, timeusedall, receiver, receivertimeused);
                              } else if (receiver[1] != "รอเจ้าหน้าที่รับเรื่อง" && repairer[1] != "ไม่ได้แจ้งพัสดุ") {
                                content1.data.push(reqID, problem, des, timerange, status, timeusedall, receiver, receivertimeused, repairer, repairertimeused);
                              }

                              onelist.push(content1, content2, content3);
                              listsdetail.push(onelist);
                            }

                            resolve(listsdetail);
                          } else {
                            resolve(0);
                          }
                        });
                      }
                    });
                  } else {
                    resolve(0);
                  }
                });
              }));

            case 18:
              detailreqlist = _context5.sent;
              getcountoflists(req, res).then(function (value) {
                countstatus = value;
                res.render("dashboardshow", {
                  title: "พัสดุ",
                  start: startdate,
                  end: enddate,
                  message: message,
                  countstatus: countstatus,
                  user_id: req.session.userID,
                  logined: req.session.loggedin,
                  user_usertype: req.session.user_usertype,
                  user_firstname: req.session.user_firstname,
                  profileimg: req.session.profileimage,
                  chart: chart,
                  employeedata: requestemployeeworkinfo,
                  listsdetail: detailreqlist
                });
              });

            case 20:
            case "end":
              return _context5.stop();
          }
        }
      });
    };

    var startdate = req.body.start;
    var enddate = req.body.end;
    var chart = [];
    var work = [];
    var connection = mysql.createConnection(db_config);
    requesttodatabase().then(function () {
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
router.get("/dashboard/PS", function (req, res) {
  var countstatus = [];

  if (req.session.loggedin && (req.session.user_usertype == "3" && req.session.user_departmentID == "4" || req.session.user_usertype == "4")) {
    var connection = mysql.createConnection(db_config);
    var listemployee = [];
    var sql = "select user_firstname,user_lastname,user_id from member where user_departmentID = '4' and user_typeID = '2'";
    connection.query(sql, function (err, results, field) {
      if (err) {} else if (results.length > 0) {
        listemployee = results;
      } else {
        listemployee = [];
      }

      console.log(listemployee);
      getcountoflists(req, res).then(function (value) {
        countstatus = value;
        res.render("dashboard", {
          title: "พัสดุ",
          listemployee: listemployee,
          countstatus: countstatus,
          user_id: req.session.userID,
          logined: req.session.loggedin,
          user_usertype: req.session.user_usertype,
          user_firstname: req.session.user_firstname,
          profileimg: req.session.profileimage
        });
      });
      connection.end();
    });
  } else {
    res.redirect("/");
  }
});
router.get("/dashboard/", function (req, res) {
  var department = req.session.user_departmentID;

  if (req.session.loggedin && req.session.user_usertype == "3") {
    if (req.session.user_departmentID == "1") {
      res.redirect("/dashboard/IT");
    } else if (req.session.user_departmentID == "2") {
      res.redirect("/dashboard/MD");
    } else if (req.session.user_departmentID == "3") {
      res.redirect("/dashboard/BD");
    } else if (req.session.user_departmentID == "4") {
      res.redirect("/dashboard/PS");
    } else {
      res.redirect("/");
    }
  } else if (req.session.user_usertype == "4") {
    getcountoflists(req, res).then(function (value) {
      var countstatus = value;
      res.render("dashboardmenu", {
        countstatus: countstatus,
        user_id: req.session.userID,
        logined: req.session.loggedin,
        user_usertype: req.session.user_usertype,
        user_firstname: req.session.user_firstname,
        profileimg: req.session.profileimage
      });
    });
  } else {
    res.redirect("/");
  }
});

function getcountoflists(req, res) {
  var listscount, connection, news, receives, requests;
  return regeneratorRuntime.async(function getcountoflists$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          connection = mysql.createConnection(db_config);
          _context6.next = 3;
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
          news = _context6.sent;
          _context6.next = 6;
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
          receives = _context6.sent;
          _context6.next = 9;
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
          requests = _context6.sent;
          listscount = [requests[0].count, receives[0].count, news[0].count];
          connection.end();
          return _context6.abrupt("return", listscount);

        case 13:
        case "end":
          return _context6.stop();
      }
    }
  });
}

function minuteconvert(minutes) {
  var minutesforconvert = minutes;
  var days = 0;
  var hours = 0;
  var minute = 0;
  var texttime = "";

  while (minutesforconvert >= 1440) {
    days += 1;
    minutesforconvert -= 1440;
  }

  if (days != 0) {
    texttime += "" + days + " วัน ";
  }

  while (minutesforconvert >= 60) {
    hours += 1;
    minutesforconvert -= 60;
  }

  if (hours != 0) {
    texttime += "" + hours + " ชั่วโมง ";
  }

  minute = minutesforconvert;

  if (minute != 0) {
    texttime += "" + minute + " นาที ";
  }

  if (texttime == "") {
    texttime = "0 นาที";
  }

  return texttime;
}

module.exports = router;