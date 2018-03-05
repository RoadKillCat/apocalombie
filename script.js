"use strict";

//retrieve canvases and 2d contexts
var cnvs = document.getElementById("cnvs");
var ctx = cnvs.getContext("2d");
var mcnvs = document.getElementById("mcnvs"); //map
var mctx = mcnvs.getContext("2d");

//retrieve sensitivity slider
var sens_sldr = document.getElementById("sens_sldr");

/*************************************************
                     VARIABLES
**************************************************/

/***************general/random*********************/
//id of the animation frame
var update_id;
//have they clicked start?
var in_play = false;
//wirerame?
var wireframe = false;
//set of keys currently being pressed
var pressed_keys = new Set();

/******************timings************************/
//time, in milliseconds, of start
var time_start;
//time, in milliseconds, of last animation frame
var time_last_ms;
//time difference, in seconds, from last anim. frame
var time_diff_s;
//time of last kill, in milliseconds
var time_kill_ms;
//padding of time display
var time_p = 5;

/******************crosshairs**********************/
//crosshair height
var cross_h = 20;
//crosshair cam padding
var cross_p = 2;
//crosshair font
var cross_f = "8px monospace";

/**********************map**************************/
//how many times smaller than the whole screen
var msize = 4;
//scale of the map
var mscale = 4;
///gap, in units, between each ring
var ring_gap = 4;
//radii of zombie red dots
var zomb_r = 4;

/*******************scoring*************************/
//score increase from killing a zomb
var scr_incr = 1000;
//duration of scr
var scr_dur = 400;

/********************player*************************/
//starting (cam) position
var cam = {x: 0, y: 0, z: 3.5, yaw: 0, pitch: 0, roll: 0, fov: 50};
//sensitivity of mouse movement
var sens = 8;
//speed, units per second
var spd = 12;

//jump
var jump_height = 7;
var jump_spd =  16;    //units per second
var jump_mscale = 1.1; //map scale jump multiplier
var jumping = false;
var jump_dir;
var jump_rest;
var jump_peak;

/********************zombie*************************/
//min and max spawn distances, in units, from player
var min_spwn = 12;
var max_spwn = 32;
var zomb_kill_dst = 4;  //units *from feet*
var zomb_spd = 4;       //units per second
var zomb_turn_spd = 60; //degrees per second

//maximum alowed, otherwise rendering slows down a lot
var max_zombies = 48;

//array to store coordinates of zombos
var zombies = [];

function new_zomb(){
    let y = Math.random() * Math.PI * 2;
    let d = min_spwn + Math.random() * (max_spwn - min_spwn);
    zombies.push({
        x: cam.x + Math.cos(y) * d,
        y: cam.y + Math.sin(y) * d,
        z: 0,
        yaw: Math.random() * 360 - 180
    })
}

new_zomb();


/*** STARTING FUNCTIONS ***/

//scale canvas to screen size
fts();
//display start up screen
startup();

console.log("THINK WE CAM CHEAT, DO WE ?");
console.log("p.s. jokes on you, ich habe diene IP");

function update(time){
    time_diff_s  = time_last_ms ? (time - time_last_ms) / 1000 : 0;
    time_last_ms = time;

    update_zombs();
    handle_keys();
    incr_jump();
    minimap();
    zengine.render(construct_world(), cam, cnvs, wireframe);
    crosshairs();
    disp_score(time);
    
    if (!am_i_dead())
    update_id = requestAnimationFrame(update);
}


/**********************************
        EVENT LISTENERS
**********************************/

/*** BASIC SCREEN RESIZE ***/

window.addEventListener("resize", fts);

function fts(){
    cnvs.width = innerWidth;
    cnvs.height = innerHeight;
    mcnvs.width = innerWidth / msize;
    mcnvs.height = innerHeight / msize;
}

/*** KEYBOARD EVENTS ***/

