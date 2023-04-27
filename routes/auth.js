const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { authorizeApi, encrypt } = require("../middlewares");
const dotenv = require("dotenv");
dotenv.config();
const mysql = require("mysql2");
const connection = mysql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

router.get("/login/success", authorizeApi, (req, res) => {
  if (req.user) {
    const memberId = req.user.id;
    const username = req.user.displayName;
    const email = req.user._json.email;
    const password = encrypt(req.user.id);
    const userRole = "user";
    const token = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    connection.query(
      "INSERT INTO members (memberId, username, email, password, userRole) VALUES (?, ?, ?, ?, ?)",
      [memberId, username, email, password, userRole],
      (err, result) => {
        if (result) {
          // res.send(result);
        } else {
        //   res.status(err.status || 500).json({
        //     status: err.status,
        //     message: err.message,
        //   });
        }
      }
    );

    res.status(200).json({
      success: true,
      message: "successfull",
      user: {
        auth: true,
        token,
        memberId,
        email,
        username,
        photo: req.user._json.picture,
      },
    });
    return;
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  return res.redirect(process.env.CLIENT_URL);
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["openid", "email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["email", "profile"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["profile"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

module.exports = router;
