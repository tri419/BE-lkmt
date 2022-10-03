'use strict';

/**
 * ApiError class
 *
 * @class ApiError
 */
class ApiError {
  /**
   * Creates an instance of ApiError.
   * @memberof ApiError
   */
  constructor() {
    /** @type {Number} */
    this.code = undefined;
    /** @type {String} */
    this.type = undefined;
    /** @type {String} */
    this.message = undefined;
    /** @type {Number} */
    this.http = undefined;
    /** @type {Object} */
    this.meta = undefined;
  }

  static initWithParams({ code = 0, type = '', message = '', http = 400 }) {
    const ret = new ApiError();
    ret.code = code;
    ret.type = type;
    ret.message = message;
    ret.http = http;
    return ret;
  }
}

module.exports = ApiError;
