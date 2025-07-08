<template>
  <div class="task-list">
    <el-tree
      :data="tasks"
      :props="treeProps"
      node-key="id"
      draggable
      show-arrow
      class="task-tree"
      :expand-on-click-node="false"
      @node-drop="onNodeDrop"
    >
      <template #default="{ data }">
        <TaskCard
          :task="data"
          :show-project-name="showProjectName"
          :all-projects="allProjects"
          @update:taskName="val => $emit('update:taskName', val)"
          @move-task="val => $emit('move-task', val)"
          @sub-task-saved="val => $emit('sub-task-saved', val)"
        />
      </template>
    </el-tree>
    <div v-if="tasks.length === 0" class="empty-state">
      <slot name="empty">暂无任务</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import TaskCard from './TaskCard.vue'
import { ElTree } from 'element-plus'
const props = defineProps({
  tasks: { type: Array, default: () => [] },
  showProjectName: { type: Boolean, default: true },
  allProjects: { type: Array, default: () => [] }
})
const treeProps = { children: 'subTasks', label: 'name' }
function onNodeDrop(...args: any[]) {
  // 透传事件，父组件可监听
  // $emit('node-drop', ...args)
}
</script>

<style scoped>
.task-list {
  width: 100%;
}
.task-tree {
  background: none;
  /* 统一 el-tree 的缩进、箭头、hover、选中等样式 */
  --el-tree-node-content-height: 40px;
}
:deep(.el-tree-node__content) {
  min-height: 40px;
  padding: 0 0 0 8px;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: background 0.2s;
  padding-left: 0 !important;
  gap: 0 !important;
}
:deep(.el-tree-node__content:hover) {
  background: rgba(52, 152, 219, 0.06);
}
:deep(.el-tree-node__expand-icon) {
  margin-right: 0 !important;
  padding: 0 !important;
  width: 18px !important;
  min-width: 0 !important;
  vertical-align: middle !important;
}
:deep(.el-tree-node__children) {
  margin-left: 24px;
}
:deep(.task-left) {
  margin-left: 0 !important;
  margin-right: 2px !important;
  padding-left: 0 !important;
}
:deep(.task-card) {
  /* 保证卡片主内容和右侧信息分开，右侧信息靠右 */
  width: 100%;
  display: flex;
  align-items: center;
  background: transparent;
  border-radius: 8px;
  min-height: 40px;
  padding: 0;
}
:deep(.task-main) {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  justify-content: space-between;
  height: 40px;
  position: relative;
  padding-left: 0;
}
:deep(.task-meta) {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 12px;
}
:deep(.project-name) {
  font-size: 12px;
  color: #3498db;
  background: rgba(52, 152, 219, 0.08);
  padding: 2px 8px;
  border-radius: 8px;
  white-space: nowrap;
}
:deep(.task-date) {
  font-size: 12px;
  color: #b0b0b0;
  background: rgba(52, 152, 219, 0.06);
  padding: 2px 8px;
  border-radius: 8px;
  white-space: nowrap;
}
.empty-state {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-size: 13px;
}
</style>

<style>
.el-tree-node__content {
  padding-left: 0 !important;
  gap: 0 !important;
}
.el-tree-node__expand-icon {
  margin-right: 0 !important;
  padding: 0 !important;
  width: 18px !important;
  min-width: 0 !important;
  vertical-align: middle !important;
}
.task-left {
  margin-left: 0 !important;
  margin-right: 2px !important;
  padding-left: 0 !important;
}
</style> 