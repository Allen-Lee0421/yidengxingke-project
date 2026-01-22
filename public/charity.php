<?php
/**
 * 易鑒星科 - 星燈公益透明盒公示系統
 * 功能：顯示累積捐款、存放證明截圖、預留網域分租對接端
 */

$base_fund = 15820; // 初始權威累積金額
$current_year = 2026;
?>
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <title>星燈公益證明庫 · 易鑒星科</title>
    <style>
        body { background: #0a0a0a; color: #d4af37; font-family: "Noto Serif TC", serif; text-align: center; padding: 50px; }
        .fund-box { border: 2px solid #d4af37; padding: 40px; display: inline-block; background: rgba(212, 175, 55, 0.05); }
        .receipt-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 40px; }
        .receipt-card { border: 1px solid #333; padding: 10px; opacity: 0.6; }
        .vhost-node { color: #444; font-size: 10px; margin-top: 100px; }
    </style>
</head>
<body>
    <h1>星燈公益 (Charity Fund)</h1>
    <div class="fund-box">
        <p>2026 丙午年 累計提撥總額</p>
        <h2 style="font-size: 3em;">NT$ <?php echo number_format($base_fund); ?></h2>
    </div>

    <div class="receipt-grid">
        <div class="receipt-card">系統初始化中... 暫無收據</div>
    </div>

    <div class="vhost-node">
        NODE_ID: XINGDENG_VHOST_RESERVED_01 // 網域分租對接端已啟動
    </div>
</body>
</html>