'use strict';
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
var players={};


function Snake() {
  var list = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  this.id=list.charAt(Math.floor(Math.random() * list.length));
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
Snake.prototype.move = function () {
  var x=0;
  var y=0;
  if (this.elements.length>1) {
    x=this.elements[this.elements.length-2];
    y=this.elements[this.elements.length-1];
  }
  if (this.heading=='L') {x=x-1}
  else if (this.heading=='U') {y=y+1}
  else if (this.heading=='R') {x=x+1}
  else if (this.heading=='D') {y=y-1}
  this.elements.push(x,y);//this.elements.push(y);
  while (this.elements.length>this.maxlength*2) {this.elements.splice(0,1)}
  return this.elements.length/2+'['+x+':'+y+']';
};
module.exports=Snake;


wss.on('connection', (ws) => {
  var s = new Snake();
  log('WELCOME '+s.id,42); ws.send('WELCOME PLAYER '+s.id);
  ws.on('close', () => log('BYE-BYE '+s.id,41));
  ws.on('message', (msg) => {
    //if (msg.startsWith('HELLO')) {log('HELLO PLAYER '+player,42); msg='HELLO PLAYER '+player;}
    log(s.id+msg,0);
    if (msg=='Q') {ws.send('BYE-BYE, '+s.id+'!'); ws.close();} 
    else {s.set_heading(msg); log(s.move())}
    wss_send_to_all_players(s.id+''+msg+''+s.elements.length/2+'['+s.elements[s.elements.length-2]+':'+s.elements[s.elements.length-1]+']');
  });
});


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

/*
setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);
*/