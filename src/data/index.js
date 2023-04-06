'use strict';
const productModel = require('./models/Products');
const userModel = require('./models/Users');
const customerModel = require('./models/Customers');
const productTypeModel = require('./models/ProductTypes');
const brandModel = require('./models/Brands');
const roleModel = require('./models/Roles');
const cartModel = require('./models/Carts');
const orderModel = require('./models/Orders');

const ProductRepository = require('./productRepository');
const CustomerRepository = require('./customerRepository');
const UserRepository = require('./userRepository');
const ProductTypeRepository = require('./productTypeRepository');
const RoleRepository = require('./roleRepository');
const BrandRepository = require('./brandRepository');
const CartRepository = require('./cartRepository');
const OrderRepository = require('./orderRepository');
module.exports = {
  productRepository: new ProductRepository({}),
  customerRepository: new CustomerRepository({}),
  userRepository: new UserRepository({}),
  productTypeRepository: new ProductTypeRepository({}),
  roleRepository: new RoleRepository({}),
  brandRepository: new BrandRepository({}),
  cartRepository: new CartRepository({}),
  orderRepository: new OrderRepository({}),

  productModel: productModel,
  roleModel: roleModel,
  userModel: userModel,
  customerModel: customerModel,
  productTypeModel: productTypeModel,
  brandModel: brandModel,
  roleModel: roleModel,
  cartModel: cartModel,
  orderModel: orderModel,
};
