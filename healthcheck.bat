@echo off
SET RETRIES=10
SET COUNT=0

:loop
curl -s -o nul -f http://localhost:3002/api/status
IF %ERRORLEVEL%==0 (
  echo ✅ Health check passed!
  EXIT /B 0
)

SET /A COUNT+=1
IF %COUNT% GEQ %RETRIES% (
  echo ❌ Health check failed!
  EXIT /B 1
)

timeout /T 2 >nul
GOTO loop
