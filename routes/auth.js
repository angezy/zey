const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../config/db');
const { validateSignup, handleValidationErrors } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

// Rate limiter for authentication routes
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    max: 3, // Limit each IP to 3 requests per windowMs (24 hours)
    message: 'Too many requests from this IP, please try again after 24 hours.'
});

router.use(limiter);

// Signup Route
router.post('/signup', validateSignup, handleValidationErrors, async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Connect to the database
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 16);

        // Create a new user
        const newUser = {
            username,
            email,
            password: hashedPassword,
            createdAt: new Date(),
        };

        await usersCollection.insertOne(newUser);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Sign In Route
router.post('/signin', async (req, res) => {
    const { email, password, rememberMe } = req.body;

    try {
        // Connect to the database
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        // Check if the user exists
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Verify the password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Create a JWT token with different expiration times based on 'rememberMe'
        const tokenOptions = rememberMe ? { expiresIn: '7d' } : { expiresIn: '1h' };
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, tokenOptions);

        res.json({ message: 'Signin successful', token });
    } catch (err) {
        console.error('Error during signin:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
