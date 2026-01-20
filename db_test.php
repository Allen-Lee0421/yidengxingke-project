<?php
header('Content-Type: text/html; charset=utf-8');
echo "<h3>易鑒星科 - 資料庫連線測試</h3>";

// 根據智邦後台截圖修正的參數
$servername = "localhost"; 
$username = "vhost161124"; // 修正為後台顯示的帳號
$password = "Kc@790421";   // 請確保這是您在智邦後台設定的資料庫密碼
$dbname = "vhost161124";   // 智邦通常資料庫名與帳號相同

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo "連線失敗: " . $conn->connect_error . "<br>";
    echo "目前的設定 - 帳號: $username / 資料庫: $dbname";
} else {
    echo "<span style='color:green; font-weight:bold;'>【成功】易鑒星科資料庫已完全接通！</span>";
    $conn->close();
}
?>