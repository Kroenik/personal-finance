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
var usersFilePath = path.join(__dirname, "users.json");

app.get("/users", (req, res) => {
  fs.readFile(usersFilePath, (err, buffer) => {
    res.json(JSON.parse(buffer.toString()));
  });
});

app.post("/users", (req, res) => {
  req.body.password = crypto.pbkdf2Sync(req.body.password, "qwertzuioplkjhgfdsayxcvbnm", 100000, 64, "sha512").toString("hex");

  fs.readFile(usersFilePath, (err, buffer) => {
    const existing = JSON.parse(buffer.toString());
    existing.push(req.body);
    fs.writeFile(usersFilePath, JSON.stringify(existing), () => {
      res.sendStatus(200);
    });
  });
});

app.post("/login", (req, res) => {
  //create user object with request data
  const user = { username: req.body.username, password: crypto.pbkdf2Sync(req.body.password, "qwertzuioplkjhgfdsayxcvbnm", 100000, 64, "sha512").toString("hex") };
  fs.readFile(usersFilePath, (err, buffer) => {
    //get registered user from json
    let regUsers = JSON.parse(buffer.toString());
    //check if there is matching username and password with input data
    let matchingData = regUsers.filter((regUser) => regUser.username === user.username && regUser.password === user.password);
    if (matchingData.length >= 1) {
      const token = jwt.sign({ user: user }, "secretkey");
      res.status(200).json({ token: token });
    } else {
      res.status(401).json({ unauthorized: "Username or password was invalid" });
    }
  });
});

app.get("/transactions", verifyToken, (req, res) => {
  fs.readFile(transactionsFilePath, (err, buffer) => {
    res.json(JSON.parse(buffer.toString()));
  });
});

//verifyToken,

app.post("/transactions", (req, res) => {
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
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, "secretkey", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
