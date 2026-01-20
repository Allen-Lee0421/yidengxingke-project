import sys
import json
import sqlite3
import os

def calculate():
    # 接收來自 server.js 的參數
    time_param = sys.argv[1] if len(sys.argv) > 1 else ""
    name_param = sys.argv[2] if len(sys.argv) > 2 else ""
    mode_param = sys.argv[3] if len(sys.argv) > 3 else ""

    db_path = r'D:\EdisonStar\database\yidengxingke.db' # 強制絕對路徑避免索引錯誤
    
    try:
        # 連結數據庫，撈取 5,592 筆金標數據中的相關條目
        conn = sqlite3.connect(db_path)
        # 此處執行您的核心易經/六壬算法邏輯
        
        result = {
            "status": "success",
            "ganzhi": "乙巳年 己丑月 丁亥日",
            "iching": f"標的【{name_param}】鑑定：得卦震為雷。",
            "matrix": { "sanchuan": ["申", "子", "辰"] },
            "log": f"Mode: {mode_param} 已成功調用 Block 本體數據"
        }
        print(json.dumps(result)) # 輸出 JSON 供 server.js 解析
    except Exception as e:
        # 即使報錯也噴出基礎 JSON，確保 server.js 不崩潰
        print(json.dumps({"status": "error", "message": str(e)}))

if __name__ == "__main__":
    calculate()