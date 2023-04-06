'use strict';
/**
 * @typedef {import("./policy")} PolicyService
 * @typedef {import("../data/roleRepository")} roleRepository
 */
const { defaultsDeep } = require('lodash');
const { ulid } = require('ulid');
const { ErrorModel } = require('../models');
const { ERROR, ROUTE, LOGS } = require('../constants');
const { Utils } = require('../libs/utils');

const defaultOpts = {};

class RoleService {
  /**
   *
   * @param {*} opts
   * @param {PolicyService} policy
   * @param {roleRepository} repo
   */
  constructor(opts, policy, repo, repoProduct) {
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.policy = policy;
    this.repo = repo;
  }
  async createRole(data) {
    data.uid = ulid();
    const output = await this.repo.createOne(data);
    return output;
  }
  async updateRole(msg) {
    const { uid, data } = msg;
    const findRole = await this.repo.findOne('uid', uid);
    if (!findRole) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const output = await this.repo.updateRoleById(msg);
    return output;
  }
  async viewRole(uid) {
    const findRole = await this.repo.findOne('uid', uid);
    if (!findRole) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    return findRole;
  }
  async deleteRole(uid) {
    const findRole = await this.repo.findOne('uid', uid);
    if (!findRole) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    try {
      await this.repo.deleteRoleById(uid);
      return true;
    } catch (error) {
      return false;
    }
  }
  async updateStatusRole(msg) {
    const { uid, data } = msg;
    const findProductType = await this.repo.findOne('uid', uid);
    if (!findProductType) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const output = await this.repo.updateRoleById(msg);
    return output;
  }
  async searchRole(data) {
    const output = await this.repo.search(data);
    return output;
  }
}
module.exports = RoleService;
