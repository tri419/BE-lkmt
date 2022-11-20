const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const { getDefaultDB } = require('../../infrastructures/mongoose');

const schema = mongoose.Schema;

const ProductSchema = new schema({
  productId: {
    type: String,
  },
  number: {
    type: Number,
  },
  price: {
    type: Number,
  },
});
const OrderSchema = new schema(
  {
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
    status: {
      type: String,
    },
    address: {
      street: {
        type: String,
      },
      province: {
        type: String,
      },
      district: {
        type: String,
      },
      ward: {
        type: String,
      },
    },
    date: {
      type: String,
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
    deliveryDate: {
      type: String,
    },
  },
  { timestamps: true },
);
OrderSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = getDefaultDB().model('Orders', OrderSchema);
