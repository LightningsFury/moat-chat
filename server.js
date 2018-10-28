// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
const http = require('http');
const serv = http.Server(app)
const io = require('socket.io')(serv, {});
setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
let unique = require('unique-string');



// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  console.log(`Pinged ${Date()}`)
  response.sendFile(__dirname + '/views/index.html');
});
app.use('/', express.static(__dirname + '/views'));
const storage = require('node-persist');
// init sqlite db
var fs = require('fs');
let messages = [];
(async () => {
  await storage.init({
 
    stringify: JSON.stringify,
 
    parse: JSON.parse,
 
    encoding: 'utf8',
 
    logging: false,  // can also be custom logging function
 
    ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS
 
    expiredInterval: 2 * 60 * 1000, // every 2 minutes the process will clean-up the expired cache
 
    // in some cases, you (or some other service) might add non-valid storage files to your
    // storage dir, i.e. Google Drive, make this true if you'd like to ignore these files and not throw an error
    forgiveParseErrors: false
 
});

})()



// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// endpoint to get all the dreams in the database
// currently this is the only endpoint, ie. adding dreams won't update the database
// read the sqlite3 module docs and try to add your own! https://www.npmjs.com/package/sqlite3

let sockets = {}
io.on('connection', async function(socket) {
  let vals = await storage.values();
  socket.readied = true;
  
  vals.sort((a, b) => {
    return a[2]-b[2]})
 
  sockets[socket.id] = {}
  
  socket.on('login', data=>{
    sockets[socket.id].name = data;
    console.log('loggedin',data);
  })
  socket.on('ready', data => {
    
    if (socket.readied) {
      for (let i = 0; i < vals.length; i++)  {
        socket.emit('othermsg', vals[i][0], vals[i][1], vals[i][3].images, vals[i][3].links);
      }
      socket.readied = false;
    }
  })


  
  socket.on('newMessage', (data) => {
    let name = data.name
        if (name.toLowerCase().includes('waqqas')) {
     name = "Waqqas Impersonator";
    }
    storage.setItem(unique(), [data.msg, name, Date.now(), data])
    socket.broadcast.emit('othermsg', data.msg,name);
  
  })
})


serv.listen(3000, function(){
  console.log('listening on *:3000');
});
