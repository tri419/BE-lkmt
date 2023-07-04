const MomoPayment = require('momo-payment-sdk');

/* HOST_WEBHOOK => MoMo system will call to your URL for alert the result */
const HOST_WEBHOOK = process.env.HOST_WEBHOOK;

/*
 constructor: partnerCode, accessKey, secretKey => provided from Momo
 constructor: environment = "live" || "sandbox"
*/
class MomoPaymentService {
  constructor(partnerCode, accessKey, secretKey, environment) {
    this.momoPayment = new MomoPayment({
      partnerCode,
      accessKey,
      secretKey,
      environment,
    });
  }

  /* Return the URL payment by QR code */
  async createPayment({
    orderId,
    amount,
    orderInfo = 'Thanh toán đơn hàng online',
    returnUrl = 'https://business.momo.vn/return',
  }) {
    try {
      if (!orderId || !amount || !orderInfo) {
        throw new Error('invalid input');
      }
      const result = await this.momoPayment.createPayment({
        requestId: `ID-${orderId}`,
        orderId,
        amount: amount.toString(),
        orderInfo,
        returnUrl,
        notifyUrl: HOST_WEBHOOK,
      });
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /* Rollback the transaction */
  async refundPayment({ requestId, orderId, amount, transId }) {
    try {
      if (!orderId || !amount || !transId) {
        throw new Error('invalid input');
      }
      const result = await this.momoPayment.refundPayment({
        requestId,
        orderId,
        amount,
        transId,
      });
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /* The function for verify webhook request */
  verifySignature({
    signature,
    requestId,
    orderId,
    amount,
    orderInfo,
    orderType,
    transId,
    message,
    localMessage,
    responseTime,
    errorCode,
    payType,
  }) {
    try {
      const result = this.momoPayment.verifySignature({
        signature,
        requestId,
        orderId,
        amount,
        orderInfo,
        orderType,
        transId,
        message,
        localMessage,
        responseTime,
        errorCode,
        payType,
      });
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
module.exports = MomoPaymentService;
