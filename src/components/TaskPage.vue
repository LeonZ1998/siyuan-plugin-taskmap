<template>
  <div class="task-page">
    <div class="page-header">
      <h3>任务管理</h3>
      <p>管理您的所有任务</p>
    </div>
    <div class="page-content">
      <div class="task-list">
        <div class="task-item">
          <el-checkbox />
          <span class="task-text">完成项目文档</span>
          <span class="task-date">今天</span>
        </div>
        <div class="task-item">
          <el-checkbox />
          <span class="task-text">代码审查</span>
          <span class="task-date">明天</span>
        </div>
        <div class="task-item">
          <el-checkbox />
          <span class="task-text">团队会议</span>
          <span class="task-date">本周</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 任务管理页面逻辑
</script>

<style lang="scss" scoped>
.task-page {
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
  .task-list {
    .task-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 4px;
      border-radius: 6px;
      margin-bottom: 4px;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: rgba(52, 152, 219, 0.1);
      }
      
      .task-text {
        flex: 1;
        font-size: 13px;
      }
      
      .task-date {
        font-size: 11px;
        color: #7f8c8d;
        background: rgba(52, 152, 219, 0.1);
        padding: 2px 6px;
        border-radius: 8px;
      }
    }
  }
}
</style> 