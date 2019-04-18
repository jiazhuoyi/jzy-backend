const mongoose = require('mongoose');

const LoginlogSchema = new mongoose.Schema({
  // _id: { type: String, default: new mongoose.Types.ObjectId() },
  // _id: mongoose.Types.ObjectId(),
  account: String,
  date: { type: Number, default: Date.now }
});

module.exports = mongoose.model('loginlog', LoginlogSchema);