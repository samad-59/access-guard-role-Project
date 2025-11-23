const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');
const permissionRoutes = require('./routes/permissions');
const logRoutes = require('./routes/logs');
const Role = require('./models/Role');
const Permission = require('./models/Permission');
const User = require('./models/User');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/logs', logRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Seeding Data
const seedData = async () => {
    try {
        const permissionCount = await Permission.countDocuments();
        if (permissionCount === 0) {
            console.log('Seeding Permissions...');
            const permissions = [
                'read_users', 'create_users', 'update_users', 'delete_users',
                'read_roles', 'create_roles', 'update_roles', 'delete_roles',
                'read_permissions', 'create_permissions',
                'read_logs'
            ];

            const createdPermissions = [];
            for (const perm of permissions) {
                const p = await Permission.create({ name: perm, description: `Can ${perm.replace('_', ' ')}` });
                createdPermissions.push(p);
            }
            console.log('Permissions Seeded');

            console.log('Seeding Admin Role...');
            const adminRole = await Role.create({
                name: 'Admin',
                permissions: permissions, // Admin gets all permissions
                description: 'Administrator with full access'
            });
            console.log('Admin Role Seeded');

            console.log('Seeding Admin User...');
            await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: adminRole._id,
                status: 'Active'
            });
            console.log('Admin User Seeded: admin@example.com / password123');
        }
    } catch (error) {
        console.error('Seeding Error:', error);
    }
};

seedData();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
