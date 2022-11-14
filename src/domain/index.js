'use strict';
const {
  productRepository,
  customerRepository,
  orderRepository,
  userRepository,
  roleRepository,
  productTypeRepository,
  brandRepository,
} = require('../data');

const ProductService = require('./product');
const CustomerService = require('./customer');
const ProductTypeService = require('./productType');
const BrandService = require('./brand');
const PolicyService = require('./policy');
const UserService = require('./user');
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
  productRepository,
  customerRepository,
  orderRepository,
  roleRepository,
  axios,
);
const productTypeService = new ProductTypeService(
  {},
  policyService,
  productTypeRepository,
);
const brandService = new BrandService(
  {},
  policyService,
  productRepository,
  customerRepository,
  orderRepository,
  roleRepository,
  brandRepository,
);
const userService = new UserService(
  {},
  policyService,
  productRepository,
  customerRepository,
  orderRepository,
  userRepository,
);
module.exports = {
  productService,
  customerService,
  productTypeService,
  brandService,
  userService,
};
