<?php
header('Content-Type: application/json');

// --- 根據您的智邦後台截圖修正後的資訊 ---
$host = 'localhost';
$db   = 'vhost161124'; // 這是您的資料庫名稱
$user = 'vhost161124'; // 這是您的管理者帳號
$pass = 'Kc@790421'; // <-- 請填入您登入智邦後台的那組密碼
// ---------------------------------------

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => '連線依舊失敗，請確認是否已點擊同步按鈕']);
    exit;
}

// 自動建立會員資料表
$conn->query("CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$action = $_POST['action'] ?? '';

if ($action === 'register') {
    $u = $_POST['username'];
    $e = $_POST['email'];
    $p = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $u, $e, $p);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => '註冊成功！您現在可以登入了']);
    } else {
        echo json_encode(['success' => false, 'message' => '帳號已存在']);
    }
}

if ($action === 'login') {
    $u = $_POST['username'];
    $p = $_POST['password'];
    $stmt = $conn->prepare("SELECT password FROM users WHERE username = ?");
    $stmt->bind_param("s", $u);
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();
    if ($res && password_verify($p, $res['password'])) {
        echo json_encode(['success' => true, 'message' => '登入成功！轉向中...', 'username' => $u]);
    } else {
        echo json_encode(['success' => false, 'message' => '帳號或密碼錯誤']);
    }
}
?>