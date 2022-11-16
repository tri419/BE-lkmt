const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const { getDefaultDB } = require('../../infrastructures/mongoose');

const schema = mongoose.Schema;

const ProductSchema = new schema({
  productId: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
  },
  price: {
    type: Number,
  },
});
const AddressSchema = new schema({
  street: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  ward: {
    type: String,
    required: true,
  },
});
const OrderSchema = new schema({
  uid: {
    type: String,
    require: true,
    unique: true,
    index: true,
  },
  orderCode: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  product: [ProductSchema],
  transportFee: {
    type: Number,
    required: false,
    default: 0,
  },
  orderCode: {
    type: String,
    required: true,
  },
  typePayment: {
    //COD, BANK, ONLINE
    type: String,
    required: false,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  address: [AddressSchema],
  date: {
    type: String,
    required: true,
  },
  totalAmount: {
    total: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
  },
  shipperId: {
    type: String,
  },
});
OrderSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = getDefaultDB().model('Orders', OrderSchema);
