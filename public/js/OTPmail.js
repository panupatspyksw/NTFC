var OTP
var OTPinput = document.getElementById("OTPinput")
var confirmotp = false;
var confirmpage = document.querySelector(".confirmsection")
confirmpage.style.display = "none"
var form = document.getElementById("formreq")
var emailinput = document.getElementById("email")
var subbitbtn = document.getElementById("submit")
form.addEventListener("submit", function(evt) {
    if(confirmotp == false){
        var emailformat = emailinput.value.match(/@g.swu.ac.th/)
        if(emailformat){
            evt.preventDefault();
            requeststd()
        }
        else{
            alert("กรุณากรอกอีเมล g.swu.ac.th")
            evt.preventDefault();
        }
    }
    else{
        alert("รายการแจ้งซ่อมของคุณถูกส่งไปยังเจ้าหน้าที่เรียบร้อย")
    }

}, true);

function cancelrequest(){
    confirmpage.style.display = "none";
}

function requeststd(){
    $.ajax({
        type : "POST",
        data: JSON.stringify({ email: emailinput.value }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        url : "/OTPforrequest",
        success: function(res)
        {
            OTP = res
            confirmpage.style.display = "block";
            
        },
        error : function(e) {
        }
    });  

  }

  function submitrequest(){

  }

  function EnterOtp(){
    if(OTP){
        if(OTP == OTPinput.value){
            confirmotp = true
            var input = document.createElement("input");
            input.type = "text";
            input.name = "checkverify";
            input.value = "verify"
            input.style.opacity = "0"
            form.appendChild(input);
            subbitbtn.click()
        }
        else{
            alert("OTP wrong")
        }
    }
    else{
        alert("blank")
    }
  }