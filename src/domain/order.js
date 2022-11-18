'use strict';
/**
 * @typedef {import("./policy")} PolicyService
 * @typedef {import("../data/order_repository")} orderRepository
 * @typedef {import("../data/customer_repository")} customerRepository
 * @typedef {import("../data/product_repository")} productRepository
 * @typedef {import("../data/cart_repository")} cartRepository
 * @typedef {import("../data/user_repository")} userRepository
 */
const { defaultsDeep } = require('lodash');
const { ulid } = require('ulid');
const { ErrorModel } = require('../models');
const { ERROR, ROUTE, LOGS } = require('../constants');
const { Utils } = require('../libs/utils');
const moment = require('moment');
const defaultOpts = {};
class OrderService {
  /**
   *
   * @param {*} opts
   * @param {PolicyService} policy
   * @param {orderRepository} repo
   * @param {cartRepository} repoCart
   * @param {customerRepository} repoCustomer
   * @param {productRepository} repoProduct
   * @param {userRepository} repoUser
   */
  constructor(
    opts,
    policy,
    repo,
    repoCart,
    repoCustomer,
    repoProduct,
    repoUser,
  ) {
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.policy = policy;
    this.repo = repo;
    this.repoCart = repoCart;
    this.repoCustomer = repoCustomer;
    this.repoProduct = repoProduct;
    this.repoUser = repoUser;
  }
  async create(data) {
    data.uid = ulid();
    data.orderCode = await this.repo.generateOrderCode();
    data.date = moment(new Date()).format('YYYY/MM/DD');
    if (data.product.length === 0) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Hãy thêm sản phẩm vào giỏ hàng',
      });
    }
    const output = await this.repo.create(data);
    await this.repoCart.update(
      { customerId: data.customerId },
      {
        $set: {
          product: [],
        },
      },
    );
    return output;
  }
  async searchOrder(data) {
    const output = await this.repo.search(data);
    return output;
  }
  async viewOrderById(uid) {
    const findOrder = await this.repo.findOne('uid', uid);
    if (!findOrder) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const findCustomer = await this.repoCustomer.findOne(
      'uid',
      findOrder.customerId,
    );
    const output = {
      uid: uid,
      orderCode: findOrder.orderCode,
      customerId: findOrder.customerId,
      customerName: findCustomer.name,
      product: findOrder.product,
      status: findOrder.status,
      typePayment: findOrder.typePayment,
      phone: findOrder.phone,
      email: findOrder.email,
      address: findOrder.address,
      totalAmount: findOrder.totalAmount,
      shipperId: findOrder.shipperId,
    };
    return output;
  }
}
module.exports = OrderService;
