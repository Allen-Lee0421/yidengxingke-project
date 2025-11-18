// routes/numerology.js - 命理運算 API 核心模組

const express = require('express');
const router = express.Router();
const User = require('../models/User'); // 導入使用者模型

// --- 路由 1: 檢查用戶是否有權限進行運算 ---
// POST /api/numerology/check
router.post('/check', async (req, res) => {
    // 假設客戶發送的資料：
    // { user_id: 1, service_type: '紫微斗數詳批' }
    const { user_id, service_type } = req.body;

    if (!user_id || !service_type) {
        return res.status(400).json({ status: 'ERROR', message: '缺少用戶ID或服務類型。' });
    }

    try {
        const user = await User.findByPk(user_id);
        
        if (!user) {
            return res.status(404).json({ status: 'ERROR', message: '用戶不存在。' });
        }

        // 🚨 這是營利邏輯的關鍵判斷：
        if (service_type === '紫微斗數詳批' && user.calculation_count > 0) {
            // 假設 '紫微斗數詳批' 服務是計次的，且用戶有餘額
            return res.json({ status: 'AUTHORIZED', message: '用戶有付費權限。' });
        } 
        
        // 假設其他服務 (如免費流年) 總是允許
        if (service_type === '免費流年') {
             return res.json({ status: 'AUTHORIZED', message: '免費服務，允許運算。' });
        }

        // 權限不足，需要付費
        return res.json({ status: 'UNAUTHORIZED', message: `權限不足，請先為服務 [${service_type}] 付費。` });

    } catch (error) {
        console.error('權限檢查錯誤:', error);
        res.status(500).json({ status: 'ERROR', message: '伺服器內部錯誤。' });
    }
});


// --- 路由 2: 實際進行命理運算並返回結果 ---
// POST /api/numerology/calculate
router.post('/calculate', async (req, res) => {
    // 假設客戶發送的資料：
    // { user_id: 1, name: '王小明', birth_date: '1990-01-01', service_type: '紫微斗數詳批' }
    const { user_id, name, birth_date, service_type } = req.body;
    
    // 實務上應在此處進行複雜的命理運算，這裡使用佔位符。
    
    // 1. 執行運算 (簡化為模擬)
    const resultData = {
        input: { name, birth_date, service_type },
        // 🔮 這是最終提供給付費客戶的寶貴資訊：
        prediction: `根據 ${name} (生於 ${birth_date}) 的數據，您的 ${service_type} 結果：【天機星坐命】，未來三年財運旺盛，但須注意感情糾紛。`,
        chart_url: 'http://localhost:3001/charts/zwei_123.svg' // 模擬星盤圖連結
    };

    // 2. 扣除餘額 (僅在付費服務中執行)
    if (service_type === '紫微斗數詳批') {
        const user = await User.findByPk(user_id);
        if (user && user.calculation_count > 0) {
             await user.decrement('calculation_count', { by: 1 }); // 餘額減 1
             console.log(`[🔮 Numerology] 用戶 #${user_id} 已成功扣除一次運算餘額。`);
        }
        // 如果餘額不足，在 /check 階段就會被擋住，這裡假設已通過檢查。
    }

    // 3. 返回運算結果給客戶
    res.json({ 
        status: 'SUCCESS',
        service: service_type,
        data: resultData
    });
});


module.exports = router;