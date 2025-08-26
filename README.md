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
- **Task-based Timing**: Select any task to start focused work
- **Timer Controls**: Start, pause, resume, and end timer sessions
- **Focus History**: Track and view focus session history
- **Statistics**: View total focus time and session counts

### 🎨 Modern Interface
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Theme Support**: Automatically syncs with Siyuan theme (light/dark/follow system)
- **Element Plus**: Beautiful and consistent UI components
- **Smooth Animations**: Modern interaction feedback

## 🚀 Quick Start

### Installation
1. Open Siyuan Note
2. Go to **Settings** → **Bazaar**
3. Search for "TaskMap"
4. Click **Install** and **Enable**

### Basic Usage

#### Create Projects
1. Navigate to the **Projects** tab
2. Enter project name in the input bar
3. Press **Enter** to create

#### Manage Tasks
1. Navigate to the **Tasks** tab
2. Tasks are automatically grouped by time
3. Click any task to open detail panel
4. Right-click for quick actions

#### Use Focus Timer
1. Navigate to the **Timer** tab
2. Select a task to focus on
3. Click **Start** to begin timing
4. Track your focus sessions

## 🛠️ Development

### Prerequisites
- Node.js 18+
- pnpm 8+

### Setup
```bash
# Clone repository
git clone https://github.com/LeonZ1998/siyuan-plugin-taskmap.git
cd siyuan-plugin-taskmap

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Build
```bash
# Build for production
pnpm build

# The build will generate package.zip for Siyuan
```

## 📦 Release Process

### Automated Release
This project uses GitHub Actions for automated releases. When you push a tag, it automatically:
1. Builds the project
2. Creates a GitHub Release
3. Uploads `package.zip` as an attachment

### Manual Release
Use the provided release scripts:

**PowerShell (Recommended for Windows):**
```powershell
.\scripts\release.ps1 1.0.1
```

**Bash (Linux/macOS):**
```bash
./scripts/release.sh 1.0.1
```

**Windows Batch:**
```cmd
scripts\release.bat 1.0.1
```

The script will:
- Update version in `plugin.json`
- Create a git tag
- Push to GitHub
- Trigger automated build and release

### Release Workflow
1. **Create Tag**: The script creates a tag like `v1.0.1`
2. **Push to GitHub**: Tag is pushed to trigger GitHub Actions
3. **Automated Build**: GitHub Actions builds the project
4. **Create Release**: A new GitHub Release is created with `package.zip`
5. **Update Bazaar**: The release is available for users to download

## 💾 Data Storage
- Uses **SQLite (sql.js)** under the hood. No IndexedDB required.
- Database file path in Siyuan workspace: `data/plugins/siyuan-plugin-taskmap/taskmap.sqlite`.
- The wasm runtime `sql-wasm.wasm` is included in the build output; the plugin loads it from the plugin root.
- When Siyuan WebDAV sync is enabled, the plugin directory (and your DB file) will be synced unless excluded.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Vue 3 + TypeScript + Element Plus
- **Build Tool**: Vite
- **Data Storage**: SQLite (sql.js)
- **State Management**: Vue 3 Composition API
- **Styling**: SCSS + CSS Variables for theming

### Project Structure
```
src/
├── components/          # Vue components
│   ├── ProjectPage.vue  # Project management
│   ├── TaskPage.vue     # Task management
│   ├── TimerPage.vue    # Focus timer
│   └── ...
├── composables/         # Vue composables
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── dbManager.ts    # Database operations
│   ├── sqlite.ts       # SQLite wrapper (sql.js)
│   └── ...
└── main.ts             # Entry point
```

### Data Models
- **Project**: `{ id, name, type, color, createdAt, ... }`
- **Task**: `{ id, title, projectId, parentId, dueDate, isCompleted, ... }`
- **Focus Session**: `{ id, taskId, startTime, endTime, duration, ... }`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/LeonZ1998/siyuan-plugin-taskmap)
- [Siyuan Note](https://github.com/siyuan-note/siyuan)
- [Element Plus](https://element-plus.org/)

---

Made with ❤️ for the Siyuan community
