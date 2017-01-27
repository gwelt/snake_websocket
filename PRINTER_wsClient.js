var WebSocket = require('ws');
var ws = new WebSocket("ws://localhost:3000");
require('child_process').execSync('stty -F /dev/ttyS0 9600');

var welcome="================================\\nhttp://"+require('os').networkInterfaces()['wlan0'][0]['address']+":3000\\n================================";
require('child_process').execSync('echo "'+welcome+'" > /dev/ttyS0','e');
console.log(welcome);

ws.on('message', function(message) {
  if (message.startsWith(':')) {
  	require('child_process').execSync('echo "'+message.substr(1)+'" > /dev/ttyS0','e');
  	//console.log(message.substr(1));
  }
});
