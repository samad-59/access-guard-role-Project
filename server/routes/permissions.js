const express = require('express');
const router = express.Router();
const Permission = require('../models/Permission');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');

// @route   GET /api/permissions
// @desc    Get all permissions
// @access  Private/Admin (Read Permissions)
router.get('/', protect, checkPermission('read_permissions'), async (req, res) => {
    try {
        const permissions = await Permission.find({});
        res.json(permissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/permissions
// @desc    Create a permission (Optional, usually seeded)
// @access  Private/Admin (Create Permissions)
router.post('/', protect, checkPermission('create_permissions'), async (req, res) => {
    const { name, description } = req.body;

    try {
        const permission = await Permission.create({
            name,
            description
        });
        res.status(201).json(permission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
