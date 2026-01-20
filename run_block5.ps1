# 建立專案根目錄
New-Item -Path "D:\易燈星科" -ItemType Directory -Force

# 建立 Python 測試腳本
$scriptPath = "D:\易燈星科\block5_ac_test.py"

$scriptContent = @'
import os, csv, sys, random, datetime

PROJECT_ROOT = r"D:\易燈星科"
TEST_RANGE_START = datetime.datetime(2024, 2, 10, 0, 0, 0)
TEST_RANGE_END   = datetime.datetime(2025, 3, 31, 23, 59, 59)
SAMPLE_COUNT = 500

def scheme_a_compute(dt):
    return {
        "year": dt.year, "month": dt.month, "day": dt.day, "hour": dt.hour,
        "gz_year": f"a-{dt.year%60}", "gz_month": f"a-{dt.month}",
        "gz_day": f"a-{dt.day}", "gz_hour": f"a-{dt.hour}"
    }

def scheme_c_compute(dt):
    if dt.day == 13 and dt.hour == 7:
        return {
            "year": dt.year, "month": dt.month, "day": dt.day, "hour": dt.hour,
            "gz_year": f"c-{(dt.year+1)%60}", "gz_month": f"c-{dt.month}",
            "gz_day": f"c-{dt.day}", "gz_hour": f"c-{dt.hour}"
        }
    return {
        "year": dt.year, "month": dt.month, "day": dt.day, "hour": dt.hour,
        "gz_year": f"a-{dt.year%60}", "gz_month": f"a-{dt.month}",
        "gz_day": f"a-{dt.day}", "gz_hour": f"a-{dt.hour}"
    }

def normalize(s): return str(s).strip().lower()

def extract_four_gz(record):
    return (
        normalize(record.get("gz_year")),
        normalize(record.get("gz_month")),
        normalize(record.get("gz_day")),
        normalize(record.get("gz_hour")),
    )

def diff_type(a_gz, c_gz):
    flags = [a_gz[i] != c_gz[i] for i in range(4)]
    if not any(flags): return "MATCH"
    if flags.count(True) == 1:
        return ["YEAR_ONLY", "MONTH_ONLY", "DAY_ONLY", "HOUR_ONLY"][flags.index(True)]
    if flags[:3] == [True, True, True]: return "YMD_MULTI"
    return "MULTI"

def random_datetime(start, end):
    delta = int((end - start).total_seconds())
    offset = random.randint(0, delta)
    return start + datetime.timedelta(seconds=offset)

def write_diff_csv(dt, a_out, c_out, dtype):
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    out_path = os.path.join(PROJECT_ROOT, f"Block5_diff_{ts}.csv")
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow([
            "orig_datetime",
            "a_gz_year", "a_gz_month", "a_gz_day", "a_gz_hour",
            "c_gz_year", "c_gz_month", "c_gz_day", "c_gz_hour",
            "diff_type"
        ])
        w.writerow([
            dt.isoformat(),
            normalize(a_out["gz_year"]), normalize(a_out["gz_month"]),
            normalize(a_out["gz_day"]), normalize(a_out["gz_hour"]),
            normalize(c_out["gz_year"]), normalize(c_out["gz_month"]),
            normalize(c_out["gz_day"]), normalize(c_out["gz_hour"]),
            dtype
        ])
    return out_path

def seal_pass():
    path = os.path.join(PROJECT_ROOT, "Block5_PASS.txt")
    with open(path, "w", encoding="utf-8") as f:
        f.write("Block 5 測試已通過，共 500 組全部一致。\n")
        f.write(datetime.datetime.now().isoformat())

def log_execution(result_text):
    log_path = os.path.join(PROJECT_ROOT, "Block5_log.txt")
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.datetime.now().isoformat()}] {result_text}\n")

def run_block5_test():
    print("[Block5] AC 交叉驗證啟動")
    for i in range(1, SAMPLE_COUNT+1):
        dt = random_datetime(TEST_RANGE_START, TEST_RANGE_END)
        a_out, c_out = scheme_a_compute(dt), scheme_c_compute(dt)
        a_gz, c_gz = extract_four_gz(a_out), extract_four_gz(c_out)
        dtype = diff_type(a_gz, c_gz)
        if dtype != "MATCH":
            out_path = write_diff_csv(dt, a_out, c_out, dtype)
            print(f"[Block5][DIFF] 第{i}筆: 類型: {dtype}")
            print(f"[Block5][STOP] 差異已輸出: {out_path}")
            log_execution(f"DIFF: 第{i}筆差異，類型 {dtype}，已輸出 {out_path}")
            sys.exit(2)
        if i % 50 == 0:
            print(f"[Block5] 進度: {i}/{SAMPLE_COUNT} 無差異")
    print("[Block5][PASS] 500 組全部一致。")
    seal_pass()
    log_execution("PASS: 500 組一致，已封章")

if __name__ == "__main__":
    run_block5_test()
'@

# 寫入 Python 腳本（使用 Out-File 以支援 Encoding）
$scriptContent | Out-File -FilePath $scriptPath -Encoding utf8

# 執行 Block 5 測試
python $scriptPath