'use strict';
/**
 * @typedef {import("./policy")} PolicyService
 * @typedef {import("../data/product_repository")} productRepository
 * @typedef {import("../data/customer_repository")} customerRepository
 * @typedef {import("../data/order_repository")} orderRepository
 */
const { defaultsDeep } = require('lodash');
const { ulid } = require('ulid');
const { ErrorModel } = require('../models');
const { ERROR, ROUTE, LOGS } = require('../constants');
const { Utils } = require('../libs/utils');

const defaultOpts = {};

class CustomerService {
  /**
   *
   * @param {*} opts
   * @param {PolicyService} policy
   * @param {customerRepository} repo
   * @param {productRepository} repoProduct
   * @param {orderRepository} repoOrder
   */
  constructor(opts, policy, repo, repoProduct, repoOrder) {
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.policy = policy;
    this.repo = repo;
    this.repoCustomer = repoProduct;
    this.repoOrder = repoOrder;
  }
  async create(data) {
    data.uid = ulid();
    const output = await this.repo.createOne(data);
    return output;
  }
}
module.exports = CustomerService;
