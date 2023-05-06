const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const passport = require("passport");
require("./passport");
const dotenv = require("dotenv");
const cookieSession = require("cookie-session");
dotenv.config();
const jwt = require("jsonwebtoken");
const authRoute = require("./routes/auth");
const { checkAuthenticated, encrypt } = require("./middlewares");
const { v4 } = require("uuid");

const app = express();

app.use(
  cookieSession({
    name: "session",
    keys: ["reviews"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

const connection = mysql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

connection.connect((err) => {
  if (err) throw err;
  console.log("DB connected!");
});

////////////api services for course project//////////////
app.post("/createRate", checkAuthenticated, (req, res) => {
  const rate = req.body.rate;
  const memberId = req.body.memberId;
  const reviewId = req.body.reviewId;

  connection.query(
    "INSERT INTO rates (rate, memberId, reviewId) VALUES (?, ?, ?)",
    [rate, memberId, reviewId],
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

app.post("/createComment", checkAuthenticated, (req, res) => {
  const content = req.body.content;
  const memberId = req.body.memberId;
  const reviewId = req.body.reviewId;

  connection.query(
    "INSERT INTO comments (content, memberId, reviewId) VALUES (?, ?, ?)",
    [content, memberId, reviewId],
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

app.post("/comments", (req, res) => {
  const reviewId = req.body.reviewId;

  connection.query(
    "SELECT * FROM comments WHERE reviewId = ?",
    [reviewId],
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

app.post("/createReview", checkAuthenticated, (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const memberId = req.body.memberId;

  connection.query(
    "INSERT INTO reviews ( title, content, memberId) VALUES (?, ?, ?)",
    [title, content, memberId],
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

app.post("/reviews", checkAuthenticated, (req, res) => {
  const memberId = req.body.memberId;

  connection.query(
    "SELECT * FROM reviews WHERE memberId = ?",
    [memberId],
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

app.get("/allReviews", (req, res) => {
  connection.query(
    "SELECT * FROM reviews INNER JOIN members ON reviews.memberId = members.Id",
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

app.post("/createMember", (req, res) => {
  const memberId = v4();
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.id
    ? encrypt(process.env.SECRET_KEY) + req.body.id
    : encrypt(req.body.password);
  const userRole = "user";
  connection.query(
    "INSERT INTO members (memberId, username, email, password,userRole) VALUES (?, ?, ?, ?, ?)",
    [memberId, username, email, password, userRole],
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

app.post("/loginMember", (req, res) => {
  const username = req.body.username;
  const password = encrypt(req.body.password);

  if (username && password) {
    connection.query(
      "SELECT * FROM members WHERE username = ? AND password = ?",
      [username, password],
      (err, result) => {
        if (result.length > 0) {
          if (err) {
            throw err;
          } else {
            const username = result[0].username;
            const token = jwt.sign({ username }, process.env.SECRET_KEY, {
              expiresIn: "1d",
            });

            res.json({
              auth: true,
              token,
              memberId: result[0].Id,
              username,
              email: result[0].email,
              createdAt: result[0].createdAt,
            });
          }
        } else {
          res.json({
            auth: false,
            message: "Wrong username or password",
          });
        }
      }
    );
  } else {
    res.json({ auth: false, message: "No username or password" });
  }
});

app.get("/members", checkAuthenticated, (req, res) => {
  connection.query("SELECT * FROM members", (err, result) => {
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

// //////////api services for other tasks //////////////
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
  const title = req.body.title;
  const message = req.body.message;
  const sender = req.body.sender;
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
  const status = "active";
  if (username && password) {
    connection.query(
      "UPDATE users SET lastLoginTime = ? WHERE status = 'active' AND username = ? AND password = ?",
      [lastLoginTime, username, password],
      (err, result) => {
        if (err) {
          throw err;
        } else {
          connection.query(
            "SELECT * FROM users WHERE status = 'active' AND username = ? AND password = ?",
            [username, password],
            (err, result) => {
              if (err) {
                throw err;
              } else {
                res.send(result);
              }
            }
          );
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

app.use("/auth", authRoute);

app.listen(process.env.PORT || 5000, () => {
  console.log("server running 5000");
});
