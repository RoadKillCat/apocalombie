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


/* GENERAL */

//cam position
var cam = {x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, fov: 70};
//frames per second
var fps = 60;

/* SETTINGS */

var wireframe = false;


/* PLAYER */

//sensitivity of mouse movement
var sens = 8;
//speed, units per second
var spd = 10;

//jump
var jump_height = 3;
var jump_spd =  8;    //units per second
var jumping = false;

/* ZOMBIE */

/*
key:
 - xh : x's height
 - xw : x's width
 - xt : x's thickness
 - hn : nose height
*/

//head
var hh = 0.7;
var hw = 0.7;
var ht = 0.8;
var hn = 0.4;

//torso
var th = 1.7;
var tw = 1;
var tt = 0.3;

//legs
var lh = 2;
var lw = 0.4;

var zomb = [
//head
{verts: [{x: 0, y: 0,  z: lh+th   }, {x: -hw/2, y: 0,  z: lh+th+hh}, {x: hw/2, y: 0,  z: lh+th+hh}], col: "#d43"},
{verts: [{x: 0, y: 0,  z: lh+th   }, {x: 0,     y: ht, z: lh+th+hn}, {x: hw/2, y: 0,  z: lh+th+hh}], col: "#d43"},
{verts: [{x: 0, y: 0,  z: lh+th   }, {x: -hw/2, y: 0,  z: lh+th+hh}, {x: 0,    y: ht, z: lh+th+hn}], col: "#d43"},
{verts: [{x: 0, y: ht, z: lh+th+hn}, {x: -hw/2, y: 0,  z: lh+th+hh}, {x: hw/2, y: 0,  z: lh+th+hh}], col: "#d43"},
//torso
{verts: [{x: -tw/2, y: 0,  z: lh   }, {x: -tw/2, y: 0,  z: lh+th}, {x:  tw/2, y: 0,  z: lh+th}, {x:  tw/2, y: 0,  z: lh   }], col: "#43e"},
{verts: [{x:  tw/2, y: tt, z: lh   }, {x:  tw/2, y: tt, z: lh+th}, {x:  tw/2, y: 0,  z: lh+th}, {x:  tw/2, y: 0,  z: lh   }], col: "#43e"},
{verts: [{x: -tw/2, y: 0,  z: lh   }, {x: -tw/2, y: 0,  z: lh+th}, {x: -tw/2, y: tt, z: lh+th}, {x: -tw/2, y: tt, z: lh   }], col: "#43e"},
{verts: [{x: -tw/2, y: tt, z: lh   }, {x: -tw/2, y: tt, z: lh+th}, {x:  tw/2, y: tt, z: lh+th}, {x:  tw/2, y: tt, z: lh   }], col: "#43e"},
{verts: [{x: -tw/2, y: 0,  z: lh+th}, {x: -tw/2, y: tt, z: lh+th}, {x:  tw/2, y: tt, z: lh+th}, {x:  tw/2, y: 0,  z: lh+th}], col: "#43e"},
{verts: [{x: -tw/2, y: 0,  z: lh   }, {x: -tw/2, y: tt, z: lh   }, {x:  tw/2, y: tt, z: lh   }, {x:  tw/2, y: 0,  z: lh   }], col: "#43e"},
//legs
{verts: [{x: -tw/2,    y: 0,  z: lh}, {x: -tw/2,    y: tt, z: lh}, {x:  -tw/2+lw, y: tt, z: lh}, {x: -tw/2+lw, y: 0, z: lh}], col: "#43e"},
{verts: [{x: -tw/2,    y: 0,  z: lh}, {x: -tw/2,    y: tt, z: lh}, {x: -tw/2, y: tt/2, z: 0}], col: "#43e"},
{verts: [{x: -tw/2,    y: tt, z: lh}, {x: -tw/2+lw, y: tt, z: lh}, {x: -tw/2, y: tt/2, z: 0}], col: "#43e"},
{verts: [{x: -tw/2+lw, y: tt, z: lh}, {x: -tw/2+lw, y: 0,  z: lh}, {x: -tw/2, y: tt/2, z: 0}], col: "#43e"},
{verts: [{x: -tw/2,    y: 0,  z: lh}, {x: -tw/2+lw, y: 0,  z: lh}, {x: -tw/2, y: tt/2, z: 0}], col: "#43e"},
//////
{verts: [{x: tw/2,    y: 0,  z: lh}, {x: tw/2,    y: tt, z: lh}, {x: tw/2-lw, y: tt, z: lh},  {x: tw/2-lw, y: 0,  z: lh}], col: "#43e"},
{verts: [{x: tw/2,    y: 0,  z: lh}, {x: tw/2,    y: tt, z: lh}, {x: tw/2, y: tt/2, z: 0}], col: "#43e"},
{verts: [{x: tw/2,    y: tt, z: lh}, {x: tw/2-lw, y: tt, z: lh}, {x: tw/2, y: tt/2, z: 0}], col: "#43e"},
{verts: [{x: tw/2-lw, y: tt, z: lh}, {x: tw/2-lw, y: 0,  z: lh}, {x: tw/2, y: tt/2, z: 0}], col: "#43e"},
{verts: [{x: tw/2,    y: 0,  z: lh}, {x: tw/2-lw, y: 0,  z: lh}, {x: tw/2, y: tt/2, z: 0}], col: "#43e"},


//{verts: [{x:  tw/2, y: 0,  z: 0},  {x:  tw/2, y: tt, z: 0},  {x:   tw/2-lw, y: tt, z: 0},  {x:  tw/2-lw, y: 0,  z: 0 }], col: "#43e"},

]

var no_zombs = 1;

var zombies = [];

