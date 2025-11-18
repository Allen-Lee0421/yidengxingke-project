@echo off
REM ----------------------------------------------------
REM 易燈星科 - PowerShell 安裝腳本啟動器 (run.bat)
REM ----------------------------------------------------
D:
cd D:\易燈星科

echo.
echo 正在啟動 PowerShell 安裝程序...
echo ----------------------------------------------------

REM 執行 PowerShell 腳本
REM -ExecutionPolicy Bypass 允許直接執行本地腳本 (通常需要管理員權限)
PowerShell.exe -NoProfile -ExecutionPolicy Bypass -File .\install.ps1

pause