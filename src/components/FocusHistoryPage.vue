<template>
  <div class="focus-history-page">
    <div class="focus-stats">
      <div class="stat-card">
        <div class="stat-title">今日专注时长</div>
        <div class="stat-value">{{ todayDuration }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">总专注时长</div>
        <div class="stat-value">{{ totalDuration }}</div>
      </div>
      <el-button v-if="showClearBtn" type="danger" size="small" style="margin-left:24px;" @click="onClearRecords">清空专注记录</el-button>
    </div>
    <div class="focus-history">
      <div v-for="(taskGroups, date) in groupedRecords" :key="date" class="focus-day-group">
        <div class="focus-date">{{ date }}</div>
        <el-timeline>
          <FocusHistoryCard
            v-for="group in taskGroups"
            :key="group.taskId"
            :task-name="group.taskName"
            :records="group.records"
            @show-detail="onShowDetail"
          />
        </el-timeline>
      </div>
    </div>
    <el-dialog v-model="showDetailDialog" title="专注记录" width="420px">
      <template v-if="detailRecord">
        <div style="display:flex;align-items:center;gap:8px;">
          <el-icon color="#347cff"><Timer /></el-icon>
          <span style="font-size:18px;font-weight:600;">{{ detailRecord.taskName }}</span>
        </div>
        <div style="margin:12px 0 4px 0;color:#aaa;">
          <el-icon><Clock /></el-icon>
          {{ formatRelative(detailRecord.startTime) }} {{ formatDateTime(detailRecord.startTime) }} - {{ formatTime(detailRecord.endTime) }}
        </div>
        <div style="color:#aaa;margin-bottom:8px;">
          <el-icon><Timer /></el-icon>
          {{ formatDuration(detailRecord.duration) }}
        </div>
        <el-input
          v-model="detailRecord.note"
          type="textarea"
          rows="3"
          placeholder="记录你的想法..."
          style="margin-top:12px;"
        />
      </template>
      <template #footer>
        <el-button type="danger" @click="onDeleteDetail">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineExpose } from 'vue';
