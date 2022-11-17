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
      const customerId = req.headers.customerId || req.headers.customerid;
      const data = CartModel.fromRequest(req.body, customerId);
      const output = await cartService.create(data);
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { value: uid } = req.swagger.params.uid;
      //const customerId = req.headers.customerId || req.headers.customerid;
      const data = CartModel.fromUpdate(req.body);
      const output = await cartService.update({ uid, data });
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  view: async (req, res, next) => {
    try {
      const customerId = req.headers.customerId || req.headers.customerid;
      const output = await cartService.viewCart(customerId);
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
};
