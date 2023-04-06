const { OrderModel } = require('../../../../models');
const {
  orderService,
  cartService,
  momoPaymentService,
} = require('../../../../domain');

const paypal = require('paypal-rest-sdk');
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
  approve: async (req, res, next) => {
    try {
      const { value: uid } = req.swagger.params.uid;
      const data = OrderModel.approveOrder(req.body);
      const output = await orderService.approveOrder({ uid, data });
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  readyToShip: async (req, res, next) => {
    try {
      const { value: uid } = req.swagger.params.uid;
      const data = OrderModel.readyToShip(req.body);
      const output = await orderService.readyToShipOrder({ uid, data });
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  createPaypal: async (req, res, next) => {
    try {
      const data = OrderModel.paypal(req.body);
      const create_payment_json = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        redirect_urls: {
          return_url: 'http://localhost:3001/success',
          cancel_url: 'http://localhost:3001/cancel',
        },
        transactions: [
          {
            amount: {
              currency: 'USD',
              total: data.price,
            },
            description: 'Washing Bar soap',
          },
        ],
      };
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
              res.json(payment.links[i].href);
            }
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },
  success: async (req, res, next) => {
    try {
      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;
      const execute_payment_json = {
        payer_id: payerId,
        transactions: [
          {
            amount: {
              currency: 'USD',
              total: '25.00',
            },
          },
        ],
      };
      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        function (error, payment) {
          //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
          if (error) {
            console.log(error.response);
            throw error;
          } else {
            console.log(JSON.stringify(payment));
            res.json('Success');
          }
        },
      );
    } catch (error) {
      next(error);
    }
  },
  listOrderShipper: async (req, res, next) => {
    try {
      const userId = req.headers.userId || req.headers.userid;
      const output = await orderService.listOrderShipper(userId);
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  transport: async (req, res, next) => {
    try {
      const { value: uid } = req.swagger.params.uid;
      const data = OrderModel.transportOrder(req.body);
      const output = await orderService.transportOrder({ uid, data });
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  complete: async (req, res, next) => {
    try {
      const { value: uid } = req.swagger.params.uid;
      const data = OrderModel.completeOrder(req.body);
      const output = await orderService.completeOrder({ uid, data });
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  historyOrder: async (req, res, next) => {
    try {
      const customerId = req.headers.customerId || req.headers.customerid;
      const output = await orderService.historyOrder(customerId);
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  cancel: async (req, res, next) => {
    try {
      const { value: uid } = req.swagger.params.uid;
      const data = OrderModel.cancelOrder(req.body);
      const output = await orderService.cancelOrder({ uid, data });
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  createOrderAdmin: async (req, res, next) => {
    try {
      const data = OrderModel.createOrder(req.body);
      const output = await orderService.createOrderAdmin(data);
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
      const data = OrderModel.update(req.body);
      const output = await orderService.updateOrder({ uid, data });
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  homePage: async (req, res, next) => {
    try {
      const data = OrderModel.homePage(req.query);
      const output = await orderService.homePage(data);
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  momo: async (req, res, next) => {
    try {
      const data = OrderModel.momo(req.body);
      const output = await momoPaymentService.createPayment({
        orderId: data.orderCode,
        amount: data.amount,
      });
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
};
