const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    permissions: [{
        type: String, // Storing permission names for simplicity, or could be ObjectId
        ref: 'Permission'
    }],
    description: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
