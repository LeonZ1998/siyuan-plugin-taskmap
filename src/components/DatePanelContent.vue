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
        <el-date-picker
          v-model="localRangeStart"
          type="date"
          placeholder="开始日期"
          style="width: 180px; margin-right: 12px;"
          :disabled-date="date => localRangeEnd && date.getTime() > new Date(localRangeEnd).getTime()"
          @change="onRangeStartChange"
          :locale="zhLocale"
        />
        <el-date-picker
          v-model="localRangeEnd"
          type="date"
          placeholder="结束日期"
          style="width: 180px;"
          :disabled-date="date => localRangeStart && date.getTime() < new Date(localRangeStart).getTime()"
          @change="onRangeEndChange"
          :locale="zhLocale"
        />
      </div>
      <el-switch v-model="localUseTargetTime" class="date-panel-switch" active-text="使用项目时间" @change="onUseTargetTimeChange" />
      <el-divider />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { Calendar, ArrowRight, Refresh } from '@element-plus/icons-vue'
import zhLocale from 'element-plus/dist/locale/zh-cn.mjs'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) }, // { mode, singleDate, range, useTargetTime }
  displayDate: { type: String, default: '' },
  rangeStartText: { type: String, default: '' },
  rangeStartDesc: { type: String, default: '' },
  rangeEndText: { type: String, default: '' },
  rangeEndDesc: { type: String, default: '' },
  projectStartDate: { type: [Date, String, Number], default: null },
  projectEndDate: { type: [Date, String, Number], default: null },
})
const emit = defineEmits(['update:modelValue', 'clear'])

const modeOptions = [
  { label: '单日', value: 'single' },
  { label: '区间', value: 'range' }
]

const localMode = ref(props.modelValue.mode || 'single')
const localSingleDate = ref(props.modelValue.singleDate || new Date())
const localUseTargetTime = ref(props.modelValue.useTargetTime || false)
const localRangeStart = ref(props.modelValue.rangeStart ? new Date(props.modelValue.rangeStart) : new Date())
const localRangeEnd = ref(props.modelValue.rangeEnd ? new Date(props.modelValue.rangeEnd) : new Date())
const showRangeCalendar = ref('') // 'start' | 'end' | ''

watch(() => props.modelValue, (val) => {
  if (val.mode !== undefined) localMode.value = val.mode
  if (val.singleDate !== undefined) localSingleDate.value = val.singleDate
  if (val.useTargetTime !== undefined) localUseTargetTime.value = val.useTargetTime
  if (val.rangeStart !== undefined) localRangeStart.value = val.rangeStart
  if (val.rangeEnd !== undefined) localRangeEnd.value = val.rangeEnd
})

watch(localMode, (val) => {
  if (val === 'single') {
    localSingleDate.value = localRangeStart.value || new Date()
  } else if (val === 'range') {
    localRangeStart.value = localSingleDate.value || new Date()
    localRangeEnd.value = localSingleDate.value || new Date()
  }
  emit('update:modelValue', { ...props.modelValue, mode: val })
})
watch(localSingleDate, (val) => {
  emit('update:modelValue', { ...props.modelValue, singleDate: val })
})
watch(localUseTargetTime, (val) => {
  emit('update:modelValue', { ...props.modelValue, useTargetTime: val })
  if (val && props.projectStartDate && props.projectEndDate) {
    localRangeStart.value = new Date(props.projectStartDate)
    localRangeEnd.value = new Date(props.projectEndDate)
  }
})
watch(localRangeStart, (val) => {
  emit('update:modelValue', { ...props.modelValue, rangeStart: val instanceof Date ? val : new Date(val) })
})
watch(localRangeEnd, (val) => {
  emit('update:modelValue', { ...props.modelValue, rangeEnd: val instanceof Date ? val : new Date(val) })
})

function onSingleDateChange(val: Date) {
  localSingleDate.value = val
}
function onUseTargetTimeChange(val) {
  localUseTargetTime.value = val
  emit('update:modelValue', { ...props.modelValue, useTargetTime: val })
  if (val && props.projectStartDate && props.projectEndDate) {
    localRangeStart.value = new Date(props.projectStartDate)
    localRangeEnd.value = new Date(props.projectEndDate)
  }
}
function onRangeStartChange(val) {
  if (localUseTargetTime.value) localUseTargetTime.value = false
  localRangeStart.value = val
}
function onRangeEndChange(val) {
  if (val <= localRangeStart.value) {
    ElMessage.error('结束日期必须晚于开始日期，请重新选择')
    localRangeEnd.value = null
    return
  }
  if (localUseTargetTime.value) localUseTargetTime.value = false
  localRangeEnd.value = val
}

const rangeStartText = computed(() => {
  const d = localRangeStart.value
  if (!d) return ''
  const date = new Date(d)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} 周一`
})
const rangeEndText = computed(() => {
  const d = localRangeEnd.value
  if (!d) return ''
  const date = new Date(d)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} 周二`
})

const displayDate = computed(() => {
  if (localMode.value === 'single') {
    const d = localSingleDate.value
    if (!d) return ''
    const date = new Date(d)
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  } else {
    const start = localRangeStart.value
    const end = localRangeEnd.value
    if (!start || !end) return ''
    const s = new Date(start)
    const e = new Date(end)
    return `${s.getFullYear()}/${s.getMonth() + 1}/${s.getDate()} - ${e.getFullYear()}/${e.getMonth() + 1}/${e.getDate()}`
  }
})
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
</style> 