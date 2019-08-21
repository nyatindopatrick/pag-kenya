const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  username:
  {
    type: String,
    required: true
  },
  phoneNo:
  {
    type: Number,
    required: true
  },
  idNo:
  {
    type: Number,
    required: true
  },
  dob:
  {
    type: Date,
    required: true
  },
  gender:
  {
    type: String,
    required: true
  },
  station:
  {
    type: String,
    required: true
  },
  county:
  {
    type: String,
    required: true
  },
  education:
  {
    type: String,
    required: true
  },
  institution:
  {
    type: String,
    required: true
  },
  profile:
  {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
