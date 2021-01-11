function listtable(){
    var pagetext = document.querySelector(".page")
    var nextbtn = document.querySelector(".next")
    var backbtn = document.querySelector(".back")
    var pagelocation = 0;
    var pages = [];
    var amountforonepage = 10;

    var lists = document.querySelectorAll(".list")
    if(lists.length > amountforonepage){
        nextbtn.style.opacity = 1;
        nextbtn.style.pointerEvents = "fill";
        lists.forEach((element,index)=>{
            if(index > 9){
                element.style.display = "none";
            }
        })
        var storeten = [];
        for(var i = 0; i < lists.length; i++){
            storeten.push(lists[i])
            if(storeten.length == amountforonepage){
                pages.push(storeten)
                storeten = []
            }
        }
        pages.push(storeten)
        nextbtn.addEventListener("click",()=>{
            if(pagelocation < pages.length-1){
                pagelocation += 1
                backbtn.style.opacity = 1;
                backbtn.style.pointerEvents = "fill";
                if(pages[pagelocation].length%amountforonepage==0){
                    pagetext.innerText = "รายการที่ "+((amountforonepage*pagelocation)+1)+"-"+(amountforonepage+(amountforonepage*pagelocation))+" จาก "+lists.length+" รายการ";
                }
                else{
                    pagetext.innerText = "รายการที่ "+((amountforonepage*pagelocation)+1)+"-"+lists.length+" จาก "+lists.length+" รายการ";
                }
                if(pagelocation == pages.length-1){
                    nextbtn.style.opacity = 0.5;
                    nextbtn.style.pointerEvents = "none";
                }
            }
                
            lists.forEach(element => {
                element.style.display = "none";
            });
            pages[pagelocation].forEach(element => {
                element.style.display = "block"
            })
        })
        backbtn.addEventListener("click",()=>{
            nextbtn.style.opacity = 1;
            nextbtn.style.pointerEvents = "fill";
            if(pagelocation > 0){
                pagelocation -= 1
                if(pages[pagelocation].length%amountforonepage==0){
                    pagetext.innerText = "รายการที่ "+((amountforonepage*pagelocation)+1)+"-"+(amountforonepage+(amountforonepage*pagelocation))+" จาก "+lists.length+" รายการ";
                }
                else{
                    pagetext.innerText = "รายการที่ "+((amountforonepage*pagelocation)+1)+"-"+lists.length+" จาก "+lists.length+" รายการ";
                }
                if(pagelocation == 0){
                    backbtn.style.opacity = 0.5;
                    backbtn.style.pointerEvents = "none";
                }
            }

            lists.forEach(element => {
                element.style.display = "none";
            });
            pages[pagelocation].forEach(element => {
                element.style.display = "block"
            })
        })
        pagetext.innerText = "รายการที่ 1-10 จาก "+lists.length+" รายการ";

    }
    else{
        backbtn.style.opacity = 0.5;
        nextbtn.style.opacity = 0.5;
        backbtn.style.pointerEvents = "none";
        nextbtn.style.pointerEvents = "none";
        if(lists[0].id){
        pagetext.innerText = "รายการที่ 1-"+lists.length+" จาก "+lists.length+" รายการ"
        }
        else{
        pagetext.innerText = "0 รายการ";
        }
    }
    backbtn.style.opacity = 0.5;
    backbtn.style.pointerEvents = "none";

    }