'use strict';
const productModel = require('./models/Products');
const roleModel = require('./models/Roles');
const userModel = require('./models/Users');

module.exports = {
  productModel: productModel,
  roleModel: roleModel,
  userModel: userModel,
};
