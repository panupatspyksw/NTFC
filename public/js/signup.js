var confirmpage = document.querySelector(".confirmsection")
var OTP = "!1!!@321e21!"
var head = document.querySelector("form .head")
var subhead = document.querySelector("form .subhead")
var formsearch = document.querySelectorAll("form")[0]
var inputsearch = document.querySelector("input")
var submitbutton = document.querySelector("input[type='submit']")
var path = "ตรวจสอบอีเมลหรือไอดี"
var datauser = ""
var userdata = ""

formsearch.addEventListener("submit", function(evt) {
    evt.preventDefault();
    if(path == "ตรวจสอบอีเมลหรือไอดี"){
    datauser = inputsearch.value
    $.ajax({
        type : "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({ searchuser: datauser, fromweb: true  }),
        url : "/searchsignup",
        success: function(res)
        {
            userdata = res
            if(userdata.user_firstname){
                path = "ยืนยันรหัสในการลงทะเบียน"
                inputsearch.readOnly = true
                submitbutton.value = "ลงทะเบียน"
                var inputname = " <input type='text' class='inputround' value='"+userdata.user_firstname+" "+userdata.user_lastname+"' placeholder='รหัสประจำตัว' required readonly>"
                var inputdepartment = " <input type='text' class='inputround' value='"+"แผนก"+userdata.user_departmentDES+"' placeholder='รหัสประจำตัว' required readonly>"
                var inputusertype = " <input type='text' class='inputround' value='"+"ตำแหน่ง"+userdata.user_typeTITLE+"' placeholder='รหัสประจำตัว' required readonly>"
                var inputemail = " <input id='email' type='email' class='inputround' placeholder='อีเมล' required>"
                var inputphone = " <input id='phone' type='phone' class='inputround' placeholder='เบอร์โทรศัพท์' required>"
                var inputpassword = " <input id='password' type='password' class='inputround' placeholder='รหัสผ่าน' required>"
                var passworddes = "<p style='font-size:14px'>*กรุณากรอกรหัสผ่านเป็นภาษาอังกฤษเท่านั้นและประกอบด้วยตัวเลขและสัญลักษณ์</p>"
                var inputrepassword = " <input type='password' class='inputround' placeholder='ยืนยันรหัสผ่าน' required  minlength='8' maxlength='15'>"
                var checkboxpolicy = '<input type="checkbox" name="checkbox" value="check" style="display:inline-block" id="agree" required> ฉันยอมรับ<a class="th forgotpw" href="/policy" target="_blank">เงื่อนไขและข้อตกลง</a>ในการใช้งาน'
                $("input[type='submit']").before(inputname,inputdepartment,inputusertype,inputemail,inputphone,inputpassword,passworddes,inputrepassword,checkboxpolicy);
            }
        },
        error : function(e) {
            alert("ไม่พบสิทธิการเข้าใช้งานของคุณ")
        }
    });  
    }
    else if(path == "ยืนยันรหัสในการลงทะเบียน" ){
        var inputpassword = document.querySelectorAll("input[type='password']")
        var email = document.querySelector("input[type='email']").value
        var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

        if(inputpassword[0].value == inputpassword[1].value && inputpassword[0].value != "" && (inputpassword[0].value.match(/[a-z]+/) || inputpassword[0].value.match(/[A-Z]+/)) && inputpassword[0].value.match(/[0-9]+/) && (format.test(inputpassword[0].value)==true) && !(inputpassword[0].value.match(/[ก-๚]/g))){

        $.ajax({
        type : "POST",
        data: JSON.stringify({ email: email, fromweb: true }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        url : "/OTPforsignup",
        success: function(res)
        {
            alert("ตรวจสอบรหัสลงทะเบียนในอีเมล")
            confirmpage.style.display = "block";
            OTP = res
        },
        error : function(e) {
            alert("ไม่พบอีเมลของท่าน")
        }
        })
        }
        else if(inputpassword[0].value != inputpassword[1].value){
            alert("รหัสผ่านไม่ตรงกัน")
        }
        else{
            alert("รหัสผ่านไม่ตรงตามเงื่อนไข")
        }
    }

}, true);

confirmpage.style.display = "none";
function cancelrequest(){
    confirmpage.style.display = "none";
}

function signupsubmit(){
    var email = document.querySelector("input[type='email']").value
    if(path=="ยืนยันรหัสลงทะเบียนเสร็จสิ้น"){
        console.log(userdata)
        if(userdata.user_firstname){
        userdata.email = document.getElementById("email").value
        userdata.password = document.getElementById("password").value
        userdata.phone = document.getElementById("phone").value
        $.ajax({
        type : "POST",
        data: JSON.stringify({ signupdata: userdata, fromweb: true }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        url : "/signupsuccess",
        success: function(res)
        {
            
            alert("ลงทะเบียนสำเร็จ ย้ายไปยังเข้าสู่ระบบ")
            window.location.replace("/login");
          
        },
        error : function(e) {
            alert("ระบบลงทะเบียนขัดข้องติดต่อเจ้าหน้าที่")

        }
        })
        }
        else{
            alert("กลับไปลงทะเบียนตามขั้นตอน")
        }
    }
}

function EnterOtp(){
var OTPinput = document.getElementById("OTPinput")
if(OTP){
    if(OTP == OTPinput.value){        
        path="ยืนยันรหัสลงทะเบียนเสร็จสิ้น"
        signupsubmit()
    }
    else{
        alert("รหัสไม่ถูกต้อง")
        OTPinput.value = ""
        confirmpage.style.display = "none";
    }
}
else{
    alert("blank")
}
}
