<template>
  <div class="taskmap-sidebar" :data-theme="currentTheme">
    <el-container class="sidebar-container">
      <!-- 上部分：四个图标横向排列 -->
      <el-header class="sidebar-header">
        <div class="icon-row">
          <el-button
            v-for="(icon, index) in topIcons"
            :key="index"
            :icon="icon.icon"
            circle
            size="large"
            :class="['top-icon-btn', { 'active': currentPage === icon.action }]"
            @click="handleIconClick(icon.action)"
          />
        </div>
      </el-header>

      <!-- 中间部分：带图标的输入框 -->
      <el-main class="sidebar-main">
        <div class="input-section">
          <el-input
            v-model="inputText"
            :placeholder="inputPlaceholder"
            class="main-input"
            clearable
            @keyup.enter="handleEnter"
            @clear="handleClear"
          />
        </div>
      </el-main>

      <!-- 下部分：动态页面内容 -->
      <el-footer class="sidebar-footer">
        <div class="footer-content">
          <!-- 根据当前页面显示不同内容 -->
          <div v-if="currentPage === 'project'" class="project-list">
            <ProjectPage 
              v-for="project in projects"
              :key="project.id + '-' + allTasks.length"
              :project="project"
              :all-tasks="allTasks"
              :theme="currentTheme"
              @click="handleProjectCardClick(project)"
            />
            <!-- 隐藏的 TaskList 用于监听任务的 @refresh 事件，驱动统计刷新 -->
            <TaskList
              v-if="projects.length > 0"
              :tasks="tasks"
              :all-projects="projects"
              style="display: none"
              @refresh="handleRefresh"
            />
            <div v-if="projects.length === 0" class="empty-state">
              <p>暂无项目，请输入项目名称创建新项目</p>
            </div>
          </div>
          
          <TaskPage v-else-if="currentPage === 'task'" :tasks="tasks" :all-projects="projects" @refresh="handleRefresh" />
          <TimerPage v-else-if="currentPage === 'timer'" />
          <StatsPage v-else-if="currentPage === 'stats'" />
        </div>
      </el-footer>
    </el-container>
    <ProjectDetailDialog
      v-model="showProjectDialog"
      :project="selectedProject"
      @close="handleProjectDialogClose"
      @create-task="handleCreateTask"
      @project-deleted="handleProjectDeleted"
      @project-task-changed="loadProjects"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, onBeforeUnmount } from 'vue'
import {
  Document,
  Edit,
  Timer,
  DataAnalysis,
  Calendar
} from '@element-plus/icons-vue'
import ProjectPage from './ProjectPage.vue'
import TaskPage from './TaskPage.vue'
import TimerPage from './TimerPage.vue'
import StatsPage from './StatsPage.vue'
import ProjectDetailDialog from './ProjectDetailDialog.vue'
import TaskList from './TaskList.vue'
// import ThemeToggle from './ThemeToggle.vue' // 已移除，现在自动跟随思源主题
import { projectDB, taskDB } from '@/utils/dbManager'
import { ProjectStatus, ProjectType } from '@/types/project.d'
import { useTheme } from '@/composables/useTheme'
import { eventBus } from '@/utils/eventBus'
import { buildTaskTree } from '@/utils/example'

// 使用主题管理 composable
const { isDark, currentTheme, toggleTheme, setTheme, isSystemDark } = useTheme()

// 响应式数据
const inputText = ref('')
const currentPage = ref('project') // 当前显示的页面
const projects = ref([])
const tasks = ref<any[]>([]) // 任务列表
const showProjectDialog = ref(false)
const selectedProject = ref<any>(null)
const allTasks = ref([])

// 计算属性
const inputPlaceholder = computed(() => {
  return currentPage.value === 'project' ? '添加一个新项目...' : '添加一个新任务...'
})

// 顶部图标配置
const topIcons = [
  {
    icon: Document,
    action: 'project',
    title: '项目管理'
  },
  {
    icon: Edit,
    action: 'task',
    title: '任务管理'
  },
  {
    icon: Timer,
    action: 'timer',
    title: '任务计时'
  },
  {
    icon: DataAnalysis,
    action: 'stats',
    title: '数据统计'
  }
]

