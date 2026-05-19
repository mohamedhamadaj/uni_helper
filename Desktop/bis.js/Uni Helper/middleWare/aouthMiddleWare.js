const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            
            message: 'Not authorized, no token'
        });
    }
};


// في authMiddleware.js
const providerOnly = (req, res, next) => {
    if (req.user.role !== 'provider') {
        return res.status(403).json({ message: 'Only providers can access this' });
    }
    next();
};

const userOnly = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied, users only' });
    }
};

module.exports = { protect, providerOnly, userOnly };

module.exports = { protect, providerOnly, userOnly };