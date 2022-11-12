'use strict';
const {
  productRepository,
  customerRepository,
  orderRepository,
  userRepository,
  roleRepository,
  productTypeRepository,
} = require('../data');

const ProductService = require('./product');
const CustomerService = require('./customer');
const RoleService = require('./role');
const ProductTypeService = require('./productType');
const PolicyService = require('./policy');
const { redisClient, axios } = require('../infrastructures');

const policyService = new PolicyService({}, redisClient);
const productService = new ProductService(
  {},
  policyService,
  productRepository,
  customerRepository,
  orderRepository,
  userRepository,
  productTypeRepository,
  axios,
);
const customerService = new CustomerService(
  {},
  policyService,
  customerRepository,
  productRepository,
  orderRepository,
  roleRepository,
  axios,
);
const productTypeService = new ProductTypeService(
  {},
  policyService,
  productTypeRepository,
);
const roleService = new RoleService({}, policyService, roleRepository);
module.exports = {
  productService,
  customerService,
  productTypeService,
  roleService,
};
