(() => {
    const params = new URLSearchParams(window.location.search);
    const themes = [
        { title: '火線上升，先手就是節奏', summary: '你的當下更適合把模糊想法切成可執行的小步驟；先動，再用回饋修正方向。', tag: 'ACTION FIRST' },
        { title: '暗流成形，耐心是你的籌碼', summary: '外部訊號仍在重組，現在最值錢的不是躁進，而是把資源留給真正重要的決定。', tag: 'HOLD THE LINE' },
        { title: '局面換檔，別把舊劇本當導航', summary: '環境正在換軌；重新排列優先順序，比追逐所有聲音更能守住你的主導權。', tag: 'RESET THE MAP' },
        { title: '風向打開，讓好消息有入口', summary: '當你願意把需求說清楚，合作與機會會更容易找到切入點；今天先完成一次有效溝通。', tag: 'OPEN THE GATE' }
    ];
    let result = null;
    const compact = params.get('r');
    if (compact) {
        try {
            const normalized = compact.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((compact.length + 3) % 4);
            const parsed = JSON.parse(atob(normalized));
            const theme = themes[Number(parsed.i)];
            const score = Number(parsed.s);
            if (theme && Number.isFinite(score) && score >= 0 && score <= 100) result = { ...theme, score };
        } catch (error) {
            // 不讓無效分享參數造成分享頁中斷，改用預設提示。
        }
    }
    if (!result) {
        const score = Number(params.get('score'));
        const theme = params.get('theme');
        if (Number.isFinite(score) && score >= 0 && score <= 100) result = { score, tag: /^[A-Z ]{3,40}$/.test(theme || '') ? theme : 'FREE INSIGHT' };
    }
    if (result) {
        if (result.title) document.getElementById('shareTitle').textContent = result.title;
        if (result.summary) document.getElementById('shareSummary').textContent = result.summary;
        document.getElementById('shareScore').innerHTML = `${result.score}<small>ENERGY INDEX</small>`;
        document.getElementById('shareTag').textContent = result.tag;
    }
    document.title = `${document.getElementById('shareTitle').textContent} · 易鑒星科`;
})();
