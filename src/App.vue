<template>
  <div>
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="计时器" name="timer">
        <TimerPage />
      </el-tab-pane>
      <el-tab-pane label="专注记录" name="history">
        <FocusHistoryPage />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TimerPage from './components/TimerPage.vue';
import FocusHistoryPage from './components/FocusHistoryPage.vue';

const activeTab = ref('timer');
</script>

<style scoped>
.el-tabs {
  background: transparent;
}
</style>