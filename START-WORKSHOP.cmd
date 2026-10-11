@echo off
cd /d "%~dp0"
set APP_ORIGIN=http://127.0.0.1:8787
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22.18 or newer, then run this file again.
  pause
  exit /b 1
)
echo Rivals Workshop 2.4 - http://127.0.0.1:8787
echo Keep this window open while using the workshop. Ctrl+C stops the server.
node --env-file-if-exists=.env.server server/companion.mjs
pause
