<template>
  <div class="task-card" :class="{ 'is-subtask': !!task.parentId, 'is-completed': task.isCompleted }" @contextmenu.prevent="showMenu($event)">
    <div class="task-left">
      <el-checkbox class="task-checkbox" :model-value="task.isCompleted" @change="onCheckTask" />
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
    </div>
    <div class="task-divider"></div>
    <div
      v-if="menuVisible"
      class="context-menu"
      :style="menuStyle"
      @click.self="menuVisible = false"
    >
      <div class="context-menu-item" @click.stop="onAddSubTask">添加子任务</div>
      <div class="context-menu-item" @mouseenter="showMoveMenu = true" @mouseleave="showMoveMenu = false" style="position: relative;">
        <span style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          移动到
          <svg style="margin-left: 8px; width: 14px; height: 14px; vertical-align: middle;" viewBox="0 0 1024 1024"><path d="M384 192l256 320-256 320z" fill="currentColor"/></svg>
        </span>
        <div v-if="showMoveMenu" class="context-submenu">
          <div v-if="moveProjects.length > 0">
            <div
              v-for="project in moveProjects"
              :key="project.id"
              class="context-menu-item"
              @click.stop="onMoveTo(project.id)"
            >
              {{ project.name }}
            </div>
          </div>
          <div v-else class="context-menu-item" style="color:#aaa;cursor:default;">
            无其他可选项目
          </div>
        </div>
      </div>
      <div class="context-menu-item">开始计时</div>
      <div class="context-menu-item" @click.stop="onDeleteTask" style="color:#f56c6c;">删除任务</div>
    </div>
    <TaskDetailPanel
      v-if="showAddSubTaskPanel"
      :model-value="showAddSubTaskPanel"
      :project-id="task.projectId"
      :parent-id="task.id"
      @update:modelValue="showAddSubTaskPanel = false"
      @task-saved="onSubTaskSaved"
    />
    <div v-if="task.expanded && task.subTasks && task.subTasks.length > 0">
      <TaskCard
        v-for="subTask in task.subTasks"
        :key="subTask.id"
        :task="subTask"
        :show-project-name="showProjectName"
        :all-projects="allProjects"
        @refresh="$emit('refresh')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
import TaskDetailPanel from './TaskDetailPanel.vue'
import { taskDB } from '@/utils/dbManager'
import { eventBus } from '@/utils/eventBus'

/**
 * 任务卡片组件
 * @prop task 任务对象，需包含 id、name、isCompleted、subTasks 等字段
 * @prop showProjectName 是否显示项目名
 * @prop allProjects 所有项目列表
 */
const props = defineProps<{ task: any, showProjectName?: boolean, allProjects?: any[] }>()
const emit = defineEmits(['refresh'])
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
    // 直接更新数据库
    taskDB.update(props.task.id, { name: editName.value.trim() }).then(() => emit('refresh'))
  }
  isEditing.value = false
}
function onInputKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') saveEdit()
  if (e.key === 'Escape') isEditing.value = false
}

