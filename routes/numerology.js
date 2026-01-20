// routes/numerology.js - 命理運算 API 核心模組
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Sequelize 使用者模型

// --- 路由 1: 檢查用戶是否有權限進行運算 ---
// POST /api/numerology/check
router.post('/check', async (req, res) => {
  const { user_id, service_type } = req.body;

  if (!user_id || !service_type) {
    return res.status(400).json({ status: 'ERROR', message: '缺少用戶ID或服務類型。' });
  }

  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ status: 'ERROR', message: '用戶不存在。' });
    }

    // 付費服務檢查
    if (service_type === '紫微斗數詳批') {
      if (user.calculation_count > 0) {
        return res.json({ status: 'AUTHORIZED', message: '用戶有付費權限。' });
      }
      return res.json({ status: 'UNAUTHORIZED', message: '餘額不足，請先付費。' });
    }

    // 免費服務總是允許
    if (service_type === '免費流年') {
      return res.json({ status: 'AUTHORIZED', message: '免費服務，允許運算。' });
    }

    // 其他服務預設拒絕
    return res.json({ status: 'UNAUTHORIZED', message: `權限不足，請先為服務 [${service_type}] 付費。` });
  } catch (error) {
    console.error('權限檢查錯誤:', error);
    res.status(500).json({ status: 'ERROR', message: '伺服器內部錯誤。' });
  }
});

// --- 路由 2: 實際進行命理運算並返回結果 ---
// POST /api/numerology/calculate
router.post('/calculate', async (req, res) => {
  const { user_id, name, birth_date, service_type } = req.body;

  if (!user_id || !name || !birth_date || !service_type) {
    return res.status(400).json({ status: 'ERROR', message: '缺少必要參數。' });
  }

  try {
    // 模擬運算結果
    const resultData = {
      input: { name, birth_date, service_type },
      prediction: `根據 ${name} (生於 ${birth_date}) 的數據，您的 ${service_type} 結果：【天機星坐命】，未來三年財運旺盛，但須注意感情糾紛。`,
      chart_url: 'http://localhost:3001/charts/zwei_123.svg'
    };

    // 扣除餘額（僅付費服務）
    if (service_type === '紫微斗數詳批') {
      const user = await User.findByPk(user_id);
      if (user && user.calculation_count > 0) {
        await user.decrement('calculation_count', { by: 1 });
        console.log(`[🔮 Numerology] 用戶 #${user_id} 已成功扣除一次運算餘額。`);
      }
    }

    res.json({ status: 'SUCCESS', service: service_type, data: resultData });
  } catch (error) {
    console.error('命理運算錯誤:', error);
    res.status(500).json({ status: 'ERROR', message: '伺服器內部錯誤。' });
  }
});

module.exports = router;