(() => {
    const $ = (id) => document.getElementById(id);
    const params = new URLSearchParams(window.location.search);
    const utm = {
        source: params.get('utm_source') || 'direct',
        medium: params.get('utm_medium') || 'web',
        campaign: params.get('utm_campaign') || 'free_experience',
        content: params.get('utm_content') || ''
    };
    let currentResult = null;
    let shareUrl = '';

    function hashString(value) {
        let hash = 2166136261;
        for (let i = 0; i < value.length; i += 1) {
            hash ^= value.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return Math.abs(hash >>> 0);
    }

    function makeResult(name, birthday, hour) {
        const seed = hashString(`${name}|${birthday}|${hour}`);
        const index = seed % 4;
        const themes = [
            { title: '火線上升，先手就是節奏', summary: '你的當下更適合把模糊想法切成可執行的小步驟；先動，再用回饋修正方向。', tag: 'ACTION FIRST' },
            { title: '暗流成形，耐心是你的籌碼', summary: '外部訊號仍在重組，現在最值錢的不是躁進，而是把資源留給真正重要的決定。', tag: 'HOLD THE LINE' },
            { title: '局面換檔，別把舊劇本當導航', summary: '環境正在換軌；重新排列優先順序，比追逐所有聲音更能守住你的主導權。', tag: 'RESET THE MAP' },
            { title: '風向打開，讓好消息有入口', summary: '當你願意把需求說清楚，合作與機會會更容易找到切入點；今天先完成一次有效溝通。', tag: 'OPEN THE GATE' }
        ][index];
        return {
            score: 68 + (seed % 27),
            index,
            ...themes,
            token: Math.random().toString(36).slice(2, 8) + seed.toString(36).slice(-4),
            createdAt: new Date().toISOString()
        };
    }

    function buildShareUrl(result) {
        const url = new URL('share.html', window.location.href);
        const compactResult = btoa(JSON.stringify({ i: result.index, s: result.score })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
        url.searchParams.set('r', compactResult);
        url.searchParams.set('ref', `ES${result.token}`);
        url.searchParams.set('utm_source', 'result_card');
        url.searchParams.set('utm_medium', 'social');
        url.searchParams.set('utm_campaign', 'referral');
        return url.toString();
    }

    function renderResult(result) {
        $('cardTitle').textContent = result.title;
        $('cardSummary').textContent = result.summary;
        $('cardScore').innerHTML = `${result.score}<small>ENERGY INDEX</small>`;
        $('cardChip').textContent = result.tag;
        $('resultTimestamp').textContent = `生成於 ${new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(result.createdAt))}`;
        shareUrl = buildShareUrl(result);
        $('shareUrlText').textContent = shareUrl;
    }

    function openShare(network) {
        const text = `${currentResult.title}｜易鑒星科免費即時結果`;
        const encodedText = encodeURIComponent(text);
        const encodedUrl = encodeURIComponent(shareUrl);
        const targets = {
            line: `https://line.me/R/msg/text/?${encodedText}%0A${encodedUrl}`,
            x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
            threads: `https://www.threads.net/intent/post?text=${encodedText}%20${encodedUrl}`
        };
        window.open(targets[network], '_blank', 'noopener,noreferrer,width=640,height=640');
    }

    async function copyText(value) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(value);
            return;
        }
        const helper = document.createElement('textarea');
        helper.value = value;
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        helper.remove();
    }

    function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
        let line = '';
        const lines = [];
        for (const char of text) {
            const test = line + char;
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = char;
            } else {
                line = test;
            }
        }
        if (line) lines.push(line);
        lines.forEach((item, index) => ctx.fillText(item, x, y + index * lineHeight));
        return y + lines.length * lineHeight;
    }

    function downloadCard() {
        if (!currentResult) return;
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 675;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 1200, 675);
        gradient.addColorStop(0, '#0d1119');
        gradient.addColorStop(.58, '#16151a');
        gradient.addColorStop(1, '#2a1e12');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const glow = ctx.createRadialGradient(950, 110, 20, 950, 110, 280);
        glow.addColorStop(0, 'rgba(212,175,55,.30)');
        glow.addColorStop(1, 'rgba(212,175,55,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(212,175,55,.65)';
        ctx.lineWidth = 2;
        ctx.strokeRect(22, 22, 1156, 631);
        ctx.strokeStyle = 'rgba(242,212,119,.22)';
        ctx.lineWidth = 1;
        ctx.strokeRect(40, 40, 1120, 595);
        ctx.fillStyle = '#d4af37';
        ctx.font = '700 22px Courier New, monospace';
        ctx.fillText('EDISON STAR · PERSONAL MATRIX', 72, 98);
        ctx.fillStyle = '#fff8dc';
        ctx.font = '700 48px "Noto Serif TC", sans-serif';
        const titleBottom = wrapCanvasText(ctx, currentResult.title, 72, 178, 850, 62);
        ctx.fillStyle = '#d4d5da';
        ctx.font = '26px "Noto Serif TC", sans-serif';
        const summaryBottom = wrapCanvasText(ctx, currentResult.summary, 72, titleBottom + 25, 850, 40);
        ctx.fillStyle = '#f2d477';
        ctx.font = '700 86px Courier New, monospace';
        ctx.fillText(String(currentResult.score), 72, Math.max(summaryBottom + 112, 495));
        ctx.fillStyle = '#9ba0aa';
        ctx.font = '20px Courier New, monospace';
        ctx.fillText('ENERGY INDEX', 80, Math.max(summaryBottom + 143, 530));
        ctx.fillStyle = '#e2d9bd';
        ctx.font = '22px Courier New, monospace';
        ctx.fillText(currentResult.tag, 330, Math.max(summaryBottom + 125, 505));
        ctx.fillStyle = 'rgba(242,212,119,.84)';
        ctx.font = '20px Courier New, monospace';
        ctx.fillText('xingdeng.tw · FREE INSIGHT', 820, 610);
        const link = document.createElement('a');
        link.download = `xingdeng-result-${currentResult.token}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    $('experienceForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const name = $('userName').value.trim() || '訪客';
        const birthday = $('userBirthday').value;
        const hour = $('userHour').value;
        const error = $('experienceError');
        error.textContent = '';
        if (!birthday || !hour) {
            error.textContent = '請先填寫出生日期與時辰，才能生成結果。';
            return;
        }
        if (!$('agreeDisclaimer').checked) {
            error.textContent = '請先勾選同意免責聲明。';
            return;
        }
        currentResult = makeResult(name, birthday, hour);
        renderResult(currentResult);
        $('resultSection').hidden = false;
        $('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    $('copyLinkBtn').addEventListener('click', async () => {
        const button = $('copyLinkBtn');
        try {
            await copyText(shareUrl);
            button.textContent = '已複製，快去分享';
            setTimeout(() => { button.textContent = '一鍵複製分享連結'; }, 2200);
        } catch (error) {
            button.textContent = '複製失敗，請手動選取';
        }
    });

    document.querySelectorAll('[data-share]').forEach((button) => {
        button.addEventListener('click', () => openShare(button.dataset.share));
    });
    $('downloadCardBtn').addEventListener('click', downloadCard);

    $('leadForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const error = $('leadError');
        const submit = $('leadSubmitBtn');
        error.textContent = '';
        const email = $('leadEmail').value.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            error.textContent = '請輸入有效的 Email。';
            return;
        }
        if (!$('privacyConsent').checked) {
            error.textContent = '請勾選同意隱私政策與資料收集。';
            return;
        }
        submit.disabled = true;
        submit.textContent = '正在安全提交…';
        const payload = {
            name: $('leadName').value.trim(),
            email,
            contactPreference: $('contactPreference').value,
            privacyConsent: true,
            consentVersion: '2026-08-24',
            source: utm.source,
            utm,
            resultId: currentResult ? currentResult.token : '',
            referralCode: params.get('ref') || '',
            honeypot: ''
        };
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.message || '提交暫時失敗，請稍後再試。');
            $('leadForm').hidden = true;
            $('leadSuccess').hidden = false;
        } catch (submitError) {
            error.textContent = submitError.message;
            submit.disabled = false;
            submit.textContent = '接收後續更新';
        }
    });
})();