// 处理图标点击
const handleIconClick = (action: string) => {
  currentPage.value = action
}

// 处理回车输入
const handleEnter = async () => {
  if (currentPage.value === 'project') {
    // 新建项目
    const projectName = inputText.value.trim() || '未命名'
    try {
      await projectDB.create({
        name: projectName,
        type: ProjectType.WORK_CAREER, // 默认类型
        status: ProjectStatus.ACTIVE,
        color: '#3498db', // 默认颜色
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isArchived: false,
        order: projects.value.length,
        taskCount: 0,
        completedTaskCount: 0,
        completionRate: 0
      })
      await loadProjects() // 只信任数据库
      inputText.value = ''
    } catch (error) {
      // 新建项目失败
    }
  } else if (currentPage.value === 'task') {
    // 新建任务
    const taskName = inputText.value.trim() || '未命名任务'
    try {
      const newTask = await taskDB.create({
        name: taskName,
        projectId: null, // 暂时不关联项目
        parentId: null, // 顶级任务
        status: 'pending', // 待完成
        priority: 'medium', // 中等优先级
        dueDate: null, // 暂不设置截止日期
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isCompleted: false,
        order: tasks.value.length
      })
      
      // 添加到本地任务列表
      tasks.value.push(newTask)
      
      // 清空输入框
      inputText.value = ''
    } catch (error) {
      // 新建任务失败
    }
  }
}

// 加载项目列表
const loadProjects = async () => {
  try {
    const projectList = await projectDB.getAll()
    projects.value = projectList.map(p => ({
      ...p
    }))
  } catch (error) {
    // 加载项目列表失败
  }
}

const loadTasks = async () => {
  try {
    const taskList = await taskDB.getAll()
    tasks.value = buildTaskTree(taskList)
    allTasks.value = [...taskList] // 强制新引用，确保响应式
  } catch (error) {
    // 加载任务列表失败
  }
}

// 处理清空
const handleClear = () => {
  // 输入框已清空
}

// 处理项目卡片点击
const handleProjectCardClick = (project: any) => {
  selectedProject.value = project
  showProjectDialog.value = true
}

const handleProjectDialogClose = () => {
  showProjectDialog.value = false
  selectedProject.value = null
}

const handleCreateTask = () => {
  // 处理创建任务逻辑
  // 这里可以跳转到任务页面或打开任务创建对话框
}

const handleProjectDeleted = async () => {
  showProjectDialog.value = false
  selectedProject.value = null
  await nextTick()
  const projectList = await projectDB.getAll()
  projects.value = projectList.map(p => ({
    ...p
  }))
}

function getTotalTasks(projectId) {
  return allTasks.value.filter(t => t.projectId === projectId).length
}
function getCompletedTasks(projectId) {
  return allTasks.value.filter(t => t.projectId === projectId && (t.status === 'completed' || t.isCompleted)).length
}
function getDaysLeft(endDate) {
  if (!endDate) return 0
  const today = new Date()
  const end = new Date(endDate)
  return Math.ceil((end.getTime() - today.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))
}

const handleRefresh = async () => {
  await new Promise(resolve => setTimeout(resolve, 100)); // 等待数据库写入完成
  await loadTasks()
  await loadProjects()
}

// 组件挂载时加载数据
onMounted(() => {
  eventBus.on('global-refresh', handleRefresh)
  loadProjects()
  loadTasks()
})
onBeforeUnmount(() => {
  eventBus.off('global-refresh', handleRefresh)
})
</script>

