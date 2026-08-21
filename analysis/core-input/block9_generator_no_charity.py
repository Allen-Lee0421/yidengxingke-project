
import os, json, csv
from fpdf import FPDF
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = PROJECT_ROOT / "reports"
LOG_PATH = PROJECT_ROOT / "revenue_log.csv"
OUTPUT_DIR.mkdir(exist_ok=True)

class EdisonStarReport(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 8)
        self.set_text_color(212, 175, 55)
        self.cell(0, 10, 'EDISON STAR STRATEGIC INTELLIGENCE - GLOBAL CONFIDENTIAL', 0, 1, 'C')
    def footer(self):
        # 已移除公益標註，改為品牌聲明
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, 'Edison Star Matrix - Private Strategic Report | xingdeng.tw', 0, 0, 'C')

def log_transaction(user_name, amount_ntd):
    """純記帳，無公益抽成"""
    file_exists = LOG_PATH.is_file()
    with open(LOG_PATH, mode='a', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(['Date', 'Customer', 'Revenue_NTD', 'Product'])
        writer.writerow([datetime.now().strftime("%Y-%m-%d"), user_name, amount_ntd, "yijian_bigdata"])

def generate_report(user_name, user_data, lang='zh-TW', price=1280):
    pdf = EdisonStarReport()
    pdf.add_page()
    pdf.set_font('Arial', 'B', 22)
    pdf.set_text_color(178, 34, 34)
    pdf.cell(0, 20, f'2026 BING-WU STRATEGY MATRIX', 0, 1, 'C')
    pdf.set_font('Arial', '', 12)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(5)
    pdf.cell(0, 10, f'Target: {user_name}', 0, 1)
    pdf.cell(0, 10, f'Analysis Date: {datetime.now().strftime("%Y-%m-%d %H:%M")}', 0, 1)
    pdf.line(10, 55, 200, 55)
    pdf.ln(15)
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'Global Strategic Analysis:', 0, 1)
    pdf.set_font('Arial', '', 12)
    results = [
        f"Ganzhi Cycle: {user_data.get('year', '2026 Bing-Wu')}",
        f"Month Pillar Fixed: {user_data.get('month_gz', 'BLOCK6_JIEQI')}",
        f"Energy Index: 95% (Fire Element Surplus)",
        f"Core Hexagram: Huo-Lei-Shi-Ke",
        f"Wealth Matrix: Strategic Breakthrough Required"
    ]
    for line in results:
        pdf.cell(0, 10, f"- {line}", 0, 1)
    pdf.ln(10)
    pdf.set_fill_color(245, 245, 220)
    pdf.set_font('Arial', 'I', 10)
    prologue = "This report leverages BLOCK 6-7 fixed solar-term boundaries to provide cold, calculated strategic insights for 2026."
    pdf.multi_cell(0, 10, prologue, border=1, align='C', fill=True)
    
    # 高曝光分享區塊
    pdf.ln(10)
    pdf.set_font('Arial', 'B', 11)
    pdf.set_text_color(212, 175, 55)
    pdf.cell(0, 10, f"Share: xingdeng.tw/r/{user_name[:8]} - Scan to unlock your matrix", 0, 1, 'C')

    filename = f"Report_{user_name}_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    save_path = OUTPUT_DIR / filename
    pdf.output(str(save_path))
    log_transaction(user_name, price)
    return str(save_path)

if __name__ == "__main__":
    path = generate_report("Edison_Global_Client", {"year": "2026 Bing-Wu", "month_gz": "丙寅"}, price=1280)
    print(f"報告已生成：{path}")
