'use strict';
/**
 * @typedef {import("express").RequestHandler} RequestHandler
 */
const pino = require('pino');
const serializers = require('pino-std-serializers');
const pinoHttp = require('../../../libs/pino_http');
const { ulid } = require('ulid');
/**
 * Pino logger middleware for express
 * @function PinoLoggerMiddleWare
 * @param {pino.Logger} logger A Pino instance
 * @param {Set} ignoreMap Ignored route mapping
 * @param {string[]} bodyBlackList Ignore body properties
 * @param {string[]} queryBlackList Ignore query properties
 * @returns {RequestHandler}
 */
const PinoLoggerMiddleWare = (
  logger,
  ignoreMap,
  bodyBlackList,
  queryBlackList,
) => {
  if (logger == null) {
    logger = pino({
      serializers: serializers,
    });
  }
  if (ignoreMap == null) {
    ignoreMap = new Set();
  }
  if (bodyBlackList == null) {
    bodyBlackList = [];
  }
  if (queryBlackList == null) {
    queryBlackList = [];
  }
  const httpLogger = pinoHttp({
    genReqId: () => ulid().toLowerCase(),
    logger,
  });
  return (req, res, next) => {
    if (!ignoreMap.has(req.path)) {
      httpLogger(req, res);
    }
    next();
  };
};

module.exports = {
  pinoHtttpMiddleware: PinoLoggerMiddleWare,
};
