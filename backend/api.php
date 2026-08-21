<?php
header('Content-Type: application/json; charset=utf-8');
http_response_code(410);
echo json_encode([
    'success' => false,
    'message' => '此舊版會員接口已停用，請改用 /api/auth。'
], JSON_UNESCAPED_UNICODE);
?>
