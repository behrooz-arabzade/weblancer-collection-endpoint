let jwt = require('jsonwebtoken');

module.exports.authorizeToken = function authorizeToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log("authorizeToken", authHeader, token)
    if (token == null) {
        res.sendStatus(401);
        return;
    }

    console.log("authorizeToken verifying")
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
        console.log("authorizeToken err", err)
        if (err) {
            res.sendStatus(401);
            return;
        }
        console.log("authorizeToken success", user);
        req.user = user;
        next();
    });
}

module.exports.getAuthorizedUser = (req) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return false;
    }

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return false;
        }

        return user;
    });
}

module.exports.generateAccessToken = function generateAccessToken(user, expireTime = '30d') {
    return jwt.sign(user, process.env.JWT_ACCESS_TOKEN_SECRET/*, {expiresIn: expireTime}*/);
}
