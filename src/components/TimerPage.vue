<template>
  <div class="timer-page">
    <div class="header-row">
      <h3>任务计时</h3>
      <el-button type="primary" class="add-focus-btn" @click="showAddFocusDialog = true">添加专注记录</el-button>
    </div>
    <div class="page-content">
             <div class="task-selector">
         <el-tree-select
           v-model="selectedTaskId"
           :data="taskTreeData"
           :props="{
             children: 'children',
             label: 'label',
             value: 'id'
           }"
           placeholder="选择任务或输入新任务名称按回车创建"
           style="width: 220px"
           clearable
           filterable
           allow-create
           default-first-option
           @change="onTaskChange"
           @create="onCreateTask"
           :render-after-expand="false"
         />
       </div>
      <div class="timer-display">
        <el-progress
          type="circle"
          :percentage="progressPercentage"
          :width="220"
          :stroke-width="10"
          :color="isPaused ? '#888' : '#347cff'"
          :format="() => formattedTime"
        />
        <div class="timer-status">{{ statusText }}</div>
        <div class="timer-controls">
          <el-button v-if="!isRunning && !isPaused" size="large" type="primary" @click="startTimer">开始</el-button>
          <el-button v-if="isRunning" size="large" @click="pauseTimer">暂停</el-button>
          <el-button v-if="isPaused" size="large" type="primary" @click="resumeTimer">继续</el-button>
          <el-button v-if="isRunning || isPaused" size="large" @click="endTimer">结束</el-button>
        </div>
      </div>
      <div class="focus-history-section">
        <FocusHistoryPage ref="focusHistoryRef" />
      </div>
    </div>
    <AddFocusRecordDialog v-model="showAddFocusDialog" @record-added="handleRecordAdded" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { taskDB, timerRecordDB, projectDB } from '@/utils/dbManager';
import FocusHistoryPage from './FocusHistoryPage.vue';
import AddFocusRecordDialog from './AddFocusRecordDialog.vue';
import { ref as vueRef } from 'vue';
import { eventBus } from '@/utils/eventBus'
const focusHistoryRef = vueRef();

const elapsedSeconds = ref(0);
const isRunning = ref(false);
const isPaused = ref(false);
let timerId: number | null = null;

// 多段记录支持
const currentRecord = ref<any>(null);
const segments = ref<any[]>([]);
const startTime = ref<number>(0);
const pauseStartTime = ref<number>(0);
const totalPausedTime = ref(0);

// 开始计时
async function startTimer() {
  console.log('[TimerPage] startTimer 被调用，selectedTask:', selectedTask.value)
  if (!selectedTask.value) {
    console.log('[TimerPage] 没有选中的任务，无法开始计时')
    ElMessage.warning('请先选择一个任务');
    return;
  }
  
  // 如果当前有正在进行的记录，先结束它
  if (currentRecord.value && (isRunning.value || isPaused.value)) {
    await endTimer();
  }
  
  isRunning.value = true;
  isPaused.value = false;
  startTime.value = Date.now();
  elapsedSeconds.value = 0;
  totalPausedTime.value = 0;
  
  // 创建新的专注记录
  currentRecord.value = {
    taskId: selectedTask.value.id,
    taskName: selectedTask.value.name,
    startTime: startTime.value,
    segments: [],
    status: 'running'
  };
  console.log('[TimerPage] 创建了新的专注记录:', currentRecord.value)
  
  // 创建第一个片段
  segments.value = [{
    id: generateSegmentId(),
    startTime: startTime.value,
    duration: 0
  }];
  
  if (timerId) clearInterval(timerId);
  timerId = window.setInterval(() => {
    elapsedSeconds.value++;
    saveTimerState();
  }, 1000);
  
  ElMessage.success('开始专注');
}

