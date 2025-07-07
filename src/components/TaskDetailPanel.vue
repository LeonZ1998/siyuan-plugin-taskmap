<template>
  <el-dialog :model-value="modelValue" @close="onClose" width="480px" class="task-detail-dialog" append-to-body>
    <el-card class="task-detail-panel" shadow="never">
      <el-form label-position="top" :model="form">
        <el-form-item label="任务名称" label-class="section-label">
          <el-input v-model="form.name" placeholder="如 Task" class="input-large" />
        </el-form-item>
        <el-form-item label="备注" label-class="section-label">
          <el-input v-model="form.note" placeholder="备注" class="input-note" type="textarea" :rows="2" />
        </el-form-item>
        <el-divider />
        <el-form-item label="任务日期和循环" label-class="section-label">
          <template v-if="!showDatePanel">
            <div class="date-card" @click="showDatePanel = true">
              <div class="date-card-left">
                <span class="date-card-icon-bg">
                  <el-icon class="date-card-icon"><Calendar /></el-icon>
                </span>
                <span class="date-card-text">日期和循环</span>
              </div>
              <span class="date-card-arrow">
                <el-icon><ArrowRight /></el-icon>
              </span>
            </div>
          </template>
          <TaskDatePanel v-else />
        </el-form-item>
        <el-divider />
        <el-form-item label="任务量化" label-class="section-label">
          <el-card class="quantify-card" shadow="never">
            <el-row align="middle" justify="space-between">
              <el-col :span="16" class="quantify-label">
                <el-icon><DataAnalysis /></el-icon>
                量化进度
              </el-col>
              <el-col :span="8" class="quantify-switch">
                <el-switch v-model="form.quantify" />
              </el-col>
            </el-row>
          </el-card>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%" @click="onClose">保存任务</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Calendar, ArrowRight, DataAnalysis } from '@element-plus/icons-vue'
import TaskDatePanel from './TaskDatePanel.vue'
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])
const form = ref({ name: '', note: '', quantify: false })
const showDatePanel = ref(false)
function onClose() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.task-detail-dialog :deep(.el-dialog__body) {
  padding: 0 0 8px 0;
}
.task-detail-panel {
  background: #23232a;
  border-radius: 16px;
  padding: 18px 18px 8px 18px;
  color: #fff;
  box-shadow: 0 2px 8px 0 #00000022;
  margin-bottom: 12px;
}
.section-label {
  font-size: 15px;
  color: #8fa3c8;
  font-weight: 500;
  margin-bottom: 6px;
}
.input-large {
  font-size: 16px;
  margin-bottom: 6px;
}
.input-note {
  font-size: 14px;
  color: #888;
  margin-bottom: 0;
}
.date-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: #23232a;
  border-radius: 14px;
  padding: 0 16px;
  height: 44px;
  box-sizing: border-box;
  margin-top: 2px;
  transition: background 0.2s;
  cursor: pointer;
}
.date-card-left {
  display: flex;
  align-items: center;
}
.date-card-icon-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #ffd6b7 0%, #ffb199 100%);
  border-radius: 8px;
  margin-right: 10px;
}
.date-card-icon {
  color: #ff7e3f;
  font-size: 18px;
}
.date-card-text {
  font-size: 16px;
  color: #bfc8dc;
  font-weight: 500;
}
.date-card-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bfc8dc;
  font-size: 18px;
  background: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
}
.quantify-card {
  background: #23232a;
  border-radius: 14px;
  padding: 8px 12px;
  color: #fff;
  box-shadow: none;
}
.quantify-label {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #fff;
}
.quantify-label .el-icon {
  margin-right: 8px;
}
.quantify-switch {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style> 