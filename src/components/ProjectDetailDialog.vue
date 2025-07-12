<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="val => $emit('update:modelValue', val)"
    width="520px"
    top="8vh"
    :show-close="false"
    class="project-detail-dialog"
    :close-on-click-modal="true"
    append-to-body
  >
    <div class="dialog-content">
      <!-- 1. 顶部导航栏 -->
      <div class="dialog-header">
        <el-button link class="back-btn" @click="$emit('close')">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="header-actions">
          <el-dropdown @command="handleProjectAction" trigger="click">
            <el-button link class="more-btn">
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="archive" :disabled="props.project?.status === 'archived'">
                  <el-icon><Folder /></el-icon>
                  归档项目
                </el-dropdown-item>
                <el-dropdown-item command="delete" divided>
                  <el-icon style="color: #f56c6c;"><Delete /></el-icon>
                  <span style="color: #f56c6c;">删除项目</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 2. 项目信息行 -->
      <div class="project-info-row edit-row">
        <el-avatar
          class="project-avatar"
          :src="''"
          :icon="null"
        >
          <span v-if="props.project?.icon" v-html="getIconSVG(props.project.icon)" style="width:24px;height:24px;"></span>
          <el-icon v-else :size="20">
            <Folder />
          </el-icon>
        </el-avatar>
        <el-input
          v-model="editableProjectName"
          class="project-name-input"
          :class="{ 'is-focus': isEditingName }"
          :readonly="!isEditingName"
          @focus="isEditingName = true"
          @blur="onNameBlur"
          @click="isEditingName = true"
          placeholder="未命名项目"
        />
        <el-select v-model="projectType" class="project-type-select" size="small">
          <el-option v-for="type in projectTypes" :key="type.value" :label="type.label" :value="type.value" />
        </el-select>
      </div>

      <!-- 3. 四个统计卡片 -->
      <div class="project-stats-row stats-grid">
        <el-card class="stat-card" shadow="hover" @click="showSetDateDialog = true" style="cursor:pointer;">
          <div class="stat-main">
            <el-icon class="stat-icon"><Clock /></el-icon>
            {{ formatDaysLeft() }}
          </div>
          <div class="stat-deadline">{{ formatDeadlineDate() }} 截止</div>
          <el-progress :percentage="Number(deadlineProgress)" :show-text="false" class="stat-progress" />
        </el-card>
        <el-card class="stat-card progress-card" shadow="hover">
          <div class="progress-card-content">
            <el-progress type="circle" :percentage="progressPercent" :show-text="false" :stroke-width="5" :width="45"  status="success" class="progress-circle" />
            <div class="progress-info">
              <div class="progress-percent">{{ progressPercent }}<span class="progress-percent-sign">%</span></div>
              <div class="progress-label">目标进度</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-main">
            <el-icon class="stat-icon"><Flag /></el-icon>
            {{ finishedCount }}
          </div>
          <div class="stat-sub">已完成次数</div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-main">
            <el-icon class="stat-icon"><Timer /></el-icon>
            {{ formatTotalTime() }}
          </div>
          <div class="stat-sub">目标计时</div>
        </el-card>
      </div>

      <!-- 4. 任务列表区域（可滚动） -->
      <div class="task-list-container">
        <div class="task-list-section">
          <div class="section-title-row">
            <div class="section-title">任务列表</div>
            <el-button type="primary" round size="small" class="create-task-btn" @click="handleCreateTask">创建任务</el-button>
          </div>
          <div v-if="unfinishedTasks.length === 0 && finishedTasks.length === 0" class="empty-state">暂无任务</div>
          <TaskList v-else :tasks="unfinishedTasks" :all-projects="allProjects" :show-project-name="false" @refresh="loadProjectTasks">
            <template #empty></template>
          </TaskList>
          <TaskList v-if="finishedTasks.length > 0" :tasks="finishedTasks" :all-projects="allProjects" :show-project-name="false" @refresh="loadProjectTasks">
            <template #empty></template>
          </TaskList>
        </div>
      </div>
    </div>
    <SetDateDialog v-model:visible="showSetDateDialog" @confirm="onDateConfirm" :range="[props.project?.startDate, props.project?.endDate]" />
    <TaskDetailPanel v-model="showTaskPanel" :key="showTaskPanelKey" :project-id="props.project?.id" @task-saved="onTaskSaved" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { ArrowLeft, MoreFilled, Folder, Flag, Clock, ArrowRight, Timer, Calendar, Delete } from '@element-plus/icons-vue'