// 暂停计时
function pauseTimer() {
  if (!isRunning.value) return;
  
  isRunning.value = false;
  isPaused.value = true;
  pauseStartTime.value = Date.now();
  
  // 结束当前片段
  if (segments.value.length > 0) {
    const lastSegment = segments.value[segments.value.length - 1];
    lastSegment.endTime = pauseStartTime.value;
    lastSegment.duration = Math.floor((pauseStartTime.value - lastSegment.startTime) / 1000);
  }
  
  if (timerId) clearInterval(timerId);
  ElMessage.info('已暂停');
}

// 继续计时
function resumeTimer() {
  if (!isPaused.value) return;
  
  isRunning.value = true;
  isPaused.value = false;
  
  // 计算暂停的总时间
  const pauseEndTime = Date.now();
  totalPausedTime.value += pauseEndTime - pauseStartTime.value;
  
  // 创建新的片段（不创建新记录）
  const newSegment = {
    id: generateSegmentId(),
    startTime: pauseEndTime,
    duration: 0
  };
  
  // 添加到当前记录的片段中
  segments.value.push(newSegment);
  
  if (timerId) clearInterval(timerId);
  timerId = window.setInterval(() => {
    elapsedSeconds.value++;
    saveTimerState();
  }, 1000);
  
  ElMessage.success('继续专注');
}

