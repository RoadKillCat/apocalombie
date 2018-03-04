
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
