function deleterow(s){
    s.parentNode.remove()
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
  document.querySelector(".lists").append(listforadd)
}

var submit = document.getElementById("submit");
var form = document.querySelector("form")
window.addEventListener("unload",function(){
var form = document.querySelector("form")
form.reset();
})

form.onsubmit = function(){
  list.remove()
}

if ( window.history.replaceState ) {
window.history.replaceState( null, null, window.location.href );
}

var fileinput = document.getElementById("imageinput");
console.log(fileinput.fi)
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




