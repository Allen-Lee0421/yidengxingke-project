document.addEventListener('DOMContentLoaded', () => {
    console.log('易燈星科網站前端已載入。');

    // --------------------------------------------------------
    // [功能 1] 卷軸式呈現動畫 (實現卷軸動畫效果)
    // --------------------------------------------------------
    const scrollSections = document.querySelectorAll('.scroll-section');

    /**
     * 檢查元素是否進入可視範圍
     */
    const checkScroll = () => {
        const viewportHeight = window.innerHeight; // 瀏覽器視窗高度

        scrollSections.forEach(section => {
            // 取得元素相對於視窗頂部的距離
            const rect = section.getBoundingClientRect(); 

            // 判斷條件：當元素頂部距離 < 視窗高度 - 150px 時，顯示它
            if (rect.top < viewportHeight - 150) { 
                section.classList.add('is-visible'); // 套用 style.css 中定義的淡入/滑入效果
            }
        });
    };
    
    // 綁定滾動事件：在使用者滾動時不斷檢查
    window.addEventListener('scroll', checkScroll);
    
    // 立即檢查一次：確保頁面剛載入時，頂部區塊立即顯示
    checkScroll();


    // --------------------------------------------------------
    // [功能 2] API 呼叫骨架 (與後端 PHP 溝通)
    // --------------------------------------------------------

    /**
     * 模擬生成易經卦象的 API 呼叫
     */
    const generateHexagram = async () => {
        const hexagramResult = document.getElementById('hexagram-result');
        if (hexagramResult) {
            hexagramResult.innerHTML = '正在分析天機，請稍候...';
        }
        
        try {
            // 呼叫後端 API (注意路徑應指向後端 api.php)
            // 假設網站部署在 http://localhost/yidengxingke/
            const apiPath = '/yidengxingke/backend/api.php?action=generate_hexagram';
            
            const response = await fetch(apiPath);
            const data = await response.json();

            if (data.success) {
                if (hexagramResult) {
                     hexagramResult.innerHTML = `
                        <h3>✅ 恭喜您，求得 ${data.hexagram_name} 卦 </h3>
                        <p><strong>判詞:</strong> ${data.description}</p>
                        <pre>${JSON.stringify(data.lines, null, 2)}</pre>
                        `;
                }
            } else {
                if (hexagramResult) {
                    hexagramResult.innerHTML = `<h3>❌ 占卜失敗: ${data.message}</h3>`;
                }
            }
        } catch (error) {
            console.error('API 呼叫錯誤:', error);
            if (hexagramResult) {
                hexagramResult.innerHTML = `<h3>⚠️ 網路連線或伺服器錯誤。</h3>`;
            }
        }
    };
    
    // 範例：將此 API 呼叫函數綁定到易經頁面中的按鈕 (此處為假設的 ID)
    const hexagramButton = document.getElementById('generate-button');
    if (hexagramButton) {
        hexagramButton.addEventListener('click', generateHexagram);
    }

});

// 繪製卦象的輔助函數 (待實作)
// function drawHexagram(lines) { /* ... */ }