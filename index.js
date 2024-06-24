const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { ExpressPeerServer } = require("peer");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use(cors());
app.use("/peerjs", peerServer);

let users = [];

io.on("connection", (socket) => {
  console.log("New user connected!");

  // Handle joining room and storing user info
  socket.on("join-room", (userId, userName) => {
    console.log(`User ${userName} joined the room`);

    const roomId = "52f524a6-c93e-4832-bedd-7925fd76dc55";
    const user = { id: userId, name: userName, sid: socket.id }; // Store socket id
    users.push(user);

    socket.join(roomId);
    io.to(roomId).emit("update-user-list", users);
    socket.broadcast.to(roomId).emit("user-connected", user);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${userName} disconnected!`);
      users = users.filter((u) => u.id !== userId);
      io.to(roomId).emit("update-user-list", users);
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });

    // Handle request for updated user list
    socket.on("request-user-list", () => {
      io.to(socket.id).emit("update-user-list", users);
    });
  });

  // Additional event listeners can be added here as needed
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
