<?php
header('Content-Type: text/html; charset=utf-8');
echo "<h2>易鑒星科 - Block 9 聯網與環境測試</h2>";
echo "伺服器時間: " . date("Y-m-d H:i:s") . "<br>";
$connection = @fsockopen("www.google.com", 80);
if ($connection) { echo "聯網狀態: <span style='color:green;'>正常</span>"; fclose($connection); }
else { echo "聯網狀態: <span style='color:red;'>受限</span>"; }
?>
