# TaskMap Plugin Release Script for PowerShell
# 使用方法: .\scripts\release.ps1 [版本号]
# 例如: .\scripts\release.ps1 1.0.0

param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

$ErrorActionPreference = "Stop"

$TagName = "v$Version"

Write-Host "🚀 开始发布 TaskMap Plugin v$Version" -ForegroundColor Green

# 检查当前分支
$CurrentBranch = git branch --show-current
if ($CurrentBranch -ne "main" -and $CurrentBranch -ne "master") {
    Write-Host "⚠️  警告: 当前分支是 $CurrentBranch，建议在 main 分支上发布" -ForegroundColor Yellow
    $Continue = Read-Host "是否继续? (y/N)"
    if ($Continue -ne "y" -and $Continue -ne "Y") {
        exit 1
    }
}

# 检查是否有未提交的更改
$Status = git status --porcelain
if ($Status) {
    Write-Host "❌ 有未提交的更改，请先提交或暂存" -ForegroundColor Red
    git status --short
    exit 1
}

# 检查是否已经存在该 tag
$ExistingTags = git tag -l
if ($ExistingTags -contains $TagName) {
    Write-Host "❌ Tag $TagName 已存在" -ForegroundColor Red
    exit 1
}

# 更新 plugin.json 中的版本号
Write-Host "📝 更新 plugin.json 版本号..." -ForegroundColor Cyan
$PluginJson = Get-Content plugin.json -Raw
$PluginJson = $PluginJson -replace '"version": "[^"]*"', "`"version`": `"$Version`""
$PluginJson | Set-Content plugin.json -Encoding UTF8

# 提交版本更新
Write-Host "📦 提交版本更新..." -ForegroundColor Cyan
git add plugin.json
git commit -m "chore: bump version to $Version"

# 创建 tag
Write-Host "🏷️  创建 tag $TagName..." -ForegroundColor Cyan
git tag -a $TagName -m "Release $TagName"

# 推送到远程仓库
Write-Host "📤 推送到远程仓库..." -ForegroundColor Cyan
git push origin $CurrentBranch
git push origin $TagName

Write-Host "✅ 发布流程完成!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 接下来会发生什么:" -ForegroundColor Yellow
Write-Host "1. GitHub Actions 将自动触发构建"
Write-Host "2. 构建成功后会自动创建 Release"
Write-Host "3. package.zip 将作为附件上传到 Release"
Write-Host ""
Write-Host "🔗 查看构建状态: https://github.com/LeonZ1998/siyuan-plugin-taskmap/actions" -ForegroundColor Blue
Write-Host "🔗 查看 Release: https://github.com/LeonZ1998/siyuan-plugin-taskmap/releases" -ForegroundColor Blue 