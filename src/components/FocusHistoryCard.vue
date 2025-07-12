<template>
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
        <div class="focus-summary">
          <span class="focus-total-duration">{{ totalDuration }}</span>
          <span class="focus-record-count">{{ records.length }} 次专注</span>
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

// 计算总时长
const totalDuration = computed(() => {
  const totalSeconds = props.records.reduce((sum, record) => sum + (record.duration || 0), 0);
  const m = Math.floor(totalSeconds / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h > 0) return `${h}h${mm}m`;
  return `${m}m`;
});

function onClick() {
  // 传递所有记录到详情页面
  emit('show-detail', {
    taskName: props.taskName,
    records: props.records,
    totalDuration: totalDuration.value
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
.focus-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}
.focus-total-duration {
  font-size: 15px;
  color: #fff;
  font-weight: 600;
}
.focus-record-count {
  font-size: 13px;
  color: #aaa;
}
</style> 