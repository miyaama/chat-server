const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");

const tzoffset = new Date().getTimezoneOffset() * 60000;

const PORT = process.env.PORT || 5000;

const db = mysql.createPool({
  host: "eu-cdbr-west-03.cleardb.net",
  user: "b2c398a199230c",
  password: "e2161ece",
  database: "heroku_57e493460004146",
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/login", (req, res) => {
  const { name } = req.body;
  recipient_name = name;

  const sqlGet = "SELECT * FROM users WHERE name = ?";
  db.query(sqlGet, name, (error, result) => {
    if (error) {
      console.log(error);
    }
    console.log(true, result);
    const user = result?.[0];

    if (!user) {
      const sqlInsert = "INSERT INTO users (name) VALUES (?)";
      db.query(sqlInsert, name, (error, result) => {
        if (error) {
          console.log(error);
          res.sendStatus(error.status);
        }
        res.send(result);
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/api/get/:recipient_name", (req, res) => {
  const { recipient_name } = req.params;
  const sqlGetMessages = "SELECT * FROM messages WHERE recipient_name = ?";
  db.query(sqlGetMessages, recipient_name, (error, result = []) => {
    if (error) {
      console.log(error);
    }

    const messages = result.map((message) => ({
      ...message,
      date: new Date(message.date - tzoffset)
        .toISOString()
        .slice(0, 19)
        .replace("T", " "),
    }));

    res.send(messages.reverse());
  });
});

app.post("/api/send", (req, res) => {
  const { recipient_name, sender_name, message, subject } = req.body;
  const date = new Date(Date.now() - tzoffset)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const sqlInsert =
    "INSERT INTO messages (recipient_name, sender_name, message, subject, date) VALUES (?,?,?,?,?)";
  db.query(
    sqlInsert,
    [recipient_name, sender_name, message, subject, date],
    (error, result) => {
      if (error) {
        console.log(error);
        res.sendStatus(error.status);
      }
      res.send(result);
    }
  );
});

app.get("/api/users", (req, res) => {
  const sqlGet = "SELECT * FROM users";
  db.query(sqlGet, (error, result) => {
    res.send(result);
  });
});
