const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const {authorizeApi, encrypt} = require('../middlewares')



router.get("/login/success", authorizeApi, (req, res) => {
    if (req.user) {
        const email = req.user._json.email;
        const encryptedId = encrypt(req.user.id)
        const token = jwt.sign({ email }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });
        res.status(200).json({
            success: true,
            message: "successfull",
            user: {
                auth: true,
                token,
                email,
                username: req.user.displayName,
                photo: req.user._json.picture,
                id: encryptedId
            },
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
    res.redirect(process.env.CLIENT_URL);
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
