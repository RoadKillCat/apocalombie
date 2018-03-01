"use strict";

//retrieve canvas and 2d context
var cnvs = document.getElementById("cnvs");
var ctx = cnvs.getContext("2d");

/*** VARIABLES ***/

/* GENERAL */

//cam position
var cam = {x: 0, y: 0, z: 3.5, yaw: 0, pitch: 0, roll: 0, fov: 50};
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
 - xc : x's colour
 - hn : nose height
*/

//head
var hh = 0.4;
var hw = 0.5;
var ht = 0.8;
var hn = 0.15;
var hcb = "#e30";
var hcs = "#f41";

//torso
var th = 1.7;
var tw = 1;
var tt = 0.3;
var tcf = "#d98";
var tcb = "#c65";
var tcs = "#c54";

//legs
var lh = 2;
var lw = 0.4;
var lco = "#c54";
var lci = "#a32";

//arms
var al = 1.5;
var ah = 0.3;
var aw = 0.25;
var aco = "#d76";
var aci = "#a32";

var zomb = [
//head
{verts: [{x: 0,    y: 0, z: lh+th   }, {x: -hw/2, y: 0, z: lh+th+hh}, {x: hw/2, y: 0,  z: lh+th+hh}], col: hcb},
{verts: [{x: 0,    y: 0, z: lh+th   }, {x:  hw/2, y: 0, z: lh+th+hh}, {x: 0,    y: ht, z: lh+th+hn}], col: hcs},
{verts: [{x: 0,    y: 0, z: lh+th   }, {x: -hw/2, y: 0, z: lh+th+hh}, {x: 0,    y: ht, z: lh+th+hn}], col: hcs},
{verts: [{x: hw/2, y: 0, z: lh+th+hh}, {x: -hw/2, y: 0, z: lh+th+hh}, {x: 0,    y: ht, z: lh+th+hn}], col: hcs}, 
//torso
{verts: [{x: -tw/2, y: 0,  z: lh   }, {x: -tw/2, y: 0,  z: lh+th}, {x:  tw/2, y: 0,  z: lh+th}, {x:  tw/2, y: 0,  z: lh   }], col: tcb},
{verts: [{x:  tw/2, y: tt, z: lh   }, {x:  tw/2, y: tt, z: lh+th}, {x:  tw/2, y: 0,  z: lh+th}, {x:  tw/2, y: 0,  z: lh   }], col: tcs},
{verts: [{x: -tw/2, y: 0,  z: lh   }, {x: -tw/2, y: 0,  z: lh+th}, {x: -tw/2, y: tt, z: lh+th}, {x: -tw/2, y: tt, z: lh   }], col: tcs},
{verts: [{x: -tw/2, y: tt, z: lh   }, {x: -tw/2, y: tt, z: lh+th}, {x:  tw/2, y: tt, z: lh+th}, {x:  tw/2, y: tt, z: lh   }], col: tcf},
{verts: [{x: -tw/2, y: 0,  z: lh+th}, {x: -tw/2, y: tt, z: lh+th}, {x:  tw/2, y: tt, z: lh+th}, {x:  tw/2, y: 0,  z: lh+th}], col: tcs},
{verts: [{x: -tw/2, y: 0,  z: lh   }, {x: -tw/2, y: tt, z: lh   }, {x:  tw/2, y: tt, z: lh   }, {x:  tw/2, y: 0,  z: lh   }], col: tcs},
//legs
{verts: [{x: -tw/2, y: 0,  z: lh}, {x: -tw/2,    y: tt,   z: lh}, {x: -tw/2, y: tt/2, z: lh}], col: lco},
{verts: [{x: -tw/2, y: 0,  z: lh}, {x: -tw/2,    y: tt,   z: lh}, {x: -tw/2, y: tt/2, z: 0 }], col: lco},
{verts: [{x: -tw/2, y: tt, z: lh}, {x: -tw/2+lw, y: tt/2, z: lh}, {x: -tw/2, y: tt/2, z: 0 }], col: lci},
{verts: [{x: -tw/2, y: 0,  z: lh}, {x: -tw/2+lw, y: tt/2, z: lh}, {x: -tw/2, y: tt/2, z: 0 }], col: lci},
//////
{verts: [{x:  tw/2, y: 0,  z: lh}, {x:  tw/2,    y: tt,   z: lh}, {x: tw/2-lw, y: tt/2, z: lh}], col: lco},
{verts: [{x:  tw/2, y: 0,  z: lh}, {x:  tw/2,    y: tt,   z: lh}, {x: tw/2,    y: tt/2, z: 0 }], col: lco},
{verts: [{x:  tw/2, y: tt, z: lh}, {x:  tw/2-lw, y: tt/2, z: lh}, {x: tw/2,    y: tt/2, z: 0 }], col: lci},
{verts: [{x:  tw/2, y: 0,  z: lh}, {x:  tw/2-lw, y: tt/2, z: lh}, {x: tw/2,    y: tt/2, z: 0 }], col: lci},
//arms
{verts: [{x: -tw/2, y: 0,  z: lh+th},      {x: -tw/2, y: 0,  z: lh+th-ah},   {x: -tw/2-aw, y: 0,  z: lh+th-ah/2}], col: aco},  
{verts: [{x: -tw/2, y: 0,  z: lh+th},      {x: -tw/2, y: 0,  z: lh+th-ah},   {x: -tw/2,    y: al, z: lh+th-ah/2}], col: aci},  
{verts: [{x: -tw/2, y: 0,  z: lh+th},      {x: -tw/2, y: al, z: lh+th-ah/2}, {x: -tw/2-aw, y: 0,  z: lh+th-ah/2}], col: aco},  
{verts: [{x: -tw/2, y: al, z: lh+th-ah/2}, {x: -tw/2, y: 0,  z: lh+th-ah},   {x: -tw/2-aw, y: 0,  z: lh+th-ah/2}], col: aco},  
//////
{verts: [{x:  tw/2, y: 0,  z: lh+th},      {x:  tw/2, y: 0,  z: lh+th-ah},   {x:  tw/2+aw, y: 0,  z: lh+th-ah/2}], col: aco},  
{verts: [{x:  tw/2, y: 0,  z: lh+th},      {x:  tw/2, y: 0,  z: lh+th-ah},   {x:  tw/2,    y: al, z: lh+th-ah/2}], col: aci},  
{verts: [{x:  tw/2, y: 0,  z: lh+th},      {x:  tw/2, y: al, z: lh+th-ah/2}, {x:  tw/2+aw, y: 0,  z: lh+th-ah/2}], col: aco},  
{verts: [{x:  tw/2, y: al, z: lh+th-ah/2}, {x:  tw/2, y: 0,  z: lh+th-ah},   {x:  tw/2+aw, y: 0,  z: lh+th-ah/2}], col: aco},  
]

