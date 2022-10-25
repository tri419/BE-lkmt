const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const { getDefaultDB } = require('../../infrastructures/mongoose');

const schema = mongoose.Schema;

const UserSchema = new schema({
  uid: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  code: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  unsignedName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
  avatar: {
    type: string,
    required: false,
  },
  roleId: {
    type: String,
    required: true,
  },
});
UserSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = getDefaultDB().model('Users', UserSchema);
