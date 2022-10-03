'use strict';
/**
 * @typedef {import("express").RequestHandler} RequestHandler
 */

/**
 * Cors middleware for express
 * @return {RequestHandler}
 */
const CorsMiddleWare = () => (req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, Content-Type, Accept, Authorization, x-api-key,platform, push, device',
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  );
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Expose-Headers', 'Limit, Offset, Total');
  res.header('Access-Control-Max-Age', '600');
  if (req.method === 'OPTIONS') {
    return res.end();
  }
  return next();
};

module.exports = {
  corsMiddleWare: CorsMiddleWare,
};
