"use strict";

//retrieve canvas and 2d context
var cnvs = document.getElementById("cnvs");
var ctx = cnvs.getContext("2d");

//resizing boilerplate
function fitToScreen(){
    cnvs.width = innerWidth;
    cnvs.height = innerHeight;
}
fitToScreen();
window.addEventListener("resize", fitToScreen);

startup();

//cam position
var cam = {x: 0, y: -5, z: 0, yaw: 0, pitch: 0, roll: 0, fov: 60};
//sensitivity of mouse movement
var sens = 10;


var world = [
{verts: [{x: -1, y: 0, z: 0}, {x: 1, y: 0, z: 0}, {x: 0, y: 0, z: Math.sqrt(3)}], col: "red"}
];


cnvs.onclick = () => cnvs.requestPointerLock();

document.addEventListener("pointerlockchange", function(){
    if (document.pointerLockElement == cnvs){
        document.addEventListener("mousemove", mm);
    } else {
        document.removeEventListener("mousemove", mm);
    }
})

function mm(e){
    cam.yaw += e.movementX / sens;
    cam.pitch -= e.movementY / sens;
    render(world, cam, cnvs, false);
}

function startup(){
    ctx.fillStyle = "white";
    ctx.font = "50px monospace";
    ctx.textAlign = "center";
    ctx.fillText("click to start", cnvs.width / 2, cnvs.height / 2);
}
