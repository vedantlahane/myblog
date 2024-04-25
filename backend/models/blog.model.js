// backend/models/blog.model.js

const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
  title: String,
  content: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Blog', blogSchema);
