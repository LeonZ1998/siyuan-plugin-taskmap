<template>
  <DatePanelContent
    v-model:modelValue="panelValue"
    :display-date="displayDate"
    :range-start-text="rangeStartText"
    :range-start-desc="rangeStartDesc"
    :range-end-text="rangeEndText"
    :range-end-desc="rangeEndDesc"
    :project-start-date="projectStartDate"
    :project-end-date="projectEndDate"
    @clear="onClear"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DatePanelContent from './DatePanelContent.vue'

const emit = defineEmits(['closePanel'])

const panelValue = ref({
  mode: 'single',
  singleDate: new Date(),
  useTargetTime: false,
  rangeStart: new Date(),
  rangeEnd: new Date()
})

const displayDate = computed(() => {
  // 格式化 panelValue.value.singleDate
  const d = panelValue.value.singleDate
  if (!d) return ''
  const date = new Date(d)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
})
const rangeStartText = computed(() => displayDate.value + ' 周一')
const rangeStartDesc = computed(() => '今天')
const rangeEndText = computed(() => '2025/7/8 周二')
const rangeEndDesc = computed(() => '持续2天')

const projectStartDate = ref(new Date())
const projectEndDate = ref(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

function onClear() {
  panelValue.value.singleDate = new Date();
  panelValue.value.mode = 'single';
  panelValue.value.useTargetTime = false;
  // 通知父组件收起面板
  emit('closePanel')
}

defineExpose({ panelValue })
</script> 