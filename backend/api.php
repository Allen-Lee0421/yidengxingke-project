<?php
/**
 * 易燈星科 - API 處理入口 (api.php)
 * 升級功能：包含完整的會員註冊與登入邏輯。
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // 允許跨域請求 (測試環境需要)

// --- 引入核心檔案 ---
require_once 'config.php'; 
require_once 'Yijing.php';

$response = ['success' => false, 'message' => '未知錯誤'];
// 處理 POST 或 GET 請求的參數
$action = $_REQUEST['action'] ?? '';
$conn = null;

try {
    // 嘗試建立資料庫連線
    $conn = getDbConnection();
    if (!$conn) {
        throw new Exception("伺服器錯誤：無法建立資料庫連線。請檢查 config.php。");
    }

    // --- 路由分發 ---
    switch ($action) {
        
        // 1. 會員註冊
        case 'register':
            $username = $_POST['username'] ?? '';
            $password = $_POST['password'] ?? '';
            $email = $_POST['email'] ?? '';

            if (empty($username) || empty($password) || empty($email)) {
                $response['message'] = '所有欄位皆為必填。';
                break;
            }

            // 檢查用戶名或電子郵件是否已存在
            $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
            $stmt->bind_param("ss", $username, $email);
            $stmt->execute();
            $stmt->store_result();
            if ($stmt->num_rows > 0) {
                $response['message'] = '用戶名或電子郵件已存在。';
                $stmt->close();
                break;
            }
            $stmt->close();

            // 安全地儲存密碼 (使用 PHP 內建的 bcrypt 加密)
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            
            // 寫入資料庫
            $stmt = $conn->prepare("INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $username, $passwordHash, $email);
            
            if ($stmt->execute()) {
                $response = ['success' => true, 'message' => '註冊成功！'];
            } else {
                $response['message'] = '註冊失敗，請稍後再試。';
            }
            $stmt->close();
            break;

        // 2. 會員登入
        case 'login':
            $username = $_POST['username'] ?? '';
            $password = $_POST['password'] ?? '';

            if (empty($username) || empty($password)) {
                $response['message'] = '請輸入用戶名和密碼。';
                break;
            }

            // 查找用戶
            $stmt = $conn->prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $stmt->bind_result($userId, $dbUsername, $passwordHash);
            $stmt->fetch();
            $stmt->close();

            if ($passwordHash && password_verify($password, $passwordHash)) {
                // 登入成功，建立 Session 或 JWT (此處簡化為返回成功訊息)
                $response = [
                    'success' => true, 
                    'message' => '登入成功！',
                    'user_id' => $userId,
                    'username' => $dbUsername
                ];
            } else {
                $response['message'] = '用戶名或密碼錯誤。';
            }
            break;
            
        // 3. 易經卦象生成 (維持不變)
        case 'generate_hexagram':
            $result = Yijing::generateHexagram();
            $response = $result;
            break;
            
        // 4. 獲取產品列表 (維持不變)
        case 'get_products':
            $stmt = $conn->prepare("SELECT id, name, price, description, type FROM products WHERE is_active = 1 ORDER BY id ASC");
            $stmt->execute();
            $result = $stmt->get_result();
            $products = [];
            while($row = $result->fetch_assoc()) {
                $products[] = $row;
            }
            $stmt->close();
            $response = ['success' => true, 'products' => $products];
            break;

        default:
            $response['message'] = '無效的 API 動作。';
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
} finally {
    if ($conn) {
        $conn->close();
    }
    // 輸出 JSON 結果
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}