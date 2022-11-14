'use strict';
const productModel = require('./models/Products');
const userModel = require('./models/Users');
const customerModel = require('./models/Customers');
const productTypeModel = require('./models/ProductTypes');
const brandModel = require('./models/Brands');
const roleModel = require('./models/Roles');
const cartModel = require('./models/Carts');

const ProductRepository = require('./product_repository');
const CustomerRepository = require('./customer_repository');
const UserRepository = require('./user_repository');
const ProductTypeRepository = require('./productType_repository');
const RoleRepository = require('./role_repository');
const BrandRepository = require('./brand_repository');
const CartRepository = require('./cart_repository');
module.exports = {
  productRepository: new ProductRepository({}),
  customerRepository: new CustomerRepository({}),
  userRepository: new UserRepository({}),
  productTypeRepository: new ProductTypeRepository({}),
  roleRepository: new RoleRepository({}),
  brandRepository: new BrandRepository({}),
  cartRepository: new CartRepository({}),

  productModel: productModel,
  roleModel: roleModel,
  userModel: userModel,
  customerModel: customerModel,
  productTypeModel: productTypeModel,
  brandModel: brandModel,
  roleModel: roleModel,
  cartModel: cartModel,
};
