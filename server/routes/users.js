const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');
const ActivityLog = require('../models/ActivityLog');

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin (Read Users)
router.get('/', protect, checkPermission('read_users'), async (req, res) => {
    try {
        const users = await User.find({}).select('-password').populate('role');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/users
// @desc    Create a user
// @access  Private/Admin (Create Users)
router.post('/', protect, checkPermission('create_users'), async (req, res) => {
    const { name, email, password, role, status } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            status
        });

        if (user) {
            await ActivityLog.create({
                user: req.user._id,
                action: 'Create User',
                ipAddress: req.ip,
                details: `Created user ${user.email}`
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user (Role, Status)
// @access  Private/Admin (Update Users)
router.put('/:id', protect, checkPermission('update_users'), async (req, res) => {
    const { name, email, role, status } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            user.role = role || user.role;
            user.status = status || user.status;

            const updatedUser = await user.save();

            await ActivityLog.create({
                user: req.user._id,
                action: 'Update User',
                ipAddress: req.ip,
                details: `Updated user ${user.email}`
            });

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin (Delete Users)
router.delete('/:id', protect, checkPermission('delete_users'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();

            await ActivityLog.create({
                user: req.user._id,
                action: 'Delete User',
                ipAddress: req.ip,
                details: `Deleted user ${user.email}`
            });

            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
