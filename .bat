// musicPlayer.js - 背景音樂自動播放程式 (最終 Windows 兼容版)

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); // 引入執行 CMD 指令的核心模組

const MUSIC_DIR = path.join(__dirname, 'music'); // 設定音樂資料夾路徑
let currentPlaylist = []; // 當前播放列表

console.log('--- 🎶 音樂播放系統已啟動 (最終 Windows 兼容模式) ---');
console.log('請注意: 首次播放可能彈出預設播放器視窗。');

// 函數：取得所有 MP3 檔案
function getMusicFiles() {
    try {
        const files = fs.readdirSync(MUSIC_DIR);
        // 篩選出所有以 .mp3 結尾的檔案，並組成完整路徑
        currentPlaylist = files
            .filter(file => file.endsWith('.mp3'))
            .map(file => path.join(MUSIC_DIR, file));
        return currentPlaylist;

    } catch (err) {
        console.error(`❌ 錯誤：音樂資料夾讀取失敗，請確認資料夾路徑: ${MUSIC_DIR}`);
        return [];
    }
}

// 函數：依序播放音樂
function playMusicLoop(index = 0) {
    const playlist = getMusicFiles();
    if (playlist.length === 0) {
        console.log('🔇 歌單為空。請在 /music 資料夾內放入 MP3 檔案。');
        return;
    }
    if (index >= playlist.length) {
        // 播放完畢，從頭開始 (后宮循環)
        index = 0;
    }

    const currentSongPath = playlist[index];
    console.log(`🎤 正在播放: ${path.basename(currentSongPath)}`);
    
    // 關鍵修正：直接呼叫 Windows 系統的預設 MP3 處理程式
    // "start" 指令會在新的背景視窗中開啟預設播放器
    const command = `start "" "${currentSongPath}"`;

    const child = exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ 播放錯誤，可能找不到系統播放器或 MP3 檔案損壞: ${error.message}`);
            // 發生錯誤，跳過這首歌
            return playMusicLoop(index + 1); 
        }
        // 注意: 使用 start 指令難以精確監測歌曲結束時間，
        // 這裡將以固定延遲時間來模擬播放結束並循環下一首。

        // 這裡需要根據您的歌曲長度設定一個合理的時間 (例如 30 秒)
        // 為了測試，我們設為一個較短的時間，實際應用時需要更聰明的判斷或更長的延遲。
        const DURATION_MS = 30000; // 模擬等待 30 秒

        setTimeout(() => {
            console.log(`✅ 歌曲播放結束 (模擬)。`);
            // 播放下一首歌
            playMusicLoop(index + 1);
        }, DURATION_MS);
    });
}

// 啟動音樂播放器
playMusicLoop();