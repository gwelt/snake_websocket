'use strict';
const debug=true;
const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, function() {
    if (debug) console.log(`\x1bc\x1b[44m SNAKE SERVER LISTENING ON PORT ${ PORT } \x1b[0m`);
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

process.on ('SIGINT', function () {
  wss_send_to_all_players('SERVER IS GOING DOWN!');
  if (debug) console.log('\r\n\x1b[44m SERVER DOWN \x1b[0m');
  process.exit(0);
});

/*
setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);
*/