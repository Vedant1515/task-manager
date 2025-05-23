@echo off
SET RETRIES=10
SET COUNT=0

:loop
curl -s -f http://localhost:3002/api/status >nul 2>&1
IF %ERRORLEVEL%==0 (
  echo ✅ Health check passed!
  EXIT /B 0
)

SET /A COUNT+=1
IF %COUNT% GEQ %RETRIES% (
  echo ❌ Health check failed!
  EXIT /B 1
)

REM Use safer delay without redirection
ping -n 3 127.0.0.1 >nul

GOTO loop
