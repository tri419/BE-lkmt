const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const { getDefaultDB } = require('../../infrastructures/mongoose');

const schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);
const CartSchema = new Schema(
  {
    uid: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    product: [ProductSchema],
  },
  { timestamps: true },
);
CartSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = getDefaultDB().model('Carts', CartSchema);