const menuVisible = ref(false)
const menuStyle = ref({ left: '0px', top: '0px', zIndex: 9999 })
function showMenu(e: MouseEvent) {
  e.preventDefault()
  menuStyle.value = {
    left: e.clientX + 'px',
    top: e.clientY + 'px',
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

const showAddSubTaskPanel = ref(false)
function onAddSubTask() {
  showAddSubTaskPanel.value = true
  menuVisible.value = false
}
function onSubTaskSaved() {
  showAddSubTaskPanel.value = false
  emit('refresh')
}

// 勾选递归：勾选/取消该任务及所有子任务
async function updateTaskAndChildren(task: any, checked: boolean) {
  await taskDB.update(task.id, { isCompleted: checked, status: checked ? 'completed' : 'pending' })
  if (task.subTasks && task.subTasks.length > 0) {
    for (const sub of task.subTasks) {
      await updateTaskAndChildren(sub, checked)
    }
  }
}
// 新增：递归向上取消父任务
async function updateParentIfNeeded(task: any, checked: boolean) {
  if (!checked && task.parentId) {
    const parent = await taskDB.get(task.parentId)
    if (parent && parent.isCompleted) {
      await taskDB.update(parent.id, { isCompleted: false, status: 'pending' })
      await updateParentIfNeeded(parent, false)
    }
  }
}
async function onCheckTask(checked: boolean) {
  await updateTaskAndChildren(props.task, checked)
  await updateParentIfNeeded(props.task, checked)
  emit('refresh')
  eventBus.emit('global-refresh')
}

const showMoveMenu = ref(false)
const moveProjects = computed(() => {
  const all = props.allProjects || []
  const filtered = all.filter(p => String(p.id) !== String(props.task.projectId))
  console.log('[TaskCard] allProjects:', all)
  console.log('[TaskCard] moveProjects:', filtered)
  return filtered
})
async function onMoveTo(projectId: string) {
  await taskDB.update(props.task.id, { projectId })
  menuVisible.value = false
  emit('refresh')
  eventBus.emit('global-refresh')
}

async function onDeleteTask() {
  await taskDB.delete(props.task.id)
  emit('refresh')
  eventBus.emit('global-refresh')
  menuVisible.value = false
}
</script>

<style scoped>
.task-card {
  display: flex;
  align-items: center;
  position: relative;
  min-height: 40px;
  padding: 0;
  background: transparent;
  transition: background 0.2s, box-shadow 0.2s;
  border-radius: 12px;
  box-shadow: 0 1px 4px 0 #0001;
}
.task-card:hover {
  background: rgba(52, 152, 219, 0.10);
  box-shadow: 0 4px 16px 0 #0002;
}
.task-card.is-completed {
  background: rgba(180, 180, 180, 0.08);
}
.task-card.is-completed .task-name {
  color: #aaa;
  text-decoration: line-through;
}
.task-card.is-subtask {
  padding-left: 32px;
}
.task-left {
  display: flex;
  align-items: center;
  margin-right: 4px;
}
.task-checkbox {
  margin: 0 4px 0 8px;
  flex-shrink: 0;
}
.task-main {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  justify-content: space-between;
  height: 40px;
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
  color: #fff;
  background: linear-gradient(90deg, #3498db 0%, #6c6cff 100%);
  padding: 2px 10px;
  border-radius: 10px;
  white-space: nowrap;
  font-weight: 500;
  box-shadow: 0 1px 4px #3498db22;
}
.task-date {
  font-size: 12px;
  color: #fff;
  background: linear-gradient(90deg, #b0b0b0 0%, #3498db 100%);
  padding: 2px 10px;
  border-radius: 10px;
  white-space: nowrap;
  font-weight: 500;
  box-shadow: 0 1px 4px #b0b0b022;
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
  min-width: 140px;
  background: var(--el-bg-color, #23232a);
  border: 1px solid var(--el-border-color, #333a44);
  border-radius: 12px;
  box-shadow: 0 8px 32px #0004;
  padding: 6px 0;
  color: var(--el-text-color-primary, #fff);
  overflow: visible; /* 关键：允许子菜单溢出 */
}
.context-menu-item {
  padding: 10px 24px;
  cursor: pointer;
  font-size: 15px;
  color: inherit;
  transition: background 0.2s;
  border-radius: 8px;
  margin: 0 4px;
}
.context-menu-item:hover {
  background: var(--el-fill-color-light, #2d3a4a);
}
.context-menu-item + .context-menu-item {
  border-top: 1px solid #333a44;
  margin-top: 2px;
}
.context-submenu {
  position: absolute;
  left: 100%;
  top: 0;
  min-width: 140px;
  background: var(--el-bg-color, #23232a);
  border: 1px solid var(--el-border-color, #333a44);
  border-radius: 12px;
  box-shadow: 0 8px 32px #0004;
  padding: 6px 0;
  color: var(--el-text-color-primary, #fff);
  z-index: 10001;
  display: block;
}
</style> 