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
    this.name = 'Player' + idx
    this.isOnline = true
  }
}

class Room {
  constructor (rname) {
    this.name = rname
    this.idx = 0
    this.num = 0
    this.players = []
    console.log('made room', rname);
  }

  join (pid) {
    this.idx++
    this.num++
    this.players.push(new Player(this.idx, pid))
  }

  leave (pid) {
    this.num--
    for(let i in this.players){
      if(this.players[i].pid === pid){
        this.players.splice(i, 1)
        break
      }
    }
  }
}

class RoomManager {
  constructor () {
    this.rooms = [new Room("room1"), new Room("room2")]
    this.playersRoom = {}
  }

  make (rid) {
    this.rooms.push(new Room(rname))
  }

  join (rname, pid) {
    for(let room of this.rooms){
      if(room.name === rname){
        room.join(pid)
        this.playersRoom[pid] = room
        return room
      }
    }
  }

  leave (pid) {
    this.playersRoom[pid].leave(pid)
  }

  rename (name, pid) {
    for(let player of this.playersRoom[pid].players){
      if(player.pid === pid){
        player.name = name
        break
      }
    }
  }
}

const RM = new RoomManager()

io.on('connection', function(socket){
  console.log('a user connected');
  // R1.join(socket.id)
  console.log(socket.id);

  io.emit('connected', RM)

  socket.on('player join', (data) => { // 本当はroom作成後
    console.log('player join', data);
    let room = RM.join(data.roomName, data.id)
    console.log('check!', room.players[0]);
    io.emit('player joined', room)
  })

  socket.on('disconnect', () => {
    console.log('disconnect', socket.id);
    RM.leave(socket.id)
    // PM.leave(socket.id)
  });

  socket.on('name change', (data) => {
    RM.rename(data.name, data.id)
    io.emit('name change', data)
  })
});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
