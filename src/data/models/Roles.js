const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const { getDefaultDB } = require('../../infrastructures/mongoose');

const schema = mongoose.Schema;

const RoleSchema = new schema({
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
});
RoleSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = getDefaultDB().model('Roles', RoleSchema);
