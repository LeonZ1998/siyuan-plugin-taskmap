<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="val => $emit('update:modelValue', val)"
    width="720px"
    top="5vh"
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
        <div class="header-title">
          <el-input
            v-model="editableProjectName"
            class="header-project-name"
            :class="{ 'is-focus': isEditingName }"
            :readonly="!isEditingName"
            @focus="isEditingName = true"
            @blur="onNameBlur"
            @click="isEditingName = true"
            placeholder="未命名项目"
          />
          <el-select v-model="projectType" class="header-project-type" size="small">
            <el-option v-for="type in projectTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </div>
        <div class="header-actions">
          <el-dropdown @command="handleProjectAction" trigger="click">
            <el-button link class="more-btn">
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item 
                  command="archive"
                  :class="{ 'is-active': props.project?.status !== 'archived' }"
                  :disabled="props.project?.status === 'archived'"
                >
                  <el-icon><Folder /></el-icon>
                  归档项目
                </el-dropdown-item>
                <el-dropdown-item 
                  command="unarchive"
                  :class="{ 'is-active': props.project?.status === 'archived' }"
                  :disabled="props.project?.status !== 'archived'"
                >
                  <el-icon><FolderOpened /></el-icon>
                  取消归档项目
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

      <!-- 2. 项目信息卡片 -->
      <div class="project-info-card" style="display: none;">
        <div class="project-info-content">
          <div class="project-details">
            <!-- 项目类型已移动到顶部 -->
          </div>
        </div>
      </div>

      <!-- 3. 统计卡片网格 -->
      <div class="stats-section">
        <div class="stats-grid">
          <!-- 截止时间卡片 -->
          <div class="stat-card deadline-card" @click="showSetDateDialog = true">
            <div class="card-background"></div>
            <div class="card-content">
              <div class="card-left">
                <el-icon class="stat-icon"><Clock /></el-icon>
              </div>
              <div class="card-right">
                <div class="stat-info">
                  <div class="stat-main">{{ formatDaysLeft() }}</div>
                  <div class="stat-sub">{{ formatDeadlineDate() }} 截止</div>
                </div>
                <el-progress :percentage="Number(deadlineProgress)" :show-text="false" class="stat-progress" />
              </div>
            </div>
          </div>

          <!-- 进度卡片 -->
          <div class="stat-card progress-card">
            <div class="card-background"></div>
            <div class="card-content">
              <div class="card-left">
                <el-progress type="circle" :percentage="progressPercent" :show-text="false" :stroke-width="6" :width="50" status="success" class="progress-circle" />
              </div>
              <div class="card-right">
                <div class="progress-info">
                  <div class="progress-percent">{{ progressPercent }}<span class="progress-percent-sign">%</span></div>
                  <div class="progress-label">目标进度</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 完成次数卡片 -->
          <div class="stat-card completed-card">
            <div class="card-background"></div>
            <div class="card-content">
              <div class="card-left">
                <el-icon class="stat-icon"><Flag /></el-icon>
              </div>
              <div class="card-right">
                <div class="stat-info">
                  <div class="stat-main">{{ finishedCount }}</div>
                  <div class="stat-sub">已完成次数</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 计时卡片 -->
          <div class="stat-card timer-card">
            <div class="card-background"></div>
            <div class="card-content">
              <div class="card-left">
                <el-icon class="stat-icon"><Timer /></el-icon>
              </div>
              <div class="card-right">
                <div class="stat-info">
                  <div class="stat-main">{{ formatTotalTime(totalProjectDuration) }}</div>
                  <div class="stat-sub">目标计时</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 任务列表区域 -->
      <div class="task-list-section">
        <div class="task-list-header">
          <div class="task-list-title">
            <span class="title-icon">📋</span>
            任务列表
          </div>
          <el-button type="primary" size="small" class="create-task-btn" @click="handleCreateTask">
            <el-icon><Plus /></el-icon>
            创建任务
          </el-button>
        </div>
        
        <div class="task-list-content">
          <div v-if="projectUnfinishedTasks.length === 0 && projectFinishedTasks.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <div class="empty-text">暂无任务</div>
            <div class="empty-hint">点击上方按钮创建第一个任务</div>
          </div>
          <template v-else>
            <div v-if="projectUnfinishedTasks.length > 0" class="task-group">
              <div class="task-group-title">
                <span class="group-icon">⏳</span>
                未完成任务
              </div>
              <TaskList :tasks="projectUnfinishedTasks" :all-projects="allProjects" :show-project-name="false" @refresh="loadProjectTasks">
                <template #empty></template>
              </TaskList>
            </div>
            <div v-if="projectFinishedTasks.length > 0" class="task-group">
              <div class="task-group-title">
                <span class="group-icon">✅</span>
                已完成任务
              </div>
              <TaskList :tasks="projectFinishedTasks" :all-projects="allProjects" :show-project-name="false" @refresh="loadProjectTasks">
                <template #empty></template>
              </TaskList>
            </div>
          </template>
        </div>
      </div>
    </div>
    <SetDateDialog v-model:visible="showSetDateDialog" @confirm="onDateConfirm" :range="[props.project?.startDate, props.project?.endDate]" />
    <TaskDetailPanel v-model="showTaskPanel" :key="showTaskPanelKey" :project-id="props.project?.id" @task-saved="onTaskSaved" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { ArrowLeft, MoreFilled, Folder, Flag, Clock, Timer, Delete, Plus, FolderOpened } from '@element-plus/icons-vue'
