# TaskMap Plugin for Siyuan

[简体中文](./README_zh_CN.md)

A modern task management plugin for Siyuan Note, built with Vue 3 and Element Plus.

## ✨ Features

### 📋 Project Management
- Create and manage projects with different types
- Track project progress and completion rates
- Set project deadlines and milestones
- Archive and delete projects

### ✅ Task Management
- **Smart Task Grouping**: Tasks are automatically organized into:
  - 📅 **Unscheduled**: Tasks without due dates
  - 🌞 **Today**: Tasks due today
  - 📆 **Next Week**: Tasks due within the next 7 days
  - ✅ **Completed**: All completed tasks
- **Hierarchical Tasks**: Support for subtasks and parent-child relationships
- **Task Details**: Rich task editing with notes and date ranges
- **Drag & Drop**: Reorder tasks and move between projects
- **Context Menu**: Right-click for quick actions (add subtask, move, delete, start timer)

### ⏱️ Focus Timer
- **Task-based Timing**: Select any task to start focused work sessions
- **Timer Controls**: Start, pause, resume, and end timer sessions
- **Focus History**: Track and view your focus session history
- **Statistics**: View total focus time and session counts

### 🎨 Modern UI
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Theme Support**: Automatically syncs with Siyuan's theme (light/dark/system)
- **Element Plus**: Beautiful and consistent UI components
- **Smooth Animations**: Modern interaction feedback

## 🚀 Quick Start

### Installation
1. Open Siyuan Note
2. Go to **Settings** → **Marketplace**
3. Search for "TaskMap"
4. Click **Install** and **Enable**

### Basic Usage

#### Creating Projects
1. Navigate to the **Projects** tab
2. Type a project name in the input bar
3. Press **Enter** to create
4. Click on any project card to open detailed view

#### Managing Tasks
1. Switch to the **Tasks** tab
2. Type a task name in the input bar
3. Press **Enter** to create
4. Use the task groups to organize your work

#### Using the Timer
1. Go to the **Timer** tab
2. Select a task from the dropdown
3. Click **Start** to begin timing
4. Use **Pause** and **Resume** as needed
5. Click **End** when finished

## 🛠️ Development

### Prerequisites
- Node.js 16+
- pnpm
- Siyuan Note 2.8.0+

### Setup
```bash
# Clone the repository
git clone https://github.com/LeonZ1998/siyuan-plugin-taskmap.git
cd siyuan-plugin-taskmap

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Edit .env file and set your Siyuan workspace path
# VITE_SIYUAN_WORKSPACE_PATH=D:/YourSiyuanWorkspace

# Start development
pnpm dev
```

### Build
```bash
# Build for production
pnpm build

# This will generate package.zip for distribution
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Vue 3 (Composition API) + TypeScript
- **UI Framework**: Element Plus
- **Build Tool**: Vite
- **Data Storage**: IndexedDB
- **State Management**: Vue 3 Reactivity
- **Event System**: Custom Event Bus

### Project Structure
```
src/
├── components/          # Vue components
│   ├── TaskCard.vue    # Task display component
│   ├── TaskPage.vue    # Task management page
│   ├── ProjectPage.vue # Project display component
│   └── TimerPage.vue   # Timer interface
├── utils/              # Utility functions
│   ├── dbManager.ts    # Database operations
│   └── eventBus.ts     # Event communication
├── types/              # TypeScript type definitions
├── composables/        # Vue composables
└── App.vue            # Main application component
```

## 📊 Data Storage

TaskMap uses IndexedDB for local data storage:
- **Projects**: Project information and metadata
- **Tasks**: Task details, relationships, and status
- **Timer Records**: Focus session history and statistics

All data is stored locally in your browser, ensuring privacy and offline functionality.

## 🎯 Key Features Explained

### Smart Task Grouping
Tasks are automatically categorized based on their due dates:
- **Unscheduled**: Perfect for tasks without specific deadlines
- **Today**: Focus on immediate priorities
- **Next Week**: Plan ahead for upcoming work
- **Completed**: Track your progress and achievements

### Theme Integration
TaskMap seamlessly integrates with Siyuan's theme system:
- Automatically detects and syncs with Siyuan's theme
- Supports light, dark, and system theme modes
- All UI components adapt to theme changes in real-time

### Context Menu Actions
Right-click on any task for quick actions:
- **Add Subtask**: Create child tasks
- **Move to Project**: Transfer tasks between projects
- **Start Timer**: Begin a focus session
- **Delete**: Remove tasks (with confirmation)

## 🤝 Contributing

We welcome contributions! Please feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: https://github.com/LeonZ1998/siyuan-plugin-taskmap
- **Siyuan Note**: https://github.com/siyuan-note/siyuan
- **Element Plus**: https://element-plus.org/

---

Made with ❤️ for the Siyuan community
