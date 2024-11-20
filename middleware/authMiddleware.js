const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.header('Authorization')?.split(' ')[1];

    // If token is missing, redirect to the sign-in page
    if (!token) {
        return res.redirect('/signin'); // Redirect to the sign-in page
    }

    try {
        // Verify the token and decode it
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the decoded user information to the request object
        req.user = decoded;
        next();
    } catch (err) {
        // If the token is invalid or expired, redirect to the sign-in page
        res.redirect('/signin'); // Redirect to the sign-in page
    }
};

module.exports = authMiddleware;
