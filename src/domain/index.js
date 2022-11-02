'use strict';
const {
  productRepository,
  customerRepository,
  orderRepository,
  userRepository,
  roleRepository,
} = require('../data');

const ProductService = require('./product');
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
  axios,
);

module.exports = {
  productService,
  //customerService,
};
