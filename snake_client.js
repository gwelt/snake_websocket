var ws=ws_open(location.origin.replace(/^http/, 'ws')+'/socket');
var snakeID, direction;
var keyset=[37,38,39,40,27];
var Snakes=[];
var tweets=[];

function tweet(t) {
  if (t) {tweets.push(t)}
  while (tweets.length>1) {tweets.splice(0,1)}
  var etweet=document.getElementById('text');
  if (etweet) {
    etweet.innerHTML="";
    tweets.forEach(function(tt) {etweet.innerHTML+=tt+"<br>"});
  };
}

function init_grid (dimX,dimY) {
  var grid=document.getElementById("grid");
  grid.style.textAlign='left';
  var s=Math.min(Math.floor(grid.offsetWidth/dimX),Math.floor(grid.offsetHeight/dimY));
  if (s==0) {s=Math.floor(grid.offsetWidth/dimX)};
  var out="<style>.g {float:left;width:"+s+"px;height:"+s+"px;background-color:#e0e0e0;border:1px solid white;box-sizing:border-box;}</style>";
  out+="<div style='display:inline-block;width:"+s*dimX+"px;height:100%;background-color:#ffffff';>";
  for (var y=dimY-1;y>=0;y--) { out+="<div style=clear:both></div>"; for (var x=0;x<dimX;x++) { out+="<div onclick=turn("+((x<dimX/2)?0:1)+") class=g id=X"+x+"Y"+y+"></div>"; } }
  out+="</div><div style=clear:both></div><div id=text style=\"text-align:left;font:"+s+"px 'Lucidia Console', Monaco, monospace\"></div>";
  grid.innerHTML=out; 
  tweet();
}

function turn(right) {
  if (right) {
    switch (direction) {
      case 'L': send('U'); break;
      case 'U': send('R'); break;
      case 'R': send('D'); break;
      case 'D': send('L'); break;
      default: send('R');
    }
  } else {
    switch (direction) {
      case 'L': send('D'); break;
      case 'U': send('L'); break;
      case 'R': send('U'); break;
      case 'D': send('R'); break;
      default: send('L');
    }
  }
}

function display_snake (s,col) {
  var opacity=1;
  s.elements.reverse().forEach(function(e) {
    var elem=document.getElementById('X'+e[0]+'Y'+e[1]);
    elem.style.background=col;
    elem.style.opacity=opacity;
    if ((col)&&(opacity>0.5)) {opacity-=0.1;}
  });
}

document.onkeydown = function(event) {
  if (keyset.indexOf(event.keyCode)>=0) {
    switch (event.keyCode) {
      case 37: send('L'); break; // LEFT
      case 38: send('U'); break; // UP
      case 39: send('R'); break; // RIGHT
      case 40: send('D'); break; // DOWN
      case 27: send('Q'); break; // ESC (QUIT/START)
    }
    event.cancelBubble = true;
    event.returnValue = false;
  }
  return event.returnValue;
}

function send(new_direction) {if (new_direction!=direction) {direction=new_direction; ws.send(new_direction)}}

function ws_open(url) {
  try {ws=new WebSocket(url)} catch (err){alert(err);ws=false};
  if (ws) {
    ws.onmessage = function (message) {
      if (message.data.startsWith('::ID=')) {snakeID=message.data.substr(5)}
      else if (message.data.startsWith(':')) {tweet(message.data.substr(1))}
      else {
        Snakes.forEach(function (s) {display_snake(s,null)});
        Snakes=JSON.parse(message.data);
        if (direction==null) {init_grid(Snakes[0].dim[0],Snakes[0].dim[1])}
        Snakes.forEach(function (s) {display_snake(s,(s.id==snakeID)?'#0070C0':'#505050'); if ((s.id==snakeID)&&(s.heading==null)) {direction=0}; });
      }
    }
  }
  return ws;
}