// 生成片段ID
function generateSegmentId() {
  return 'seg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 任务选择相关
const tasks = ref<any[]>([]);
const taskTreeData = ref<any[]>([]);
const selectedTaskId = ref<string | null>(null);
const selectedTask = computed(() => {
  // 在树形数据中查找选中的任务
  if (!selectedTaskId.value) {
    console.log('[TimerPage] selectedTask: 没有选中的任务ID')
    return null;
  }
  
  console.log('[TimerPage] selectedTask: 查找任务ID:', selectedTaskId.value, '在树形数据中:', taskTreeData.value)
  
  // 递归查找任务
  const findTask = (nodes: any[]): any => {
    for (const node of nodes) {
      if (node.id === selectedTaskId.value && node.type === 'task') {
        console.log('[TimerPage] selectedTask: 找到任务:', node.task)
        return node.task; // 返回实际的任务对象
      }
      if (node.children) {
        const found = findTask(node.children);
        if (found) return found;
      }
    }
    return null;
  };
  
  const result = findTask(taskTreeData.value);
  console.log('[TimerPage] selectedTask: 最终结果:', result)
  return result;
});

async function loadTasks() {
  console.log('[TimerPage] loadTasks: 开始加载任务和项目数据')
  const allTasks = await taskDB.getAll();
  const allProjects = await projectDB.getAll();
  console.log('[TimerPage] loadTasks: 获取到任务数量:', allTasks.length, '项目数量:', allProjects.length)
  
  // 构建树形数据结构
  const treeData = [];
  
  // 1. 为每个项目创建节点
  allProjects.forEach(project => {
    const projectTasks = allTasks.filter(task => task.projectId === project.id);
    const pendingTasks = projectTasks.filter(task => !task.isCompleted);
    const completedTasks = projectTasks.filter(task => task.isCompleted);
    
             treeData.push({
           id: `project_${project.id}`,
           label: project.name,
           type: 'project',
           projectId: project.id,
           'data-type': 'project',
           children: [
             {
               id: `pending_${project.id}`,
               label: `未完成任务 (${pendingTasks.length})`,
               type: 'status-group',
               status: 'pending',
               projectId: project.id,
               'data-type': 'status-group',
               children: pendingTasks.map(task => ({
                 id: task.id,
                 label: `⏳ ${task.name}`,
                 type: 'task',
                 'data-type': 'task',
                 task: task
               }))
             },
             {
               id: `completed_${project.id}`,
               label: `已完成任务 (${completedTasks.length})`,
               type: 'status-group',
               status: 'completed',
               projectId: project.id,
               'data-type': 'status-group',
               children: completedTasks.map(task => ({
                 id: task.id,
                 label: `✅ ${task.name}`,
                 type: 'task',
                 'data-type': 'task',
                 task: task
               }))
             }
           ]
         });
  });
  
  // 2. 添加未分配项目的任务
  const unassignedTasks = allTasks.filter(task => !task.projectId);
  const unassignedPending = unassignedTasks.filter(task => !task.isCompleted);
  const unassignedCompleted = unassignedTasks.filter(task => task.isCompleted);
  
  if (unassignedTasks.length > 0) {
         treeData.push({
       id: 'unassigned',
       label: '未分配项目',
       type: 'unassigned-group',
       'data-type': 'unassigned-group',
       children: [
         {
           id: 'unassigned_pending',
           label: `未完成任务 (${unassignedPending.length})`,
           type: 'status-group',
           status: 'pending',
           'data-type': 'status-group',
           children: unassignedPending.map(task => ({
             id: task.id,
             label: `⏳ ${task.name}`,
             type: 'task',
             'data-type': 'task',
             task: task
           }))
         },
         {
           id: 'unassigned_completed',
           label: `已完成任务 (${unassignedCompleted.length})`,
           type: 'status-group',
           status: 'completed',
           'data-type': 'status-group',
           children: unassignedCompleted.map(task => ({
             id: task.id,
             label: `✅ ${task.name}`,
             type: 'task',
             'data-type': 'task',
             task: task
           }))
         }
       ]
     });
  }
  
  taskTreeData.value = treeData;
  tasks.value = allTasks;
  console.log('[TimerPage] loadTasks: 树形数据构建完成:', treeData)
}

function onTaskChange() {
  // 检查选中的是否是任务节点
  if (selectedTaskId.value) {
    // 递归查找选中的节点
    const findNode = (nodes: any[]): any => {
      for (const node of nodes) {
        if (node.id === selectedTaskId.value) {
          return node;
        }
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const selectedNode = findNode(taskTreeData.value);
    
    if (selectedNode && selectedNode.type === 'task') {
      ElMessage.success(`已选择任务：${selectedNode.task.name}`);
    } else if (selectedNode && (selectedNode.type === 'project' || selectedNode.type === 'status-group' || selectedNode.type === 'unassigned-group')) {
      // 如果选择了项目或状态组，清空选择
      selectedTaskId.value = null;
      ElMessage.warning('请选择具体的任务，而不是项目或状态组');
    }
  }
}

// 创建新任务处理
async function onCreateTask(inputValue: string) {
  if (!inputValue || inputValue.trim() === '') return;
  
  try {
    // 创建新任务
    const newTask = await taskDB.create({
      name: inputValue.trim(),
      description: '',
      projectId: null,
      status: 'active',
      priority: 'medium',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    // 重新加载任务列表以更新树形数据
    await loadTasks();
    
    // 选择新创建的任务
    selectedTaskId.value = newTask.id;
    
    ElMessage.success(`已创建并选择新任务：${newTask.name}`);
  } catch (error) {
    ElMessage.error('创建任务失败');
    console.error('创建任务失败:', error);
  }
}



const TIMER_STATE_KEY = 'taskmap-timer-state';

function saveTimerState() {
  const state = {
    selectedTaskId: selectedTaskId.value,
    status: isRunning.value ? 'running' : (isPaused.value ? 'paused' : 'stopped'),
    startTime: startTime.value,
    elapsedSeconds: elapsedSeconds.value,
    lastUpdate: Date.now()
  };
  console.log('[Timer] 保存状态', JSON.stringify(state));
  localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
}

function clearTimerState() {
  localStorage.removeItem(TIMER_STATE_KEY);
}

function restoreTimerState() {
  const state = JSON.parse(localStorage.getItem(TIMER_STATE_KEY) || '{}');
  if (state.selectedTaskId) {
    selectedTaskId.value = state.selectedTaskId;
    console.log('[TimerPage] 恢复选中的任务ID:', state.selectedTaskId);
  }
  if (typeof state.startTime === 'number') startTime.value = state.startTime;

  // 默认
  isRunning.value = false;
  isPaused.value = false;

  if (state.status === 'running') {
    // 补算离开期间的时间
    const now = Date.now();
    const delta = Math.floor((now - (state.lastUpdate || now)) / 1000);
    elapsedSeconds.value = (state.elapsedSeconds || 0) + delta;
    isRunning.value = true;
    isPaused.value = false;
  } else if (state.status === 'paused') {
    elapsedSeconds.value = state.elapsedSeconds || 0;
    isRunning.value = false;
    isPaused.value = true;
  } else {
    elapsedSeconds.value = state.elapsedSeconds || 0;
    isRunning.value = false;
    isPaused.value = false;
  }
}



const formattedTime = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60).toString().padStart(2, '0');
  const s = (elapsedSeconds.value % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

const progressPercentage = computed(() => {
  // 一圈一分钟
  return Math.min(100, Math.round((elapsedSeconds.value % 60) / 60 * 100));
});

const statusText = computed(() => {
  if (isRunning.value) return '计时中';
  if (isPaused.value) return '已暂停';
  return '未开始';
});



async function endTimer() {
  console.log('[TimerPage] endTimer 被调用')
  console.log('[TimerPage] currentRecord:', currentRecord.value)
  console.log('[TimerPage] segments:', segments.value)
  console.log('[TimerPage] isRunning:', isRunning.value, 'isPaused:', isPaused.value)
  
  if (!currentRecord.value) {
    console.log('[TimerPage] 没有当前记录，直接重置计时器')
    resetTimer();
    return;
  }
  
  // 结束最后一个片段
  if (segments.value.length > 0) {
    const lastSegment = segments.value[segments.value.length - 1];
    const endTime = Date.now();
    lastSegment.endTime = endTime;
    lastSegment.duration = Math.floor((endTime - lastSegment.startTime) / 1000);
  }
  
  // 计算总时长（所有片段的总和）
  const totalDuration = segments.value.reduce((sum, segment) => sum + segment.duration, 0);
  console.log('[TimerPage] 计算的总时长:', totalDuration)
  
  // 创建完整的专注记录
  const newRecord = {
    ...currentRecord.value,
    endTime: Date.now(),
    totalDuration: totalDuration,
    segments: [...segments.value],
    status: 'finished',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  console.log('[TimerPage] 准备保存的专注记录:', newRecord)
  
  try {
    // 写入数据库
    const savedRecord = await timerRecordDB.create(newRecord);
    console.log('[TimerPage] 专注记录保存成功:', savedRecord)
  } catch (error) {
    console.error('[TimerPage] 保存专注记录失败:', error)
    ElMessage.error('保存专注记录失败')
    return
  }
  
  resetTimer();
  
  // 刷新历史记录
  if (focusHistoryRef.value && focusHistoryRef.value.loadRecords) {
    focusHistoryRef.value.loadRecords();
  }
  
  ElMessage.success(`专注完成，总时长: ${formatDuration(totalDuration)}`);
}

// 重置计时器
function resetTimer() {
  isRunning.value = false;
  isPaused.value = false;
  elapsedSeconds.value = 0;
  totalPausedTime.value = 0;
  currentRecord.value = null;
  segments.value = [];
  
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  
  clearTimerState();
}

// 格式化时长
function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h > 0) return `${h}h${mm}m`;
  return `${m}m`;
}

const showAddFocusDialog = ref(false);

function handleRecordAdded() {
  // 刷新专注历史记录
  if (focusHistoryRef.value && focusHistoryRef.value.loadRecords) {
    focusHistoryRef.value.loadRecords();
  }
}

onMounted(async () => {
  await loadTasks();
  restoreTimerState();
  
  // 如果恢复后是running，自动启动interval
  if (isRunning.value) {
    console.log('[TimerPage] 恢复运行状态，选中的任务:', selectedTask.value);
    
    // 重新创建当前记录和片段（如果状态恢复后是running）
    if (!currentRecord.value && selectedTask.value) {
      currentRecord.value = {
        taskId: selectedTask.value.id,
        taskName: selectedTask.value.name,
        startTime: startTime.value,
        segments: [],
        status: 'running'
      };
      
      // 创建片段
      segments.value = [{
        id: generateSegmentId(),
        startTime: startTime.value,
        duration: elapsedSeconds.value
      }];
      
      console.log('[TimerPage] 重新创建了当前记录:', currentRecord.value);
    }
    
    if (timerId) clearInterval(timerId);
    timerId = window.setInterval(() => {
      elapsedSeconds.value++;
      // 无限计时，不再有上限
      saveTimerState();
    }, 1000);
  }
  // 只监听在 App.vue 转发过来的专用事件，避免潜在循环
  eventBus.on('start-task-timer-activate', async (taskId: string) => {
    console.log('[TimerPage] 接收到 start-task-timer-activate 事件:', taskId)
    
    // 确保任务数据已加载
    if (taskTreeData.value.length === 0) {
      console.log('[TimerPage] 任务数据未加载，正在加载...')
      await loadTasks()
    }
    
    if (selectedTaskId.value !== taskId) {
      console.log('[TimerPage] 设置选中的任务ID:', taskId)
      selectedTaskId.value = taskId
    }
    
    // 等待下一个 tick，确保 selectedTask 计算属性已更新
    await nextTick()
    
    if (!isRunning.value) {
      console.log('[TimerPage] 开始计时，选中的任务:', selectedTask.value)
      await startTimer()
    } else {
      console.log('[TimerPage] 计时器已在运行中')
    }
  })
});

onUnmounted(() => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  saveTimerState(); // 只保存当前状态
});
</script>

<style lang="scss" scoped>
.timer-page {
  width: 100%;
  min-width: 320px;
  padding: 8px 0;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.add-focus-btn {
  height: 32px;
  font-size: 15px;
}

.page-header {
  margin-bottom: 16px;
  padding: 0 4px;
  h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
    color: inherit;
  }
  p {
    margin: 0;
    font-size: 12px;
    color: #7f8c8d;
  }
}

.page-content {
  .task-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
  .selected-task-name {
    margin-top: 6px;
    font-size: 15px;
    color: #3498db;
    font-weight: 500;
  }
  
  // 树形选择器样式重置和优化
  :deep(.el-tree-select) {
    // 重置基础样式
    .el-tree-select__popper {
      max-height: 300px;
      background: #fff;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
    
    // 重置输入框样式
    .el-input__wrapper {
      background: #fff;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      box-shadow: none;
      
      &:hover {
        border-color: #c0c4cc;
      }
      
      &.is-focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }
    
    // 重置输入框文字样式
    .el-input__inner {
      color: #606266;
      font-size: 14px;
      line-height: 1.5;
    }
    
    // 重置占位符样式
    .el-input__inner::placeholder {
      color: #c0c4cc;
    }
    
    // 重置清除按钮样式
    .el-input__suffix {
      .el-input__suffix-inner {
        .el-select__caret {
          color: #c0c4cc;
        }
        
        .el-input__clear {
          color: #c0c4cc;
          
          &:hover {
            color: #909399;
          }
        }
      }
    }
  }
  
  // 树形选择器下拉面板样式重置
  :deep(.el-tree-select__popper) {
    .el-tree {
      background: #fff;
      color: #606266;
      font-size: 14px;
      
      // 重置树节点样式
      .el-tree-node {
        .el-tree-node__content {
          height: 34px;
          line-height: 34px;
          padding: 0 8px;
          
          &:hover {
            background: #f5f7fa;
          }
          
          // 重置展开/收起图标
          .el-tree-node__expand-icon {
            color: #c0c4cc;
            font-size: 12px;
            
            &.expanded {
              transform: rotate(90deg);
            }
          }
          
          // 重置节点标签
          .el-tree-node__label {
            color: #606266;
            font-size: 14px;
            font-weight: normal;
          }
          
          // 重置复选框样式（如果有）
          .el-checkbox {
            .el-checkbox__input {
              .el-checkbox__inner {
                border-color: #dcdfe6;
                background: #fff;
              }
            }
          }
        }
        
        // 重置子节点缩进
        .el-tree-node__children {
          .el-tree-node__content {
            padding-left: 24px;
          }
        }
      }
      
      // 重置项目节点样式
      .el-tree-node[data-type="project"] {
        .el-tree-node__content {
          background: #f8f9fa;
          border-bottom: 1px solid #ebeef5;
          
          .el-tree-node__label {
            font-weight: 600;
            color: #303133;
          }
        }
      }
      
      // 重置状态组节点样式
      .el-tree-node[data-type="status-group"] {
        .el-tree-node__content {
          background: #fafafa;
          
          .el-tree-node__label {
            font-weight: 500;
            color: #606266;
          }
        }
      }
      
      // 重置任务节点样式
      .el-tree-node[data-type="task"] {
        .el-tree-node__content {
          .el-tree-node__label {
            color: #303133;
          }
        }
      }
    }
  }
}
  .timer-display {
    text-align: center;
    margin-bottom: 20px;
    padding: 16px;
    background: rgba(52, 152, 219, 0.1);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .timer-status {
      margin: 16px 0 8px 0;
      font-size: 18px;
      color: #7f8c8d;
    }
    .timer-controls {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 8px;
    }
  }
}
.focus-history-section {
  margin-top: 32px;
}
.timer-header-row {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}
.timer-main-panel {
  flex: 1;
}
  .add-focus-btn-panel {
    display: flex;
    align-items: center;
    margin-top: 32px;
  }
  
  // 全局样式隔离 - 确保树形选择器不受外部样式影响
  :deep(.el-tree-select) {
    // 强制重置所有可能的继承样式
    * {
      box-sizing: border-box;
    }
    
    // 重置可能的全局字体设置
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    
    // 确保下拉面板在最上层
    .el-tree-select__popper {
      z-index: 3000 !important;
    }
  }
  
  // 暗色主题下的样式重置
  :deep([data-theme="dark"] .el-tree-select) {
    .el-tree-select__popper {
      background: #23272f;
      border-color: #2a2e32;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
    }
    
    .el-input__wrapper {
      background: #23272f;
      border-color: #2a2e32;
      color: #e8eaed;
      
      &:hover {
        border-color: #3a3e42;
      }
      
      &.is-focus {
        border-color: #6cb4ff;
        box-shadow: 0 0 0 2px rgba(108, 180, 255, 0.2);
      }
    }
    
    .el-input__inner {
      color: #e8eaed;
      background: transparent;
    }
    
    .el-input__inner::placeholder {
      color: #7a7d85;
    }
    
    .el-input__suffix {
      .el-input__suffix-inner {
        .el-select__caret {
          color: #7a7d85;
        }
        
        .el-input__clear {
          color: #7a7d85;
          
          &:hover {
            color: #9ca3af;
          }
        }
      }
    }
  }
  
  :deep([data-theme="dark"] .el-tree-select__popper) {
    .el-tree {
      background: #23272f;
      color: #e8eaed;
      
      .el-tree-node {
        .el-tree-node__content {
          &:hover {
            background: #2a2e32;
          }
          
          .el-tree-node__expand-icon {
            color: #7a7d85;
          }
          
          .el-tree-node__label {
            color: #e8eaed;
          }
        }
      }
      
      .el-tree-node[data-type="project"] {
        .el-tree-node__content {
          background: #1a1d23;
          border-bottom-color: #2a2e32;
          
          .el-tree-node__label {
            color: #e8eaed;
          }
        }
      }
      
      .el-tree-node[data-type="status-group"] {
        .el-tree-node__content {
          background: #1f2329;
          
          .el-tree-node__label {
            color: #c1c7cd;
          }
        }
      }
      
      .el-tree-node[data-type="task"] {
        .el-tree-node__content {
          .el-tree-node__label {
            color: #e8eaed;
          }
        }
      }
    }
  }
</style> 