import { ElDialog, ElButton, ElIcon, ElAvatar, ElSelect, ElOption, ElProgress, ElCheckbox, ElDatePicker, ElInput, ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessageBox, ElTree } from 'element-plus'
import { ProjectType, ProjectStatus } from '@/types/project.d'
import { taskDB, projectDB } from '@/utils/dbManager'
import SetDateDialog from './SetDateDialog.vue'
import { getIconSVG } from '@/icons/icons'
import { ICON_IDS } from '@/icons/icons'
import TaskDetailPanel from './TaskDetailPanel.vue'
import TaskCard from './TaskCard.vue'
import 'element-plus/es/components/tree/style/css'
import TaskList from './TaskList.vue'
import { buildTaskTree } from '@/utils/example'

const showSetDateDialog = ref(false)
const selectedDateInfo = ref<any>(null)
const onDateConfirm = (val: any) => {
  selectedDateInfo.value = val
  if (props.project && props.project.id && val.range && val.range.length === 2) {
    const [start, end] = val.range
    props.project.startDate = start
    props.project.endDate = end
    props.project.dueDate = end
    projectDB.update(props.project.id, {
      startDate: start,
      endDate: end,
      dueDate: end
    })
  }
}

const props = defineProps({
  modelValue: Boolean,
  project: { type: Object, default: () => ({ name: '未命名项目', type: ProjectType.WORK_CAREER, icon: '', }) },
  allTasks: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'close', 'create-task', 'project-deleted', 'project-task-changed'])

const projectType = ref(props.project?.type || ProjectType.WORK_CAREER)
const projectTypes = [
  { value: ProjectType.LEARNING_GROWTH, label: '学习成长' },
  { value: ProjectType.EXPERIENCE_BREAKTHROUGH, label: '体验突破' },
  { value: ProjectType.LEISURE_ENTERTAINMENT, label: '休闲娱乐' },
  { value: ProjectType.WORK_CAREER, label: '工作事业' },
  { value: ProjectType.FAMILY_LIFE, label: '家庭生活' },
  { value: ProjectType.PHYSICAL_HEALTH, label: '身体健康' },
  { value: ProjectType.FINANCIAL_MANAGEMENT, label: '财务理财' },
  { value: ProjectType.SOCIAL_RELATIONSHIPS, label: '人际社群' },
]
const tasks = ref<any[]>([])
const allProjects = ref<any[]>([])

const editableProjectName = ref(props.project?.name || '')
const isEditingName = ref(false)
const onNameBlur = () => {
  isEditingName.value = false
  if (props.project && props.project.id && editableProjectName.value !== props.project.name) {
    props.project.name = editableProjectName.value
    projectDB.update(props.project.id, { name: editableProjectName.value })
  }
}

// 加载项目任务
const loadProjectTasks = async () => {
  if (!props.project?.id) return
  
  try {
    const projectId = props.project.id
    const projectTasks = await taskDB.getByProject(projectId)
    tasks.value = projectTasks.map(task => ({
      ...task,
      isCompleted: task.status === 'completed',
      hasChildren: task.subTasks && task.subTasks.length > 0,
      projectName: '',
      expanded: false,
      startDate: task.startDate,
      endDate: task.endDate,
      dueDate: task.dueDate
    }))
  } catch (error) {
    // 加载项目任务失败
    tasks.value = []
  }
}

