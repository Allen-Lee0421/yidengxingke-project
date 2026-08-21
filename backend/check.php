<?php
header('Content-Type: application/json; charset=utf-8');
http_response_code(410);
echo json_encode([
    'success' => false,
    'message' => '此舊版資料庫檢查接口已停用。'
], JSON_UNESCAPED_UNICODE);
?>
