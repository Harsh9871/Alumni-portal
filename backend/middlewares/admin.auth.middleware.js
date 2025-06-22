// src/middlewares/auth.middleware.js
const dotenv = require('dotenv');
dotenv.config();
const adminAuthMiddleware  = (req, res, next) => {
    const admin_email = req.body.admin_email;
    const admin_password = req.body.admin_password;
    if (!admin_email || !admin_password) {
        return res.status(401).json({
            message: 'Authentication failed',
            succcess: false,
        });
    }

    if (admin_email !== process.env.ADMIN_EMAIL ||  admin_password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({
            message: 'Authentication failed',
            succcess: false,
        });
    } else {
        next();
    }

};

module.exports = adminAuthMiddleware