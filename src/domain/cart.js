'use strict';
/**
 * @typedef {import("./policy")} PolicyService
 * @typedef {import("../data/cart_repository")} cartRepository
 * @typedef {import("../data/customer_repository")} customerRepository
 * @typedef {import("../data/product_repository")} productRepository
 * @typedef {import("../data/order_repository")} orderRepository
 * @typedef {import("../data/user_repository")} userRepository
 
 */
const { defaultsDeep } = require('lodash');
const { ulid } = require('ulid');
const { ErrorModel } = require('../models');
const { ERROR, ROUTE, LOGS } = require('../constants');
const { Utils } = require('../libs/utils');
const defaultOpts = {};
class CartService {
  /**
   *
   * @param {*} opts
   * @param {PolicyService} policy
   * @param {cartRepository} repo
   * @param {customerRepository} repoCustomer
   * @param {productRepository} repoProduct
   * @param {orderRepository} repoOrder
   * @param {userRepository} repoUser
   */
  constructor(
    opts,
    policy,
    repo,
    repoCustomer,
    repoProduct,
    repoOrder,
    repoUser,
  ) {
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.policy = policy;
    this.repo = repo;
    this.repoCustomer = repoCustomer;
    this.repoProduct = repoProduct;
    this.repoOrder = repoOrder;
    this.repoUser = repoUser;
  }
  async create(data) {
    data.uid = ulid();
    const output = await this.repo.createOne(data);
    return output;
  }
  async update(msg) {
    const { uid, data } = msg;
    const findCart = await this.repo.findOne('uid', uid);
    if (!findCart) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const findProductOnCart = findCart.product.filter(
      (item) => item.productId === data.productId,
    );
    if (findProductOnCart.length > 0) {
      const ret = await this.repo.update(
        {
          customerId: findCart.customerId,
          'product.productId': data.productId,
        },
        {
          $set: {
            'product.$.number': data.number + findProductOnCart[0].number,
          },
        },
      );
      if (!ret) {
        throw ErrorModel.initWithParams({
          ...ERROR.VALIDATION.INVALID_REQUEST,
          message: 'Cập nhật không thành công',
        });
      }
      return ret;
    } else {
      findCart.product.push({
        productId: data.productId,
        number: data.number,
        price: data.price,
      });
      const ret = await this.repo.update(
        {
          uid: uid,
        },
        {
          $set: {
            product: findCart.product,
          },
        },
      );
      if (!ret) {
        throw ErrorModel.initWithParams({
          ...ERROR.VALIDATION.INVALID_REQUEST,
          message: 'Cập nhật không thành công',
        });
      }
      return ret;
    }
  }
  async viewCart(customerId) {
    const findCart = await this.repo.findOne('customerId', customerId);
    if (!findCart) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const listProduct = [];
    for (let i = 0; i < findCart.product.length; i++) {
      const findProduct = await this.repoProduct.findOne(
        'uid',
        findCart.product[i].productId,
      );
      listProduct.push({
        productId: findProduct.uid,
        name: findProduct.name,
        number: findCart.product[i].number,
        image: findProduct.image,
        price: findCart.product[i].price,
        discount: findProduct.discount,
      });
    }
    findCart.product = listProduct;
    return findCart;
  }
}
module.exports = CartService;