document.addEventListener("keypress", kd);
document.addEventListener("keyup", ku);

//note to self, make anonymous if still one line after a couple of revs
function kd(e){
    if ('f'.includes(e.key)){
        switch (e.key){
            case 'f':
                wireframe = !wireframe;
            break;
        }
    } else {
        pressed_keys.add(e.key);
    }
}

function ku(e){
    pressed_keys.delete(e.key);
}

function step(angle){
    //step distance
    let sd= spd * time_diff_s;
    cam.x += Math.sin(zengine.to_rad(cam.yaw + angle)) * sd;
    cam.y += Math.cos(zengine.to_rad(cam.yaw + angle)) * sd;
}

function handle_keys(tds){
    for (let k of pressed_keys){
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
/*            case 'z':
                cam.z += 0.5;
                break;
            case 'x':
                cam.z -= 0.5;
                break;*/
        }
    }
}

/***  MOUSE EVENTS ***/

cnvs.onclick = function(){
    if (in_play) return;
    cnvs.requestPointerLock();
}

document.addEventListener("pointerlockchange", function(){
    if (document.pointerLockElement == cnvs){
        in_play = true;
        mcnvs.style.display = "block";
        sens_sldr.style.display="none";
        time_start = time_last_ms = performance.now();
        update_id = requestAnimationFrame(update);
        document.addEventListener("mousemove", mm);
        document.addEventListener("click", mc);
    } else {
        in_play = false;
        cancelAnimationFrame(update_id);
        document.removeEventListener("mousemove", mm);
        document.removeEventListener("mouseclick", mc);
    }
})

function mc(e){
    if (e.button) return;
    var ordered_zombs = zombies.sort((a, b) => zengine.distance(a, cam) - zengine.distance(b, cam));
    for (let i = 0; i < zombies.length; i++){
        let z = ordered_zombs[i];
        if (zengine.dot_prod({x: z.x - cam.x, y: z.y - cam.y, z: z.z - cam.z},
                      {x: Math.sin(zengine.to_rad(cam.yaw)) * Math.cos(zengine.to_rad(cam.pitch)),
                       y: Math.cos(zengine.to_rad(cam.yaw)) * Math.cos(zengine.to_rad(cam.pitch)),
                       z: Math.sin(zengine.to_rad(cam.pitch))
                      }) > 0 &&
            in_scope(zomb.map(f => f.verts.map(zengine.z_axis_rotate(-z.yaw))
                                          .map(zengine.translate(z.x, z.y, z.z))))
            ){
            console.log("shot, zombo", i);
            zombies.splice(i, 1);
            new_zomb();
            if (zombies.length < max_zombies) new_zomb();
            time_kill_ms = performance.now();
            time_start -= scr_incr;
            break; //only one kill per shot!
        }
    }
}

function mm(e){
    cam.yaw += e.movementX * sens / 32;
    cam.yaw += cam.yaw < -180 ? 360 : cam.yaw > 180 ? -360 : 0;
    cam.pitch -= e.movementY * sens / 32;
    cam.pitch += cam.pitch < -180 ? 360 : cam.pitch > 180 ? -360 : 0;
}

/********************************
       OTHER FUNCTIONS
********************************/

function startup(){
    ctx.clearRect(0, 0, cnvs.width, cnvs.height);
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.strokeStyle = ctx.fillStyle = "#f11";
    ctx.strokeRect(cnvs.width/2-500, cnvs.height/2-200, 1000, 300);
    ctx.font = "80px monospace";
    ctx.fillText("apocalombie", cnvs.width / 2, cnvs.height / 2 - 100);
    ctx.fillStyle = "#fff";
    ctx.font = "20px monospace";
    ctx.fillText("controls: wasd & space", cnvs.width / 2, cnvs.height / 2);
    ctx.fillText("click to begin", cnvs.width / 2, cnvs.height / 2 + 30);
    sens_sldr.style.width = 400;
    sens_sldr.style.top = cnvs.height / 2 + 120;
    sens_sldr.style.left = cnvs.width / 2 - 200; // sub half of sldr width
    ctx.fillText("sensitivity:" + sens.toString().padStart(3), cnvs.width / 2, cnvs.height / 2 + 155);
    ctx.font = "8px monospace";
    ctx.fillText("DISCLAIMER: by having this game open, you accept full responsibility for the playing of this game", cnvs.width / 2, cnvs.height - 20);
}


