import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { v4 as uuidv4 } from "uuid";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", // Full height of the viewport
  },
  box: {
    padding: theme.spacing(2),
    width: "30%",
    border: `4px solid rgba(255, 0, 0, 0.5)`, // Red mixed border
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
    backgroundColor: theme.palette.background.paper,
    textAlign: "center",
  },
  textField: {
    margin: theme.spacing(1),
    width: "60%",
  },
  button: {
    margin: theme.spacing(2, 0), // top and bottom margin of 16px, left and right margin of 0
  },
}));

function Login({ setName, setIsLogin, setUserId }) {
  const classes = useStyles();
  const [nameInput, setNameInput] = useState("");

  const handleNameChange = (event) => {
    setNameInput(event.target.value);
  };

  const handleSubmit = () => {
    setName(nameInput.trim());
    const id = uuidv4()
    setUserId(id)
    setIsLogin(true);
  };

  return (
    <div className={classes.container}>
      <Box className={classes.box}>
        <Typography variant="h5" gutterBottom>
          Enter your name
        </Typography>
        <Box p={2} />
        <TextField
          className={classes.textField}
          label="Name"
          variant="outlined"
          value={nameInput}
          onChange={handleNameChange}
          fullWidth
        />
        <Box p={2} />
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Submit
        </Button>
        <Box p={2} />
      </Box>
    </div>
  );
}

export default Login;
