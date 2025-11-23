const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Access denied. No role assigned.' });
        }

        const userPermissions = req.user.role.permissions; // Array of permission strings

        if (userPermissions.includes(requiredPermission)) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
    };
};

module.exports = { checkPermission };
