class Base {
  constructor() {
    /** @type {Date} */
    this.createdAt = undefined;
    /** @type {Date} */
    this.updatedAt = undefined;
    /** @type {Array<String>} */
    this.includedFields = undefined;
  }
}

module.exports = Base;
