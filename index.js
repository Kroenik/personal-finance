const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

var transactionsFilePath = path.join(__dirname, "transactions.json");
var commentsDefaultFilePath = path.join(__dirname, "comments_default.json");

app.get("/transactions", (req, res) => {
  fs.readFile(transactionsFilePath, (err, buffer) => {
    res.json(JSON.parse(buffer.toString()));
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
