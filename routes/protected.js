const express = require('express');
const path = require('path');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Apply the auth middleware to all routes
router.use(authMiddleware);

// Serve protected views dynamically
router.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, '../protected_views/pages', `${page}.handlebars`);

    // Check if the file exists and render it
    res.render(filePath, { user: req.user }, (err) => {
        if (err) {
            // Handle cases where the file doesn't exist or another error occurs
            res.status(404).send('Page not found');
        }
    });
});

module.exports = router;
