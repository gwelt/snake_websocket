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

function new_player() {
  var list = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return list.charAt(Math.floor(Math.random() * list.length));
}

function log(text,col) {
  if (debug) {if (col>0) {process.stdout.write('\x1b['+col+'m '+text+' \x1b[0m ')} else {process.stdout.write(text+' ');}} return;
}

function wss_send_to_all_players(msg) {wss.clients.forEach((client) => {client.send(msg)})}

wss.on('connection', (ws) => {
  var player=new_player();
  log('WELCOME '+player,42); ws.send('WELCOME PLAYER '+player);
  ws.on('close', () => log('BYE-BYE '+player,41));
  ws.on('message', (msg) => {
    //if (msg.startsWith('HELLO')) {log('HELLO PLAYER '+player,42); msg='HELLO PLAYER '+player;}
    log(player+msg,0);
    wss_send_to_all_players(player+msg);
    if (msg=='Q') {ws.send('BYE-BYE!'); ws.close();} 
  });
});


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