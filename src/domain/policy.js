'use strict';
/**
 * @typedef {import("../infrastructures/redis")} RedisConnection
 */
const { defaultsDeep } = require('lodash');
const { ErrorModel } = require('../models');
const { ERROR } = require('../constants');

const defaultOpts = {};

/**
 * PolicyService
 */
class PolicyService {
  /**
   *
   * @param {*} opts
   * @param {RedisConnection} redis
   */
  constructor(opts, redis) {
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.redis = redis;
  }

  /* ------------------------------- Check Auth ------------------------------- */
  /**
   * @param  {String} role
   * @param  {String} route
   */
  async check(role, route) {
    const permissions = await this.getObject(role);
    if (!permissions) {
      throw ErrorModel.initWithParams({
        ...ERROR.AUTH.UNAUTHORIZED,
      });
    }
    const data = permissions.permissions.find((item) => item.route === route);
    if (!data || !data.enabled) {
      throw ErrorModel.initWithParams({
        ...ERROR.AUTH.UNAUTHORIZED,
      });
    }
    return true;
  }
  /* -------------------------------------------------------------------------- */

  /* ---------------------------------- REDIS --------------------------------- */
  /**
   * @param  {String} uid
   */
  async getObject(uid) {
    const user = await this.redis.getObject(uid);
    return user;
  }
  /**
   * @param  {String} key
   * @param  {String} value
   * @param  {String} expire=60*60
   */
  async cacheSetEx(key, value, expire = 60) {
    return this.redis.setEx(key, expire, value);
  }
  /**
   * @param  {String} key
   */
  async cacheGet(key) {
    const uid = await this.redis.get(key);
    return uid;
  }
  /**
   * @param  {String} key
   */
  async cacheDel(key) {
    return this.redis.del(key);
  }
  /**
   * @param  {String} key
   */
  async cacheGetKey(key) {
    const ret = await this.redis.getKey(key);
    return ret;
  }
  /**
   * @param  {String} key
   */
  async cacheDel(key) {
    return this.redis.del(key);
  }
  /* -------------------------------------------------------------------------- */
}

module.exports = PolicyService;
