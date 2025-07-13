# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-19

### Added
- 初始版本发布
- 项目管理功能：创建、编辑、删除项目
- 任务管理功能：智能分组（待安排、今日待办、未来一周、已完成）
- 层级任务支持：父子任务关系
- 任务详情面板：支持备注、日期范围设置
- 右键菜单：快速操作（添加子任务、移动、删除、开始计时）
- 专注计时功能：基于任务的计时器
- 专注历史记录：查看和统计专注会话
- 现代化界面：Vue 3 + Element Plus
- 主题支持：自动同步思源主题（明亮/暗黑/跟随系统）
- 响应式设计：支持桌面和移动设备
- 拖拽排序：重新排序任务和在项目间移动
- 自动发布流程：GitHub Actions 自动构建和发布

### Technical
- 基于 Vue 3 + TypeScript + Element Plus 构建
- 使用 IndexedDB 进行本地数据存储
- 支持思源笔记 2.8.0+ 版本
- 完整的开发工具链和自动化发布流程
