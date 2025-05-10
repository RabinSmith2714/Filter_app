const mongoose = require('mongoose');

const filterRecordSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    filterName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('FilterRecord', filterRecordSchema); 