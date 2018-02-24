const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

class Player {
  constructor (idx, pid) {
    this.idx = idx
    this.pid = pid
    this.isOnline = true
  }
}

class Room {
  constructor (rname) {
    this.name = rname
    this.idx = 0
    this.num = 0
    this.players = []
  }

  join (pid) {
    this.idx++
    this.num++
    this.players.push(new Player(this.idx, pid))
  }

  leave (pid) {
    this.num--
    let i = 0;
    this.players.splice(this.players.indexOf(),1)
  }
}

class RoomManager {
  constructor () {
    this.rooms = [new Room("ひまわり"), new Room("紫陽花")]
  }

  make (rid) {
    this.rooms.push(new Room(rname))
  }
}

const RM = new RoomManager()

io.on('connection', function(socket){
  console.log('a user connected');
  // R1.join(socket.id)
  console.log(socket.id);

  io.emit('connected', RM)

  socket.on('disconnect', function(){
    console.log('user disconnected');
    // PM.leave(socket.id)
  });

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

  socket.on('name change', (name) => {
    console.log('name: ' + name);
    io.emit('name change', name)
  })
});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
