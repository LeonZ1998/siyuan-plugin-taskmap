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
        <div class="header-spacer"></div>
        <el-button link class="more-btn">
          <el-icon><MoreFilled /></el-icon>
        </el-button>
      </div>

      <!-- 2. 项目信息行 -->
      <div class="project-info-row">
        <el-avatar :icon="Folder" class="project-avatar" />
        <div class="project-title">
          <div class="project-name">{{ project?.name || '未命名项目' }}</div>
        </div>
        <div class="project-type-wrapper">
          <el-select v-model="projectType" class="project-type-select" size="small">
            <el-option v-for="type in projectTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </div>
        <el-button
          class="project-date-btn"
          style="color: #2563eb"
          text
          @click="showSetDateDialog = true"
        >
          <el-icon color="#2563eb"><Calendar /></el-icon>
          <span style="color: #2563eb">
            {{ formatBtnDate(selectedDateInfo) }}
          </span>
        </el-button>
        <SetDateDialog v-model:visible="showSetDateDialog" @confirm="onDateConfirm" />
      </div>

      <!-- 3. 四个统计卡片 -->
      <div class="project-stats-row">
        <div class="stat-card">
          <div class="stat-main">{{ formatDaysLeft() }}</div>
          <div class="stat-sub">截止时间</div>
          <el-icon class="stat-icon"><Clock /></el-icon>
        </div>
        <div class="stat-card">
          <div class="stat-main">{{ project?.completionRate || 0 }}%</div>
          <div class="stat-sub">项目进度</div>
          <el-progress :percentage="project?.completionRate || 0" :show-text="false" :stroke-width="4" />
        </div>
        <div class="stat-card">
          <div class="stat-main">{{ project?.completedTaskCount || 0 }}</div>
          <div class="stat-sub">已完成任务</div>
          <el-icon class="stat-icon"><Flag /></el-icon>
        </div>
        <div class="stat-card">
          <div class="stat-main">{{ formatTotalTime() }}</div>
          <div class="stat-sub">总计用时</div>
          <el-icon class="stat-icon"><Timer /></el-icon>
        </div>
      </div>

      <!-- 4. 任务列表区域（可滚动） -->
      <div class="task-list-container">
        <div class="task-list-section">
          <div class="section-title">待办任务 {{ tasks.length }}</div>
          <div v-for="task in tasks" :key="task.id" class="task-card">
            <div class="task-left">
              <el-checkbox class="task-checkbox" :model-value="task.isCompleted" />
              <el-button v-if="task.hasChildren" class="expand-btn" type="text" size="small" :class="{ expanded: task.expanded }">
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
            <div class="task-main">
              <span class="task-name">{{ task.name }}</span>
              <div class="task-meta">
                <span v-if="task.projectName" class="project-name">{{ task.projectName }}</span>
                <span v-if="task.dueDate" class="task-date">{{ formatDate(task.dueDate) }}</span>
              </div>
              <div class="task-divider"></div>
            </div>
          </div>
          <div v-if="tasks.length === 0" class="empty-state">
            <p>暂无任务，点击下方按钮创建新任务</p>
          </div>
        </div>
      </div>

      <!-- 5. 底部按钮（固定在底部） -->
      <div class="dialog-footer">
        <el-button type="primary" round @click="$emit('create-task')">创建任务</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ArrowLeft, MoreFilled, Folder, Flag, Clock, ArrowRight, Timer, Calendar } from '@element-plus/icons-vue'
import { ElDialog, ElButton, ElIcon, ElAvatar, ElSelect, ElOption, ElProgress, ElCheckbox, ElDatePicker } from 'element-plus'
import { ProjectType } from '@/types/project.d'
import { taskDB, projectDB } from '@/utils/dbManager'
import SetDateDialog from './SetDateDialog.vue'
const showSetDateDialog = ref(false)
const selectedDateInfo = ref<any>(null)
const onDateConfirm = (val: any) => {
  selectedDateInfo.value = val
  if (props.project && props.project.id && val.range && val.range.length === 2) {
    const [start, end] = val.range
    props.project.startDate = start
    props.project.endDate = end
    projectDB.update(props.project.id, {
      startDate: start,
      endDate: end,
    })
  }
}

const props = defineProps({
  modelValue: Boolean,
  project: { type: Object, default: () => ({ name: '未命名项目', type: ProjectType.WORK_CAREER, icon: '', }) }
})
const emit = defineEmits(['update:modelValue', 'close', 'create-task'])

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

// 加载项目任务
const loadProjectTasks = async () => {
  if (!props.project?.id) return
  
  try {
    const projectTasks = await taskDB.getByProject(props.project.id)
    tasks.value = projectTasks.map(task => ({
      ...task,
      isCompleted: task.status === 'completed',
      hasChildren: task.subTasks && task.subTasks.length > 0,
      projectName: '',
      expanded: false
    }))
  } catch (error) {
    console.error('加载项目任务失败:', error)
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

// 按钮日期格式化
const formatBtnDate = (dateInfo: any) => {
  if (!dateInfo || !dateInfo.range || dateInfo.range.length !== 2) return '设置日期'
  const [start, end] = dateInfo.range
  if (!start || !end) return '设置日期'
  const startDate = new Date(start)
  const endDate = new Date(end)
  const startStr = `${startDate.getMonth() + 1}月${startDate.getDate()}日`
  const endStr = `${endDate.getMonth() + 1}月${endDate.getDate()}日`
  return `${startStr} - ${endStr}`
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
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 8px 20px;
  .back-btn, .more-btn { 
    font-size: 20px; 
    padding: 8px;
  }
  .header-spacer { flex: 1; }
}

.project-info-row {
  display: flex; align-items: center; margin: 16px 20px 20px 20px;
  .project-avatar { 
    margin-right: 16px; 
    width: 48px;
    height: 48px;
  }
  .project-title { flex: 1; }
  .project-name { 
    font-size: 24px; 
    font-weight: 600; 
    line-height: 1.2;
  }
  .project-type-wrapper { margin-left: 16px; }
  .project-type-select { width: 140px; }
  .project-date-btn-wrapper {
    margin-left: 16px;
    display: flex;
    align-items: center;
  }
}

.project-stats-row {
  display: flex; gap: 12px; margin: 0 20px 24px 20px;
  .stat-card {
    flex: 1; 
    border-radius: 12px; 
    padding: 16px 12px;
    display: flex; 
    flex-direction: column; 
    align-items: center;
    text-align: center;
    position: relative;
    background: var(--el-fill-color-light);
    
    .stat-main { 
      font-size: 20px; 
      font-weight: 600; 
      margin-bottom: 4px; 
      line-height: 1.2;
      color: var(--el-text-color-primary);
    }
    .stat-sub { 
      font-size: 12px; 
      margin-bottom: 8px; 
      line-height: 1.2;
      color: var(--el-text-color-secondary);
    }
    .stat-icon { 
      font-size: 16px;
      margin-top: 4px; 
      color: var(--el-text-color-secondary);
    }
    .el-progress { 
      width: 100%; 
      margin-top: 8px; 
    }
  }
}

.task-list-container {
  flex: 1;
  overflow-y: auto;
  margin: 0 20px;
  min-height: 0;
}

.task-list-section {
  padding: 0 0 20px 0;
  .section-title { 
    font-size: 16px; 
    font-weight: 600;
    margin-bottom: 12px; 
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

.dialog-footer {
  display: flex; 
  justify-content: center; 
  margin: 0 20px 20px 20px;
  flex-shrink: 0;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-light);
  
  .el-button {
    padding: 12px 32px;
    font-size: 14px;
    font-weight: 500;
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
</style> 