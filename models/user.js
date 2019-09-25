let mongoose = require('mongoose');

module.exports = mongoose.model('user', new mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    pwd: {
        type: String,
        default: ''
    },
    createTime: {
        type: Date,
        default: new Date()
    }
}), 'user');
