const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');
const ActivityLog = require('../models/ActivityLog');

// @route   GET /api/roles
// @desc    Get all roles
// @access  Private/Admin (Read Roles)
router.get('/', protect, checkPermission('read_roles'), async (req, res) => {
    try {
        const roles = await Role.find({});
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/roles
// @desc    Create a role
// @access  Private/Admin (Create Roles)
router.post('/', protect, checkPermission('create_roles'), async (req, res) => {
    const { name, permissions, description } = req.body;

    try {
        const roleExists = await Role.findOne({ name });

        if (roleExists) {
            return res.status(400).json({ message: 'Role already exists' });
        }

        const role = await Role.create({
            name,
            permissions,
            description
        });

        await ActivityLog.create({
            user: req.user._id,
            action: 'Create Role',
            ipAddress: req.ip,
            details: `Created role ${role.name}`
        });

        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/roles/:id
// @desc    Update role
// @access  Private/Admin (Update Roles)
router.put('/:id', protect, checkPermission('update_roles'), async (req, res) => {
    const { name, permissions, description } = req.body;

    try {
        const role = await Role.findById(req.params.id);

        if (role) {
            role.name = name || role.name;
            role.permissions = permissions || role.permissions;
            role.description = description || role.description;

            const updatedRole = await role.save();

            await ActivityLog.create({
                user: req.user._id,
                action: 'Update Role',
                ipAddress: req.ip,
                details: `Updated role ${role.name}`
            });

            res.json(updatedRole);
        } else {
            res.status(404).json({ message: 'Role not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/roles/:id
// @desc    Delete role
// @access  Private/Admin (Delete Roles)
router.delete('/:id', protect, checkPermission('delete_roles'), async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);

        if (role) {
            await role.deleteOne();

            await ActivityLog.create({
                user: req.user._id,
                action: 'Delete Role',
                ipAddress: req.ip,
                details: `Deleted role ${role.name}`
            });

            res.json({ message: 'Role removed' });
        } else {
            res.status(404).json({ message: 'Role not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
