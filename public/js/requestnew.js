
var listcount = 1

function deleterow(s){
    if(listcount > 1){
        listcount -=1
        s.parentNode.remove()
    }
    else{
        alert("ต้องมีอย่างน้อย 1 รายการที่จะแจ้ง")
    }
}

function cloneelement(copy){

copy.style.display = "inline-block"
var paste = copy.cloneNode(true);
copy.style.display = "none"
return paste
}

cloneelement(document.querySelector(".listorder"))
var addbtn = document.getElementById("newbtn")
addbtn.onclick = function(){
  var listforadd = cloneelement(document.querySelector(".listorder"))
  if(listcount < 10){
    listcount+=1
    document.querySelector(".lists").append(listforadd)
  }
  else{
      alert("แจ้งได้มากที่สุด 10 รายการเท่านั้น")
  }
}

var submit = document.getElementById("submit");
var form = document.querySelector("form")
window.addEventListener("unload",function(){
var form = document.querySelector("form")
form.reset();
})



if ( window.history.replaceState ) {
window.history.replaceState( null, null, window.location.href );
}

var fileinput = document.getElementById("imageinput");
var preview = document.getElementById("previewimg");
var previewimgcopy = document.querySelector("#listimage");
fileinput.addEventListener("change",function(e)
{

    while (preview.firstChild) 
    {
    preview.removeChild(preview.firstChild);
    }
    var fileInput =  document.getElementById('imageinput'); 
    var filePath = fileInput.value; 
    // Allowing file type 
    var allowedExtensions =  /(\.jpg|\.jpeg|\.png|\.gif)$/i; 
    if (!allowedExtensions.exec(filePath)) { 
        alert('Invalid file type'); 
        fileInput.value = ''; 
        return false; 
    }  
        // console.log(e.target.result)
    if ( fileinput.files && fileinput.files.length > 0 && fileinput.files.length < 10 )
    {
        for(var i = 0; i < fileinput.files.length; i++)
        {
            var fileReader = new FileReader()
            var pasteimg = cloneelement(document.querySelector("#listimage"))
            fileReader.readAsDataURL(fileinput.files[i]);
            fileReader.onload = (e) => 
            {
                pasteimg.data = e.target.result;
                preview.append(pasteimg)
                pasteimg = cloneelement(document.querySelector("#listimage"))
            }
        }
    }
    else{
        alert("cannot upload image more than 10 ")
        fileinput.value = "";
    }
})




