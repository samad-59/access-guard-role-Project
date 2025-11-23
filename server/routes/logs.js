const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');

// @route   GET /api/logs
// @desc    Get all activity logs
// @access  Private/Admin (Read Logs)
router.get('/', protect, checkPermission('read_logs'), async (req, res) => {
    try {
        const logs = await ActivityLog.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