for (var i = 0; i < no_zombs; i++){
    zombies.push(zomb.map(f=>({
        verts: f.verts.map(translate(0, 10, 0)),
        col: f.col
    })));
}


function update(){
    render(construct_world(zombies), cam, cnvs, wireframe);
    circle(cnvs.width / 2, cnvs.height / 2, 10);
}

function construct_world(parts){
    var world = [];
    for (var i = 0; i < parts.length; i++){
        for (var f = 0; f < parts[i].length; f++){
            world.push(parts[i][f]);
        }
    }
    return world;
}

function jump(){
    if (jumping) return;
    //going up
    var jump_dir = 1;
    //set goal
    var jump_peak = cam.z + jump_height;
    //store resting height
    var jump_rest = cam.z;
    //jump interval
    var ji = jump_spd / fps;
    var u = function(){
        if (jump_dir == 1){
            if (cam.z > jump_peak){
                cam.z = jump_peak;
                jump_dir = -1;
            } else {
                cam.z += ji
            }
        } else {
            cam.z -= ji;
        }
        if (cam.z - ji >= jump_rest){
            setTimeout(u, 1000 / fps);
        } else {
            cam.z = jump_rest;
            jumping = false;
        }
        update();
    }
    jumping = true;
    u();
}
        


/**********************************
        EVENT LISTENERS
**********************************/

/*** KEYBOARD EVENTS ***/


document.addEventListener("keypress", kd);
document.addEventListener("keyup", ku);

//IDs for the setIntervals running on held keys
var key_ids = {};

function kd(e){
    var k = e.key;
    var wasd = {'w': 0, 'a': -90, 's': 180, 'd': 90};
    //if key is in 'wasd' and is not already being pressed
    if (wasd.hasOwnProperty(k) && !key_ids.hasOwnProperty(k)){
        var stp = function(){
            step(wasd[k]); 
            update();
        };
        stp();
        key_ids[k] = setInterval(stp, 1000 / fps);
    } else if (k == ' '){
        jump();
    } else if ('zx'.includes(k)){
        console.log('zx')
        cam.z += 0.5 * (k == 'z' ? 1 : -1);
        update();
    } else if (k == 'f') {
        wireframe = !wireframe;
        update();
    }
}

function ku(e){
    var k = e.key;
    if ('wasd'.includes(k)){
        clearInterval(key_ids[k]);
        delete key_ids[k];1
    }
}

function step(angle){
    var stride = spd / fps;
    cam.x += Math.sin(toRad(cam.yaw + angle)) * stride;
    cam.y += Math.cos(toRad(cam.yaw + angle)) * stride;
}

/***  MOUSE EVENTS ***/

cnvs.onclick = () => cnvs.requestPointerLock();

document.addEventListener("pointerlockchange", function(){
    if (document.pointerLockElement == cnvs){
        document.addEventListener("mousemove", mm);
        document.addEventListener("click", mc);
        update();
    } else {
        document.removeEventListener("mousemove", mm);
        document.removeEventListener("mouseclick", mc);
    }
})

function mc(){
    for (var i = 0; i < zombies.length; i++){
        if (in_scope(zombies[i])){
            zombies.splice(i, 1);
            var ra = Math.random() * Math.PI * 0.3;
            zombies.push(zomb.map(f=>({
            verts: f.verts.map(translate(0, 10, 0))
                          .map(zAxisRotate(ra)),
            col: f.col})));
        }
    }
    update();
}

function mm(e){
    cam.yaw += e.movementX / sens;
    cam.pitch -= e.movementY / sens;
    update();
}

/********************************
       OTHER FUNCTIONS
********************************/

function startup(){
    ctx.fillStyle = "white";
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("click to start wasd move, zx lower up and down, space single jump, f wireframe", cnvs.width / 2, cnvs.height / 2);
}

function circle(x, y, r){
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function in_polygon(p, poly){
    //bounding box quick check
    var min_x = poly[0].x;
    var max_x = poly[0].x;
    var min_y = poly[0].y;
    var max_y = poly[0].y;
    for (var i = 1; i < poly.length; i++){
        min_x = Math.min(min_x, poly[i].x);
        max_x = Math.max(max_x, poly[i].x);
        min_y = Math.min(min_y, poly[i].y);
        max_y = Math.max(max_y, poly[i].y);
    }
    if (p.x < min_x || p.x > max_x || p.y < min_y || p.y > max_y) return false;
    //if passed bounding box, try ray casting
    var inside = false;
    for (var i = 0; i < poly.length; i++){
        var j = i < poly.length - 1 ? i + 1 : 0;
        //check if crosses line and if that cross is to the right of the point
        if ((poly[i].y < p.y && poly[j].y > p.y || poly[i].y > p.y && poly[j].y < p.y) &&
            p.x < ((p.y - poly[i].y) * (poly[j].x - poly[i].x)) / (poly[j].y - poly[i].y) + poly[i].x){
            inside = !inside;
        }
    }
    return inside;
}

function in_scope(zomb){
    var faces = zomb.map(f => f.verts);
    for (var f = 0; f < faces.length; f++){
        var aligned = faces[f]
        .map(translate(-cam.x, -cam.y, -cam.z))
        .map(zAxisRotate(toRad(cam.yaw)))
        .map(yAxisRotate(toRad(cam.roll)))
        .map(xAxisRotate(toRad(cam.pitch)))
        .map(translate(cam.x,cam.y,cam.z));

        var face2d = aligned.map(c => (
        {x: toDeg(Math.atan2(c.x - cam.x, c.y - cam.y)),
         y: toDeg(Math.atan2(c.z - cam.z, c.y - cam.y))
        }));
        
        if (in_polygon({x: 0, y: 0}, face2d)) return true;
    }
    return false;
}
