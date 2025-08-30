<template>
  <!-- 每条专注记录都独立显示 -->
  <el-timeline-item
    type="primary"
    color="#347cff"
    :icon="TimerIcon"
    class="focus-history-card"
    @click="onClick"
  >
    <div class="focus-card-row">
      <div class="focus-card-main">
        <div class="focus-task">{{ taskName }}</div>
        <div class="focus-time-range">{{ formatTimeRange(props.records[0]) }}</div>
                 <div v-if="hasMultipleSegments(props.records[0])" class="segment-info">
           {{ getSegmentCount(props.records[0]) }} 次专注
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

// 格式化时间范围（支持多段记录）
function formatTimeRange(record: any) {
  if (!record) return '';
  
  // 如果有segments字段，说明是多段记录
  if (record.segments && record.segments.length > 0) {
    const firstSegment = record.segments[0];
    const lastSegment = record.segments[record.segments.length - 1];
    
    const startDate = new Date(firstSegment.startTime);
    const endDate = new Date(lastSegment.endTime);
    
    const formatTime = (date: Date) => {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };
    
    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
  }
  
  // 兼容旧格式：直接使用startTime和endTime
  if (record.startTime && record.endTime) {
    const startDate = new Date(record.startTime);
    const endDate = new Date(record.endTime);
    
    const formatTime = (date: Date) => {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };
    
    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
  }
  
  return '';
}

// 检查是否有多个专注片段
function hasMultipleSegments(record: any) {
  return record.segments && record.segments.length > 1;
}

// 获取专注片段数量
function getSegmentCount(record: any) {
  if (record.segments && record.segments.length > 0) {
    return record.segments.length;
  }
  return 1; // 如果没有segments字段，默认为1个片段
}

function onClick() {
  // 计算总时长
  const totalSeconds = props.records.reduce((sum, record) => sum + (record.duration || 0), 0);
  const m = Math.floor(totalSeconds / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const totalDuration = h > 0 ? `${h}h${mm}m` : `${m}m`;
  
  // 传递所有记录到详情页面
  emit('show-detail', {
    taskName: props.taskName,
    records: props.records,
    totalDuration: totalDuration
  });
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
.focus-time-range {
  font-size: 14px;
  color: #aaa;
  margin-top: 4px;
}

.segment-indicator {
  font-size: 12px;
  color: #888;
  font-weight: normal;
  margin-left: 8px;
}

.segment-info {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}
</style> 