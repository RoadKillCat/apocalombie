'use strict';

//retrieve canvases and 2d contexts
let cnvs = document.getElementById('cnvs');
let ctx = cnvs.getContext('2d');
let mcnvs = document.getElementById('mcnvs'); //map
let mctx = mcnvs.getContext('2d');

//retrieve sensitivity slider
let sens_sldr = document.getElementById('sens_sldr');

/*************************************************
                     VARIABLES
**************************************************/

/***************general/random*********************/
//id of the animation frame
let update_id;
//have they clicked start?
let in_play = false;
//wirerame?
let wireframe = false;
//horizon (how far can we see)
let horizon = 30
//set of keys currently being pressed
let pressed_keys = new Set();

/******************timings************************/
//time, in milliseconds, of start
let time_start;
//time, in milliseconds, of last animation frame
let time_last_ms;
//time difference, in seconds, from last anim. frame
let time_diff_s;
//time of last kill, in milliseconds
let time_kill_ms;
//padding of time display
let time_p = 5;

/******************crosshairs**********************/
//crosshair height
let cross_h = 20;
//crosshair cam padding
let cross_p = 2;
//crosshair font
let cross_f = '8px monospace';

/**********************map**************************/
//how many times smaller than the whole screen
let msize = 4;
//scale of the map
let mscale = 4;
///gap, in units, between each ring
let ring_gap = 4;
//radii of zombie red dots
let zomb_r = 4;

/*******************scoring*************************/
//score increase from killing a zomb
let scr_incr = 2000;
//duration of score popup
let scr_dur = 256;

/********************player*************************/
//starting (cam) position
let cam = {x: 0, y: 0, z: 3.5, yaw: 0, pitch: 0, roll: 0, fov: 50};
//sensitivity of mouse movement
let sens = 4;
//speed, units per second
let spd = 12;
//am dead?
let dead = false;

//jump
let jump_height = 7;
let jump_spd =  16;    //units per second
let jump_mscale = 1.1; //map scale jump multiplier
let jumping = false;
let jump_dir;
let jump_rest;
let jump_peak;

/********************zombie*************************/
//min and max spawn distances, in units, from player
let min_spwn = 20;
let max_spwn = 32;
let zomb_kill_dst = 4;  //units from cam to zombie's feet
let zomb_spd_start = 2; //units per second
let zomb_spd_max   = 4;   //units per second
let zomb_spd_incr  = 0.2; //every spawn increases max speed by this
let zomb_acc = 1;       //units per second ^ 2

let zomb_turn_spd = 60; //degrees per second

//maximum alowed, otherwise rendering slows down a lot
let max_zombies = 32;

//array to store coordinates of zombos
let zombies = [];

/*** STARTING FUNCTIONS ***/

//scale canvas to screen size
fts();
//display start up screen
startup();
//spawn the first zombie
spawn_zomb();

//troll
console.log('THINK WE CAM CHEAT, DO WE ?');
console.log('p.s. jokes on you, ich habe diene IP');

function update(time){
    time_diff_s  = time_last_ms ? (time - time_last_ms) / 1000 : 0;
    time_last_ms = time;

    update_zombs();
    handle_keys();
    incr_jump();
    minimap();
    zengine.render(construct_world(), cam, cnvs, wireframe, horizon);
    crosshairs();
    disp_score(time);
    disp_spds();
    am_i_dead();

    if (!dead)
    update_id = requestAnimationFrame(update);
}


/**********************************
        EVENT LISTENERS
**********************************/

/*** BASIC SCREEN RESIZE ***/

window.addEventListener('resize', fts);

function fts(){
    cnvs.width = innerWidth;
    cnvs.height = innerHeight;
    mcnvs.width = innerWidth / msize;
    mcnvs.height = innerHeight / msize;
}

/*** KEYBOARD EVENTS ***/

document.addEventListener('keypress', kd);
document.addEventListener('keyup', ku);

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
        }
    }
}

/***  MOUSE EVENTS ***/

cnvs.onclick = function(){
    if (in_play || dead) return;
    cnvs.requestPointerLock();
}

document.addEventListener('pointerlockchange', function(){
    if (document.pointerLockElement == cnvs){
        in_play = true;
        mcnvs.style.display = 'block';
        sens_sldr.style.display='none';
        time_start = time_last_ms = performance.now();
        update_id = requestAnimationFrame(update);
        document.addEventListener('mousemove', mm);
        document.addEventListener('click', mc);
    } else {
        in_play = false;
        cancelAnimationFrame(update_id);
        document.removeEventListener('mousemove', mm);
        document.removeEventListener('mouseclick', mc);
    }
})

