const { CartModel } = require('../../../../models');
const { cartService } = require('../../../../domain');
const { loggerService } = require('../../../../libs/logger');

/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */

module.exports = {
  /* --------------------------------- API ERP -------------------------------- */
  /**
   * Create new cart
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  create: async (req, res, next) => {
    try {
      const userId = req.headers.userId || req.headers.userid;
      const data = CartModel.fromRequest(req.body, userId);
      const output = await cartService.create(data);
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
};
