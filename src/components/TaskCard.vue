<template>
  <div class="task-card" :class="{ 'is-subtask': !!task.parentId }">
    <div class="task-left">
      <el-checkbox class="task-checkbox" :model-value="task.isCompleted" />
      <el-button
        v-if="task.hasChildren"
        class="expand-btn"
        type="text"
        size="small"
        :class="{ expanded: task.expanded }"
      >
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>
    <div class="task-main">
      <span
        v-if="!isEditing"
        class="task-name"
        @dblclick="startEdit"
        @click="startEdit"
        tabindex="0"
        @focus="startEdit"
      >{{ task.name }}</span>
      <input
        v-else
        ref="inputRef"
        class="task-name"
        v-model="editName"
        @blur="saveEdit"
        @keydown="onInputKeydown"
      />
      <div class="task-meta">
        <span v-if="showProjectName" class="project-name">{{ task.projectName || '无项目' }}</span>
        <span v-if="task.startDate" class="task-date">{{ formatShortDate(task.startDate) }}</span>
      </div>
      <div class="task-divider"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
const props = defineProps<{ task: any, showProjectName?: boolean }>()
const emit = defineEmits(['update:taskName'])
const formatShortDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const isEditing = ref(false)
const editName = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function startEdit() {
  editName.value = props.task.name
  isEditing.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}
function saveEdit() {
  if (editName.value.trim() && editName.value !== props.task.name) {
    emit('update:taskName', editName.value.trim())
  }
  isEditing.value = false
}
function onInputKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') saveEdit()
  if (e.key === 'Escape') isEditing.value = false
}
</script>

<style scoped>
.task-card {
  display: flex;
  align-items: center;
  position: relative;
  min-height: 36px;
  padding: 0;
  background: transparent;
  transition: background 0.2s;
  border-radius: 6px;
}
.task-card:hover {
  background: rgba(52, 152, 219, 0.06);
}
.task-card.is-subtask {
  padding-left: 32px;
}
.task-left {
  display: flex;
  align-items: center;
  margin-right: 8px;
}
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
}
.expand-btn.expanded {
  transform: rotate(90deg);
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
}
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
.task-card.is-subtask .task-main .task-divider {
  left: 0;
}
</style> 