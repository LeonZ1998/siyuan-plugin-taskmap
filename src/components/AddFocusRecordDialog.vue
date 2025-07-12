<template>
  <el-dialog v-model="dialogVisible" title="添加专注记录" width="480px" :before-close="handleClose">
    <el-form :model="form" label-position="top" ref="formRef">
      <el-form-item label="选择任务" prop="taskId">
        <el-select v-model="form.taskId" filterable placeholder="请选择任务" style="width: 100%">
          <el-option v-for="task in tasks" :key="task.id" :label="task.name" :value="task.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%" />
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择结束时间" style="width: 100%" />
      </el-form-item>
      <el-form-item label="备注" prop="note">
        <el-input v-model="form.note" type="textarea" :rows="3" placeholder="记录你的想法..." />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { taskDB, timerRecordDB } from '@/utils/dbManager'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'record-added'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref()
const loading = ref(false)
const tasks = ref<any[]>([])

const form = ref({
  taskId: '',
  startTime: '',
  endTime: '',
  note: ''
})

async function loadTasks() {
  tasks.value = await taskDB.getAll()
}

function resetForm() {
  form.value = { taskId: '', startTime: '', endTime: '', note: '' }
  formRef.value?.clearValidate()
}

function handleClose() {
  dialogVisible.value = false
  resetForm()
}

async function handleConfirm() {
  if (!form.value.taskId || !form.value.startTime || !form.value.endTime) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const startTime = new Date(form.value.startTime)
  const endTime = new Date(form.value.endTime)
  
  if (endTime <= startTime) {
    ElMessage.warning('结束时间必须晚于开始时间')
    return
  }

  loading.value = true
  try {
    const task = tasks.value.find(t => t.id === form.value.taskId)
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
    
    const record = {
      taskId: form.value.taskId,
      taskName: task?.name || '',
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      duration,
      status: 'finished',
      note: form.value.note.trim(),
      type: 'manual'
    }

    await timerRecordDB.create(record)
    ElMessage.success('专注记录添加成功')
    emit('record-added', record)
    handleClose()
  } catch (error) {
    ElMessage.error('添加专注记录失败')
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, (val) => {
  if (val) loadTasks()
})
</script>

<style scoped>
.el-form-item {
  margin-bottom: 20px;
}

.el-form-item__label {
  font-weight: 500;
  color: #333;
}
</style> 