<template>
  <el-timeline-item
    type="primary"
    color="#347cff"
    :icon="TimerIcon"
    class="focus-history-card"
  >
    <div class="focus-card-row">
      <div class="focus-card-main">
        <div class="focus-task">{{ taskName }}</div>
        <div v-for="record in records" :key="record.id" class="focus-record-row" @click="onClick(record)">
          <div class="focus-time-range">{{ timeRange(record) }}</div>
          <div class="focus-duration">{{ duration(record) }}</div>
          <div class="focus-note" v-if="record.note">{{ record.note }}</div>
        </div>
      </div>
    </div>
  </el-timeline-item>
</template>
<script setup lang="ts">
import { Timer } from '@element-plus/icons-vue';
import { computed } from 'vue';
const TimerIcon = Timer;
const props = defineProps<{ records: any[], taskName: string }>();
const emit = defineEmits(['show-detail']);
function timeRange(record: any) {
  const s = new Date(record.startTime);
  const e = new Date(record.endTime);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const sameDay = s.toDateString() === e.toDateString();
  if (sameDay) {
    return `${pad(s.getHours())}:${pad(s.getMinutes())} - ${pad(e.getHours())}:${pad(e.getMinutes())}`;
  } else {
    return `${s.getMonth() + 1}/${s.getDate()} ${pad(s.getHours())}:${pad(s.getMinutes())} - ${e.getMonth() + 1}/${e.getDate()} ${pad(e.getHours())}:${pad(e.getMinutes())}`;
  }
}
function duration(record: any) {
  const sec = record.duration || 0;
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (s === 0) return `${m}m`;
  return `${m}m${s}s`;
}
function onClick(record: any) {
  emit('show-detail', record);
}
</script>
<style scoped>
.focus-history-card {
  cursor: pointer;
}
.focus-card-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
}
.focus-card-main {
  flex: 1;
  min-width: 0;
}
.focus-task {
  font-size: 15px;
  color: #fff;
  font-weight: 600;
  margin-top: 2px;
  margin-bottom: 6px;
}
.focus-record-row {
  margin-bottom: 6px;
  padding: 6px 0;
  border-bottom: 1px dashed #2d3a4a22;
}
.focus-record-row:last-child {
  border-bottom: none;
}
.focus-note {
  font-size: 13px;
  color: #aaa;
  margin-top: 2px;
  white-space: pre-line;
}
.focus-time-range {
  font-size: 13px;
  color: #aaa;
}
.focus-duration {
  font-size: 15px;
  color: #fff;
  font-weight: 600;
  margin-left: 8px;
  display: inline-block;
}
</style> 