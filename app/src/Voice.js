import React, { useState, useRef, useEffect } from "react";
import {
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { io } from "socket.io-client";
import Peer from "peerjs";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    height: "100vh",
    padding: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    height: "100%",
    border: `4px solid rgba(255, 0, 0, 0.5)`, // Red mixed border
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
    backgroundColor: theme.palette.background.paper,
  },
  userList: {
    maxHeight: "calc(100vh - 64px)",
    overflowY: "auto",
  },
  selectedUser: {
    padding: theme.spacing(2),
  },
}));

function VoiceWindow({ userId, name }) {
  const classes = useStyles();
  const [peerId, setPeerId] = useState("");
  const [remotePeerIdValue, setRemotePeerIdValue] = useState("");
  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingCallDialogOpen, setIncomingCallDialogOpen] = useState(false);
  const [caller, setCaller] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);

  const socket = useRef(null);
  const peerInstance = useRef(null);

  useEffect(() => {
    socket.current = io("/");

    const peer = new Peer();

    peerInstance.current = peer;

    peer.on("open", (id) => {
      setPeerId(id);
      console.log("My Peer ID:", id);
      socket.current.emit("join-room", id, name);
    });

    peer.on("error", (error) => {
      console.error("Peer error:", error);
    });

    peer.on("call", (call) => {
      setCaller(call.peer);
      setIncomingCallDialogOpen(true);

      call.on("close", () => {
        setIncomingCallDialogOpen(false);
        alert(`Call declined by ${call.peer}`);
      });

      setCurrentCall(call);
    });

    socket.current.on("update-user-list", (users) => {
      setOnlineUsers(users.filter((user) => user.id !== peerId));
    });

    return () => {
      if (peerInstance.current) {
        peerInstance.current.destroy();
      }
      socket.current.disconnect();
    };
  }, [name]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleCallUser = () => {
    if (!selectedUser) return;

    console.log(selectedUser)
    

    // if (call) {
      navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        .then((stream) => {
          currentUserVideoRef.current.srcObject = stream;
          currentUserVideoRef.current.play();
          const call = peerInstance.current.call(selectedUser.id, stream, {
            metadata: { type: "audio" },
          });
          setCurrentCall(call);

          call.on("stream", (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play();
          });
        })
        .catch((error) => {
          console.error("Error accessing media devices:", error);
        });

      setMessageDialogOpen(false);
    // } else {
      // console.error("Call object not properly initialized.");
    // }
  };

  const handleCloseMessageDialog = () => {
    setMessageDialogOpen(false);
  };

  const handleAcceptCall = () => {
    setIncomingCallDialogOpen(false);

    if (currentCall) {
      navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        .then((stream) => {
          currentUserVideoRef.current.srcObject = stream;
          currentUserVideoRef.current.play();

          currentCall.answer(stream);

          currentCall.on("stream", (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play();
          });
        })
        .catch((error) => {
          console.error("Error accessing media devices:", error);
        });
    } else {
      console.error("Current call object not properly initialized.");
    }
  };

  const handleDeclineCall = () => {
    setIncomingCallDialogOpen(false);
    alert(`Call declined from ${caller}`);
    currentCall.close();
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        {/* Left side - Online Users List */}
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Online Users
            </Typography>
            {onlineUsers.length === 0 ? (
              <Typography variant="body1" align="center">
                No users online.
              </Typography>
            ) : (
              <List className={classes.userList}>
                {onlineUsers.map((user) => (
                  <ListItem
                    key={user.id}
                    button
                    selected={selectedUser === user}
                    onClick={() => handleUserSelect(user)}
                  >
                    <ListItemText
                      primary={user.id !== peerId ? user.name : `${user.name} (YOU)`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Right side - Selected User Details */}
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            {selectedUser ? (
              <div className={classes.selectedUser}>
                <Typography variant="h6" gutterBottom>
                  Selected User
                </Typography>
                <Typography variant="body1">{selectedUser.name}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCallUser}
                  style={{ marginTop: "16px" }}
                >
                  Call
                </Button>
              </div>
            ) : (
              <Typography variant="body1" align="center">
                Please select a user from the list.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Incoming Call Dialog */}
      <Dialog open={incomingCallDialogOpen} onClose={handleDeclineCall}>
        <DialogTitle>Incoming Call</DialogTitle>
        <DialogContent>
          <Typography>{`Incoming call from ${caller}`}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeclineCall} color="primary">
            Decline
          </Button>
          <Button onClick={handleAcceptCall} color="primary" autoFocus>
            Accept
          </Button>
        </DialogActions>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onClose={handleCloseMessageDialog}>
        <DialogTitle>
          Message {selectedUser ? selectedUser.name : ""}
        </DialogTitle>
        <DialogContent>
          {/* Add your message box component here */}
          <Typography>Write your message here...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog} color="primary">
            Close
          </Button>
          {/* Add a send message button if needed */}
        </DialogActions>
      </Dialog>

      {/* Video Players */}
      <video ref={currentUserVideoRef} autoPlay muted style={{ display: "none" }} />
      <video ref={remoteVideoRef} autoPlay style={{ display: "none" }} />
    </div>
  );
}

export default VoiceWindow;