// 格式化剩余天数
const formatDaysLeft = () => {
  if (!props.project?.dueDate) return '无截止'
  const now = new Date()
  const dueDate = new Date(props.project.dueDate)
  const diffTime = dueDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return '已逾期'
  if (diffDays === 0) return '今天截止'
  if (diffDays === 1) return '明天截止'
  return `${diffDays}天后`
}

// 格式化总用时
const formatTotalTime = () => {
  // 这里可以根据实际数据计算总用时
  const totalMinutes = 0 // 从任务数据中计算
  if (totalMinutes === 0) return '0分钟'
  
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

// 复用TaskPage的日期格式化
const formatDate = (timestamp: number) => {
  if (!timestamp) return ''
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

// 监听项目变化，重新加载任务
watch(() => props.project?.id, () => {
  if (props.modelValue) {
    loadProjectTasks()
  }
})

// 监听project变化，更新projectType
watch(() => props.project, (newProject) => {
  if (newProject?.type) {
    projectType.value = newProject.type
  }
}, { immediate: true })

// 监听弹窗显示状态
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.project?.id) {
    loadProjectTasks()
  }
})

// 自动同步数据库日期到selectedDateInfo
watch(
  () => props.modelValue,
  async (val) => {
    if (val && props.project && props.project.startDate && props.project.endDate) {
      selectedDateInfo.value = {
        range: [props.project.startDate, props.project.endDate]
      }
    }
    if (val && props.project && typeof props.project.name === 'string') {
      editableProjectName.value = props.project.name
    }
  },
  { immediate: true }
)

