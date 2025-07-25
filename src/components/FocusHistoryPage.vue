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
    
    <!-- 日期选择器 -->
    <div class="date-selector">
      <el-date-picker
        v-model="selectedDate"
        type="date"
        placeholder="选择日期查看专注记录"
        format="YYYY年MM月DD日"
        value-format="YYYY-MM-DD"
        :disabled-date="disabledDate"
        @change="onDateChange"
        style="width: 100%;"
      />
    </div>
    
    <!-- 选中日期的专注记录 -->
    <div v-if="selectedDateRecords.length > 0" class="selected-date-records">
      <div class="date-header">
        <span class="date-title">{{ formatSelectedDate(selectedDate) }} 的专注记录</span>
        <span class="date-duration">总时长: {{ formatDuration(selectedDateTotalDuration) }}</span>
      </div>
      <el-timeline>
        <FocusHistoryCard
          v-for="group in selectedDateRecords"
          :key="group.taskId"
          :task-name="group.taskName"
          :records="group.records"
          @show-detail="onShowDetail"
        />
      </el-timeline>
    </div>
    
    <!-- 无记录提示 -->
    <div v-else-if="selectedDate" class="no-records">
      <el-empty description="该日期暂无专注记录" />
    </div>
    
    <!-- 默认提示 -->
    <div v-else class="default-hint">
      <el-empty description="请选择日期查看专注记录" />
    </div>
    
    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetailDialog" title="专注记录详情" width="480px">
      <template v-if="detailRecord">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
          <el-icon color="#347cff"><Timer /></el-icon>
          <span style="font-size:18px;font-weight:600;">{{ detailRecord.taskName }}</span>
        </div>
        
        <div style="margin-bottom:16px;padding:12px;background:#f5f5f5;border-radius:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:14px;color:#666;">总专注时长</span>
            <span style="font-size:16px;font-weight:600;color:#347cff;">{{ detailRecord.totalDuration }}</span>
          </div>
          <div style="margin-top:4px;font-size:12px;color:#999;">
            {{ detailRecord.records.length }} 次专注记录
          </div>
        </div>

        <div style="max-height:300px;overflow-y:auto;">
          <div v-for="(record, index) in detailRecord.records" :key="record.id" 
               style="margin-bottom:12px;padding:12px;border:1px solid #e4e7ed;border-radius:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:14px;font-weight:500;">第 {{ index + 1 }} 次专注</span>
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:14px;color:#347cff;font-weight:600;">{{ formatDuration(record.duration) }}</span>
                <el-button 
                  type="danger" 
                  size="small" 
                  text 
                  @click="onDeleteSingleRecord(record, index)"
                  style="padding:4px 8px;"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div style="font-size:13px;color:#666;margin-bottom:6px;">
              <el-icon><Clock /></el-icon>
              {{ formatDateTime(record.startTime) }} - {{ formatTime(record.endTime) }}
            </div>
            <div v-if="record.note" style="font-size:13px;color:#666;background:#fafafa;padding:8px;border-radius:4px;">
              {{ record.note }}
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <el-button type="danger" @click="onDeleteDetail">
          <el-icon><Delete /></el-icon>
          删除所有记录
        </el-button>
      </template>
    </el-dialog>
    <AddFocusRecordDialog v-model="showAddDialog" @record-added="handleRecordAdded" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineExpose } from 'vue';
import { timerRecordDB, taskDB } from '@/utils/dbManager';
import FocusHistoryCard from './FocusHistoryCard.vue';
import { Timer, Clock, Delete } from '@element-plus/icons-vue';
import AddFocusRecordDialog from './AddFocusRecordDialog.vue';
import { ElMessage } from 'element-plus';

const showDetailDialog = ref(false);
const detailRecord = ref<any>(null);
const selectedDate = ref<string>('');

// 获取所有有记录的日期
const allRecordDates = computed(() => {
  const dates = new Set<string>();
  timerRecords.value.forEach(record => {
    const date = new Date(record.startTime);
    dates.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
  });
  return Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
});

// 禁用没有记录的日期
function disabledDate(time: Date) {
  const dateStr = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')}`;
  return !allRecordDates.value.includes(dateStr);
}

// 选择日期
function onDateChange(date: string) {
  selectedDate.value = date;
}

