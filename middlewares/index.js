const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const key = crypto
    .createHash("sha512")
    .update(process.env.SECRET_KEY)
    .digest("hex")
    .substring(0, 32);
const iv = crypto
    .createHash("sha512")
    .update(process.env.SECRET_IV)
    .digest("hex")
    .substring(0, 16);

const encrypt = (value) => {
    const cipher = crypto.createCipheriv(process.env.SECRET_ALGO, key, iv);

    return Buffer.from(
        cipher.update(value, "utf8", "hex") + cipher.final("hex")
    ).toString("base64");
};

const decrypt = (encryptedValue) => {
    const buff = Buffer.from(encryptedValue, "base64");
    const decipher = crypto.createDecipheriv(process.env.SECRET_ALGO, key, iv);
    return (
        decipher.update(buff.toString("utf8"), "hex", "utf8") +
        decipher.final("utf8")
    );
};

//check authentication
const authorizeApi = (req, res, next) => {
    if (!req.isUnauthenticated()) {
        next();
    } else
        res.status(400).json({
            message: "User Not Authenticated",
            user: null,
        });
};

const checkAuthenticated = (req, res, next) => {
    const token = req.headers["x-access-token"];

    if (!token) {
        res.status(400).send("No access token");
    } else {
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                res.status(401);
                res.json({ auth: false, message: "Unauthorized user" });
            } else {
                req.username = decoded.username;
                next();
            }
        });
    }
};

module.exports = {
    authorizeApi: authorizeApi,
    checkAuthenticated: checkAuthenticated,
    encrypt: encrypt,
    decrypt: decrypt,
};
