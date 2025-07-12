<template>
  <div class="task-page">
    <div class="page-content">
      <div v-if="unfinishedTasks.length === 0 && finishedTasks.length === 0" class="empty-state">暂无任务</div>
      <template v-else>
        <div v-if="unfinishedTasks.length > 0">
          <div class="task-group-title">任务列表</div>
          <TaskList :tasks="unfinishedTasks" :all-projects="allProjects" :show-project-name="true" @refresh="loadTasks">
            <template #empty></template>
          </TaskList>
        </div>
        <div v-if="finishedTasks.length > 0">
          <div class="task-group-title">已完成任务</div>
          <TaskList :tasks="finishedTasks" :all-projects="allProjects" :show-project-name="true" @refresh="loadTasks">
            <template #empty></template>
          </TaskList>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount } from 'vue'
import { taskDB, projectDB } from '@/utils/dbManager'
import TaskList from './TaskList.vue'
import { buildTaskTree } from '@/utils/example'
import { eventBus } from '@/utils/eventBus'

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
  tasks.value = buildTaskTree(allTasks.map(task => ({
    ...task,
    projectName: task.projectId ? projectMap[task.projectId] : ''
  })))
}

onMounted(() => {
  loadTasks()
  eventBus.on('global-refresh', loadTasks)
})

onBeforeUnmount(() => {
  eventBus.off('global-refresh', loadTasks)
})

const unfinishedTasks = computed(() => tasks.value.filter(t => !t.isCompleted))
const finishedTasks = computed(() => tasks.value.filter(t => t.isCompleted))

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
  padding: 8px 0;
  .empty-state {
    text-align: center;
    padding: 20px;
    color: #7f8c8d;
    font-size: 13px;
  }
}
.task-group-title {
  font-size: 15px;
  font-weight: bold;
  margin: 18px 0 8px 0;
  color: #6cb4ff;
}
</style> 