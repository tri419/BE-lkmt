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
      required: true,
    },
    roleId: {
      type: String,
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
// //
// CustomerSchema.pre('save', async function (next) {
//   // Hash the password before saving the user model
//   const customer = this;
//   if (customer.isModified('password')) {
//     customer.password = await bcrypt.hash(customer.password, 8);
//   }
//   next();
// });
// CustomerSchema.methods.generateAuthToken = async function () {
//   // Generate an auth token for the user
//   const customer = this;
//   const token = jwt.sign({ uid: customer.uid }, process.env.JWT_KEY);
//   customer.tokens = customer.tokens.concat({ token });
//   await customer.save();
//   return token;
// };

// CustomerSchema.statics.findByCredentials = async (email, password) => {
//   // Search for a user by email and password.
//   const customer = await Customer.findOne({ email });
//   if (!customer) {
//     throw new Error({ error: 'Invalid login credentials' });
//   }
//   const isPasswordMatch = await bcrypt.compare(password, customer.password);
//   if (!isPasswordMatch) {
//     throw new Error({ error: 'Invalid login credentials' });
//   }
//   return customer;
// };
CustomerSchema.pre('save', function (next) {
  const customer = this;
  customer.password = hashText(customer.password);
  next();
});
CustomerSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = getDefaultDB().model('Customers', CustomerSchema);
