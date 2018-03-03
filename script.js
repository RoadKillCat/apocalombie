"use strict";

//retrieve canvas and 2d context
var cnvs = document.getElementById("cnvs");
var ctx = cnvs.getContext("2d");

/*** VARIABLES ***/

/* GENERAL */

//cam position
var cam = {x: 0, y: 0, z: 3.5, yaw: 0, pitch: 0, roll: 0, fov: 50};
//time, in microseconds, of last animation frame
var time_last_ms;
//time difference, in seconds, from last anim. frame
var time_diff_s;
//set of keys currently being pressed
var pressed_keys = new Set();

/* SETTINGS */

var wireframe = false;


/* PLAYER */

//sensitivity of mouse movement
var sens = 8;
//speed, units per second
var spd = 4;

//jump
var jump_height = 3;
var jump_spd =  8;    //units per second
var jumping = false;
var jump_dir;
var jump_rest;
var jump_peak;


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


function update(time){
    time_diff_s  = time_last_ms ? (time - time_last_ms) / 1000 : 0;
    time_last_ms = time;

    handle_keys();
    incr_jump();
    zengine.render(construct_world(), cam, cnvs, wireframe);
    circle(cnvs.width / 2, cnvs.height / 2, 10);

    requestAnimationFrame(update);
}

function handle_keys(tds){
    for (var k of pressed_keys){
        switch (k){
            case 'w':
                step(0);
                break;
            case 'a':
                step(-90);
                break;
            case 's':
                step(180);
                break;
            case 'd':
                step(90);
                break;
            case ' ':
                if (!jumping) jump();
                break;
            case 'f':
                wireframe = !wireframe;
                break;
            case 'z':
                cam.z += 0.5;
                break;
            case 'x':
                cam.z -= 0.5;
                break;
        }
    }
}

function construct_world(){
    var faces = [];
    for (var i = 0; i < zombies.length; i++){
        var z = zombies[i];
        faces = faces.concat(zomb.map(f => ({verts: f.verts.map(zengine.z_axis_rotate(z.yaw))
                                                           .map(zengine.translate(z.x, z.y, z.z)),
                                             col: f.col})));
    }
    return faces;
}

function incr_jump(){
    if (!jumping) return;
    //next z pos
    var nz = cam.z + jump_spd / time_diff_s * jump_dir;
    if (nz > jump_peak){
        cam.z = jump_peak;
        jump_dir = -1;
    } else if (nz < jump_rest){
        cam.z = jump_rest;
        jumping = false;
    } else {
        cam.z = nz;
    }
}


function jump(){
    //going up
    jump_dir = 1;
    //store resting height
    jump_rest = cam.z;
    //set goal
    jump_peak = jump_rest + jump_height;
    //we're jumping
    jumping = true;
}

/**********************************
        EVENT LISTENERS
**********************************/

/*** BASIC SCREEN RESIZE ***/

window.addEventListener("resize", fts);

function fts(){
    cnvs.width = innerWidth;
    cnvs.height = innerHeight;
}

/*** KEYBOARD EVENTS ***/


document.addEventListener("keypress", kd);
document.addEventListener("keyup", ku);


//note to self, make anonymous if still one line after a couple of revs
function kd(e){
    pressed_keys.add(e.key);
}

function ku(e){
    pressed_keys.delete(e.key);
}

function step(angle){
    //step distance
    var sd= spd / fps * time_diff_s;
    cam.x += Math.sin(zengine.to_rad(cam.yaw + angle)) * sd;
    cam.y += Math.cos(zengine.to_rad(cam.yaw + angle)) * sd;
}

/***  MOUSE EVENTS ***/

cnvs.onclick = () => cnvs.requestPointerLock();

document.addEventListener("pointerlockchange", function(){
    if (document.pointerLockElement == cnvs){
        document.addEventListener("mousemove", mm);
        document.addEventListener("click", mc);
        requestAnimationFrame(update);
    } else {
        document.removeEventListener("mousemove", mm);
        document.removeEventListener("mouseclick", mc);
    }
})

function mc(){
    for (var i = 0; i < zombies.length; i++){
        var z = zombies[i];
        var r = zomb.map(f => ({verts: f.verts.map(zengine.z_axis_rotate(z.yaw)).map(zengine.translate(z.x, z.y, z.z)), col: f.col}));
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

function in_scope(obj){
    var faces = obj.map(f => f.verts);
    for (var f = 0; f < faces.length; f++){
        var aligned = faces[f].map(zengine.translate(-cam.x, -cam.y, -cam.z))
                              .map(zengine.z_axis_rotate(zengine.to_rad(cam.yaw)))
                              .map(zengine.y_axis_rotate(zengine.to_rad(cam.roll)))
                              .map(zengine.x_axis_rotate(zengine.to_rad(cam.pitch)))
                              .map(zengine.translate(cam.x, cam.y, cam.z));

        var face2d = aligned.map(c => (
        {x: zengine.to_deg(Math.atan2(c.x - cam.x, c.y - cam.y)),
         y: zengine.to_deg(Math.atan2(c.z - cam.z, c.y - cam.y))
        }));
        
        if (in_polygon({x: 0, y: 0}, face2d)) return true;
    }
    return false;
}