function toDateStr(val: number | string | Date | null | undefined): string {
  if (!val) return ''
  const d = new Date(val)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

const formatDeadlineDate = () => {
  if (!props.project?.endDate) return ''
  const d = new Date(props.project.endDate)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

// 计算目标进度百分比
const finishedCount = computed(() => tasks.value.filter(t => t.isCompleted).length)
const totalCount = computed(() => tasks.value.length)
const progressPercent = computed(() => {
  const total = totalCount.value
  const completed = finishedCount.value
  return total === 0 ? 0 : Math.round((completed / total) * 100)
})

const deadlineProgress = computed(() => {
  if (!props.project?.endDate) return 0
  const now = new Date()
  const end = new Date(props.project.endDate)
  const total = end.getTime() - (props.project?.startDate ? new Date(props.project.startDate).getTime() : now.getTime())
  const left = end.getTime() - now.getTime()
  if (total <= 0) return 100
  let percent = ((total - left) / total) * 100
  if (percent < 0) percent = 0
  if (percent > 100) percent = 100
  return Math.round(percent)
})

const showTaskPanel = ref(false)
const showTaskPanelKey = ref(0)
function handleCreateTask() {
  showTaskPanelKey.value++
  showTaskPanel.value = true
}

// 每次弹窗打开时都加载任务列表
watch(() => showTaskPanel.value, (val) => {
  if (!val) setTimeout(() => loadProjectTasks(), 200)
})

const formatShortDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

async function onUpdateTaskName(task, newName) {
  task.name = newName
  // 直接更新数据库
  await taskDB.update(task.id, { name: newName })
}

onMounted(async () => {
  loadProjectTasks()
  allProjects.value = await projectDB.getAll()
})

async function handleProjectAction(command: string) {
  if (!props.project || !props.project.id) {
    // 项目信息不完整，无法执行操作
    return
  }
  
  const projectId = props.project.id
  
  if (command === 'archive') {
    try {
      await ElMessageBox.confirm(
        '确定要归档这个项目吗？归档后项目将不再显示在活跃项目列表中。',
        '归档项目',
        {
          confirmButtonText: '确定归档',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      
      // 更新项目状态为已归档
      await projectDB.update(projectId, { status: ProjectStatus.ARCHIVED })
      props.project.status = ProjectStatus.ARCHIVED
      
      // 关闭对话框
      emit('update:modelValue', false)
      emit('close')
    } catch (error) {
      // 用户取消操作
    }
  } else if (command === 'delete') {
    try {
      await ElMessageBox.confirm(
        '确定要删除这个项目吗？删除后项目及其所有任务将无法恢复。',
        '删除项目',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'error',
        }
      )
      
      // 删除项目下的所有任务
      const projectTasks = await taskDB.getByProject(projectId)
      for (const task of projectTasks) {
        await taskDB.delete(task.id)
      }
      
      // 删除项目
      await projectDB.delete(projectId)
      
      // 关闭对话框
      emit('update:modelValue', false)
      emit('close')
      emit('project-deleted', projectId)
    } catch (error) {
      // 用户取消操作
    }
  }
}

function onTaskSaved() {
  loadProjectTasks()
  emit('project-task-changed')
}

async function onMoveTask({ task, project }) {
  // 更新任务的 projectId
  await taskDB.update(task.id, { projectId: project.id })
  // 重新加载项目任务列表
  await loadProjectTasks()
  // 通知父组件任务已变更
  emit('project-task-changed')
}

function onNodeDrop(draggingNode, dropNode, dropType, ev) {
  // 这里实现 parentId、顺序等的数据库更新逻辑
  // draggingNode.data, dropNode.data, dropType
  // dropType: 'before' | 'after' | 'inner'
  // 你可以根据 dropType 更新 parentId 和排序
  // 更新后调用 loadProjectTasks() 刷新
}

const unfinishedTasks = computed(() => buildTaskTree(tasks.value.filter(t => !t.isCompleted)))
const finishedTasks = computed(() => buildTaskTree(tasks.value.filter(t => t.isCompleted)))
const totalTasks = computed(() => (props.allTasks as any[]).filter(t => String((t as any).projectId) === String(props.project.id)).length)
const completedTasks = computed(() => (props.allTasks as any[]).filter(t => String((t as any).projectId) === String(props.project.id) && ((t as any).status === 'completed' || (t as any).isCompleted)).length)
</script>

<style lang="scss" scoped>
.project-detail-dialog {
  min-height: 80vh;
  max-height: 92vh;
  
  :deep(.el-dialog) {
    border-radius: 12px;
  }
  
  :deep(.el-dialog__body) { 
    padding: 0; 
  }
}

.dialog-content {
  min-height: 80vh;
  max-height: 92vh;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex; align-items: center; justify-content: flex-start;
  padding: 16px 20px 8px 20px;
  .back-btn { 
    font-size: 20px; 
    padding: 8px;
  }
  .header-actions {
    margin-left: auto;
    .more-btn {
      font-size: 18px;
      padding: 8px;
      color: var(--el-text-color-regular);
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}

.project-info-row {
  display: flex; align-items: center; margin: 16px 20px 20px 20px;
  .project-avatar { 
    margin-right: 16px; 
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
    min-height: 32px !important;
  }
  .project-title { flex: 1; }
  .project-name { 
    font-size: 24px; 
    font-weight: 600; 
    line-height: 1.2;
  }
  .project-type-wrapper { margin-left: 16px; }
  .project-type-select {
    width: 100px !important;
    min-width: 80px !important;
  }
  .project-date-btn-wrapper {
    margin-left: 16px;
    display: flex;
    align-items: center;
  }
}

.project-stats-row {
  display: flex;
  gap: 16px;
  margin: 24px 20px 24px 20px;
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  margin: 24px 20px 24px 20px;
}
:deep(.stat-card),
:deep(.progress-card) {
  border-radius: 14px !important;
  min-width: 0 !important;
  min-height: 48px !important;
  height: 64px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  background: #23232a !important;
  color: #fff !important;
  box-shadow: 0 2px 8px 0 #00000022 !important;
  cursor: pointer !important;
  padding: 10px 12px 8px 12px !important;
}
:deep(.stat-card .el-card__body),
:deep(.progress-card .el-card__body) {
  padding: 0 !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
}
.stat-main {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.stat-sub, .stat-deadline {
  font-size: 12px;
  color: #b0b0b8;
  margin-bottom: 2px;
  font-weight: 400;
}
.stat-icon {
  font-size: 16px;
  margin-right: 4px;
  color: #6c6cff;
}
.stat-progress {
  width: 100%;
  margin-top: 4px;
}

.task-list-container {
  flex: 1;
  overflow-y: auto;
  margin: 0 20px;
  min-height: 0;
}

.task-list-section {
  padding: 0 0 20px 0;
  .section-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .section-title { 
    font-size: 16px; 
    font-weight: 600;
    color: var(--el-color-primary);
  }
  .task-card {
    display: flex;
    align-items: center;
    position: relative;
    min-height: 40px;
    padding: 0;
    background: transparent;
    transition: background 0.2s;
    border-radius: 8px;
    margin-bottom: 4px;
    
    &:hover {
      background: var(--el-fill-color-lighter);
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
        margin-left: 2px;
        transition: transform 0.2s;
        color: var(--el-text-color-secondary);
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
      height: 40px;
      position: relative;
      padding-left: 0;
    }
    .task-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
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
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 6px;
        white-space: nowrap;
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }
      .task-date {
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 6px;
        white-space: nowrap;
        color: var(--el-text-color-secondary);
        background: var(--el-fill-color-lighter);
      }
    }
    .task-divider {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1px;
      background: var(--el-border-color-light);
      content: '';
      z-index: 1;
    }
    &.is-subtask .task-main .task-divider {
      left: 0;
    }
  }
  .empty-state {
    text-align: center;
    padding: 32px 20px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.project-date-btn {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #888;
  background: none;
  border: none;
  padding: 0 8px;
  height: 32px;
  transition: color 0.2s;
  .el-icon {
    margin-right: 4px;
    font-size: 20px;
  }
  &.active {
    color: #2563eb;
    .el-icon {
      color: #2563eb;
    }
  }
  &:hover {
    color: #2563eb;
    .el-icon {
      color: #2563eb;
    }
  }
}

:deep(.el-date-editor .el-input__inner) {
  color: transparent !important;
  caret-color: transparent !important;
  text-shadow: 0 0 0 #333;
}

.edit-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 20px 0 20px;
}
.project-avatar {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  min-height: 28px !important;
  margin-right: 4px;
}
.project-type-select {
  width: 80px !important;
  min-width: 60px !important;
  margin-left: 4px;
}
.project-name-input {
  flex: 1;
  min-width: 0;
  max-width: 480px;
  font-size: 20px;
  font-weight: 600;
  background: transparent;
  border: none;
  box-shadow: none;
  outline: none;
  padding: 0 8px;
}
.project-name-input .el-input__wrapper {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
  padding: 0;
  transition: border 0.2s, box-shadow 0.2s;
}
.project-name-input .el-input__inner {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-size: 20px;
  font-weight: 600;
  padding: 0;
}
.project-name-input.is-focus .el-input__wrapper,
.project-name-input:focus-within .el-input__wrapper {
  border: 1px solid #2563eb !important;
  background: #fff !important;
  box-shadow: 0 0 0 2px #2563eb22 !important;
}

.progress-card {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 48px !important;
  padding: 8px 10px 8px 10px !important;
  background: #23232a !important;
  border-radius: 14px !important;
}
.progress-card-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  height: 100%;
  width: 100%;
}
.progress-circle {
  flex-shrink: 0;
  margin: 0;
}
.progress-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
}
.progress-percent {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 2px;
}
.progress-percent-sign {
  font-size: 13px;
  font-weight: 400;
  margin-left: 1px;
}
.progress-label {
  font-size: 13px;
  color: #b0b0b8;
  margin-top: 0;
  font-weight: 400;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.create-task-btn {
  margin-left: auto;
}
</style> 