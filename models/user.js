let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let userModel = mongoose.model('user', new Schema({
    name: String,
    pwd: String,
    createTime: Number
}), 'user');

module.exports = userModel;