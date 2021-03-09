var progress = 0;
var tl;

function pagetransition(){
tl = gsap.timeline();
tl.to(".circle",{duration:.6, opacity:1 ,stagger:0.20});

tl.to(".circle",{duration:.5, opacity:0 ,stagger:0.20});



var w = document.querySelector(".white");
var b = document.querySelector(".blue");
var r = document.querySelector(".red");
var y = document.querySelector(".yellow");
var lb = document.querySelector(".lblue");

var to1x = w.offsetLeft-b.offsetLeft;
var to1y = w.offsetTop-b.offsetTop;
var to2x = w.offsetLeft-r.offsetLeft;
var to2y = w.offsetTop-r.offsetTop;
var to3x = w.offsetLeft-y.offsetLeft;
var to3y = w.offsetTop-y.offsetTop;
var to4x = w.offsetLeft-lb.offsetLeft
var to4y = w.offsetTop-lb.offsetTop;




tl.to(".endtext",{duration:.5 ,opacity:1 , ease: "slow"});
tl.to(".endtext",{duration:.5 ,opacity:0 , ease: "slow"});
tl.to(".pagetransition",{duration:1 ,opacity:0 , ease: "slow",onComplete:function(){
    document.querySelector(".pagetransition").style.display = "none";
    // window.location.href = "/"
}});

    

}

// window.onresize = function(){ location.reload(); }

pagetransition();
