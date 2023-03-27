const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const connection = mysql.createPool({
    user: "freedb_bashar",
    host: "sql.freedb.tech",
    password: process.env.DB_PWD,
    database: "freedb_adminka",
});

// api services
app.get("/users", (req, res) => {
    connection.query("SELECT * FROM users", (err, result) => {
        if (result) {
            res.send(result);
        } else {
            res.status(err.status || 500).json({
                status: err.status,
                message: err.message,
            });
        }
    });
});

app.post("/register", (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const lastLoginTime = req.body.lastLoginTime;
    const registerTime = req.body.registerTime;
    const status = req.body.status;

    connection.query(
        "INSERT INTO users (username, email, password, lastLoginTime, registerTime, status) VALUES (?, ?, ?, ?, ?, ?)",
        [username, email, password, lastLoginTime, registerTime, status],
        (err, result) => {
            if (result) {
                res.send(result);
            } else {
                res.status(err.status || 500).json({
                    status: err.status,
                    message: err.message,
                });
            }
        }
    );
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    connection.query(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password],
        (err, result) => {
            if (err) {
                req.setEncoding({ err: err });
            } else {
                if (result.length > 0) {
                    res.send(result);
                } else {
                    res.status(err.status || 500).json({
                        status: err.status,
                        message: err.message,
                    });
                }
            }
        }
    );
});

app.post("/block", (req, res) => {
    const username = req.body.username;

    connection.query(
        "UPDATE users SET status = 'blocked' WHERE username = ?",
        [username],
        (err, result) => {
            if (err) {
                req.setEncoding({ err: err });
              
            } else {
                res.send(result);
                console.log(result.affectedRows + " record(s) updated");
            }
        }
    );
});

app.post("/unblock", (req, res) => {
  const username = req.body.username;

  connection.query(
      "UPDATE users SET status = 'active' WHERE username = ?",
      [username],
      (err, result) => {
          if (err) {
              req.setEncoding({ err: err });
          } else {
              res.send(result);
              console.log(result.affectedRows + " record(s) updated");
          }
      }
  );
});


app.post("/delete", (req, res) => {
  const username = req.body.username;

  connection.query(
      "DELETE FROM users WHERE username=?",
      [username],
      (err, result) => {
          if (err) {
              req.setEncoding({ err: err });
          } else {
              res.send(result);
              console.log(result.affectedRows + " record(s) updated");
          }
      }
  );
});

app.listen(3001, () => {
    console.log("server running on port:3001");
});