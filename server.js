'use strict';
const delay=1000;
const tty=true;
const debug=true;
const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, function() {
    if (debug&&tty) console.log(`\x1bc\x1b[44m SNAKE SERVER LISTENING ON PORT ${ PORT } \x1b[0m`)
    else if (tty) console.log(`\x1b[44m SNAKE SERVER LISTENING ON PORT ${ PORT } \x1b[0m`);
  });
const wss = new SocketServer({ server });

///--- GLOBAL ---///
var snakes=[];
var snake_count=0;

///--- MAIN ---///
setInterval(() => {
  snakes.forEach(function (s) {s.move()});
  wss.clients.forEach((client) => {client.send(JSON.stringify(snakes))})
}, delay);

///--- SNAKE-CLASS ---///
function Snake() {
  this.id=++snake_count;
  this.reset();
}
Snake.prototype.reset = function () {
  this.elements=[3,5];
  this.heading='R';
  this.maxlength=3;
}
Snake.prototype.set_heading = function (heading) {
  this.heading=heading;
}
Snake.prototype.getX = function () {return this.elements[this.elements.length-2]}
Snake.prototype.getY = function () {return this.elements[this.elements.length-1]}
Snake.prototype.move = function () {
  var x=this.getX();
  var y=this.getY();
  if (this.heading=='L') {--x}
  else if (this.heading=='U') {++y}
  else if (this.heading=='R') {++x}
  else if (this.heading=='D') {--y}
  this.elements.push(x,y);
  while (this.elements.length>this.maxlength*2) {this.elements.splice(0,2)}
};
module.exports=Snake;

///--- CONNECTION-HANDLER ---///
wss.on('connection', (ws) => {
  var s=new Snake();
  snakes.push(s);
  log('WELCOME '+s.id,42);
  ws.send('WELCOME PLAYER '+s.id);
  
  ws.on('message', (msg) => {
    if (msg=='Q') {
      log('BYE-BYE '+s.id,41);
      ws.send('BYE-BYE '+s.id+'!');
      snakes.remove(s);
      s=undefined;
    }
    else {
      s.set_heading(msg); 
      log(s.id+msg);
    }
  });
  ws.on('close', () => {ws.close()});
});


///--- HELPERS ---///
Array.prototype.remove = function(e) {
  var t, _ref;
  if ((t = this.indexOf(e)) > -1) {
    return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref);
  }
};

function log(text,col) {
  if (debug) {if (col>0) {process.stdout.write('\x1b['+col+'m '+text+' \x1b[0m ')} else {process.stdout.write(text+' ');}} return;
}

function wss_send_to_all_players(msg) {wss.clients.forEach((client) => {client.send(msg)})}

var stdin = process.openStdin();
stdin.addListener("data", function(d) {
  if (tty) {
    console.log("COMMAND: \x1b[44m " + d.toString().trim() + " \x1b[0m");
    if (d.toString().trim()=="exit") {wss_send_to_all_players('SERVER IS GOING DOWN!'); setTimeout(function () {console.log('\x1b[44m SNAKE SERVER SAID BYE-BYE TO ALL PLAYERS AND IS NOW DOWN \x1b[0m'); process.exit(0)}, 1000);}
    else {wss_send_to_all_players(d.toString().trim());}
  }
});

process.on ('SIGINT', function () {
  if (tty) console.log('\n\r\x1b[44m SNAKE SERVER DOWN \x1b[0m');
  process.exit(0);
});

