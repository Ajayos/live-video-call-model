const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require("cors")
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.use(cors())
app.use('/peerjs', peerServer);
app.get('*', (req, res) => {
    res.send("hello World")
    // res.sendFile(__dirname + '/t.html');
});

let users = [];

io.on('connection', socket => {
    socket.on('join-room', (userId, userName) => {
        const roomId = 'guyxopushdui-jhdgfuy'
        const user = { id: userId, name: userName };
        users.push(user);
        
        socket.join(roomId);
        io.to(roomId).emit('update-user-list', users);
        socket.to(roomId).broadcast.emit('user-connected', user);

        socket.on('disconnect', () => {
            users = users.filter(u => u.id !== userId);
            io.to(roomId).emit('update-user-list', users);
            socket.to(roomId).broadcast.emit('user-disconnected', userId);
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
