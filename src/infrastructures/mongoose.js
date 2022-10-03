const mongoose = require('mongoose');
const { Utils } = require('../libs/utils');
const { logger } = require('../libs/logger');

mongoose.Promise = Promise;
/**
 * @type {mongoose}
 */
let defaultDB = null;
class MongoDbConnection {
  constructor() {
    this.endpoint = process.env.ENDPOINT_DB;
  }

  async init() {
    defaultDB = await mongoose.createConnection(this.endpoint, {
      useNewUrlParser: true,
      useFindAndModify: false,
      autoIndex: false,
    });
    let isComplete = false;
    logger.info('Waiting for MongoDB...');
    return Utils.promiseLoop(
      () => isComplete === true,
      async () => {
        if (defaultDB.readyState) {
          isComplete = true;
          logger.info('MongoDB is ready');
        }
      },
    );
  }
  async ping() {
    if (defaultDB == null) {
      throw Error('MongoDB is not ready');
    }

    return defaultDB.db.stats();
  }
}

/**
 * @returns {mongoose}
 */
const getDefaultDB = () => defaultDB;

module.exports = { MongoDbConnection, getDefaultDB };