function crosshairs(){
    ctx.strokeStyle = ctx.fillStyle = "#0f0";
    ctx.beginPath();
    ctx.moveTo(cnvs.width/2 - cross_h, cnvs.height/2);
    ctx.lineTo(cnvs.width/2 + cross_h, cnvs.height/2);
    ctx.moveTo(cnvs.width/2, cnvs.height/2 - cross_h);
    ctx.lineTo(cnvs.width/2, cnvs.height/2 + cross_h);
    ctx.stroke();
    ctx.font = cross_f;
    ctx.textBaseline = "middle"; ctx.textAlign = "left";
    ctx.fillText((parseInt(cam.pitch*10)/10).toString(), cnvs.width/2 + cross_h + cross_p, cnvs.height/2);
    ctx.textBaseline = "top"; ctx.textAlign = "center";
    ctx.fillText((parseInt(cam.yaw*10)/10).toString(),   cnvs.width/2, cnvs.height/2 + cross_h + cross_p);
}

function in_polygon(p, poly){
    //bounding box quick check
    let min_x = poly[0].x;
    let max_x = poly[0].x;
    let min_y = poly[0].y;
    let max_y = poly[0].y;
    for (let i = 1; i < poly.length; i++){
        min_x = Math.min(min_x, poly[i].x);
        max_x = Math.max(max_x, poly[i].x);
        min_y = Math.min(min_y, poly[i].y);
        max_y = Math.max(max_y, poly[i].y);
    }
    if (p.x < min_x || p.x > max_x || p.y < min_y || p.y > max_y) return false;
    //if passed bounding box, try ray casting
    let inside = false;
    for (let i = 0; i < poly.length; i++){
        let j = i < poly.length - 1 ? i + 1 : 0;
        //check if crosses line and if that cross is to the right of the point
        if ((poly[i].y < p.y && poly[j].y > p.y || poly[i].y > p.y && poly[j].y < p.y) &&
            p.x < ((p.y - poly[i].y) * (poly[j].x - poly[i].x)) / (poly[j].y - poly[i].y) + poly[i].x){
            inside = !inside;
        }
    }
    return inside;
}

function in_scope(faces){
    for (let f = 0; f < faces.length; f++){
        let aligned = faces[f].map(zengine.translate(-cam.x, -cam.y, -cam.z))
                              .map(zengine.z_axis_rotate(zengine.to_rad(cam.yaw)))
                              .map(zengine.y_axis_rotate(zengine.to_rad(cam.roll)))
                              .map(zengine.x_axis_rotate(zengine.to_rad(cam.pitch)))
                              .map(zengine.translate(cam.x, cam.y, cam.z));

        let face2d = aligned.map(c => (
        {x: zengine.to_deg(Math.atan2(c.x - cam.x, c.y - cam.y)),
         y: zengine.to_deg(Math.atan2(c.z - cam.z, c.y - cam.y))
        }));
        
        if (in_polygon({x: 0, y: 0}, face2d)) return true;
    }
    return false;
}

