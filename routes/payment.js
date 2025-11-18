// routes/payment.js - 金流 API 核心模組

const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // 導入訂單模型

// 假定的金流服務商 URL (此處使用佔位符)
const PAYMENT_GATEWAY_URL = "https://mock-payment-gateway.com/pay"; 

// --- 路由 1: 客戶發起交易請求 (建立訂單並導向金流) ---
// POST /api/payment/create
router.post('/create', async (req, res) => {
    // 假設客戶發送的資料：
    // { user_id: 1, amount: 1288.00, service_name: '紫微斗數詳批' }
    const { user_id, amount, service_name } = req.body;

    if (!user_id || !amount || !service_name) {
        return res.status(400).json({ error: '缺少必要的訂單參數。' });
    }

    try {
        // 1. 在資料庫中創建一個「待處理 (Pending)」的訂單紀錄
        const newOrder = await Order.create({
            user_id: user_id,
            amount: amount,
            service_name: service_name,
            status: 'Pending', // 預設為待處理
        });

        // 2. 準備導向金流服務商的數據 (此處為模擬)
        const paymentData = {
            merchant_id: 'YDXK-001', // 您的商戶 ID 佔位符
            order_id: newOrder.id, // 使用資料庫生成的訂單 ID
            amount: amount,
            return_url: `http://localhost:3001/api/payment/return`, // 付款完成導回
            notify_url: `http://localhost:3001/api/payment/notify`, // 背景通知
        };

        console.log(`[💰 Payment] 已創建訂單 #${newOrder.id}，金額: ${amount}`);
        
        // 3. 實務上會導向金流服務商。這裡我們返回一個模擬的導向 URL。
        res.json({ 
            success: true, 
            orderId: newOrder.id,
            redirectTo: `${PAYMENT_GATEWAY_URL}?data=${Buffer.from(JSON.stringify(paymentData)).toString('base64')}`
        });

    } catch (error) {
        console.error('創建訂單時發生錯誤:', error);
        res.status(500).json({ error: '內部伺服器錯誤，無法創建訂單。' });
    }
});


// --- 路由 2: 金流服務商回傳付款結果通知 (核心更新) ---
// POST /api/payment/notify
router.post('/notify', async (req, res) => {
    // 實務上，這裡會接收金流商加密的數據，需要進行驗證和解密。
    // 這裡我們假設接收到 order_id 和 transaction_id
    const { order_id, transaction_id, result_code } = req.body;

    // 1. 驗證金流結果 (簡化)
    if (result_code !== 'SUCCESS' || !order_id || !transaction_id) {
        // 實務上要返回特定的錯誤碼給金流商
        return res.status(200).send('FAIL'); 
    }
    
    try {
        // 2. 查找資料庫中的訂單
        const order = await Order.findByPk(order_id);

        if (order && order.status === 'Pending') {
            // 3. 更新訂單狀態為「成功」並記錄交易編號
            await order.update({
                status: 'Success',
                transaction_id: transaction_id
            });
            console.log(`[✅ Notify] 訂單 #${order_id} 狀態已更新為 Success!`);

            // 4. (未來在這裡加入邏輯): 增加用戶的命理運算次數或解鎖服務。
            
            // 必須返回 200 OK，否則金流商會重覆發送通知
            return res.status(200).send('OK'); 
        }

        return res.status(200).send('Order not found or already processed');

    } catch (error) {
        console.error('處理金流通知時發生錯誤:', error);
        res.status(500).send('Internal Server Error');
    }
});


// --- 路由 3: 付款完成後導回給客戶看的頁面 (選做) ---
// GET /api/payment/return
router.get('/return', (req, res) => {
    // 這裡應根據金流商的回傳參數，顯示「付款成功」或「付款失敗」的頁面
    res.send(`<h1>付款處理中/結果頁面</h1><p>您的交易正在處理。請檢查您的信箱或會員中心查看最終結果。</p>`);
});


module.exports = router;