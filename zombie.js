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
let hh = 0.4;
let hw = 0.5;
let ht = 0.8;
let hn = 0.15;
let hcb = "#e30";
let hcs = "#f41";

//torso
let th = 1.7;
let tw = 1;
let tt = 0.3;
let tcf = "#d98";
let tcb = "#c65";
let tcs = "#c54";

//legs
let lh = 2;
let lw = 0.4;
let lco = "#c54";
let lci = "#a32";

//arms
let al = 1.5;
let ah = 0.3;
let aw = 0.25;
let aco = "#d76";
let aci = "#a32";

let zomb = [
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
