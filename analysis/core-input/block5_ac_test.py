import os
import csv
import random
from datetime import datetime, timedelta

# 固定專案根目錄
PROJECT_ROOT = r"D:\EdisonStar"
DIFF_PATH_FMT = os.path.join(PROJECT_ROOT, "Block5_diff_{ts}.csv")
PASS_PATH = os.path.join(PROJECT_ROOT, "Block5_PASS.txt")
LOG_PATH = os.path.join(PROJECT_ROOT, "Block5_log.txt")

GAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]
ZHI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]

def simple_stem_branch_index(seed: int):
    return GAN[seed % 10], ZHI[seed % 12]

# ===== A 方案（外部庫覆寫） =====
def a_get_ganzhi(dt: datetime):
    y_gz = simple_stem_branch_index(dt.year)
    m_gz = simple_stem_branch_index(dt.year * 100 + dt.month)
    d_gz = simple_stem_branch_index(int(dt.strftime("%Y%m%d")))
    h_gz = simple_stem_branch_index(dt.hour)
    return {"year": y_gz, "month": m_gz, "day": d_gz, "hour": h_gz}

# ===== C 方案（查表法） =====
def c_get_ganzhi(dt: datetime):
    y_gz = simple_stem_branch_index(dt.year + 7)
    m_gz = simple_stem_branch_index((dt.year * 100 + dt.month) + 11)
    d_gz = simple_stem_branch_index(int(dt.strftime("%Y%m%d")) + 13)
    h_gz = simple_stem_branch_index(dt.hour + 5)
    return {"year": y_gz, "month": m_gz, "day": d_gz, "hour": h_gz}

def ensure_dir(p: str):
    d = os.path.dirname(p)
    if d and not os.path.exists(d):
        os.makedirs(d, exist_ok=True)

def now_stamp():
    return datetime.now().strftime("%Y%m%d_%H%M%S")

def write_log(line: str):
    ensure_dir(LOG_PATH)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"{datetime.now().isoformat(timespec='seconds')} | {line}\n")

def write_pass():
    ensure_dir(PASS_PATH)
    with open(PASS_PATH, "w", encoding="utf-8") as f:
        f.write("[Block5][PASS] 500 組全部一致。\n")

def write_diff_csv(rows):
    ts = now_stamp()
    diff_path = DIFF_PATH_FMT.format(ts=ts)
    ensure_dir(diff_path)
    with open(diff_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["type", "datetime", "A_year", "A_month", "A_day", "A_hour",
                    "C_year", "C_month", "C_day", "C_hour"])
        for r in rows:
            w.writerow(r)
    return diff_path

def compare_items(a, c):
    diffs = []
    for key in ["year", "month", "day", "hour"]:
        if a[key] != c[key]:
            diffs.append(key)
    return diffs

def generate_random_datetimes(n=500):
    start = datetime(2000, 1, 1, 0, 0, 0)
    end = datetime(2049, 12, 31, 23, 59, 59)
    total_seconds = int((end - start).total_seconds())
    random.seed(123456)
    dts = []
    for _ in range(n):
        offset = random.randint(0, total_seconds)
        dt = start + timedelta(seconds=offset)
        dt = dt.replace(hour=random.randint(0, 23), minute=0, second=0, microsecond=0)
        dts.append(dt)
    return dts

def format_gz(gz_tuple):
    return f"{gz_tuple[0]}{gz_tuple[1]}"

def run_block5():
    write_log("[Block5] START")
    samples = generate_random_datetimes(500)
    diffs_rows = []

    for i, dt in enumerate(samples, start=1):
        a = a_get_ganzhi(dt)
        c = c_get_ganzhi(dt)

        # 月干支不一致 → 立即停止
        if a["month"] != c["month"]:
            diff_row = [
                "Month",
                dt.strftime("%Y-%m-%d %H:%M"),
                format_gz(a["year"]), format_gz(a["month"]),
                format_gz(a["day"]),  format_gz(a["hour"]),
                format_gz(c["year"]), format_gz(c["month"]),
                format_gz(c["day"]),  format_gz(c["hour"]),
            ]
            diff_path = write_diff_csv([diff_row])
            msg = f"[Block5][STOP] 月干支不一致於樣本#{i}，已輸出差異：{diff_path}"
            print(msg)
            write_log(msg)
            return

        other_diffs = [d for d in compare_items(a, c) if d != "month"]
        if other_diffs:
            diff_row = [
                ",".join(other_diffs),
                dt.strftime("%Y-%m-%d %H:%M"),
                format_gz(a["year"]), format_gz(a["month"]),
                format_gz(a["day"]),  format_gz(a["hour"]),
                format_gz(c["year"]), format_gz(c["month"]),
                format_gz(c["day"]),  format_gz(c["hour"]),
            ]
            diffs_rows.append(diff_row)

    if diffs_rows:
        diff_path = write_diff_csv(diffs_rows)
        msg = f"[Block5][DIFF] 測試完成但發現差異，已輸出報告：{diff_path}"
        print(msg)
        write_log(msg)
    else:
        write_pass()
        msg = "[Block5][PASS] 500 組全部一致。"
        print(msg)
        write_log(msg)

if __name__ == "__main__":
    print(f"[Path] 儲存路徑：{PROJECT_ROOT}")
    run_block5()