var no_zombs = 1;

var zombies = [];

function new_zomb(){
    zombies.push({
        x: 0,
        y: 10,
        z: 0,
        yaw: 0
    })
}

new_zomb();


/*** STARTING FUNCTIONS ***/

//scale canvas to screen size
fts();
//display start up screen
startup();


function update(){
    render(construct_world(), cam, cnvs, wireframe);
    circle(cnvs.width / 2, cnvs.height / 2, 10);
}

function construct_world(){
    var faces = [];
    for (var i = 0; i < zombies.length; i++){
        var z = zombies[i];
        faces = faces.concat(zomb.map(f => ({verts: f.verts.map(zAxisRotate(z.yaw))
                                                           .map(translate(z.x, z.y, z.z)),
                                             col: f.col})));
    }
    return faces;
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

/*** BASIC SCREEN RESIZE ***/

window.addEventListener("resize", function(){
    fts();
    update();
});

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
        var z = zombies[i];
        var r = zomb.map(f => ({verts: f.verts.map(zAxisRotate(z.yaw)).map(translate(z.x, z.y, z.z)), col: f.col}));
        if (in_scope(r)){
            zombies.splice(i, 1);
            zombies.push({
                x: Math.random() * 10,
                y: Math.random() * 10,
                z: 0,
                yaw: 0
            });
        }
    }
    update();
}
setInterval(update, 10);

function mm(e){
    cam.yaw += e.movementX / sens;
    cam.pitch -= e.movementY / sens;
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

function in_scope(obj){
    var faces = obj.map(f => f.verts);
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

//fit to screen
function fts(){
    cnvs.width = innerWidth;
    cnvs.height = innerHeight;
}
