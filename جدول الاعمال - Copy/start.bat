@echo off
:: التحويل تلقائياً إلى مجلد المشروع الحالي بغض النظر عن طريقة التشغيل
cd /d "%~dp0"

echo [Safety System] Starting application...

:: تشغيل خادم PowerShell أو Node
start powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"