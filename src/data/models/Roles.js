const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const { getDefaultDB } = require('../../infrastructures/mongoose');

const schema = mongoose.Schema;

const RoleSchema = new schema(
  {
    uid: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
);
RoleSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = getDefaultDB().model('Roles', RoleSchema);
