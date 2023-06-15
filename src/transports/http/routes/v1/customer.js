const { CustomerModel, CartModel } = require('../../../../models');
const { customerService, cartService } = require('../../../../domain');
const { CustomerValidate } = require('../../../../validate');
const { loggerService } = require('../../../../libs/logger');

/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */

module.exports = {
  /* --------------------------------- API ERP -------------------------------- */
  /**
   * Create new customer
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  create: async (req, res, next) => {
    try {
      CustomerValidate.createCustomerValidate(req.body);
      const data = CustomerModel.fromRequest(req.body);
      const customer = await customerService.create(data);
      const dataCart = CartModel.create(data, customer.uid);
      const cart = await cartService.create(dataCart);
      res.json({
        success: true,
        results: { customer, cart },
      });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { value: uid } = req.swagger.params.uid;
      CustomerValidate.updateCustomerValidate(req.body);
      const data = CustomerModel.fromUpdateCustomer(req.body);
      const output = await customerService.updateCustomer({ uid, data });
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
      const { value: uid } = req.swagger.params.uid;
      const output = await customerService.viewCustomerById(uid);
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { value: uid } = req.swagger.params.uid;
      const output = await customerService.deleteCustomerById(uid);
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  status: async (req, res, next) => {
    try {
      const { value: uid } = req.swagger.params.uid;
      const data = CustomerModel.fromUpdateStatusCustomer(req.body);
      const output = await customerService.updateStatusCustomer({ uid, data });
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
      const data = CustomerModel.searchCustomer(req.query);
      const output = await customerService.searchCustomer(data);
      res.json({
        success: true,
        results: { data: output[0], paging: output[1] },
      });
    } catch (error) {
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const data = CustomerModel.login(req.body);
      const output = await customerService.login(data);
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  forgot_password: async (req, res, next) => {
    try {
      const data = CustomerModel.forgotPassword(req.body);
      const email = await customerService.forgotPassword(data, req);
      res.json({
        success: true,
        results: email,
      });
    } catch (error) {
      next(error);
    }
  },
  reset_password_token: async (req, res, next) => {
    try {
      const { value: token } = req.swagger.params.token;
      const data = CustomerModel.fromPasswordToken(req.body);
      const confirmPassword = await customerService.confirmPassword(
        token,
        data,
      );
      res.json({
        success: true,
        results: confirmPassword,
      });
    } catch (error) {
      next(error);
    }
  },
};
