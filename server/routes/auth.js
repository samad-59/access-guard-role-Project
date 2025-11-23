const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const ActivityLog = require('../models/ActivityLog');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).populate('role');

        if (user && (await user.matchPassword(password))) {
            if (user.status === 'Blocked') {
                return res.status(403).json({ message: 'Your account has been blocked.' });
            }

            // Log activity
            await ActivityLog.create({
                user: user._id,
                action: 'Login',
                ipAddress: req.ip,
                details: 'User logged in successfully'
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/register
// @desc    Register a new user (Initial Admin setup or public registration if needed)
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Assign default role if exists, or null. In a real app, we might want to set a default 'User' role.
        // For now, we'll let the admin assign roles later, or if it's the first user, maybe make them admin?
        // Let's keep it simple: just create user.

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            // Log activity
            await ActivityLog.create({
                user: user._id,
                action: 'Register',
                ipAddress: req.ip,
                details: 'User registered'
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