function mc(e){
    if (e.button) return;
    let ordered_zombs = zombies.sort((a, b) => zengine.distance(a, cam) - zengine.distance(b, cam));
    for (let i = 0; i < zombies.length; i++){
        let z = ordered_zombs[i];
        if (zengine.dot_prod({x: z.x - cam.x, y: z.y - cam.y, z: z.z - cam.z},
                      {x: Math.sin(zengine.to_rad(cam.yaw)) * Math.cos(zengine.to_rad(cam.pitch)),
                       y: Math.cos(zengine.to_rad(cam.yaw)) * Math.cos(zengine.to_rad(cam.pitch)),
                       z: Math.sin(zengine.to_rad(cam.pitch))
                      }) > 0 &&
            in_scope(zomb.map(f => f.verts.map(zengine.z_axis_rotate(zengine.to_rad(-z.yaw)))
                                          .map(zengine.translate(z.x, z.y, z.z))))){
            zombies.splice(i, 1);
            spawn_zomb();
            if (zombies.length < max_zombies) spawn_zomb();
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
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.strokeStyle = ctx.fillStyle = '#f11';
    ctx.strokeRect(cnvs.width/2-500, cnvs.height/2-200, 1000, 300);
    ctx.font = '80px monospace';
    ctx.fillText('apocalombie', cnvs.width / 2, cnvs.height / 2 - 100);
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.fillText('controls: wasd & space', cnvs.width / 2, cnvs.height / 2);
    ctx.fillText('click to begin', cnvs.width / 2, cnvs.height / 2 + 30);
    sens_sldr.style.width = 400;
    sens_sldr.style.top = cnvs.height / 2 + 120;
    sens_sldr.style.left = cnvs.width / 2 - 200; // sub half of sldr width
    ctx.fillText('sensitivity:' + sens.toString().padStart(3), cnvs.width / 2, cnvs.height / 2 + 155);
    ctx.font = '8px monospace';
    ctx.fillText('DISCLAIMER: by having this game open, you accept full responsibility for the playing of this game', cnvs.width / 2, cnvs.height - 20);
}


function crosshairs(){
    ctx.strokeStyle = ctx.fillStyle = '#0f0';
    ctx.beginPath();
    ctx.moveTo(cnvs.width/2 - cross_h, cnvs.height/2);
    ctx.lineTo(cnvs.width/2 + cross_h, cnvs.height/2);
    ctx.moveTo(cnvs.width/2, cnvs.height/2 - cross_h);
    ctx.lineTo(cnvs.width/2, cnvs.height/2 + cross_h);
    ctx.stroke();
    ctx.font = cross_f;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText((parseInt(cam.pitch*10)/10).toString(), cnvs.width/2 + cross_h + cross_p, cnvs.height/2);
    ctx.textBaseline = 'top'; ctx.textAlign = 'center';
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
        /*ctx.beginPath();
        ctx.moveTo(cnvs.width/2+face2d[0].x*(cnvs.width/cam.fov),cnvs.height/2-face2d[0].y*(cnvs.width/cam.fov));
        for (let i = 1; i < face2d.length; i++){
            ctx.lineTo(cnvs.width/2+face2d[i].x*(cnvs.width/cam.fov),cnvs.height/2-face2d[i].y*(cnvs.width/cam.fov));
        }
        ctx.closePath();ctx.stroke();*/
        if (in_polygon({x: 0, y: 0}, face2d)) return true;
    }
    return false;
}

function minimap(){
    let mscale_t = mscale * (jumping ? jump_mscale : 1);
    mctx.clearRect(0, 0, mcnvs.width, mcnvs.height);
    mctx.strokeStyle = 'white';
    for (let i = 0; i < zombies.length; i++){
        mctx.beginPath();
        let c = zengine.z_axis_rotate(zengine.to_rad(cam.yaw))(
                zengine.translate(-cam.x, -cam.y, 0)(zombies[i]))
        mctx.arc(mcnvs.width/2  + c.x * mscale_t,
                 mcnvs.height/2 - c.y * mscale_t, zomb_r, 0, Math.PI * 2);
        if (wireframe){
            mctx.stroke();
        } else {
            mctx.fillStyle = '#f33';
            mctx.fill();
        }
    }
    mctx.beginPath();
    mctx.moveTo(mcnvs.width/2, mcnvs.height/2);
    mctx.lineTo(mcnvs.width/2 + Math.sin(zengine.to_rad(cam.fov)/2) * mcnvs.height / 2, 0);
    mctx.lineTo(mcnvs.width/2 - Math.sin(zengine.to_rad(cam.fov)/2) * mcnvs.height / 2, 0);
    mctx.closePath();
    if (wireframe){
        mctx.stroke();
    } else {
        mctx.fillStyle = 'rgba(0, 255, 200, 0.2)';
        mctx.fill();
    }

    for (let r = mscale_t * ring_gap;
         r < Math.sqrt(Math.pow(mcnvs.width/2, 2) + Math.pow(mcnvs.height/2, 2));
         r += mscale_t * ring_gap){
        mctx.beginPath();
        mctx.arc(mcnvs.width/2, mcnvs.height/2, r, 0, Math.PI * 2);
        mctx.stroke();
    }
}

function disp_spds(){
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    for (let i = 0; i < zombies.length; i++){
        ctx.fillText(zombies[i].spd.toString(), time_p, cnvs.height-time_p-i*15);
    }
}

function disp_score(time){
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    let t = parseInt(time - time_start).toString()
    let w = ctx.measureText(t).width;
    ctx.fillText(t, time_p, time_p);
    ctx.font = '12px monospace';
    if (time - time_kill_ms < scr_dur){
        ctx.fillStyle = wireframe ? '#fff' : '#fd5';
        ctx.textAlign = 'right';
        ctx.fillText('+'+scr_incr.toString(), time_p + w, time_p*2 + 20);
    }
}

function disp_death(){
    ctx.fillStyle = '#f004';
    ctx.fillRect(0, 0, cnvs.width, cnvs.height);
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText('you have been eaten; f5 to resurrect', cnvs.width / 2, cnvs.height / 2 - 32);
}

function am_i_dead(){
    for (let i = 0; i < zombies.length; i++){
        if (zengine.distance(cam, zombies[i]) < zomb_kill_dst){
            //is now dead
            disp_death();
            document.exitPointerLock();
            dead = true;
            new Audio('oof.mp3').play();
         }
    }
}

function update_zombs(){
    zombies = zombies.map(function (z){
        ///step, acceleration and turn intervals
        let si = time_diff_s * z.spd;
        let ai = time_diff_s * zomb_acc;
        let ti = time_diff_s * zomb_turn_spd;
        //angle to camera from y-axis
        let atc = zengine.to_deg(Math.atan2(cam.x - z.x, cam.y - z.y)); 
        //camera offset
        let co = atc - z.yaw;
        //remove overflows
        co += co < -180 ? 360 : co > 180 ? -360 : 0;
        //facing towards player
        if (-ti < co && co < ti){
            return {x: z.x + si * Math.sin(zengine.to_rad(atc)),
                    y: z.y + si * Math.cos(zengine.to_rad(atc)), 
                    z: z.z, yaw: atc,
                    spd: z.spd + ai > zomb_spd_max ? zomb_spd_max : z.spd + ai};
        } else {
            //turn towards (i.e. no movement and no acceleration)
            return {x: z.x, y: z.y, z: z.z,
                    yaw: z.yaw + ti * (co> 0 ? 1 : -1),
                    spd: z.spd};
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
    for (let x = -horizon; x < horizon; x+=floor_w){
        for (let y = -horizon; y < horizon; y+=floor_w){
            faces.push({verts: floor_block.verts.map(zengine.translate(Math.floor(cam.x/floor_w)*floor_w+x, Math.floor(cam.y/floor_w)*floor_w+y, 0)), col: floor_block.col});
        }
    }
    return faces;
}

function incr_jump(){
    if (!jumping) return;
    //next z pos
    let nz = cam.z + jump_spd * time_diff_s * jump_dir;
    if (nz > jump_peak){
        if (pressed_keys.has('q')) jumping = false;
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

function spawn_zomb(){
    let y = Math.random() * Math.PI * 2;
    let d = min_spwn + Math.random() * (max_spwn - min_spwn);
    zombies.push({
        x: cam.x + Math.cos(y) * d,
        y: cam.y + Math.sin(y) * d,
        z: 0,
        yaw: Math.random() * 360 - 180,
        spd: zomb_spd_start
    })
    zomb_spd_max += zomb_spd_incr;
}
