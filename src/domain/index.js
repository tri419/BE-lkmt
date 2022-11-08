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
module.exports = {
  productService,
  customerService,
  productTypeService,
};
