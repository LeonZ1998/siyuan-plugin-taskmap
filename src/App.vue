<template>
  <div class="taskmap-app">
    <div class="main-panel">
      <nav class="main-nav">
        <div
          v-for="(icon, idx) in topIcons"
          :key="idx"
          :class="['nav-item', { active: currentPage === icon.action }]"
          @click="handleIconClick(icon.action)"
        >
          <component :is="icon.icon" class="nav-icon" />
          <span class="nav-label">{{ icon.title }}</span>
        </div>
      </nav>
      <div class="input-bar">
        <el-input
          v-model="inputText"
          :placeholder="inputPlaceholder"
          class="main-input"
          clearable
          @keyup.enter="handleEnter"
          @clear="handleClear"
        >
          <template #prefix>
            <el-icon class="input-icon">
              <Plus v-if="currentPage === 'project'" />
              <Edit v-else-if="currentPage === 'task'" />
              <Timer v-else-if="currentPage === 'timer'" />
            </el-icon>
          </template>
        </el-input>
      </div>
      <div class="main-content">
        <div v-if="currentPage === 'project'">
          <ProjectPage 
            v-for="project in projects"
            :key="project.id + '-' + allTasks.length"
            :project="project"
            :all-tasks="allTasks"
            :theme="currentTheme"
            @click="handleProjectCardClick(project)"
          />
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
      </div>
      <ProjectDetailDialog
        v-model="showProjectDialog"
        :project="selectedProject"
        @close="handleProjectDialogClose"
        @create-task="handleCreateTask"
        @project-deleted="handleProjectDeleted"
        @project-task-changed="loadProjects"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import {
  Document,
  Edit,
  Timer,
  Plus
} from '@element-plus/icons-vue'
import ProjectPage from './components/ProjectPage.vue'
import TaskPage from './components/TaskPage.vue'
import TimerPage from './components/TimerPage.vue'
import ProjectDetailDialog from './components/ProjectDetailDialog.vue'
import TaskList from './components/TaskList.vue'
import { projectDB, taskDB } from '@/utils/dbManager'
import { ProjectStatus, ProjectType } from '@/types/project.d'
import { useTheme } from '@/composables/useTheme'
import { eventBus } from '@/utils/eventBus'
import { buildTaskTree } from '@/utils/example'

const { currentTheme } = useTheme()
const inputText = ref('')
const currentPage = ref('project')
const projects = ref([])
const tasks = ref<any[]>([])
const showProjectDialog = ref(false)
const selectedProject = ref<any>(null)
const allTasks = ref([])

const inputPlaceholder = computed(() => {
  return currentPage.value === 'project' ? '添加一个新项目...' : '添加一个新任务...'
})

const topIcons = [
  { icon: Document, action: 'project', title: '项目' },
  { icon: Edit, action: 'task', title: '任务' },
  { icon: Timer, action: 'timer', title: '计时' }
]

const handleIconClick = (action: string) => {
  currentPage.value = action
}

const handleEnter = async () => {
  if (currentPage.value === 'project') {
    const projectName = inputText.value.trim() || '未命名项目'
    try {
      await projectDB.create({
        name: projectName,
        type: ProjectType.WORK_CAREER,
        status: ProjectStatus.ACTIVE,
        color: '#3498db',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isArchived: false,
        order: projects.value.length,
        taskCount: 0,
        completedTaskCount: 0,
        completionRate: 0
      })
      await loadProjects()
      inputText.value = ''
    } catch (error) {}
  } else if (currentPage.value === 'task') {
    const taskName = inputText.value.trim() || '未命名任务'
    try {
      await taskDB.create({
        name: taskName,
        projectId: null,
        parentId: null,
        status: 'pending',
        priority: 'medium',
        dueDate: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isCompleted: false,
        order: tasks.value.length
      })
      await loadTasks()
      inputText.value = ''
      eventBus.emit('global-refresh')
    } catch (error) {}
  }
}

const loadProjects = async () => {
  try {
    const projectList = await projectDB.getAll()
    projects.value = projectList.map(p => ({ ...p }))
  } catch (error) {}
}

const loadTasks = async () => {
  try {
    const taskList = await taskDB.getAll()
    tasks.value = buildTaskTree(taskList)
    allTasks.value = [...taskList]
  } catch (error) {}
}

const handleClear = () => {}
const handleProjectCardClick = (project: any) => {
  selectedProject.value = project
  showProjectDialog.value = true
}
const handleProjectDialogClose = () => {
  showProjectDialog.value = false
  selectedProject.value = null
}
const handleCreateTask = () => {}
const handleProjectDeleted = async () => {
  showProjectDialog.value = false
  selectedProject.value = null
  await nextTick()
  const projectList = await projectDB.getAll()
  projects.value = projectList.map(p => ({ ...p }))
}
const handleRefresh = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  await loadTasks()
  await loadProjects()
}
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
.taskmap-app {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: inherit;
  color: var(--main-text);
}

.main-panel {
  width: 100%;
  max-width: 720px;
  min-width: 320px;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  background: var(--main-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--main-text);
}

[data-theme="light"] {
  --main-bg: #fff;
  --main-text: #222;
}
[data-theme="dark"] {
  --main-bg: #23272f;
  --main-text: #e8eaed;
}

.main-nav, .input-bar, .main-content {
  background: var(--main-bg);
  color: var(--main-text);
}

.main-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  padding: 0 24px;
  height: 64px;
  border-bottom: 1px solid #eee;
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 10px 0;
    border-radius: 12px;
    transition: background 0.2s, color 0.2s;
    .nav-icon {
      width: 20px;
      height: 20px;
      margin-bottom: 2px;
      :deep(svg) { width: 20px; height: 20px; }
    }
    .nav-label {
      font-size: 12px;
      color: #888;
    }
    &.active, &:hover {
      background: #f0f4fa;
      .nav-label, .nav-icon { color: #4285f4; }
    }
  }
}
.input-bar {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  background: transparent;
}
.main-content {
  padding: 24px;
  background: transparent;
}
@media (max-width: 750px) {
  .main-panel {
    max-width: 100vw;
    min-width: 0;
    border-radius: 0;
    margin: 0;
  }
  .main-nav, .input-bar, .main-content {
    padding-left: 4px;
    padding-right: 4px;
  }
}
</style>