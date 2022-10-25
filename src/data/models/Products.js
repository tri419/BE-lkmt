const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const { getDefaultDB } = require('../../infrastructures/mongoose');

const schema = mongoose.Schema;

const ProductSchema = new schema({
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
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
  discount: {
    type: Number,
    required: false,
  },
  discountPrice: {
    type: Number,
    required: false,
  },
  expiryDate: {
    type: Number,
    required: true,
  },
  productType: {
    type: string,
    required: true,
  },
  brand: {
    type: string,
    required: true,
  },
  image: [
    {
      type: string,
    },
  ],
  descriptionSummary: {
    type: String,
  },
  descriptionDetail: [
    {
      name: {
        type: String,
      },
      description: {
        type: String,
      },
    },
  ],
});
ProductSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = getDefaultDB().model('Products', ProductSchema);