import { ElDialog, ElButton, ElIcon, ElSelect, ElOption, ElProgress, ElInput, ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessageBox } from 'element-plus'
import { ProjectType, ProjectStatus } from '@/types/project.d'
import { taskDB, projectDB, timerRecordDB } from '@/utils/dbManager'
import SetDateDialog from './SetDateDialog.vue'
import TaskDetailPanel from './TaskDetailPanel.vue'
import 'element-plus/es/components/tree/style/css'
import TaskList from './TaskList.vue'
import { eventBus } from '@/utils/eventBus'

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
const unfinishedTree = ref<any[]>([])
const finishedList = ref<any[]>([])
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

    // 1) 预处理：标准化节点属性
    const nodes = projectTasks.map(task => ({
      ...task,
      isCompleted: task.status === 'completed',
      projectName: '',
      expanded: false,
      startDate: task.startDate,
      endDate: task.endDate,
      dueDate: task.dueDate,
      subTasks: [] as any[],
    }))

    // 2) 建立字典方便引用
    const idToNode = new Map<string, any>()
    for (const n of nodes) {
      idToNode.set(String(n.id), n)
    }

    // 3) 组装父子关系
    const roots: any[] = []
    for (const n of nodes) {
      const parentId = n.parentId
      if (parentId && idToNode.has(String(parentId))) {
        const parent = idToNode.get(String(parentId))
        parent.subTasks.push(n)
      } else {
        roots.push(n)
      }
    }

    // 4) 递归排序（按 order 优先，其次 createdAt）
    function sortSiblings(arr: any[]) {
      arr.sort((a, b) => {
        const ao = (a.order ?? 0) - (b.order ?? 0)
        if (ao !== 0) return ao
        const ac = (a.createdAt ?? 0) - (b.createdAt ?? 0)
        return ac
      })
      for (const it of arr) {
        if (Array.isArray(it.subTasks) && it.subTasks.length > 0) sortSiblings(it.subTasks)
      }
    }
    sortSiblings(roots)

    // 5) 拆分：已完成任务单独列出（从未完成树中移除所有已完成节点）
    const finished: any[] = []
    function pruneCompleted(node: any): any | null {
      if (node.isCompleted) {
        // 收集为扁平已完成项（不保留子任务）
        const { subTasks, ...shallow } = node
        finished.push({ ...shallow, subTasks: [] })
        return null
      }
      if (Array.isArray(node.subTasks) && node.subTasks.length > 0) {
        const kept: any[] = []
        for (const child of node.subTasks) {
          const pruned = pruneCompleted(child)
          if (pruned) kept.push(pruned)
        }
        node.subTasks = kept
      }
      return node
    }
    const unfinishedRoots: any[] = []
    for (const r of roots) {
      const pruned = pruneCompleted(r)
      if (pruned) unfinishedRoots.push(pruned)
    }
    // 对已完成列表也做排序
    finished.sort((a, b) => {
      const ao = (a.order ?? 0) - (b.order ?? 0)
      if (ao !== 0) return ao
      return (a.createdAt ?? 0) - (b.createdAt ?? 0)
    })

    tasks.value = unfinishedRoots
    unfinishedTree.value = unfinishedRoots
    finishedList.value = finished
  } catch (error) {
    // 加载项目任务失败
    tasks.value = []
    unfinishedTree.value = []
    finishedList.value = []
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

// 目标计时：当前项目所有任务计时的总和
const totalProjectDuration = ref(0)

function collectIdsFromTree(list: any[], sink: Set<string>) {
  for (const n of list) {
    if (n && n.id != null) sink.add(String(n.id))
    if (n && Array.isArray(n.subTasks) && n.subTasks.length > 0) collectIdsFromTree(n.subTasks, sink)
  }
}

async function loadProjectTotalDuration() {
  if (!props.project?.id) return
  const ids = new Set<string>()
  collectIdsFromTree(unfinishedTree.value, ids)
  for (const f of finishedList.value) ids.add(String(f.id))
  const taskIds = Array.from(ids)
  const allRecords = await timerRecordDB.getAll()
  const projectRecords = allRecords.filter(r => taskIds.includes(r.taskId))
  totalProjectDuration.value = projectRecords.reduce((sum, r) => sum + (r.duration || 0), 0)
}

onMounted(loadProjectTotalDuration)
watch([unfinishedTree, finishedList], loadProjectTotalDuration)
eventBus.on('global-refresh', loadProjectTotalDuration)



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


const formatDeadlineDate = () => {
  if (!props.project?.endDate) return ''
  const d = new Date(props.project.endDate)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

// 计算目标进度百分比
function countTree(list: any[]): number {
  let n = 0
  for (const it of list) {
    n += 1
    if (Array.isArray(it.subTasks) && it.subTasks.length > 0) n += countTree(it.subTasks)
  }
  return n
}
const finishedCount = computed(() => finishedList.value.length)
const totalCount = computed(() => countTree(unfinishedTree.value) + finishedList.value.length)
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

onMounted(async () => {
  loadProjectTasks()
  allProjects.value = await projectDB.getAll()
  eventBus.on('global-refresh', loadProjectTasks)
})

onBeforeUnmount(() => {
  eventBus.off('global-refresh', loadProjectTasks)
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
  } else if (command === 'unarchive') {
    try {
      await ElMessageBox.confirm(
        '确定要取消归档这个项目吗？取消归档后项目将重新显示在活跃项目列表中。',
        '取消归档项目',
        {
          confirmButtonText: '确定取消',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      
      // 更新项目状态为未归档
      await projectDB.update(projectId, { status: ProjectStatus.ACTIVE })
      props.project.status = ProjectStatus.ACTIVE
      
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

// 项目任务的计算属性
const projectUnfinishedTasks = computed(() => unfinishedTree.value)
const projectFinishedTasks = computed(() => finishedList.value)

// 修改 formatTotalTime 用于秒数
function formatTotalTime(sec: number) {
  const m = Math.floor(sec / 60)
  const h = Math.floor(m / 60)
  const mm = m % 60
  if (h > 0) return `${h}小时${mm}分钟`
  return `${m}分钟`
}
</script>

<style lang="scss" scoped>
.project-detail-dialog {
  min-height: 80vh;
  max-height: 92vh;
  
  :deep(.el-dialog) {
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  :deep(.el-dialog__body) { 
    padding: 0; 
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }
  
  // 暗色主题适配
  html.dark & {
    :deep(.el-dialog) {
      background: rgba(32, 33, 36, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
  
  // 响应式设计
  @media (max-width: 768px) {
    :deep(.el-dialog) {
      width: 95% !important;
      margin: 2.5vh auto !important;
    }
  }
  
  @media (max-width: 480px) {
    :deep(.el-dialog) {
      width: 98% !important;
      margin: 1vh auto !important;
    }
  }
}

.dialog-content {
  min-height: 80vh;
  max-height: 92vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  overflow: hidden;
  border: none !important;
  box-shadow: none !important;
  
  // 暗色主题适配
  html.dark & {
    background: #18181c;
  }
}

.dialog-header {
  display: flex; align-items: center; justify-content: flex-start;
  padding: 10px 16px 6px 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  .back-btn { 
    font-size: 20px; 
    padding: 10px;
    color: rgba(255, 255, 255, 0.8);
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      transform: translateX(-2px);
    }
  }
  
  .header-title {
    flex: 1;
    display: flex;
    align-items: center;
    margin: 0 10px;
    gap: 10px;
  }

  .header-project-name {
    flex: 1;
    min-width: 0;
    max-width: unset;
    margin-right: 0;
  }
  .header-project-name .el-input__wrapper {
    box-shadow: none !important;
    border: 1.5px solid #d1d5db !important;
    background: rgba(255,255,255,0.08) !important;
    border-radius: 8px !important;
    padding: 0;
    transition: border 0.2s, box-shadow 0.2s, background 0.2s;
  }
  html.dark .header-project-name .el-input__wrapper {
    border: 1.5px solid #444 !important;
    background: rgba(255,255,255,0.06) !important;
  }
  .header-project-name .el-input__inner {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    font-size: 18px;
    font-weight: 600;
    padding: 0;
    color: white !important;
    &::placeholder {
      color: rgba(255, 255, 255, 0.6) !important;
    }
  }
  // 聚焦高亮，未聚焦无边框
  .header-project-name.is-focus .el-input__wrapper,
  .header-project-name:focus-within .el-input__wrapper {
    border: 2px solid #338aff !important;
    background: rgba(51, 138, 255, 0.08) !important;
    box-shadow: 0 0 0 2px #338aff33 !important;
    border-radius: 8px !important;
  }

  .header-project-type {
    flex: 0 0 auto;
    margin-left: 10px;
    width: 100px !important;
    min-width: 100px !important;
  }
  .header-project-type .el-input__wrapper {
    box-shadow: none !important;
    border: 1.5px solid #d1d5db !important;
    background: rgba(255,255,255,0.08) !important;
    border-radius: 8px !important;
    padding: 0;
    transition: border 0.2s, box-shadow 0.2s, background 0.2s;
  }
  html.dark .header-project-type .el-input__wrapper {
    border: 1.5px solid #444 !important;
    background: rgba(255,255,255,0.06) !important;
  }
  .header-project-type .el-input__inner {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    font-size: 14px;
    font-weight: 500;
    padding: 0;
    color: white !important;
    &::placeholder {
      color: rgba(255, 255, 255, 0.6) !important;
    }
  }
  // 聚焦高亮，未聚焦无边框
  .header-project-type.is-focus .el-input__wrapper,
  .header-project-type:focus-within .el-input__wrapper {
    border: 2px solid #338aff !important;
    background: rgba(51, 138, 255, 0.08) !important;
    box-shadow: 0 0 0 2px #338aff33 !important;
    border-radius: 8px !important;
  }

  .header-actions {
    margin-left: auto;
    .more-btn {
      font-size: 18px;
      padding: 10px;
      color: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        transform: scale(1.1);
      }
    }
  }
}

.project-info-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 16px 24px;
  margin: 20px 24px 24px 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
}

.project-info-content {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}

.project-details {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}

.project-name-input {
  flex: 1 1 auto;
  min-width: 0;
  max-width: unset;
  margin-right: 0;
}
.project-name-input .el-input__wrapper {
  box-shadow: none !important;
  border: 1.5px solid #d1d5db !important;
  background: rgba(255,255,255,0.08) !important;
  border-radius: 8px !important;
  padding: 0;
  transition: border 0.2s, box-shadow 0.2s, background 0.2s;
}
html.dark .project-name-input .el-input__wrapper {
  border: 1.5px solid #444 !important;
  background: rgba(255,255,255,0.06) !important;
}
.project-name-input .el-input__inner {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-size: 18px;
  font-weight: 600;
  padding: 0;
  color: white !important;
  &::placeholder {
    color: rgba(255, 255, 255, 0.6) !important;
  }
}
// 聚焦高亮，未聚焦无边框
.project-name-input.is-focus .el-input__wrapper,
.project-name-input:focus-within .el-input__wrapper {
  border: 2px solid #338aff !important;
  background: rgba(51, 138, 255, 0.08) !important;
  box-shadow: 0 0 0 2px #338aff33 !important;
  border-radius: 8px !important;
}

.project-type-select {
  flex: 0 0 auto;
  margin-left: auto;
  width: 120px !important;
  min-width: 100px !important;
  
  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 8px !important;
    box-shadow: none !important;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      border-color: rgba(255, 255, 255, 0.3) !important;
    }
    
    &.is-focus {
      background: rgba(255, 255, 255, 0.2) !important;
      border-color: rgba(255, 255, 255, 0.5) !important;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2) !important;
    }
  }
  
  :deep(.el-input__inner) {
    color: white !important;
    font-weight: 500 !important;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.6) !important;
    }
  }
  
  :deep(.el-select__caret) {
    color: rgba(255, 255, 255, 0.8) !important;
  }
}

.stats-section {
  margin: 8px 24px 24px 24px;
  padding: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  
  // 添加卡片进入动画
  .stat-card {
    animation: slideInUp 0.6s ease-out;
    
    &:nth-child(1) { animation-delay: 0.1s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.3s; }
    &:nth-child(4) { animation-delay: 0.4s; }
  }
  
  // 响应式设计
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
    gap: 12px;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  border-radius: 20px !important;
  min-width: 0 !important;
  min-height: 70px !important;
  height: 80px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  background: rgba(255, 255, 255, 0.15) !important;
  color: #fff !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  cursor: pointer !important;
  padding: 12px !important;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2) !important;
    background: rgba(255, 255, 255, 0.25) !important;
  }
  
  &:active {
    transform: translateY(-2px) scale(1.01);
    transition: all 0.1s ease;
  }
  
  &.deadline-card {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.1)) !important;
    border-color: rgba(255, 107, 107, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.3), rgba(255, 107, 107, 0.2)) !important;
      border-color: rgba(255, 107, 107, 0.5);
    }
  }
  
  &.progress-card {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1)) !important;
    border-color: rgba(76, 175, 80, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(76, 175, 80, 0.2)) !important;
      border-color: rgba(76, 175, 80, 0.5);
    }
  }
  
  &.completed-card {
    background: linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(33, 150, 243, 0.1)) !important;
    border-color: rgba(33, 150, 243, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.3), rgba(33, 150, 243, 0.2)) !important;
      border-color: rgba(33, 150, 243, 0.5);
    }
  }
  
  &.timer-card {
    background: linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(156, 39, 176, 0.1)) !important;
    border-color: rgba(156, 39, 176, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, rgba(156, 39, 176, 0.3), rgba(156, 39, 176, 0.2)) !important;
      border-color: rgba(156, 39, 176, 0.5);
    }
  }
}

