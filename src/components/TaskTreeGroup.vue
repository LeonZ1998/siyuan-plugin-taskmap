<template>
  <div class="task-tree-group">
    <div class="section-title">任务</div>
    <TaskList
      :tasks="unfinishedTasks"
      :all-projects="allProjects"
      :show-project-name="showProjectName"
      :show-arrow="true"
      @update:taskName="$emit('update:taskName', $event)"
      @move-task="$emit('move-task', $event)"
      @sub-task-saved="$emit('sub-task-saved', $event)"
    >
      <template #empty>
        <div class="empty-state">暂无任务</div>
      </template>
    </TaskList>
    <div class="section-title done-title">已完成 {{ finishedCount }}</div>
    <TaskList
      :tasks="finishedTasks"
      :all-projects="allProjects"
      :show-project-name="showProjectName"
      :show-arrow="true"
      @update:taskName="$emit('update:taskName', $event)"
      @move-task="$emit('move-task', $event)"
      @sub-task-saved="$emit('sub-task-saved', $event)"
    >
      <template #empty>
        <div class="empty-state">暂无已完成任务</div>
      </template>
    </TaskList>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TaskList from './TaskList.vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  allProjects: { type: Array, default: () => [] },
  showProjectName: { type: Boolean, default: true }
})

function buildTaskTree(flatTasks: any[]) {
  const idMap = new Map()
  flatTasks.forEach(t => idMap.set(t.id, { ...t, subTasks: [] }))
  const tree: any[] = []
  idMap.forEach(task => {
    if (task.parentId) {
      const parent = idMap.get(task.parentId)
      if (parent) parent.subTasks.push(task)
      else tree.push(task)
    } else {
      tree.push(task)
    }
  })
  return tree
}

const unfinishedTasks = computed(() => buildTaskTree((props.tasks as any[]).filter(t => !t.isCompleted)))
const finishedTasks = computed(() => buildTaskTree((props.tasks as any[]).filter(t => t.isCompleted)))
const finishedCount = computed(() => (props.tasks as any[]).filter(t => t.isCompleted).length)
</script>

<style scoped>
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: #bfc8dc;
}
.done-title {
  margin-top: 32px;
  color: #8fa3c8;
}
</style> 