const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
})

class Player {
  constructor (idx, pid) {
    this.idx = idx
    this.pid = pid
    this.name = 'Player' + idx
    // this.isOnline = true
  }
}

class Role {
  constructor (name, num) {
    this.name = name
    this.num = num
    this.isAbleUp
    this.isAbleDown
  }
}

class Roles {
  constructor (pnum) {
    this.pnum = pnum
    this.list = [
      new Role("人狼", 2),
      new Role("占い師", 1),
      new Role("怪盗", 1),
      new Role("吊人", 0),
      new Role("狩人", 0),
      new Role("狂人", 0),
      new Role("大狼", 0),
    ]
    console.log('nameList', this.nameList);
    if(pnum >= 4) this.list[3].num++ //吊人
    if(pnum >= 5) this.list[4].num++ //狩人
    if(pnum >= 6) this.list[5].num++ //狂人
    if(pnum >= 7) {
      this.list[6].num++ //大狼
      this.list[0].num-- // 人狼
    }
    if(pnum >= 8){
      this.list[1].num++ // 占い師
      this.list[0].num++ /// 人狼
    }
    let sum = 0
    for(let role of this.list){ // 村人を作る
      sum += role.num
    }
    this.list.push(new Role("村人", pnum+2-sum))
  }

  getHoldersNum () {
    let t = 0
    for(let role in this.list){
      t += this.list[role]
    }
    return t
  }

  updown (ctr, rname) {
    for(let role in this.lust) {
      if(role.name === rname){
        if(ctr === 'up'){
          role.num++
          break
        }
        if(ctr === 'down'){
          role.num--
          break
        }
      }
    }
    this.list[this.length-1].num = this.pnum - this.getHoldersNum()
  }

  isAbleUp (listNum) {

  }
  isAbleDown (listNum) {

  }
}

class Room {
  constructor (rname) {
    this.name = rname
    this.idx = 0
    this.num = 0
    this.players = []
    this.roles
    console.log('made room', rname)
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

  start () {
    this.roles = new Roles(this.num)
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
    return this.playersRoom[pid]
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
  console.log('a user connected')
  // R1.join(socket.id)
  console.log(socket.id)

  io.emit('connected', RM)

  socket.on('player join', (data) => { // 本当はroom作成後
    let rn = data.roomName
    socket.join(rn)
    console.log('player join', data)
    let room = RM.join(rn, data.id)
    io.to(rn).emit('player joined', room)
  })

  socket.on('disconnect', () => {
    console.log('disconnect', socket.id)
    let room = RM.leave(socket.id)
    io.to(room.rname).emit('disconnect', room)
  })

  socket.on('name change', (data) => {
    let rn = data.roomName
    RM.rename(data.name, data.id)
    io.emit('name change', data)
  })

  socket.on('game start', (pid) => {

    console.log('game start')
    let room = RM.playersRoom[pid]
    room.start()
    console.log('roles', room.roles)
    io.emit('game start', room)
  })
})

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000')
})
