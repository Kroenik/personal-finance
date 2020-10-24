const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("website"));

var transactionsFilePath = path.join(__dirname, "transactions.json");
//var commentsDefaultFilePath = path.join(__dirname, "comments_default.json");

let users = [];
app.post("/register", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (typeof username !== "string" || !username) {
    res.status(400).json({ error: "Username is not provided or not a string. Please provide a valid username" });
  } else if (typeof password !== "string" || !password) {
    res.status(400).json({ error: "Password is not provided or not a string. Please provide a valid password" });
  } else {
    const passwordDerivative = crypto.pbkdf2Sync(password, "qwertzuioplkjhgfdsayxcvbnm", 100000, 64, "sha512").toString("hex");

    users.push({ username, passwordDerivative });
    res.status(201).json({ created: "User has been created" });
  }
});

app.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  const user = {
    id: 1,
    username: "Tester",
    mail: "tester@testmail.com",
  };

  jwt.sign({ user: user }, "secretkey", (err, token) => {
    res.json({ token: token });
  });
  /*
  if (typeof username !== "string" || username === undefined) {
    res.status(400).json({ error: "Username is not provided or not a string. Please provide a valid username" });
  } else if (typeof password !== "string") {
    res.status(400).json({ error: "Password is not provided or not a string. Please provide a valid password" });
  } else {
    const PasswordDerivative = crypto.pbkdf2Sync(password, "qwertzuioplkjhgfdsayxcvbnm", 100000, 64, "sha512").toString("hex");

    let matchingData = users.filter((user) => user.username === username && user.passwordDerivative === PasswordDerivative);
    if (matchingData.length >= 1) {
      jwt.sign({ username: username }, "secretkey"),
        (err, token) => {
          res.json({ token: token });
        };
      //res.status(200).json({ OK: "Login was succesful" });
    } else {
      res.status(401).json({ unauthorized: "Username or password was invalid" });
    }
  }*/
});

app.get("/transactions", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      fs.readFile(transactionsFilePath, (err, buffer) => {
        res.json(JSON.parse(buffer.toString()));
      });
    }
  });
});

app.post("/transactions", (req, res) => {
  // if (!req.body.title || !req.body.content || !req.body.username) {
  //   return res.status(400).json({
  //     error: "The data you're sending is missing some fields. Should have: title, content and username",
  //   });
  // }

  // if (typeof req.body.title !== "string" || typeof req.body.content !== "string" || typeof req.body.username !== "string") {
  //   return res.status(400).json({
  //     error: "The data you're sending is of a wrong type. All fields should be strings",
  //   });
  // }

  fs.readFile(transactionsFilePath, (err, buffer) => {
    const existing = JSON.parse(buffer.toString());
    console.log(existing);
    existing.push(req.body);
    fs.writeFile(transactionsFilePath, JSON.stringify(existing), () => {
      res.sendStatus(200);
    });
  });
});

//erify Token
function verifyToken(req, res, next) {
  //Get auth header value
  const bearerHeader = req.headers["authorization"];
  // Check if undefined bearer
  if (typeof bearerHeader !== "undefined") {
    // Split at space
    const bearer = bearerHeader.split(" ");
    // Get token from array
    const bearerToken = bearer[1];
    //Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    //Forbidden
    res.sendStatus(403);
  }
}

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
