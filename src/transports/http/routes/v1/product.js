const { ProductModel } = require('../../../../models');
const { productService, customerService } = require('../../../../domain');
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
      const data = ProductModel.fromRequest(req.body);
      const output = await productService.create(data);
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
      const data = ProductModel.fromUpdateProduct(req.body);
      const output = await productService.updateProduct({ uid, data });
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
      const output = await productService.viewProductById(uid);
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
      const output = await productService.deleteProductById(uid);
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
      const data = ProductModel.fromUpdateStatusProduct(req.body);
      const output = await productService.updateStatusProduct({ uid, data });
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
      await customerService.auth(req, res, next);
      const data = ProductModel.searchProduct(req.query);
      const output = await productService.searchProduct(data);
      res.json({
        success: true,
        results: { data: output[0], paging: output[1] },
      });
    } catch (error) {
      next(error);
    }
  },
  listProduct: async (req, res, next) => {
    try {
      const output = await productService.listProduct();
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
};