<style lang="scss" scoped>
.taskmap-sidebar {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  
  // 明色主题
  &[data-theme="light"] {
    background: #ffffff;
    color: #202124;
    
    .sidebar-header {
      border-bottom: 1px solid #dadce0;
      background: #ffffff; // 统一背景色
      
      .top-icon-btn {
        background: #ffffff;
        border: 1px solid #dadce0;
        color: #202124;
        
        &:hover {
          background: #4285f4;
          color: white;
        }
        
        &.active {
          background: #4285f4;
          color: white;
          border-color: #4285f4;
        }
      }
    }
    
    .sidebar-main {
      background: #ffffff; // 统一背景色
      
      .main-input {
        :deep(.el-input__wrapper) {
          background: #ffffff;
          border: 1px solid #dadce0;
          
          &:hover {
            border-color: #4285f4;
          }
          
          &.is-focus {
            border-color: #4285f4;
            box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
          }
        }
        
        :deep(.el-input__inner) {
          color: #202124;
          
          &::placeholder {
            color: #5f6368;
          }
        }
        
        :deep(.el-input__suffix) {
          color: #5f6368;
        }
        
        :deep(.el-input__clear) {
          color: #5f6368;
          
          &:hover {
            color: #202124;
          }
        }
      }
    }
    
    .sidebar-footer {
      border-top: 1px solid #dadce0;
      background: #ffffff; // 统一背景色
      
      .footer-content {
        color: #5f6368;
      }
    }
  }
  
  // 暗色主题
  &[data-theme="dark"] {
    background: #202124;
    color: #e8eaed;
    
    .sidebar-header {
      border-bottom: 1px solid #5f6368;
      background: #202124; // 统一背景色
      
      .top-icon-btn {
        background: #202124;
        border: 1px solid #5f6368;
        color: #e8eaed;
        
        &:hover {
          background: #4285f4;
          color: white;
        }
        
        &.active {
          background: #4285f4;
          color: white;
          border-color: #4285f4;
        }
      }
    }
    
    .sidebar-main {
      background: #202124; // 统一背景色
      
      .main-input {
        :deep(.el-input__wrapper) {
          background: #202124;
          border: 1px solid #5f6368;
          
          &:hover {
            border-color: #4285f4;
          }
          
          &.is-focus {
            border-color: #4285f4;
            box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
          }
        }
        
        :deep(.el-input__inner) {
          color: #e8eaed;
          
          &::placeholder {
            color: #9aa0a6;
          }
        }
        
        :deep(.el-input__suffix) {
          color: #9aa0a6;
        }
        
        :deep(.el-input__clear) {
          color: #9aa0a6;
          
          &:hover {
            color: #e8eaed;
          }
        }
      }
    }
    
    .sidebar-footer {
      border-top: 1px solid #5f6368;
      background: #202124; // 统一背景色
      
      .footer-content {
        color: #9aa0a6;
      }
    }
  }
}

.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.sidebar-header {
  padding: 12px;
  height: auto !important;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  position: relative;

  .icon-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex: 1;
    gap: 6px;
  }

  .top-icon-btn {
    flex: 1;
    max-width: 45px;
    height: 45px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.sidebar-main {
  flex: none; // 改为固定高度，不占用剩余空间
  padding: 8px 20px; // 减少上下内边距
  transition: all 0.3s ease;
  overflow: hidden;
  height: auto; // 自适应高度

  .input-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;

    .main-input {
      width: 100%;
      margin: 0; // 移除外边距
      
      :deep(.el-input__wrapper) {
        border-radius: 8px;
        transition: all 0.3s ease;
        box-shadow: none;
        width: 100%;
      }

      :deep(.el-input__inner) {
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }
}

.sidebar-footer {
  padding: 16px;
  height: auto !important;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  .footer-content {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    font-size: 13px;
    overflow-y: auto;
    padding: 0;
  }
  
  .project-list {
    width: 100%;
    padding: 8px 0;
  }
  
  .empty-state {
    text-align: center;
    padding: 20px;
    color: #7f8c8d;
    font-size: 13px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .sidebar-header {
    padding: 10px;

    .icon-row {
      gap: 4px;

      .top-icon-btn {
        max-width: 40px;
        height: 40px;
      }
    }
  }

  .sidebar-main {
    padding: 16px;
  }

  .sidebar-footer {
    padding: 12px;
  }
}
</style> 