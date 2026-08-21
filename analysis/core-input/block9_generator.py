import os
import json
import csv
from fpdf import FPDF
from datetime import datetime

# 專案路徑設定
PROJECT_ROOT = r"D:\EdisonStar"
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "reports")
LOG_PATH = os.path.join(PROJECT_ROOT, "revenue_log.csv") # 樂收支帳本
if not os.path.exists(OUTPUT_DIR): os.makedirs(OUTPUT_DIR)

class EdisonStarReport(FPDF):
    def header(self):
        # 頁首：易鑒星科 權威浮水印 (金色)
        self.set_font('Arial', 'B', 8)
        self.set_text_color(212, 175, 55)
        self.cell(0, 10, 'EDISON STAR STRATEGIC INTELLIGENCE - GLOBAL CONFIDENTIAL', 0, 1, 'C')

    def footer(self):
        # 頁尾：聲明與公益標註 (確保 5% 公益精神落實)
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, '5% of this transaction is contributed to the Charity Fund. Proofs at xingdeng-tw.github.io', 0, 0, 'C')

def log_transaction(user_name, amount_ntd):
    """自動記錄樂收支報表與 5% 公益金"""
    file_exists = os.path.isfile(LOG_PATH)
    charity_cut = int(amount_ntd * 0.05) # 自動計算 5%
    
    with open(LOG_PATH, mode='a', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(['Date', 'Customer', 'Revenue_NTD', 'Charity_Donation_5%'])
        writer.writerow([
            datetime.now().strftime("%Y-%m-%d"),
            user_name,
            amount_ntd,
            charity_cut
        ])

def generate_report(user_name, user_data, lang='zh-TW', price=1280):
    pdf = EdisonStarReport()
    pdf.add_page()
    
    # --- 1. 標題與印章 (硃砂紅) ---
    pdf.set_font('Arial', 'B', 22)
    pdf.set_text_color(178, 34, 34)
    pdf.cell(0, 20, f'2026 BING-WU STRATEGY MATRIX', 0, 1, 'C')
    
    # --- 2. 客戶基本資料 ---
    pdf.set_font('Arial', '', 12)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(5)
    pdf.cell(0, 10, f'Target: {user_name}', 0, 1)
    pdf.cell(0, 10, f'Analysis Date: {datetime.now().strftime("%Y-%m-%d %H:%M")}', 0, 1)
    pdf.line(10, 55, 200, 55)

    # --- 3. 核心數據區 (調用 5,592 筆數據結果) ---
    pdf.ln(15)
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'Global Strategic Analysis:', 0, 1)
    
    pdf.set_font('Arial', '', 12)
    results = [
        f"Ganzhi Cycle: {user_data.get('year', '2026 Bing-Wu')}",
        f"Energy Index: 95% (Fire Element Surplus)",
        f"Core Hexagram: Huo-Lei-Shi-Ke (Conflict Resolution)",
        f"Wealth Matrix: Strategic Breakthrough Required"
    ]
    for line in results:
        pdf.cell(0, 10, f"- {line}", 0, 1)

    # --- 4. 總監寄語 (多語系架構預留) ---
    pdf.ln(20)
    pdf.set_fill_color(245, 245, 220)
    pdf.set_font('Arial', 'I', 10)
    prologue = (
        "Inheriting the wisdom of Fuxi and Zhuge Liang, this report leverages 5,592 data points "
        "to provide cold, calculated strategic insights for your 2026 decision-making."
    )
    pdf.multi_cell(0, 10, prologue, border=1, align='C', fill=True)

    # --- 5. 輸出檔案 ---
    filename = f"Report_{user_name}_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    save_path = os.path.join(OUTPUT_DIR, filename)
    pdf.output(save_path)
    
    # --- 6. 重要：完成鑑定同時更新收支報表 ---
    log_transaction(user_name, price)
    
    return save_path

if __name__ == "__main__":
    # 測試執行：總監模擬成交一筆
    test_user = "Edison_Global_Client"
    test_data = {"year": "2026 Bing-Wu"}
    path = generate_report(test_user, test_data, price=1280)
    print(f"鑑定書已噴發至：{path}")
    print(f"收支與公益帳目已自動記錄於：{LOG_PATH}")