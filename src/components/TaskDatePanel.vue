<template>
  <DatePanelContent
    v-model="panelValue"
    :display-date="displayDate"
    :range-start-text="rangeStartText"
    :range-start-desc="rangeStartDesc"
    :range-end-text="rangeEndText"
    :range-end-desc="rangeEndDesc"
    @clear="onClear"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DatePanelContent from './DatePanelContent.vue'

const panelValue = ref({ mode: 'single', singleDate: new Date(), useTargetTime: false })

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

function onClear() {
  // 清除逻辑
}
</script> 