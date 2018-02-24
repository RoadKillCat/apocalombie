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
var cam = {x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, fov: 70};
//sensitivity of mouse movement
var sens = 2;


var zomb = [
{verts: [{x: -0.5, y: 0, z: 0}, {x: -0.5, y: 0, z: 1.7}, {x: 0.5, y: 0, z: 1.7}, {x: 0.5, y: 0, z: 0}], col: "#43e"},
{verts: [{x: 0, y: 0, z: 1.7}, {x: -0.4, y: 0, z: 2.392}, {x: 0.4, y: 0, z: 2.392}], col: "#d43"}
]

var no_zombs = 1;

var zombies = [];

for (var i = 0; i < no_zombs; i++){
    zombies.push(zomb.map(f=>({
        verts: f.verts.map(translate(0, 10, 0)),
        col: f.col
    })));
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
            console.log("edge between:", poly[i], poly[j]);
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

function construct_world(parts){
    var world = [];
    for (var i = 0; i < parts.length; i++){
        for (var f = 0; f < parts[i].length; f++){
            world.push(parts[i][f]);
        }
    }
    return world;
}

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

function update(){
    render(construct_world(zombies), cam, cnvs, false);
    circle(cnvs.width / 2, cnvs.height / 2, 10); 
}

function mm(e){
    cam.yaw += e.movementX / sens;
    cam.pitch -= e.movementY / sens;
    update();
}

function startup(){
    ctx.fillStyle = "white";
    ctx.font = "50px monospace";
    ctx.textAlign = "center";
    ctx.fillText("click to start", cnvs.width / 2, cnvs.height / 2);
}

function circle(x, y, r){
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

