const jwt = require("jsonwebtoken");

module.exports.authMiddleware = (req, res, next) => {
    const excludedRoutes = ['/auth/login', '/auth/register'];
    if (req && !excludedRoutes.includes(req.path)) {
        const userInfo = jwt.decode(req.headers.authorization?.split(" ")[1]);
        if (!userInfo) return res.status(403).json({message: "User not authorized"});
        req.authUser = userInfo;
    }
    next();
};