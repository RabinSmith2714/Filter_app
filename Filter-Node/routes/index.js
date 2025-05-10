const express = require('express');
const router = express.Router();
const path = require('path');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (!req.session.username && req.path !== '/login.html') {
        return res.redirect('/login.html');
    }
    next();
};

// Serve static files
router.use(express.static(path.join(__dirname, '../public')));

// Routes
router.get('/', (req, res) => {
    if (req.session.username) {
        res.redirect('/landing.html');
    } else {
        res.redirect('/login.html');
    }
});

router.get('/login.html', (req, res) => {
    if (req.session.username) {
        res.redirect('/landing.html');
    } else {
        res.sendFile(path.join(__dirname, '../public/login.html'));
    }
});

router.get('/landing.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/landing.html'));
});

router.get('/filters.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/filters.html'));
});

module.exports = router; 