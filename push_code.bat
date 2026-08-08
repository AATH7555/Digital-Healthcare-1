@echo off
TITLE Digital Healthcare - Git Push Assistant
COLOR 0A
CLS

ECHO ========================================================
ECHO      DIGITAL HEALTHCARE SYSTEM - AUTO PUSH
ECHO ========================================================
ECHO.

ECHO [1/5] Checking Git status...
IF NOT EXIST .git (
    ECHO Initializing new Git repository...
    git init
)

ECHO [2/5] Adding all files...
git add .

ECHO [3/5] Committing changes...
git commit -m "Auto-save: Latest updates"

ECHO [4/5] Checking Remote...
git remote -v > remote_check.tmp
set /p REMOTE_CHECK=<remote_check.tmp
del remote_check.tmp

IF "%REMOTE_CHECK%"=="" (
    ECHO No remote repository found.
    SET /P REPO_URL=Please paste your GitHub URL (Right-click to paste): 
    git remote add origin %REPO_URL%
)

ECHO [5/5] Pushing to remote...
git branch -M main
git push -u origin main

ECHO.
ECHO ========================================================
ECHO      DONE! Press any key to exit.
ECHO ========================================================
PAUSE >NUL