// 格式化选中的日期
function formatSelectedDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 获取选中日期的记录
const selectedDateRecords = computed(() => {
  if (!selectedDate.value) return [];
  
  const groups: Record<string, { taskId: string, taskName: string, records: any[] }> = {};
  
  timerRecords.value.forEach(record => {
    const recordDate = new Date(record.startTime);
    const recordDateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
    
    if (recordDateStr === selectedDate.value) {
      if (!groups[record.taskId]) {
        groups[record.taskId] = {
          taskId: record.taskId,
          taskName: record.taskName,
          records: []
        };
      }
      groups[record.taskId].records.push(record);
    }
  });
  
  return Object.values(groups);
});

// 选中日期的总时长
const selectedDateTotalDuration = computed(() => {
  return selectedDateRecords.value.reduce((total, group) => {
    return total + group.records.reduce((sum, record) => sum + (record.duration || 0), 0);
  }, 0);
});

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

const timerRecords = ref<any[]>([]);
const showAddDialog = ref(false);
const tasks = ref<any[]>([]);

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

onMounted(async () => {
  // 设置默认日期为今天
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  selectedDate.value = todayStr;
  
  // 加载数据
  await loadRecords();
  await loadTasks();
});

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h > 0) return `${h}h${mm}m`;
  return `${m}m`;
}

// 统计
const today = new Date();
today.setHours(0, 0, 0, 0);
const todayStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
// 重新计算今日所有任务的专注记录
const todayRecords = computed(() => timerRecords.value.filter(r => {
  const recordDate = new Date(r.startTime);
  const recordDateStr = `${recordDate.getFullYear()}年${recordDate.getMonth() + 1}月${recordDate.getDate()}日`;
  return recordDateStr === todayStr;
}));
const todayDuration = computed(() => formatDuration(todayRecords.value.reduce((sum, r) => sum + (r.duration || 0), 0)));
const totalDuration = computed(() => formatDuration(timerRecords.value.reduce((sum, r) => sum + (r.duration || 0), 0)));

async function onDeleteDetail() {
  if (detailRecord.value && detailRecord.value.records) {
    try {
      // 删除该任务的所有专注记录
      for (const record of detailRecord.value.records) {
        await timerRecordDB.delete(record.id);
      }
      
      // 从本地移除这些记录
      const recordIds = detailRecord.value.records.map(r => r.id);
      timerRecords.value = timerRecords.value.filter(r => !recordIds.includes(r.id));
      
      showDetailDialog.value = false;
      ElMessage.success('已删除所有专注记录');
    } catch (error) {
      ElMessage.error('删除失败');
    }
  }
}

async function onDeleteSingleRecord(record: any, index: number) {
  try {
    await timerRecordDB.delete(record.id);
    
    // 从本地移除该记录
    detailRecord.value.records.splice(index, 1);
    
    // 从主列表中也移除该记录
    const recordIndex = timerRecords.value.findIndex(r => r.id === record.id);
    if (recordIndex !== -1) {
      timerRecords.value.splice(recordIndex, 1);
    }
    
    // 重新计算总时长
    const totalSeconds = detailRecord.value.records.reduce((sum, r) => sum + (r.duration || 0), 0);
    const m = Math.floor(totalSeconds / 60);
    const h = Math.floor(m / 60);
    const mm = m % 60;
    detailRecord.value.totalDuration = h > 0 ? `${h}h${mm}m` : `${m}m`;
    
    ElMessage.success('已删除专注记录');
    
    // 如果没有记录了，关闭弹窗
    if (detailRecord.value.records.length === 0) {
      showDetailDialog.value = false;
    }
  } catch (error) {
    ElMessage.error('删除失败');
  }
}

const showClearBtn = import.meta.env.MODE === 'development';
async function onClearRecords() {
  await timerRecordDB.clear();
  await loadRecords();
}

function handleRecordAdded(record: any) {
  addRecord(record);
}
</script>

<style scoped>
.focus-history-page {
  padding: 24px 0 0 0;
  max-width: 700px;
  margin: 0 auto;
}

.focus-stats {
  display: flex;
  gap: 18px;
  margin-bottom: 24px;
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

.date-selector {
  margin-bottom: 24px;
}

.selected-date-records {
  margin-bottom: 24px;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #181c20;
  border-radius: 8px;
}

.date-title {
  font-size: 16px;
  font-weight: 600;
  color: #6cb4ff;
}

.date-duration {
  font-size: 14px;
  color: #aaa;
}

.no-records,
.default-hint {
  text-align: center;
  padding: 40px 0;
}
</style> 