import { timerRecordDB, taskDB } from '@/utils/dbManager';
import FocusHistoryCard from './FocusHistoryCard.vue';
import { Timer, Clock, Delete } from '@element-plus/icons-vue';
const showDetailDialog = ref(false);
const detailRecord = ref<any>(null);
function onShowDetail(record: any) {
  detailRecord.value = { ...record };
  showDetailDialog.value = true;
}
function formatDateTime(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
function formatRelative(ts: number) {
  // 可用 dayjs 或自定义实现“8个月前”效果
  return '';
}

const timerRecords = ref<any[]>([]);
const showAddDialog = ref(false);
const tasks = ref<any[]>([]);
const addForm = ref({
  taskId: '',
  startTime: '',
  endTime: '',
  type: 'normal',
  note: ''
});

async function loadRecords() {
  // 始终从数据库读取，保证刷新后数据不丢失
  timerRecords.value = (await timerRecordDB.getAll()).filter(r => r.status === 'finished');
}

async function loadTasks() {
  tasks.value = await taskDB.getAll();
}

async function addRecord(record: any) {
  // 先写入数据库，再刷新列表
  await timerRecordDB.create(record);
  await loadRecords();
}

defineExpose({ addRecord, loadRecords });

onMounted(() => {
  loadRecords();
  loadTasks();
});

function formatDate(dateStrOrNum: string | number) {
  const d = new Date(dateStrOrNum);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatTimeRange(start: string | number, end: string | number) {
  const s = new Date(start);
  const e = new Date(end);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(s.getHours())}:${pad(s.getMinutes())} - ${pad(e.getHours())}:${pad(e.getMinutes())}`;
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h > 0) return `${h}h${mm}m`;
  return `${m}m`;
}

// 保证 groupedRecords 来源于 timerRecords.value 的全部内容，且无任何筛选，仅按日期和任务分组
const groupedRecords = computed(() => {
  // 先按日期分组，再按taskId分组
  const groups: Record<string, Record<string, { taskId: string, taskName: string, records: any[] }>> = {};
  for (const rec of timerRecords.value) {
    const date = formatDate(rec.startTime);
    if (!groups[date]) groups[date] = {};
    if (!groups[date][rec.taskId]) {
      groups[date][rec.taskId] = {
        taskId: rec.taskId,
        taskName: rec.taskName,
        records: []
      };
    }
    groups[date][rec.taskId].records.push(rec);
  }
  // 转为数组结构并按日期倒序
  const result: Record<string, any[]> = {};
  for (const date in groups) {
    result[date] = Object.values(groups[date]);
  }
  return Object.fromEntries(
    Object.entries(result).sort((a, b) => {
      // 取每组第一个记录的startTime进行排序
      const aTime = a[1][0]?.records[0]?.startTime || 0;
      const bTime = b[1][0]?.records[0]?.startTime || 0;
      return bTime - aTime;
    })
  );
});

// 统计
const today = new Date();
today.setHours(0, 0, 0, 0);
const todayStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
// 重新计算今日所有任务的专注记录
const todayRecords = computed(() => timerRecords.value.filter(r => formatDate(r.startTime) === todayStr));
const todayDuration = computed(() => formatDuration(todayRecords.value.reduce((sum, r) => sum + (r.duration || 0), 0)));
const totalDuration = computed(() => formatDuration(timerRecords.value.reduce((sum, r) => sum + (r.duration || 0), 0)));

async function onAddConfirm() {
  if (!addForm.value.taskId || !addForm.value.startTime || !addForm.value.endTime) return;
  const task = tasks.value.find(t => t.id === addForm.value.taskId);
  const start = new Date(addForm.value.startTime).getTime();
  const end = new Date(addForm.value.endTime).getTime();
  const duration = Math.floor((end - start) / 1000);
  const record = {
    taskId: addForm.value.taskId,
    taskName: task ? task.name : '',
    startTime: start,
    endTime: end,
    duration,
    status: 'finished',
    note: addForm.value.note,
    type: addForm.value.type
  };
  await timerRecordDB.create(record);
  addRecord(record);
  showAddDialog.value = false;
  addForm.value = { taskId: '', startTime: '', endTime: '', type: 'normal', note: '' };
}

async function onDeleteDetail() {
  if (detailRecord.value && detailRecord.value.id) {
    await timerRecordDB.delete(detailRecord.value.id);
    // 从本地移除
    const idx = timerRecords.value.findIndex(r => r.id === detailRecord.value.id);
    if (idx !== -1) timerRecords.value.splice(idx, 1);
    showDetailDialog.value = false;
  }
}

const showClearBtn = import.meta.env.MODE === 'development';
async function onClearRecords() {
  await timerRecordDB.clear();
  await loadRecords();
}
</script>

<style scoped>
.focus-history-page {
  padding: 24px 0 0 0;
  max-width: 700px;
  margin: 0 auto;
}
.focus-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}
.add-btn {
  margin-left: 18px;
  height: 38px;
}
.focus-stats {
  display: flex;
  gap: 18px;
  margin-bottom: 0;
}
.stat-card {
  background: #181c20;
  border-radius: 12px;
  padding: 18px 24px;
  flex: 1;
  text-align: center;
  box-shadow: 0 2px 8px #0002;
}
.stat-title {
  font-size: 15px;
  color: #aaa;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #fff;
}
.focus-history {
  margin-top: 12px;
}
.focus-day-group {
  margin-bottom: 32px;
}
.focus-date {
  font-size: 17px;
  color: #6cb4ff;
  font-weight: 600;
  margin-bottom: 12px;
}
.focus-task {
  font-size: 15px;
  color: #fff;
  font-weight: 600;
  margin-top: 2px;
}
.focus-note {
  font-size: 13px;
  color: #aaa;
  margin-top: 2px;
  white-space: pre-line;
}
.focus-duration {
  font-size: 15px;
  color: #aaa;
  margin-top: 2px;
}
</style> 