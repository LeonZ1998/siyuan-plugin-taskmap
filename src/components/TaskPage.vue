<template>
  <div class="task-page">
    <div class="page-content">
      <TaskTreeGroup
        :tasks="tasks"
        :all-projects="allProjects"
        :show-project-name="true"
        @refresh="loadTasks"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { taskDB, projectDB } from '@/utils/dbManager'
import TaskTreeGroup from './TaskTreeGroup.vue'

// 所有任务（平铺数组）
const tasks = ref<any[]>([])
// 所有项目
const allProjects = ref<any[]>([])

// 加载所有任务和项目
async function loadTasks() {
  const allTasks = await taskDB.getAll()
  const projects = await projectDB.getAll()
  allProjects.value = projects
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p.name]))
  tasks.value = allTasks.map(task => ({
    ...task,
    projectName: task.projectId ? projectMap[task.projectId] : ''
  }))
}

onMounted(loadTasks)

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
  await taskDB.update(task.id, { name: newName })
  await loadTasks()
}

async function onMoveTask({ task, project }) {
  await taskDB.update(task.id, { projectId: project.id })
  await loadTasks()
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
</style> 