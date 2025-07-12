<template>
  <div class="timer-page">
    <div class="header-row">
      <h3>任务计时</h3>
      <el-button type="primary" class="add-focus-btn" @click="showAddFocusDialog = true">添加专注记录</el-button>
    </div>
    <div class="page-content">
      <div class="task-selector">
        <el-select
          v-model="selectedTaskId"
          filterable
          clearable
          placeholder="选择任务"
          style="width: 220px"
          @change="onTaskChange"
        >
          <el-option
            v-for="task in tasks"
            :key="task.id"
            :label="task.name"
            :value="task.id"
          />
        </el-select>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { taskDB, timerRecordDB } from '@/utils/dbManager';
import FocusHistoryPage from './FocusHistoryPage.vue';
import AddFocusRecordDialog from './AddFocusRecordDialog.vue';
import { ref as vueRef } from 'vue';
import { eventBus } from '@/utils/eventBus'
const focusHistoryRef = vueRef();

const elapsedSeconds = ref(0);
const isRunning = ref(false);
const isPaused = ref(false);
let timerId: number | null = null;

// 任务选择相关
const tasks = ref<any[]>([]);
const selectedTaskId = ref<string | null>(null);
const selectedTask = computed(() => tasks.value.find(t => t.id === selectedTaskId.value) || null);

async function loadTasks() {
  tasks.value = await taskDB.getAll();
}

function onTaskChange() {
  if (selectedTask.value) {
    ElMessage.success(`已选择任务：${selectedTask.value.name}`);
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
  if (state.selectedTaskId) selectedTaskId.value = state.selectedTaskId;
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

// 记录计时开始时间
const startTime = ref<number | null>(null);

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

function startTimer() {
  if (isRunning.value) return;
  isRunning.value = true;
  isPaused.value = false;
  if (!startTime.value) startTime.value = Date.now() - elapsedSeconds.value * 1000;
  if (timerId) clearInterval(timerId);
  timerId = window.setInterval(() => {
    elapsedSeconds.value++;
    // 无限计时，不再有上限
    saveTimerState();
  }, 1000);
  saveTimerState();
}

function pauseTimer() {
  if (!isRunning.value) return;
  isRunning.value = false;
  isPaused.value = true;
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  saveTimerState();
}

function resumeTimer() {
  if (!isPaused.value) return;
  isRunning.value = true;
  isPaused.value = false;
  if (timerId) clearInterval(timerId);
  timerId = window.setInterval(() => {
    elapsedSeconds.value++;
    // 无限计时，不再有上限
    saveTimerState();
  }, 1000);
  saveTimerState();
}

function resetTimer() {
  stopTimer();
  elapsedSeconds.value = 0;
  isPaused.value = false;
  startTime.value = null;
  clearTimerState();
}

function stopTimer() {
  isRunning.value = false;
  isPaused.value = false;
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  clearTimerState();
}

async function endTimer() {
  // 写入数据库
  let newRecord = null;
  if (selectedTask.value && elapsedSeconds.value > 0) {
    newRecord = {
      taskId: selectedTask.value.id,
      taskName: selectedTask.value.name,
      startTime: startTime.value,
      endTime: Date.now(),
      duration: elapsedSeconds.value,
      status: 'finished',
    };
    await timerRecordDB.create(newRecord);
  }
  resetTimer();
  // 只刷新历史，不再重复写入
  if (focusHistoryRef.value && focusHistoryRef.value.loadRecords) {
    focusHistoryRef.value.loadRecords();
  }
}

const showAddFocusDialog = ref(false);

function handleRecordAdded(record: any) {
  // 刷新专注历史记录
  if (focusHistoryRef.value && focusHistoryRef.value.loadRecords) {
    focusHistoryRef.value.loadRecords();
  }
}

onMounted(() => {
  loadTasks();
  restoreTimerState();
  // 如果恢复后是running，自动启动interval
  if (isRunning.value) {
    if (timerId) clearInterval(timerId);
    timerId = window.setInterval(() => {
      elapsedSeconds.value++;
      // 无限计时，不再有上限
      saveTimerState();
    }, 1000);
  }
  eventBus.on && eventBus.on('start-task-timer', (taskId: string) => {
    if (selectedTaskId.value !== taskId) {
      selectedTaskId.value = taskId
    }
    if (!isRunning.value) {
      startTimer()
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
</style> 