<template>
  <div class="task-card" :class="{ 'is-subtask': !!task.parentId }" @contextmenu.prevent="showMenu($event)">
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
        @dblclick.left="startEdit"
        @click.left="startEdit"
        tabindex="0"
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
        <span v-else class="task-date">无日期</span>
      </div>
      <div class="task-divider"></div>
    </div>
    <div
      v-if="menuVisible"
      class="context-menu"
      :style="menuStyle"
      @click.self="menuVisible = false"
    >
      <div class="context-menu-item">添加子任务</div>
      <div class="context-menu-item move-menu-trigger" @mouseenter="showMoveMenu" @mouseleave="hideMoveMenu">
        移动到
        <span class="arrow">▶</span>
        <div v-if="moveMenuVisible" class="move-menu" :style="moveMenuStyle" @mouseenter="showMoveMenu" @mouseleave="hideMoveMenu">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="move-list-item"
            @click.stop="moveToProject(project)"
          >
            <span>{{ project.name }}</span>
          </div>
          <div v-if="filteredProjects.length === 0" class="move-list-item" style="color:#aaa;cursor:default;">无可移动项目</div>
        </div>
      </div>
      <div class="context-menu-item">开始计时</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
const props = defineProps<{ task: any, showProjectName?: boolean, allProjects?: any[] }>()
const emit = defineEmits(['update:taskName', 'move-task'])
const formatShortDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const isEditing = ref(false)
const editName = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function startEdit(e: MouseEvent) {
  if (e && e.button !== 0) return
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

const menuVisible = ref(false)
const menuStyle = ref({ left: '0px', top: '0px', position: 'fixed', zIndex: 9999 })
function showMenu(e: MouseEvent) {
  e.preventDefault()
  menuStyle.value = {
    left: e.clientX + 'px',
    top: e.clientY + 'px',
    position: 'fixed',
    zIndex: 9999
  }
  menuVisible.value = true
}
function onClickOutside(e: MouseEvent) {
  if (!menuVisible.value) return
  const menu = document.querySelector('.context-menu')
  if (menu && !menu.contains(e.target as Node)) {
    menuVisible.value = false
  }
}
onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
})

const moveMenuVisible = ref(false)
const moveMenuStyle = ref({ left: '0px', top: '0px' })
let moveMenuTimer: any = null

function showMoveMenu(e: MouseEvent) {
  clearTimeout(moveMenuTimer)
  moveMenuVisible.value = true
  // 计算二级菜单位置
  const trigger = document.querySelector('.move-menu-trigger')
  if (trigger) {
    const rect = (trigger as HTMLElement).getBoundingClientRect()
    moveMenuStyle.value = {
      left: rect.right + 4 + 'px',
      top: rect.top + 'px',
      position: 'fixed',
      zIndex: 10000
    }
  }
}
function hideMoveMenu() {
  moveMenuTimer = setTimeout(() => {
    moveMenuVisible.value = false
  }, 200)
}
function moveToProject(project: any) {
  emit('move-task', { task: props.task, project })
  moveMenuVisible.value = false
  menuVisible.value = false
}

const filteredProjects = computed(() =>
  (props.allProjects || []).filter(
    p => String(p.id) !== String(props.task.projectId)
  )
)
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
.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 120px;
  background: var(--el-bg-color, #fff);
  border: 1px solid var(--el-border-color, #e4e7ed);
  border-radius: 6px;
  box-shadow: 0 2px 8px #0001;
  padding: 4px 0;
  color: var(--el-text-color-primary, #333);
}
.context-menu-item {
  padding: 8px 20px;
  cursor: pointer;
  font-size: 14px;
  color: inherit;
  transition: background 0.2s;
}
.context-menu-item:hover {
  background: var(--el-fill-color-light, #f5f7fa);
}
.move-menu-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.move-menu {
  position: fixed;
  min-width: 160px;
  max-height: 320px;
  overflow-y: auto;
  background: var(--el-bg-color, #fff);
  border: 1px solid var(--el-border-color, #e4e7ed);
  border-radius: 6px;
  box-shadow: 0 2px 8px #0001;
  padding: 4px 0;
  color: var(--el-text-color-primary, #333);
  z-index: 10000;
}
.move-list-item {
  padding: 10px 18px;
  cursor: pointer;
  font-size: 15px;
  color: var(--el-text-color-primary, #333);
  border-radius: 6px;
  transition: background 0.2s;
}
.move-list-item:hover {
  background: var(--el-fill-color-light, #f5f7fa);
}
.arrow {
  margin-left: 8px;
  font-size: 12px;
  color: #888;
}
</style> 