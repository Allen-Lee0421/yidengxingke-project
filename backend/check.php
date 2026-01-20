<?php
// 易鑒星科 - 資料庫連線測試工具
$host = 'localhost';
$db   = 'kcli0124_db';
$user = 'kcli0124_user';
$pass = 'Kc@790421'; // <--- 請在此處填入您認為正確的那組密碼

echo "<h3>資料庫連線測試中...</h3>";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("<h1 style='color:red;'>連線失敗！原因：" . $conn->connect_error . "</h1><p>這代表您的密碼真的不對。</p>");
} else {
    echo "<h1 style='color:green;'>連線成功！密碼是正確的。</h1>";
    
    // 順便幫您檢查有沒有 users 這個表
    $checkTable = $conn->query("SHOW TABLES LIKE 'users'");
    if ($checkTable->num_rows == 0) {
        echo "<p>偵測到缺少『會員資料表』，正在自動為您建立...</p>";
        $sql = "CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        if ($conn->query($sql)) { echo "<h2 style='color:blue;'>資料表已自動建立成功！</h2>"; }
    } else {
        echo "<h2 style='color:blue;'>資料表已存在，一切正常！</h2>";
    }
}
?>