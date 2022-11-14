'use strict';
const {
  productRepository,
  customerRepository,
  orderRepository,
  userRepository,
  roleRepository,
  productTypeRepository,
  brandRepository,
  cartRepository,
} = require('../data');

const ProductService = require('./product');
const CustomerService = require('./customer');
const RoleService = require('./role');
const ProductTypeService = require('./productType');
const BrandService = require('./brand');
const PolicyService = require('./policy');
const UserService = require('./user');
const CartService = require('./cart');
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
  brandRepository,
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
const roleService = new RoleService({}, policyService, roleRepository);
const cartService = new CartService({}, policyService, cartRepository);
module.exports = {
  productService,
  customerService,
  productTypeService,
  brandService,
  userService,
  roleService,
  cartService,
};
