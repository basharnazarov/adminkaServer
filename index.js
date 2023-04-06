const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const connection = mysql.createPool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    multipleStatements: true,
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

app.get("/recipients", (req, res) => {
    connection.query("SELECT sender FROM messages", (err, result) => {
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

app.post("/create", (req, res) => {
    const username = req.body.username;
    const title = req.body.title
    const message = req.body.message
    const sender = req.body.sender
    connection.query(
        "INSERT INTO messages (username, title, message, sender) VALUES (?, ?, ?, ?)",
        [username, title, message, sender],
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

app.post("/messages", (req, res) => {
    const username = req.body.username;
    connection.query(
        "SELECT * FROM messages WHERE username = ?",
        [username],
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
    const lastLoginTime = new Date();
    // UPDATE users SET lastLoginTime = ? WHERE status = 'active' AND username = ? AND password = ?; 
    const status = "active";
    if (username && password) {
        connection.query(
            "UPDATE users SET lastLoginTime = ? WHERE status = 'active' AND username = ? AND password = ?",
            [lastLoginTime, username, password],
            (err, result) => {
                if (err) {
                    throw err;
                } else {
                    connection.query("SELECT * FROM users WHERE status = 'active' AND username = ? AND password = ?", [username, password], (err,result)=>{
                        if(err){
                            throw err
                        } else {
                            res.send(result)
                        }
                    })
                    // res.send(result);
                }
            }
        );
    }

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


app.listen(process.env.PORT || 3001, () => {
    console.log("server running");
});
