<template>
  <div class="task-list">
    <el-tree
      :data="tasks"
      :props="treeProps"
      node-key="id"
      draggable
      :show-arrow="showArrow"
      class="task-tree"
      :expand-on-click-node="false"
      @node-drop="onNodeDrop"
      :empty-text="''"
    >
      <template #default="{ data }">
        <TaskCard
          :task="data"
          :show-project-name="showProjectName"
          :all-projects="allProjects"
          :indent="data.parentId && visibleIdSet.has(String(data.parentId))"
          @refresh="$emit('refresh')"
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
import { eventBus } from '@/utils/eventBus'
import { computed } from 'vue'
import { taskDB } from '@/utils/dbManager'
const props = defineProps({
  tasks: { type: Array, default: () => [] },
  showProjectName: { type: Boolean, default: true },
  allProjects: { type: Array, default: () => [] },
  showArrow: { type: Boolean, default: true }
})
const treeProps = { children: 'subTasks', label: 'name' }

// 收集当前渲染树中的所有任务ID，用于决定是否需要缩进
function collectIds(list: any[], set: Set<string>) {
  for (const it of list as any[]) {
    if (it && it.id != null) set.add(String(it.id))
    if (it && Array.isArray(it.subTasks) && it.subTasks.length > 0) collectIds(it.subTasks, set)
  }
}
const visibleIdSet = computed(() => {
  const s = new Set<string>()
  collectIds(props.tasks as any[], s)
  return s
})

function onNodeDrop(draggingNode: any, dropNode: any, dropType: string, ev: any) {
  // 处理拖拽排序
  const draggedTask = draggingNode.data
  const dropTask = dropNode.data
  
  if (!draggedTask || !draggedTask.id) return
  
  // 获取同级任务列表
  const siblings = getSiblingTasks(draggingNode)
  if (!siblings) return
  
  // 计算新的order值
  let newOrder = 0
  
  if (dropType === 'before') {
    // 拖拽到目标节点之前
    newOrder = dropTask.order || 0
  } else if (dropType === 'after') {
    // 拖拽到目标节点之后
    newOrder = (dropTask.order || 0) + 1
  } else if (dropType === 'inner') {
    // 拖拽到目标节点内部（作为子任务）
    // 这里需要处理父子关系的逻辑
    return
  }
  
  // 批量更新同级任务的order
  updateSiblingOrders(siblings, draggedTask.id, newOrder)
}

// 获取同级任务列表
function getSiblingTasks(node: any) {
  if (!node.parent) return props.tasks // 根级别任务
  
  const parent = node.parent
  return parent.data ? parent.data.subTasks : parent.childNodes.map((n: any) => n.data)
}

// 批量更新同级任务排序
async function updateSiblingOrders(siblings: any[], draggedTaskId: string, newOrder: number) {
  try {
    // 过滤掉被拖拽的任务，重新排序
    const otherSiblings = siblings.filter(task => task.id !== draggedTaskId)
    
    // 根据新位置重新分配order值
    const updates = []
    
    // 更新被拖拽任务的order
    updates.push(taskDB.update(draggedTaskId, { order: newOrder }))
    
    // 更新其他任务的order
    let currentOrder = 0
    for (const task of otherSiblings) {
      if (currentOrder === newOrder) {
        currentOrder++ // 跳过被拖拽任务的位置
      }
      updates.push(taskDB.update(task.id, { order: currentOrder }))
      currentOrder++
    }
    
    // 批量执行更新
    await Promise.all(updates)
    
    // 触发刷新事件
    eventBus.emit('global-refresh')
  } catch (error) {
    console.error('更新任务排序失败:', error)
  }
}

</script>

<style scoped>
.task-list {
  width: 100%;
}
.task-tree {
  background: none;
  --el-tree-node-content-height: 40px;
}
:deep(.el-tree-node__content) {
  min-height: 40px;
  padding: 0 0 0 8px;
  border-radius: 12px;
  margin-bottom: 4px;
  transition: background 0.2s, box-shadow 0.2s;
}
:deep(.el-tree-node__content:hover),
:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: rgba(52, 152, 219, 0.10);
  box-shadow: 0 2px 8px #3498db22;
}
:deep(.el-tree-node__expand-icon) {
  margin-right: 0 !important;
  padding: 0 !important;
  width: 18px !important;
  min-width: 0 !important;
  font-size: 16px;
  vertical-align: middle !important;
}
:deep(.el-tree-node__children) {
  margin-left: 24px;
  border-left: 2px dashed #2d3a4a22;
}
:deep(.task-left) {
  margin-left: 0 !important;
  margin-right: 2px !important;
  padding-left: 0 !important;
}
:deep(.task-card) {
  width: 100%;
  display: flex;
  align-items: center;
  background: transparent;
  border-radius: 12px;
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
  color: #fff;
  background: linear-gradient(90deg, #3498db 0%, #6c6cff 100%);
  padding: 2px 10px;
  border-radius: 10px;
  white-space: nowrap;
  font-weight: 500;
  box-shadow: 0 1px 4px #3498db22;
}
:deep(.task-date) {
  font-size: 12px;
  color: #fff;
  background: linear-gradient(90deg, #b0b0b0 0%, #3498db 100%);
  padding: 2px 10px;
  border-radius: 10px;
  white-space: nowrap;
  font-weight: 500;
  box-shadow: 0 1px 4px #b0b0b022;
}
.empty-state {
  text-align: center;
  padding: 32px 0;
  color: #b0b0b0;
  font-size: 17px;
  letter-spacing: 1px;
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