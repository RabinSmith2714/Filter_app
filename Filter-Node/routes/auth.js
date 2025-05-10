const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt for username:', username);
        
        const user = await User.findByUsername(username);
        console.log('Found user:', user);

        if (!user) {
            console.log('User not found');
            return res.json({ success: false, message: 'Invalid username or password' });
        }

        const isMatch = User.comparePassword(user.password, password);
        console.log('Password match:', isMatch);
        console.log('Stored password:', user.password);
        console.log('Attempted password:', password);

        if (!isMatch) {
            console.log('Password does not match');
            return res.json({ success: false, message: 'Invalid username or password' });
        }

        req.session.username = username;
        console.log('Login successful');
        res.json({ success: true });
    } catch (error) {
        console.error('Login error:', error);
        res.json({ success: false, message: 'Server error' });
    }
});

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.json({ success: false, message: 'Username already exists' });
        }

        await User.create(username, password);
        req.session.username = username;
        res.json({ success: true });
    } catch (error) {
        console.error('Registration error:', error);
        res.json({ success: false, message: 'Server error' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

module.exports = router; 