const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { getDefaultDB } = require('../../infrastructures/mongoose');
const { hashText } = require('../../libs/bcrypt_helper');
//const Customer = require('../../models/customer');
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
      required: true,
    },
    password: {
      type: String,
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
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
    },
    avatar: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
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
        district_Id: {
          type: String,
        },
        ward_Id: {
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
CustomerSchema.pre('save', function (next) {
  const customer = this;
  customer.password = hashText(customer.password);
  next();
});

CustomerSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = getDefaultDB().model('Customers', CustomerSchema);
