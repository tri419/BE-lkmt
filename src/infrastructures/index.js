'use strict';
const { MongoDbConnection } = require('./mongoose');

const mongoose = new MongoDbConnection();

module.exports = {
  initMongoose: async () => mongoose.init(),
  isMongoDBHealthy: async () => mongoose.ping().then(() => true),
};
