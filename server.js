'use strict';
const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const CLIENTJS = path.join(__dirname, 'client.js');
const server = express()
  .use((req, res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    if (req.url=="/") {res.sendFile(INDEX)}
    if (req.url=="/client.js") {res.sendFile(CLIENTJS)}
  })
  .listen(PORT, function() {process.stdout.write(`\x1b[44m SNAKE SERVER LISTENING ON PORT ${ PORT } \x1b[0m `)});
const wss = new SocketServer({ server });
///--- HELPERS ---///
Array.prototype.remove = function(e) {var t, _ref; if ((t = this.indexOf(e)) > -1) {return ([].splice.apply(this, [t,1].concat(_ref = [])), _ref)}};
process.on ('SIGINT', function () {process.stdout.write('\n\r\x1b[44m SNAKE SERVER DOWN \x1b[0m'); process.exit(0);});

///--- MAIN ---///
var snakes=[];
var snakesID=0;
setInterval(() => {
  snakes.forEach(function (s) {s.move()});
  broadcast(JSON.stringify(detect_collisions(snakes)));
}, 300);

///--- SNAKE-CLASS ---///
function Snake() {
  this.id=++snakesID;
  this.reset();
}
Snake.prototype.reset = function () {
  this.elements=[];
  this.heading=null;
  this.maxlength=0;
  this.dim=[40,20];
}
Snake.prototype.launch = function () {
  this.elements=[[Math.floor((Math.random()*(this.dim[0]-1))),Math.floor((Math.random()*(this.dim[1]-1)))]];
  this.maxlength=3;
  broadcast(':PLAYER '+this.id+' STARTED @'+this.elements);
}
Snake.prototype.set_heading = function (h) {
  if (h[0]!=this.heading) {this.maxlength++} // GROW +1 WHEN CHANGING DIRECTION
  this.heading=h[0];
}
Snake.prototype.move = function () {
  if (this.elements.length>0) {
    var pos=this.elements[this.elements.length-1];
    var x=pos[0], y=pos[1];
    switch (this.heading) {
      case 'L': --x; if (x<0) {x=this.dim[0]-1}; break;
      case 'U': ++y; if (y>this.dim[1]-1) {y=0}; break;
      case 'R': ++x; if (x>this.dim[0]-1) {x=0}; break;
      case 'D': --y; if (y<0) {y=this.dim[1]-1}; break;
    }
    this.elements.push([x,y]);
    while (this.elements.length>this.maxlength) {this.elements.splice(0,1)}
  }
  else if (this.heading) {this.launch()}
};
module.exports=Snake;

///--- COLLISION DETECTION ---///
/* if a snakes' head collides with some other element, the snake dies */
function detect_collisions (snakes) {
  var all_heads=[], all_elements=[];
  snakes.forEach(function (s) {
    if (s.elements.length>3) { // puppies do not collide
      all_heads.push(s.elements[s.elements.length-1])
      all_elements=all_elements.concat(s.elements);
    };
  });
  all_heads.forEach(function (head) {
    var x=head[0], y=head[1], c=0;
    all_elements.forEach(function (e) {
      if ((e[0]==x)&&(e[1]==y)) {
        if(c>0) {
          snakes.forEach(function (s) {
            if (s.elements.indexOf(head)>0) {s.reset();broadcast(':PLAYER '+s.id+' DIED @'+head);}
          });
        }
        c++; 
      }
    })
  });
  return snakes;
}

///--- CONNECTION-HANDLER ---///
function broadcast(text) {try{wss.clients.forEach((ws) => {ws.send(text)})} catch(err){} }
wss.on('connection', (ws) => {
  var s=new Snake();
  snakes.push(s);
  ws.send('::ID='+s.id);
  ws.send(':PRESS ARROW-KEYS TO START, PLAYER '+s.id);
  ws.on('message', (msg) => {s.set_heading(msg[0])});
  ws.on('close', () => {snakes.remove(s);broadcast(':PLAYER '+s.id+' LEFT');s=undefined;});
});
