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
}
module.exports = OrderService;
