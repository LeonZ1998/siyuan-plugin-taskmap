#!/bin/bash

# TaskMap Plugin Release Script
# 使用方法: ./scripts/release.sh [版本号]
# 例如: ./scripts/release.sh 1.0.0

set -e

# 检查参数
if [ $# -eq 0 ]; then
    echo "❌ 请提供版本号"
    echo "使用方法: ./scripts/release.sh [版本号]"
    echo "例如: ./scripts/release.sh 1.0.0"
    exit 1
fi

VERSION=$1
TAG_NAME="v$VERSION"

echo "🚀 开始发布 TaskMap Plugin v$VERSION"

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo "⚠️  警告: 当前分支是 $CURRENT_BRANCH，建议在 main 分支上发布"
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ 有未提交的更改，请先提交或暂存"
    git status --short
    exit 1
fi

# 检查是否已经存在该 tag
if git tag -l | grep -q "^$TAG_NAME$"; then
    echo "❌ Tag $TAG_NAME 已存在"
    exit 1
fi

# 更新 plugin.json 中的版本号
echo "📝 更新 plugin.json 版本号..."
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" plugin.json

# 提交版本更新
echo "📦 提交版本更新..."
git add plugin.json
git commit -m "chore: bump version to $VERSION"

# 创建 tag
echo "🏷️  创建 tag $TAG_NAME..."
git tag -a "$TAG_NAME" -m "Release $TAG_NAME"

# 推送到远程仓库
echo "📤 推送到远程仓库..."
git push origin "$CURRENT_BRANCH"
git push origin "$TAG_NAME"

echo "✅ 发布流程完成!"
echo ""
echo "📋 接下来会发生什么:"
echo "1. GitHub Actions 将自动触发构建"
echo "2. 构建成功后会自动创建 Release"
echo "3. package.zip 将作为附件上传到 Release"
echo ""
echo "🔗 查看构建状态: https://github.com/Wetoria/plugin-sample-vite-vue/actions"
echo "🔗 查看 Release: https://github.com/Wetoria/plugin-sample-vite-vue/releases" 