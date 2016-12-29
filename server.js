'use strict';
const debug=true;
const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, function() {if (debug) process.stdout.write(`\x1bc\x1b[44m SNAKE SERVER LISTENING ON PORT ${ PORT } \x1b[0m`);});
const wss = new SocketServer({ server });

///--- MAIN ---///
var snakes=[];
var snakesID=0;
const board_dimension=[20,5];
const delay=750;
setInterval(() => {
  if (debug) {board_reset()} // DEBUG
  snakes.forEach(function (s) {
    s.move();
    if (debug) {board_put_snake(s)} // DEBUG
  });
  if (debug) {board_print()} // DEBUG
  detect_collisions(snakes);
  wss.clients.forEach((ws) => {ws.send(JSON.stringify(snakes))})
}, delay);

///--- SNAKE-CLASS ---///
function Snake() {
  this.id=++snakesID;
  this.reset();
}
Snake.prototype.reset = function () {
  this.elements=[];
  this.heading=null;
  this.maxlength=0;
  this.dim=board_dimension;
}
Snake.prototype.launch = function () {
  this.elements=[[0,0]]; // issue: random position here
  this.maxlength=3;
}
Snake.prototype.set_heading = function (h) {
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
function detect_collisions (snakes) {
  var all_heads=[], all_elements=[];
  snakes.forEach(function (s) {
    // issue: do not include puppy-snakes here
    if (s.elements.length) {all_heads.push(s.elements[s.elements.length-1])};
    all_elements=all_elements.concat(s.elements);
  });
  all_heads.forEach(function (head) {
    var x=head[0], y=head[1], c=0;
    all_elements.forEach(function (e) {
      if ((e[0]==x)&&(e[1]==y)) {
        if(c>0) {
          snakes.forEach(function (s) {
            if (s.elements.indexOf(head)>0) {log('COLLISION @'+head+' '+s.id+' DIES!',41);s.reset()}
          });
        }
        c++; 
      }
    })
  });
  log('\n'+all_heads.length+' heads: ['+all_heads+']');
  log('\n'+all_elements.length+' elements: ['+all_elements+']');
}

///--- CONNECTION-HANDLER ---///
wss.on('connection', (ws) => {
  var s=new Snake();
  snakes.push(s);
  log('WELCOME '+s.id,42);
  ws.send(':WELCOME PLAYER '+s.id);
  ws.on('message', (msg) => {
    log(s.id+msg[0]);
    if (msg=='Q') {s.reset()}
    else {s.set_heading(msg[0])}
  });
  ws.on('close', () => {snakes.remove(s);log('BYE-BYE '+s.id,41);s=undefined;});
});

///--- HELPERS ---///
Array.prototype.remove = function(e) {
  var t, _ref;
  if ((t = this.indexOf(e)) > -1) {
    return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref);
  }
};

process.on ('SIGINT', function () {
  if (debug) process.stdout.write('\n\r\x1b[44m SNAKE SERVER DOWN \x1b[0m');
  process.exit(0);
});

///--- DEBUG-HELPERS ---///
function log(text,col) {
  if (debug) {if (col>0) {process.stdout.write('\x1b['+col+'m '+text+' \x1b[0m ')} else {process.stdout.write(text+' ');}} return;
}

var board=[];
function board_reset() {for(var x=0;x<board_dimension[0];x++){board[x]=[];for(var y=0;y<board_dimension[1];y++){board[x][y]='';}}}
function board_put_snake(s) {for(var i=0;i<s.elements.length;i++) {board[s.elements[i][0]][s.elements[i][1]]=s.id;}}
function board_print() {process.stdout.write(`\x1bc\x1b[44m DEBUG-BOARD \x1b[0m`); for(var y=board_dimension[1]-1;y>=0;y--) {var line=''; for(var x=0;x<board_dimension[0];x++) {if (board[x][y]=='') {board[x][y]='.'} var t=board[x][y].toString().slice(0,1); line=line+t;} log('\n'+line);} log('\n');}
