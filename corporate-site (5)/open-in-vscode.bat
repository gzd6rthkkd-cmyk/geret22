@echo off
cd /d "%~dp0"
code . index.html
if errorlevel 1 echo VS Code не знайдено. Встановіть його з https://code.visualstudio.com
pause
