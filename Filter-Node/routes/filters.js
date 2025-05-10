const express = require('express');
const router = express.Router();
const FilterRecord = require('../models/FilterRecord');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (!req.session.username) {
        return res.json({ success: false, message: 'Not authenticated' });
    }
    next();
};

// Track filter usage
router.post('/track', isAuthenticated, async (req, res) => {
    try {
        const { filterName } = req.body;
        const record = new FilterRecord({
            username: req.session.username,
            filterName
        });
        await record.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking filter:', error);
        res.json({ success: false, message: 'Server error' });
    }
});

// Get filter history
router.get('/history', isAuthenticated, async (req, res) => {
    try {
        const records = await FilterRecord.find({ username: req.session.username })
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json({
            success: true,
            records: records.map(record => ({
                filterName: record.filterName,
                createdAt: record.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching filter history:', error);
        res.json({ success: false, message: 'Server error' });
    }
});

module.exports = router; 