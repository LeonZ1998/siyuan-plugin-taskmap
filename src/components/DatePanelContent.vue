<template>
  <div class="date-panel-content">
    <div class="date-panel-header">
      <span class="date-panel-icon-bg">
        <el-icon class="date-panel-icon"><Calendar /></el-icon>
      </span>
      <span class="date-panel-date">{{ displayDate }}</span>
      <el-button link class="date-panel-clear" @click="$emit('clear')">清除</el-button>
    </div>
    <el-segmented v-model="localMode" :options="modeOptions" class="date-panel-segmented" />
    <div v-if="localMode === 'single'" class="date-panel-calendar">
      <el-calendar v-model="localSingleDate" :fullscreen="false" :locale="zhLocale" @input="onSingleDateChange" />
    </div>
    <div v-else class="date-panel-range-panel">
      <div class="date-panel-range-row">
        <div class="date-panel-range-block">
          <div class="date-panel-range-label">开始日期</div>
          <div class="date-panel-range-date">{{ rangeStartText }}</div>
          <div class="date-panel-range-desc">{{ rangeStartDesc }}</div>
        </div>
        <div class="date-panel-range-block">
          <div class="date-panel-range-label">结束日期</div>
          <div class="date-panel-range-date">{{ rangeEndText }}</div>
          <div class="date-panel-range-desc">{{ rangeEndDesc }}</div>
        </div>
      </div>
      <el-switch v-model="localUseTargetTime" class="date-panel-switch" active-text="使用项目时间" @change="onUseTargetTimeChange" />
      <el-divider />
      <el-row align="middle" class="date-panel-repeat-row">
        <el-col :span="12" class="date-panel-repeat-label">
          <el-icon><Refresh /></el-icon>
          设置循环
        </el-col>
        <el-col :span="12" class="date-panel-repeat-value">
          无循环
          <el-icon style="margin-left:4px"><ArrowRight /></el-icon>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Calendar, ArrowRight, Refresh } from '@element-plus/icons-vue'
import zhLocale from 'element-plus/dist/locale/zh-cn.mjs'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) }, // { mode, singleDate, range, useTargetTime }
  displayDate: { type: String, default: '' },
  rangeStartText: { type: String, default: '' },
  rangeStartDesc: { type: String, default: '' },
  rangeEndText: { type: String, default: '' },
  rangeEndDesc: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'clear'])

const modeOptions = [
  { label: '单日', value: 'single' },
  { label: '区间/循环', value: 'range' }
]

const localMode = ref(props.modelValue.mode || 'single')
const localSingleDate = ref(props.modelValue.singleDate || new Date())
const localUseTargetTime = ref(props.modelValue.useTargetTime || false)

watch(() => props.modelValue, (val) => {
  if (val.mode !== undefined) localMode.value = val.mode
  if (val.singleDate !== undefined) localSingleDate.value = val.singleDate
  if (val.useTargetTime !== undefined) localUseTargetTime.value = val.useTargetTime
})

watch(localMode, (val) => {
  emit('update:modelValue', { ...props.modelValue, mode: val })
})
watch(localSingleDate, (val) => {
  emit('update:modelValue', { ...props.modelValue, singleDate: val })
})
watch(localUseTargetTime, (val) => {
  emit('update:modelValue', { ...props.modelValue, useTargetTime: val })
})

function onSingleDateChange(val: Date) {
  localSingleDate.value = val
}
function onUseTargetTimeChange(val: boolean) {
  localUseTargetTime.value = val
}
</script>

<style scoped>
.date-panel-content {
  background: #23232a;
  border-radius: 14px;
  margin-top: 8px;
  padding: 0 0 8px 0;
  width: 520px;
  margin-left: auto;
  margin-right: auto;
}
.date-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px 8px 16px;
}
.date-panel-icon-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #ffd6b7 0%, #ffb199 100%);
  border-radius: 8px;
}
.date-panel-icon {
  color: #ff7e3f;
  font-size: 18px;
}
.date-panel-date {
  font-size: 16px;
  color: #bfc8dc;
  font-weight: 500;
  margin-left: 4px;
}
.date-panel-clear {
  margin-left: auto;
  color: #4e7fff;
  font-size: 15px;
  font-weight: 500;
}
.date-panel-segmented {
  margin: 0 16px 8px 16px;
}
.date-panel-calendar {
  background: #23232a;
  border-radius: 14px;
  padding: 8px 8px 0 8px;
}
.date-panel-range-panel {
  background: #23232a;
  border-radius: 14px;
  padding: 12px 12px 0 12px;
}
.date-panel-range-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}
.date-panel-range-block {
  flex: 1;
  background: #282838;
  border-radius: 10px;
  padding: 8px 10px;
  color: #bfc8dc;
}
.date-panel-range-label {
  font-size: 13px;
  color: #8fa3c8;
  margin-bottom: 2px;
}
.date-panel-range-date {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 2px;
}
.date-panel-range-desc {
  font-size: 12px;
  color: #8fa3c8;
}
.date-panel-switch {
  margin: 8px 0 0 0;
}
.date-panel-repeat-row {
  margin-top: 8px;
}
.date-panel-repeat-label {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #8fa3c8;
}
.date-panel-repeat-label .el-icon {
  margin-right: 6px;
}
.date-panel-repeat-value {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 15px;
  color: #bfc8dc;
}
</style> 