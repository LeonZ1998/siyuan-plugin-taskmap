<template>
  <div class="task-tree-group">
    <div class="section-title-group">
      <span class="section-title">任务</span>
      <span class="section-count" v-if="unfinishedCount > 0">{{ unfinishedCount }}</span>
    </div>
    <TaskList
      :tasks="unfinishedTasks"
      :all-projects="allProjects"
      :show-project-name="showProjectName"
      :show-arrow="true"
      @refresh="$emit('refresh')"
    >
      <template #empty>
        <div class="empty-state">暂无任务</div>
      </template>
    </TaskList>
    <div class="section-title-group done-title">
      <span class="section-title">已完成</span>
      <span class="section-count" v-if="finishedCount > 0">{{ finishedCount }}</span>
    </div>
    <TaskList
      :tasks="finishedTasks"
      :all-projects="allProjects"
      :show-project-name="showProjectName"
      :show-arrow="true"
      @refresh="$emit('refresh')"
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

/**
 * 任务树分组组件
 * @prop tasks 平铺任务数组
 * @prop allProjects 所有项目
 * @prop showProjectName 是否显示项目名
 */
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
const unfinishedCount = computed(() => (props.tasks as any[]).filter(t => !t.isCompleted).length)
const finishedCount = computed(() => (props.tasks as any[]).filter(t => t.isCompleted).length)
</script>

<style scoped>
.task-tree-group {
  width: 100%;
}
.section-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  margin: 28px 0 12px 0;
  color: #2563eb;
  letter-spacing: 1px;
}
.section-title-group.done-title {
  margin-top: 40px;
  color: #8fa3c8;
}
.section-title {
  font-size: 18px;
  font-weight: 700;
}
.section-count {
  background: linear-gradient(90deg, #3498db 0%, #6c6cff 100%);
  color: #fff;
  border-radius: 16px;
  font-size: 14px;
  padding: 2px 16px;
  margin-left: 2px;
  font-weight: 600;
  box-shadow: 0 1px 4px #3498db22;
}
</style> 