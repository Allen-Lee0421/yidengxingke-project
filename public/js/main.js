document.addEventListener('DOMContentLoaded', () => {
    console.log("易燈星科前端腳本已載入。");

    // 範例：未來您可以在這裡添加邏輯來處理命理運算模組
    const computationButton = document.querySelector('#computation-area button');
    
    // 點擊按鈕後，模擬發送一個 API 請求
    computationButton.addEventListener('click', async () => {
        console.log("正在嘗試從後端獲取易經卦象...");
        try {
            const response = await fetch('/api/yijing?input=test'); // 訪問 server.js 中定義的 API
            const data = await response.json();
            
            console.log("後端回應:", data);
            
            // 實際網站中，您會將 data 內容顯示在網頁上
            alert(`運算結果 (後端範例)：\n卦象: ${data.gua}\n分析: ${data.analysis}`);

        } catch (error) {
            console.error('API 請求失敗:', error);
            alert('無法連接到命理運算服務。請檢查伺服器。');
        }
    });
});

// 範例：CMD 音樂播放系統的提示 (這是前端無法控制的，僅供提示)
console.log("注意：MP3 自動后宮/CMD 播放需要後台程式和系統調用，無法在瀏覽器 JS 中直接實現。");