.stat-card .el-card__body {
  padding: 0 !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 14px;
  opacity: 0.1;
  z-index: -1;
  filter: blur(5px);
}

.card-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 1;
}

.card-left {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  flex: 1;
  min-width: 0;
}

.stat-icon {
  font-size: 24px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  width: 100%;
}

.stat-main {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
}

.stat-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  line-height: 1.3;
}

.stat-progress {
  width: 100%;
  margin-top: 8px;
  
  :deep(.el-progress-bar__outer) {
    background: rgba(255, 255, 255, 0.1) !important;
    border-radius: 10px !important;
    height: 6px !important;
  }
  
  :deep(.el-progress-bar__inner) {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6)) !important;
    border-radius: 10px !important;
    transition: all 0.3s ease !important;
  }
}

.progress-circle {
  flex-shrink: 0;
  margin: 0;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.progress-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  width: 100%;
}

.progress-percent {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.progress-percent-sign {
  font-size: 14px;
  font-weight: 500;
  margin-left: 2px;
  opacity: 0.8;
}

.progress-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  line-height: 1.3;
}

.task-list-section {
  flex: 1;
  overflow-y: auto;
  margin: 0 24px 24px 24px;
  min-height: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  html.dark & {
    background: #23232a;
    color: #e8eaed;
    border: 1px solid #23232a;
  }
}

