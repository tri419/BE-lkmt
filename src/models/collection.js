'use strict';

/**
 * @template T
 */
class CollectionWrapper {
  constructor() {
    /** @type {Number} */
    this.total = 0;
    /** @type {Number} */
    this.offset = 0;
    /** @type {Number} */
    this.limit = 10;
    /** @type {Array<T>} */
    this.data = [];
  }
}

module.exports = CollectionWrapper;
