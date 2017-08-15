const Userdb = require('../models/user');
module.exports = function (socketIO) {
  let socketList = {};
  socketIO.on('connection', socket => {         // 客户端与服务端连接
    const url = socket.request.headers.referer;
    const splited = url.split('/');
    const roomID = 123456;                // 总房号
    let userList = [];
    socket.on('join', username => {
      socket.username = username;         // 添加用户名属性
      socketList[username] = socket;         // 存储用户
      userList.push(username)             // 将用户添加进聊天组
      socket.join(roomID);
      socketIO.to(roomID).emit('add', username);
      Userdb.changeStatus(username, 'online').then(() => {
        Userdb.getFriends(username).then(data => {
          socketIO.emit('getFriends', data);         // 获取好友列表
        })
      })
    })
    socket.on('clientSend', data => {     // 接收客户端发来的消息
      data.time = new Date().toLocaleTimeString();
      if (data.targetName === 'all') socketIO.to(roomID).emit('serverSend', data);
      else socketList[data.targetName].emit('serverSend', data);
    })
    socket.on('disconnect', function(){           // 用户下线
      Userdb.getFriends(socket.username).then(data => {
        Userdb.changeStatus(socket.username, 'offline').then(() => {
          socketIO.emit('getFriends', data);
          console.log(`${socket.username}离开了聊天室`);
        })
      })
    })
  })
}
