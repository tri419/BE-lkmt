'use strict';
const productModel = require('./models/Products');
const roleModel = require('./models/Roles');
const userModel = require('./models/Users');
const customerModel = require('./models/Customers');
const productTypeModel = require('./models/ProductTypes');

const ProductRepository = require('./product_repository');
const CustomerRepository = require('./customer_repository');
const UserRepository = require('./user_repository');
const ProductTypeRepository = require('./productType_repository');
const RoleRepository = require('./role_repository');
module.exports = {
  productRepository: new ProductRepository({}),
  customerRepository: new CustomerRepository({}),
  userRepository: new UserRepository({}),
  productTypeRepository: new ProductTypeRepository({}),
  roleRepository: new RoleRepository({}),

  productModel: productModel,
  roleModel: roleModel,
  userModel: userModel,
  customerModel: customerModel,
  productTypeModel: productTypeModel,
};
