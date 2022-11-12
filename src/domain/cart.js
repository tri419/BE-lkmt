'use strict';
/**
 * @typedef {import("./policy")} PolicyService
 * @typedef {import("../data/product_repository")} productRepository
 * @typedef {import("../data/customer_repository")} customerRepository
 * @typedef {import("../data/order_repository")} orderRepository
 * @typedef {import("../data/user_repository")} userRepository
 * @typedef {import("../data/cart_repository")} cartRepository
 */
const { defaultsDeep } = require('lodash');
const { ulid } = require('ulid');
const { ErrorModel } = require('../models');
const { ERROR, ROUTE, LOGS } = require('../constants');
const { Utils } = require('../libs/utils');

class CartService {
  /**
   *
   * @param {*} opts
   * @param {PolicyService} policy
   * @param {productRepository} repoProduct
   * @param {customerRepository} repoCustomer
   * @param {orderRepository} repoOrder
   * @param {userRepository} repoUser
   * @param {cartRepository} repo
   */
  constructor(
    opts,
    policy,
    repoProduct,
    repoCustomer,
    repoOrder,
    repoUser,
    repo,
  ) {
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.policy = policy;
    this.repoProduct = repoProduct;
    this.repoCustomer = repoCustomer;
    this.repoOrder = repoOrder;
    this.repoUser = repoUser;
    this.repo = repo;
  }
  async create(data) {
    data.uid = ulid();
    const output = await this.repo.createOne(data);
    return output;
  }
}
