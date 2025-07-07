<template>
  <el-dialog :model-value="modelValue" @close="onClose" width="480px" class="task-date-dialog" append-to-body>
    <DatePanelContent
      v-model="panelValue"
      :display-date="displayDate"
      :range-start-text="rangeStartText"
      :range-start-desc="rangeStartDesc"
      :range-end-text="rangeEndText"
      :range-end-desc="rangeEndDesc"
      @clear="onClear"
    />
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calendar, ArrowRight, Refresh } from '@element-plus/icons-vue'
import DatePanelContent from './DatePanelContent.vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'confirm'])

const panelValue = ref({ mode: 'single', singleDate: new Date(), useTargetTime: false })

const displayDate = computed(() => {
  const d = panelValue.value.singleDate
  if (!d) return ''
  const date = new Date(d)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
})
const rangeStartText = computed(() => displayDate.value + ' 周一')
const rangeStartDesc = computed(() => '今天')
const rangeEndText = computed(() => '2025/7/8 周二')
const rangeEndDesc = computed(() => '持续2天')

function onClose() {
  emit('update:modelValue', false)
}
function onConfirm() {
  emit('confirm', panelValue.value)
  emit('update:modelValue', false)
}
function onClear() {
  // 清除逻辑
}
</script>

<style scoped>
.task-date-dialog :deep(.el-dialog__body) {
  padding: 0 0 8px 0;
}
.date-dialog-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px 8px 16px;
}
.date-dialog-icon-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #ffd6b7 0%, #ffb199 100%);
  border-radius: 8px;
}
.date-dialog-icon {
  color: #ff7e3f;
  font-size: 18px;
}
.date-dialog-date {
  font-size: 16px;
  color: #bfc8dc;
  font-weight: 500;
  margin-left: 4px;
}
.date-dialog-clear {
  margin-left: auto;
  color: #4e7fff;
  font-size: 15px;
  font-weight: 500;
}
.date-dialog-segmented {
  margin: 0 16px 8px 16px;
}
.date-dialog-calendar {
  background: #23232a;
  border-radius: 14px;
  padding: 8px 8px 0 8px;
}
.date-dialog-range-panel {
  background: #23232a;
  border-radius: 14px;
  padding: 12px 12px 0 12px;
}
.date-dialog-range-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}
.date-dialog-range-block {
  flex: 1;
  background: #282838;
  border-radius: 10px;
  padding: 8px 10px;
  color: #bfc8dc;
}
.date-dialog-range-label {
  font-size: 13px;
  color: #8fa3c8;
  margin-bottom: 2px;
}
.date-dialog-range-date {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 2px;
}
.date-dialog-range-desc {
  font-size: 12px;
  color: #8fa3c8;
}
.date-dialog-switch {
  margin: 8px 0 0 0;
}
.date-dialog-repeat-row {
  margin-top: 8px;
}
.date-dialog-repeat-label {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #8fa3c8;
}
.date-dialog-repeat-label .el-icon {
  margin-right: 6px;
}
.date-dialog-repeat-value {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 15px;
  color: #bfc8dc;
}
</style> 