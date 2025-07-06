<template>
  <div class="timer-page">
    <div class="page-header">
      <h3>任务计时</h3>
      <p>跟踪您的工作时间</p>
    </div>
    <div class="page-content">
      <div class="timer-display">
        <div class="time">25:00</div>
        <div class="timer-controls">
          <el-button size="small" type="primary">开始</el-button>
          <el-button size="small">暂停</el-button>
          <el-button size="small">重置</el-button>
        </div>
      </div>
      <div class="timer-history">
        <h4>今日记录</h4>
        <div class="history-item">
          <span class="task-name">学习Vue3</span>
          <span class="duration">45分钟</span>
        </div>
        <div class="history-item">
          <span class="task-name">代码审查</span>
          <span class="duration">30分钟</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 计时器页面逻辑
</script>

<style lang="scss" scoped>
.timer-page {
  width: 100%;
  height: 100%;
  padding: 8px 0;
}

.page-header {
  margin-bottom: 16px;
  padding: 0 4px;
  
  h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
    color: inherit;
  }
  
  p {
    margin: 0;
    font-size: 12px;
    color: #7f8c8d;
  }
}

.page-content {
  .timer-display {
    text-align: center;
    margin-bottom: 20px;
    padding: 16px;
    background: rgba(52, 152, 219, 0.1);
    border-radius: 8px;
    
    .time {
      font-size: 32px;
      font-weight: 700;
      color: #3498db;
      margin-bottom: 12px;
    }
    
    .timer-controls {
      display: flex;
      gap: 8px;
      justify-content: center;
    }
  }
  
  .timer-history {
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: inherit;
    }
    
    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 4px;
      margin-bottom: 4px;
      border-radius: 6px;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: rgba(52, 152, 219, 0.1);
      }
      
      .task-name {
        font-size: 13px;
      }
      
      .duration {
        font-size: 12px;
        color: #7f8c8d;
        background: rgba(52, 152, 219, 0.1);
        padding: 2px 6px;
        border-radius: 8px;
      }
    }
  }
}
</style> 