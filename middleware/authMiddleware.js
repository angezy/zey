const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.header('Authorization')?.split(' ')[1];

    // If token is missing, return a 401 Unauthorized response
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token and decode it
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the decoded user information to the request object
        req.user = decoded;
        next();
    } catch (err) {
        // If the token is invalid or expired, return a 401 Unauthorized response
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
