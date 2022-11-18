const { OrderModel } = require('../../../../models');
const { orderService, cartService } = require('../../../../domain');
const { loggerService } = require('../../../../libs/logger');

/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */

module.exports = {
  /* --------------------------------- API ERP -------------------------------- */
  /**
   * Create new product
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  create: async (req, res, next) => {
    try {
      const customerId = req.headers.customerId || req.headers.customerid;
      const cart = await cartService.viewCart(customerId);
      const data = OrderModel.fromRequest(req.body, cart);
      const output = await orderService.create(data);
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  search: async (req, res, next) => {
    try {
      const data = OrderModel.searchOrder(req.query);
      const output = await orderService.searchOrder(data);
      res.json({
        success: true,
        results: { data: output[0], paging: output[1] },
      });
    } catch (error) {
      next(error);
    }
  },
  view: async (req, res, next) => {
    try {
      const { value: uid } = req.swagger.params.uid;
      const output = await orderService.viewOrderById(uid);
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
};
