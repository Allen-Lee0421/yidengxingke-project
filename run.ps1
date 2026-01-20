# =========================
# Block 5: 交叉驗證 run.ps1
# =========================

# --- 配置區（請依你的服務真實端點調整） ---
# A 方案（覆寫邏輯）與 C 方案（查表法）的調用方式
# 你可選擇 HTTP API 或本機可執行檔，二擇一啟用。

$UseHttpApi = $true
$AEndpoint = "http://localhost:5001/api/pillars"   # A 方案 API
$CEndpoint = "http://localhost:5002/api/pillars"   # C 方案 API

# 若使用本機可執行檔（示例），則設置以下路徑並將 $UseHttpApi 設為 $false
$AExe = "D:\易燈星科\AService.exe"
$CExe = "D:\易燈星科\CService.exe"

# --- 輔助：四個測試時刻（子、卯、午、酉） ---
$TestHours = @(0, 6, 12, 18)  # 00:00, 06:00, 12:00, 18:00

# --- 測試日期集合：兩個節氣窗口，各 ±2 日 ---
$DaxueCenter = [datetime]::Parse("2024-12-07T00:00:00")
$LichunCenter = [datetime]::Parse("2025-02-04T00:00:00")

function Get-WindowDates($center) {
    $dates = @()
    foreach ($offset in -2..2) {
        $dates += $center.AddDays($offset).Date
    }
    return $dates
}

$TestDates = @(Get-WindowDates -center $DaxueCenter) + @(Get-WindowDates -center $LichunCenter)

# --- 調用封裝 ---
function Invoke-A($dt) {
    if ($UseHttpApi) {
        $payload = @{ iso = $dt.ToString("o") }
        return Invoke-RestMethod -Method Post -Uri $AEndpoint -Body ($payload | ConvertTo-Json) -ContentType "application/json"
    } else {
        $args = $dt.ToString("o")
        $out = & $AExe $args
        return $out | ConvertFrom-Json
    }
}

function Invoke-C($dt) {
    if ($UseHttpApi) {
        $payload = @{ iso = $dt.ToString("o") }
        return Invoke-RestMethod -Method Post -Uri $CEndpoint -Body ($payload | ConvertTo-Json) -ContentType "application/json"
    } else {
        $args = $dt.ToString("o")
        $out = & $CExe $args
        return $out | ConvertFrom-Json
    }
}

# --- 比對工具：四柱一致性 ---
function Compare-Pillars($a, $c) {
    # 期望返回物件結構：
    # { year:"甲子", month:"丙子", day:"庚寅", hour:"乙丑" }
    $diffs = @()

    if ($a.year  -ne $c.year)  { $diffs += "year"  }
    if ($a.month -ne $c.month) { $diffs += "month" }
    if ($a.day   -ne $c.day)   { $diffs += "day"   }
    if ($a.hour  -ne $c.hour)  { $diffs += "hour"  }

    return $diffs
}

# --- 差異報告器 ---
$Report = @()

function Add-Report($dt, $a, $c, $diffs) {
    $Report += [pscustomobject]@{
        iso      = $dt.ToString("o")
        A_year   = $a.year
        A_month  = $a.month
        A_day    = $a.day
        A_hour   = $a.hour
        C_year   = $c.year
        C_month  = $c.month
        C_day    = $c.day
        C_hour   = $c.hour
        diffs    = ($diffs -join ",")
    }
}

# --- 主流程：分時測試 + 即時停錯（月柱優先）
Write-Host "Block 5 交叉驗證啟動…" -ForegroundColor Cyan

foreach ($d in $TestDates) {
    foreach ($h in $TestHours) {
        $dt = [datetime]::SpecifyKind($d.AddHours($h), [System.DateTimeKind]::Local)

        try {
            $a = Invoke-A -dt $dt
            $c = Invoke-C -dt $dt
        } catch {
            Write-Host "服務調用失敗：$($_.Exception.Message)" -ForegroundColor Red
            Add-Report -dt $dt -a @{year="ERR";month="ERR";day="ERR";hour="ERR"} -c @{year="ERR";month="ERR";day="ERR";hour="ERR"} -diffs @("invoke-error")
            continue
        }

        $diffs = Compare-Pillars -a $a -c $c
        if ($diffs.Count -eq 0) {
            Write-Host ("OK " + $dt.ToString("yyyy-MM-dd HH:mm")) -ForegroundColor Green
        } else {
            Add-Report -dt $dt -a $a -c $c -diffs $diffs
            # 月柱不一致 → 立即停測並輸出修復指南
            if ($diffs -contains "month") {
                Write-Host ("月柱不一致 → 停止測試 @ " + $dt.ToString("yyyy-MM-dd HH:mm")) -ForegroundColor Yellow
                Write-Host "修復優先：請修正 A 方案月柱切換邏輯，使其以節氣交接的精確時刻為切換邊界。" -ForegroundColor Yellow
                break
            } else {
                Write-Host ("差異：" + ($diffs -join ",")) -ForegroundColor DarkYellow
            }
        }
    }

    # 若上一層發生月柱不一致並 break，終止整體跑批
    if ($Report | Where-Object { $_.diffs -like "*month*" }) {
        break
    }
}

# --- 輸出差異報告 ---
$ts = (Get-Date).ToString("yyyyMMdd_HHmmss")
$csvPath = "D:\易燈星科\Block5_diff_$ts.csv"
$Report | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8

Write-Host "交叉驗證完成。差異報告輸出：$csvPath" -ForegroundColor Cyan