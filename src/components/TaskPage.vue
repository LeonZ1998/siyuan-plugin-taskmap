<template>
  <div class="task-page">
    <div class="page-content">
      <div class="task-list">
        <TaskCard v-for="task in tasks" :key="task.id" :task="task" :show-project-name="true" :all-projects="allProjects" @update:taskName="(newName) => onUpdateTaskName(task, newName)" @move-task="onMoveTask" />
        <div v-if="tasks.length === 0" class="empty-state">
          <p>暂无任务，请输入任务名称创建新任务</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import { taskDB, projectDB } from '@/utils/dbManager'
import TaskCard from './TaskCard.vue'

const tasks = ref<any[]>([])
const allProjects = ref<any[]>([])

onMounted(async () => {
  // 加载所有任务
  const allTasks = await taskDB.getAll()
  // 加载所有项目
  const projects = await projectDB.getAll()
  allProjects.value = projects
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p.name]))
  // 为每个任务补充 projectName
  tasks.value = allTasks.map(task => ({
    ...task,
    projectName: task.projectId ? projectMap[task.projectId] : ''
  }))
})

// 格式化日期
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays === -1) return '昨天'
  if (diffDays > 0 && diffDays <= 7) return `${diffDays}天后`
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)}天前`
  
  return date.toLocaleDateString()
}

const formatShortDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

async function onUpdateTaskName(task, newName) {
  task.name = newName
  // 直接更新数据库
  await taskDB.update(task.id, { name: newName })
}

async function onMoveTask({ task, project }) {
  await taskDB.update(task.id, { projectId: project.id })
  // 刷新任务列表
  const allTasks = await taskDB.getAll()
  const projectMap = Object.fromEntries(allProjects.value.map(p => [p.id, p.name]))
  tasks.value = allTasks.map(task => ({
    ...task,
    projectName: task.projectId ? projectMap[task.projectId] : ''
  }))
}
</script>

<style lang="scss" scoped>
.task-page {
  width: 100%;
  height: 100%;
  padding: 8px 0;
  .empty-state {
    text-align: center;
    padding: 20px;
    color: #7f8c8d;
    font-size: 13px;
  }
}

.task-list {
  .task-card {
    display: flex;
    align-items: center;
    position: relative;
    min-height: 36px;
    padding: 0;
    background: transparent;
    transition: background 0.2s;
    border-radius: 6px;
    &:hover {
      background: rgba(52, 152, 219, 0.06);
    }
    &.is-subtask {
      padding-left: 32px;
    }
    .task-left {
      display: flex;
      align-items: center;
      margin-right: 8px;
      .task-checkbox {
        margin: 0 4px 0 8px;
        flex-shrink: 0;
      }
      .expand-btn {
        width: 20px;
        height: 20px;
        padding: 0;
        color: #7f8c8d;
        margin-left: 2px;
        transition: transform 0.2s;
        &.expanded {
          transform: rotate(90deg);
        }
      }
    }
    .task-main {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
      justify-content: space-between;
      height: 36px;
      position: relative;
      padding-left: 0;
    }
    .task-name {
      font-size: 15px;
      font-weight: 500;
      color: inherit;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      flex: 1;
      margin-left: 0;
    }
    .task-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      margin-left: 12px;
      .project-name {
        font-size: 12px;
        color: #3498db;
        background: rgba(52, 152, 219, 0.08);
        padding: 2px 8px;
        border-radius: 8px;
        white-space: nowrap;
      }
      .task-date {
        font-size: 12px;
        color: #b0b0b0;
        background: rgba(52, 152, 219, 0.06);
        padding: 2px 8px;
        border-radius: 8px;
        white-space: nowrap;
      }
    }
    .task-divider {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1px;
      background: #ececec;
      content: '';
      z-index: 1;
    }
    &.is-subtask .task-main .task-divider {
      left: 0;
    }
  }
}
.task-page[data-theme="dark"] .task-card .task-main .task-divider {
  background: #333a44;
}
</style> 