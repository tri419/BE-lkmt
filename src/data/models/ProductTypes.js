const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const { getDefaultDB } = require('../../infrastructures/mongoose');
const schema = mongoose.Schema;

const ProductTypeSchema = new schema(
  {
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
    nameUnsigned: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true },
);
ProductTypeSchema.plugin(mongooseDelete, { ProductTypeSchema: true });
module.exports = getDefaultDB().model('ProductTypes', ProductTypeSchema);
