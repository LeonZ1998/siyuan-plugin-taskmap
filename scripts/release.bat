@echo off
setlocal enabledelayedexpansion

REM TaskMap Plugin Release Script for Windows
REM 使用方法: scripts\release.bat [版本号]
REM 例如: scripts\release.bat 1.0.0

if "%~1"=="" (
    echo ❌ 请提供版本号
    echo 使用方法: scripts\release.bat [版本号]
    echo 例如: scripts\release.bat 1.0.0
    exit /b 1
)

set VERSION=%~1
set TAG_NAME=v%VERSION%

echo 🚀 开始发布 TaskMap Plugin v%VERSION%

REM 检查当前分支
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
if not "%CURRENT_BRANCH%"=="main" if not "%CURRENT_BRANCH%"=="master" (
    echo ⚠️  警告: 当前分支是 %CURRENT_BRANCH%，建议在 main 分支上发布
    set /p CONTINUE="是否继续? (y/N): "
    if /i not "!CONTINUE!"=="y" exit /b 1
)

REM 检查是否有未提交的更改
git status --porcelain >nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ 有未提交的更改，请先提交或暂存
    git status --short
    exit /b 1
)

REM 检查是否已经存在该 tag
git tag -l | findstr /c:"%TAG_NAME%" >nul
if %errorlevel% equ 0 (
    echo ❌ Tag %TAG_NAME% 已存在
    exit /b 1
)

REM 更新 plugin.json 中的版本号
echo 📝 更新 plugin.json 版本号...
powershell -Command "(Get-Content plugin.json) -replace '\"version\": \"[^\"]*\"', '\"version\": \"%VERSION%\"' | Set-Content plugin.json"

REM 提交版本更新
echo 📦 提交版本更新...
git add plugin.json
git commit -m "chore: bump version to %VERSION%"

REM 创建 tag
echo 🏷️  创建 tag %TAG_NAME%...
git tag -a "%TAG_NAME%" -m "Release %TAG_NAME%"

REM 推送到远程仓库
echo 📤 推送到远程仓库...
git push origin "%CURRENT_BRANCH%"
git push origin "%TAG_NAME%"

echo ✅ 发布流程完成!
echo.
echo 📋 接下来会发生什么:
echo 1. GitHub Actions 将自动触发构建
echo 2. 构建成功后会自动创建 Release
echo 3. package.zip 将作为附件上传到 Release
echo.
echo 🔗 查看构建状态: https://github.com/Wetoria/plugin-sample-vite-vue/actions
echo 🔗 查看 Release: https://github.com/Wetoria/plugin-sample-vite-vue/releases

pause 