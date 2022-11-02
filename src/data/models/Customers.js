const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const { getDefaultDB } = require('../../infrastructures/mongoose');

const schema = mongoose.Schema;

const CustomerSchema = mongoose.Schema(
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
    },
    nameUnsigned: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    sex: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    status: {
      type: Boolean,
      required: true,
    },
    avatar: {
      type: String,
    },
    address: [
      {
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
        status: {
          type: Boolean,
        },
      },
    ],
  },
  { timestamps: true },
);
CustomerSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = getDefaultDB().model('Customers', CustomerSchema);
