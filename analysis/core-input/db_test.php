<?php
header('Content-Type: application/json; charset=utf-8');
http_response_code(410);
echo json_encode([
    'success' => false,
    'message' => '舊版資料庫測試頁已停用。'
], JSON_UNESCAPED_UNICODE);
?>
