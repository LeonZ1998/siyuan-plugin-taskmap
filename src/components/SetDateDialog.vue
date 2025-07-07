<template>
  <el-dialog :model-value="visible" @close="onClose" width="400px" title="设置日期">
    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
      <el-date-picker
        v-model="rangeDate"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="flex: 2"
      />
    </div>
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  range: Array // [startDate, endDate]
})
const emit = defineEmits(['update:visible', 'confirm'])

const rangeDate = ref<[Date | null, Date | null]>([null, null])

watch(() => props.visible, (val) => {
  if (val && props.range && props.range.length === 2) {
    rangeDate.value = [
      props.range[0] ? new Date(Number(props.range[0])) : null,
      props.range[1] ? new Date(Number(props.range[1])) : null
    ]
  }
})

function onClose() {
  emit('update:visible', false)
}
function onConfirm() {
  emit('confirm', {
    range: rangeDate.value
  })
  emit('update:visible', false)
}
</script> 