function minimap(){
    let mscale_t = mscale * (jumping ? jump_mscale : 1);
    mctx.clearRect(0, 0, mcnvs.width, mcnvs.height);
    for (let i = 0; i < zombies.length; i++){
        mctx.beginPath();
        let c = zengine.z_axis_rotate(zengine.to_rad(cam.yaw))(
                zengine.translate(-cam.x, -cam.y, 0)(zombies[i]))
        mctx.arc(mcnvs.width/2  + c.x * mscale_t,
                 mcnvs.height/2 - c.y * mscale_t, zomb_r, 0, Math.PI * 2);
        if (wireframe){
            mctx.stroke();
        } else {
            mctx.fillStyle = "#f33";
            mctx.fill();
        }
    }
    
    mctx.beginPath();
    mctx.moveTo(mcnvs.width/2, mcnvs.height/2);
    mctx.lineTo(mcnvs.width/2 + Math.sin(zengine.to_rad(cam.fov)/2) * mcnvs.height / 2, 0);
    mctx.lineTo(mcnvs.width/2 - Math.sin(zengine.to_rad(cam.fov)/2) * mcnvs.height / 2, 0);
    mctx.closePath();
    if (wireframe){
        mctx.strokeStyle = "white";
        mctx.stroke();
    } else {
        mctx.fillStyle = "rgba(0, 255, 200, 0.2)";
        mctx.fill();
    }

    mctx.strokeStyle = "white";
    for (let r = mscale_t * ring_gap;
         r < Math.sqrt(Math.pow(mcnvs.width/2, 2) + Math.pow(mcnvs.height/2, 2));
         r += mscale_t * ring_gap){
        mctx.beginPath();
        mctx.arc(mcnvs.width/2, mcnvs.height/2, r, 0, Math.PI * 2);
        mctx.stroke();
    }
}

function disp_score(time){
    ctx.fillStyle = "#fff";
    ctx.font = "20px monospace";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(parseInt(time - time_start).toString(), time_p, time_p);
    if (time - time_kill_ms < scr_dur){
        ctx.fillStyle = "#fd5";
        ctx.fillText("+"+scr_incr.toString(), time_p, time_p*2 + 20);
    }
}    

function disp_death(){
    ctx.fillStyle = "#f004";
    ctx.fillRect(0, 0, cnvs.width, cnvs.height);
    ctx.fillStyle = "#fff";
    ctx.font = "20px monospace";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("you have been eaten; f5 to resurrect", cnvs.width / 2, cnvs.height / 2 - 32);
}

function am_i_dead(){
    for (let i = 0; i < zombies.length; i++){
        if (zengine.distance(cam, zombies[i]) < zomb_kill_dst){
            disp_death();
            document.exitPointerLock();
            return true;
         }
    }
    return false;
}

function update_zombs(){
    zombies = zombies.map(function (z){
        ///step and turn intervals
        let si = zomb_spd * time_diff_s
        let ti = zomb_turn_spd * time_diff_s;
        //angle to camera from y-axis
        let atc = zengine.to_deg(Math.atan2(cam.x - z.x, cam.y - z.y)); 
        //camera offset
        let co = atc - z.yaw;
        //remove overflows
        co += co < -180 ? 360 : co > 180 ? -360 : 0;
        if (-ti < co && co < ti){
            return {x: z.x + si * Math.sin(zengine.to_rad(atc)),
                    y: z.y + si * Math.cos(zengine.to_rad(atc)), 
                    z: z.z, yaw: atc};
        } else {
            return {x: z.x, y: z.y, z: z.z,
                    yaw: z.yaw + ti * (co> 0 ? 1 : -1)};
        }
    });
}

function construct_world(){
    let faces = [];
    for (let i = 0; i < zombies.length; i++){
        let z = zombies[i];
        faces = faces.concat(zomb.map(f => ({verts: f.verts.map(zengine.z_axis_rotate(zengine.to_rad(-z.yaw)))
                                                           .map(zengine.translate(z.x, z.y, z.z)),
                                             col: f.col})));
    }
    return faces;
}

function incr_jump(){
    if (!jumping) return;
    //next z pos
    let nz = cam.z + jump_spd * time_diff_s * jump_dir;
    if (nz > jump_peak){
        if (pressed_keys.has("q")) jumping = false;
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
