'use strict';
/**
 * @typedef {import("./policy")} PolicyService
 * @typedef {import("../data/productType_repository")} productTypeRepository
 * @typedef {import("../data/product_repository")} productRepository
 */
const { defaultsDeep } = require('lodash');
const { ulid } = require('ulid');
const { ErrorModel } = require('../models');
const { ERROR, ROUTE, LOGS } = require('../constants');
const { Utils } = require('../libs/utils');

const defaultOpts = {};

class ProductTypeService {
  /**
   *
   * @param {*} opts
   * @param {PolicyService} policy
   * @param {productTypeRepository} repo
   * @param {productRepository} repoProduct
   */
  constructor(opts, policy, repo, repoProduct) {
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.policy = policy;
    this.repo = repo;
    this.repoProduct = repoProduct;
  }
  async createProductType(data) {
    data.uid = ulid();
    const output = await this.repo.createOne(data);
    return output;
  }
  async updateProductType(msg) {
    const { uid, data } = msg;
    const findProductType = await this.repo.findOne('uid', uid);
    if (!findProductType) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const output = await this.repo.updateProductTypeById(msg);
    return output;
  }
  async viewProductType(uid) {
    const findProductType = await this.repo.findOne('uid', uid);
    if (!findProductType) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    return findProductType;
  }
  async deleteProductType(uid) {
    const findProductType = await this.repo.findOne('uid', uid);
    if (!findProductType) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    try {
      await this.repo.deleteProductTypeById(uid);
      return true;
    } catch (error) {
      return false;
    }
  }
  async updateStatusProductType(msg) {
    const { uid, data } = msg;
    const findProductType = await this.repo.findOne('uid', uid);
    if (!findProductType) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const output = await this.repo.updateProductTypeById(msg);
    return output;
  }
  async searchProductType(data) {
    const output = await this.repo.search(data);
    return output;
  }
}
module.exports = ProductTypeService;
