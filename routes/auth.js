const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

const CLIENT_URL = "http://localhost:3000/";

function authorizeApi(req, res, next) {
    if (!req.isUnauthenticated()) {
        next();
    } else
        res.status(400).json({
            message: "User Not Authenticated",
            user: null,
        });
}

// router.get("/login/success", authorizeApi, (req, res) => {
//     if (req.user) {
//         res.status(200).json({
//             success: true,
//             message: "successfull",
//             user: req.user,
//             cookies: req.cookies,
//         });
//     }
// });


router.get("/login/success", authorizeApi, (req, res) => {
  if (req.user) {
    const email = req.user._json.email
    const token = jwt.sign(
      { email },
      process.env.SECRET_KEY,
      {
          expiresIn: "1d",
      }
  );
 
      res.status(200).json({
        success: true,
        message: "successfull",
        user: {auth: true, token, email, username: req.user.displayName, photo: req.user._json.picture}
      });
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
    res.redirect(CLIENT_URL);
});

router.get("/google", passport.authenticate("google", { scope: ["openid", "email", "profile"] }));

router.get(
    "/google/callback",
    passport.authenticate("google", {
        successRedirect: CLIENT_URL,
        failureRedirect: "/login/failed",
    })
);

router.get("/github", passport.authenticate("github", { scope: ["profile"] }));

router.get(
    "/github/callback",
    passport.authenticate("github", {
        successRedirect: CLIENT_URL,
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
        successRedirect: CLIENT_URL,
        failureRedirect: "/login/failed",
    })
);

module.exports = router;
