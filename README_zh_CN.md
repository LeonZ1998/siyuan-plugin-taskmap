# TaskMap 思源笔记插件

[English](./README.md)

一个基于 Vue 3 和 Element Plus 的现代化思源笔记任务管理插件。

## ✨ 功能特性

### 📋 项目管理
- 创建和管理不同类型的项目
- 跟踪项目进度和完成率
- 设置项目截止日期和里程碑
- 归档和删除项目

### ✅ 任务管理
- **智能任务分组**: 任务自动按时间分组：
  - 📅 **待安排**: 没有截止日期的任务
  - 🌞 **今日待办**: 今天到期的任务
  - 📆 **未来一周**: 未来7天内到期的任务
  - ✅ **已完成**: 所有已完成的任务
- **层级任务**: 支持子任务和父子关系
- **任务详情**: 丰富的任务编辑功能，支持备注和日期范围
- **拖拽排序**: 重新排序任务和在项目间移动
- **右键菜单**: 快速操作（添加子任务、移动、删除、开始计时）

### ⏱️ 专注计时
- **基于任务的计时**: 选择任何任务开始专注工作
- **计时控制**: 开始、暂停、继续和结束计时会话
- **专注历史**: 跟踪和查看专注会话历史
- **统计分析**: 查看总专注时间和会话次数

### 🎨 现代化界面
- **响应式设计**: 在桌面和移动设备上无缝工作
- **主题支持**: 自动同步思源主题（明亮/暗黑/跟随系统）
- **Element Plus**: 美观一致的UI组件
- **流畅动画**: 现代化的交互反馈

## 🚀 快速开始

### 安装
1. 打开思源笔记
2. 进入 **设置** → **集市**
3. 搜索 "TaskMap"
4. 点击 **安装** 并 **启用**

### 基本使用

#### 创建项目
1. 导航到 **项目** 标签页
2. 在输入栏中输入项目名称
3. 按 **Enter** 创建

#### 管理任务
1. 导航到 **任务** 标签页
2. 任务自动按时间分组
3. 点击任何任务打开详情面板
4. 右键进行快速操作

#### 使用专注计时
1. 导航到 **计时** 标签页
2. 选择要专注的任务
3. 点击 **开始** 开始计时
4. 跟踪你的专注会话

## 🛠️ 开发

### 环境要求
- Node.js 18+
- pnpm 8+

### 设置
```bash
# 克隆仓库
git clone https://github.com/LeonZ1998/siyuan-plugin-taskmap.git
cd siyuan-plugin-taskmap

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 构建
```bash
# 构建生产版本
pnpm build

# 构建将生成 package.zip 用于思源
```

## 📦 发布流程

### 自动发布
本项目使用 GitHub Actions 进行自动发布。当你推送一个标签时，它会自动：
1. 构建项目
2. 创建 GitHub Release
3. 上传 `package.zip` 作为附件

### 手动发布
使用提供的发布脚本：

**PowerShell (Windows 推荐):**
```powershell
.\scripts\release.ps1 1.0.1
```

**Bash (Linux/macOS):**
```bash
./scripts/release.sh 1.0.1
```

**Windows 批处理:**
```cmd
scripts\release.bat 1.0.1
```

脚本将：
- 更新 `plugin.json` 中的版本号
- 创建 git 标签
- 推送到 GitHub
- 触发自动构建和发布

### 发布工作流
1. **创建标签**: 脚本创建类似 `v1.0.1` 的标签
2. **推送到 GitHub**: 标签推送触发 GitHub Actions
3. **自动构建**: GitHub Actions 构建项目
4. **创建发布**: 创建新的 GitHub Release 并包含 `package.zip`
5. **更新集市**: 发布可供用户下载

## 🏗️ 架构

### 技术栈
- **前端**: Vue 3 + TypeScript + Element Plus
- **构建工具**: Vite
- **数据存储**: IndexedDB
- **状态管理**: Vue 3 Composition API
- **样式**: SCSS + CSS 变量主题

### 项目结构
```
src/
├── components/          # Vue 组件
│   ├── ProjectPage.vue  # 项目管理
│   ├── TaskPage.vue     # 任务管理
│   ├── TimerPage.vue    # 专注计时
│   └── ...
├── composables/         # Vue 组合式函数
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
│   ├── dbManager.ts    # 数据库操作
│   ├── indexedDB.ts    # IndexedDB 包装器
│   └── ...
└── main.ts             # 入口文件
```

### 数据模型
- **项目**: `{ id, name, type, color, createdAt, ... }`
- **任务**: `{ id, title, projectId, parentId, dueDate, isCompleted, ... }`
- **专注会话**: `{ id, taskId, startTime, endTime, duration, ... }`

## 🤝 贡献

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 链接

- [GitHub 仓库](https://github.com/LeonZ1998/siyuan-plugin-taskmap)
- [思源笔记](https://github.com/siyuan-note/siyuan)
- [Element Plus](https://element-plus.org/)

---

为思源社区而制作 ❤️
