'use strict';
const pino = require('pino');
// const logger = require('r7insight_node');

module.exports = {
  /** @type {pino.Logger} */
  logger: pino({ name: 'process', enabled: process.env.NO_LOG !== 'true' }),
  /** @type {pino.Logger} */
  transport: pino({
    name: 'transport',
    enabled: process.env.NO_LOG !== 'true',
  }),
  //   loggerService: new logger({
  //     token: process.env.TOKEN_RAPID7,
  //     region: 'ap',
  //   }),
};
