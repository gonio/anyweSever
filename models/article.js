let mongoose = require('mongoose');

module.exports = mongoose.model('article', new mongoose.Schema({
    title: String,
    content: String,
    name: String,
    time: Number
}), 'article');