.task-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.task-list-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.title-icon {
  font-size: 22px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.create-task-btn {
  margin-left: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 8px 16px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  
  &:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4) !important;
  }
}

.task-list-content {
  width: 100%;
  padding: 0;
  
  html.dark & {
    background: transparent;
    color: #e8eaed;
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  margin: 20px 0;
}

.empty-icon {
  font-size: 48px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  opacity: 0.8;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.empty-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.task-group {
  margin-top: 24px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }
  
  html.dark & {
    background: #23232a;
    color: #e8eaed;
    border: 1px solid #23232a;
  }
}

.task-group-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.group-icon {
  font-size: 20px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
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
  max-width: 680px;
  font-size: 18px;
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
  font-size: 18px;
  font-weight: 600;
  padding: 0;
}
.project-name-input.is-focus .el-input__wrapper,
.project-name-input:focus-within .el-input__wrapper {
  border: 1px solid #2563eb !important;
  background: #fff !important;
  box-shadow: 0 0 0 2px #2563eb22 !important;
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

// 覆盖 Element Plus 勾选框暗色主题
html.dark :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #4285f4 !important;
  border-color: #4285f4 !important;
}
html.dark :deep(.el-checkbox__inner) {
  background-color: #23232a !important;
  border-color: #5f6368 !important;
}
html.dark :deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
  border-color: #fff !important;
}

// 下拉菜单项激活状态样式
:deep(.el-dropdown-menu__item.is-active) {
  color: #409eff !important;
  font-weight: 600 !important;
}

:deep(.el-dropdown-menu__item.is-active:hover) {
  color: #409eff !important;
}

// 下拉菜单项禁用状态样式
:deep(.el-dropdown-menu__item.is-disabled) {
  color: #c0c4cc !important;
  cursor: not-allowed !important;
}

:deep(.el-dropdown-menu__item.is-disabled:hover) {
  color: #c0c4cc !important;
}

:deep(.el-dropdown-menu__item.is-disabled .el-icon) {
  color: #c0c4cc !important;
}
</style> 