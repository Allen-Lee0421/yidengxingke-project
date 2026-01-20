// routes/payment.js - 金流 API 核心模組
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

const PAYMENT_GATEWAY_URL = "https://mock-payment-gateway.com/pay";

// 建立訂單並導向金流
router.post('/create', async (req, res) => {
  const { user_id, amount, service_name } = req.body;
  if (!user_id || !amount || !service_name) {
    return res.status(400).json({ error: '缺少必要的訂單參數。' });
  }
  try {
    const newOrder = await Order.create({
      user_id,
      amount,
      service_name,
      status: 'Pending'
    });

    const paymentData = {
      merchant_id: 'YDXK-001',
      order_id: newOrder.id,
      amount,
      return_url: `http://localhost:3001/api/payment/return`,
      notify_url: `http://localhost:3001/api/payment/notify`
    };

    console.log(`[💰 Payment] 已創建訂單 #${newOrder.id}，金額: ${amount}`);

    res.json({
      success: true,
      orderId: newOrder.id,
      redirectTo: `${PAYMENT_GATEWAY_URL}?data=${Buffer.from(JSON.stringify(paymentData)).toString('base64')}`
    });
  } catch (error) {
    console.error('創建訂單錯誤:', error);
    res.status(500).json({ error: '內部伺服器錯誤，無法創建訂單。' });
  }
});

// 金流通知更新訂單
router.post('/notify', async (req, res) => {
  const { order_id, transaction_id, result_code } = req.body;
  if (result_code !== 'SUCCESS' || !order_id || !transaction_id) {
    return res.status(200).send('FAIL');
  }
  try {
    const order = await Order.findByPk(order_id);
    if (order && order.status === 'Pending') {
      await order.update({ status: 'Success', transaction_id });
      console.log(`[✅ Notify] 訂單 #${order_id} 已更新為 Success`);
      return res.status(200).send('OK');
    }
    return res.status(200).send('Order not found or already processed');
  } catch (error) {
    console.error('通知處理錯誤:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 付款完成導回頁面
router.get('/return', (req, res) => {
  res.send(`<h1>付款處理中/結果頁面</h1><p>您的交易正在處理，請檢查信箱或會員中心查看最終結果。</p>`);
});

module.exports = router;