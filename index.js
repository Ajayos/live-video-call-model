import express, { static as expressStatic } from "express";
import { createServer } from "https";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import { ExpressPeerServer } from "peer";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const options = {
  key: fs.readFileSync("./server.key"),
  cert: fs.readFileSync("./server.crt"),
};

const server = createServer(options, app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use(cors());
app.use(expressStatic(join(__dirname, "public")));
app.use("/peerjs", peerServer);

app.get("*", (req, res) => {
  return res.sendFile(join(__dirname, "public", "index.html"));
});

let users = [];

io.on("connection", (socket) => {
  socket.on("join-room", (userId, userName) => {
    console.log(`User ${userName} joined the room`);

    const roomId = "52f524a6-c93e-4832-bedd-7925fd76dc55";
    const user = { id: userId, name: userName, sid: socket.id };
    users.push(user);

    socket.join(roomId);
    io.to(roomId).emit("update-user-list", users);
    socket.broadcast.to(roomId).emit("user-connected", user);

    socket.on("disconnect", () => {
      console.log(`User ${userName} disconnected!`);
      users = users.filter((u) => u.id !== userId);
      io.to(roomId).emit("update-user-list", users);
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });

    socket.on("request-user-list", () => {
      io.to(socket.id).emit("update-user-list", users);
    });
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
