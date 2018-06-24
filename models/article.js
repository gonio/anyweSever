let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let articleModel = mongoose.model('article', new Schema({
    title: String,
    content: String,
    name: String,
    time: Number
}), 'article');

module.exports = articleModel;