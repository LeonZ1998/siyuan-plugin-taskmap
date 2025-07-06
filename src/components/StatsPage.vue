<template>
  <div class="stats-page">
    <div class="page-header">
      <h3>数据统计</h3>
      <p>查看您的工作数据</p>
    </div>
    <div class="page-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">12</div>
          <div class="stat-label">总项目</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">45</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">8</div>
          <div class="stat-label">进行中</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">32h</div>
          <div class="stat-label">总时长</div>
        </div>
      </div>
      <div class="chart-section">
        <h4>本周进度</h4>
        <div class="chart-placeholder">
          <div class="chart-bar" style="height: 60%"></div>
          <div class="chart-bar" style="height: 80%"></div>
          <div class="chart-bar" style="height: 45%"></div>
          <div class="chart-bar" style="height: 90%"></div>
          <div class="chart-bar" style="height: 70%"></div>
          <div class="chart-bar" style="height: 55%"></div>
          <div class="chart-bar" style="height: 85%"></div>
        </div>
        <div class="chart-labels">
          <span>一</span>
          <span>二</span>
          <span>三</span>
          <span>四</span>
          <span>五</span>
          <span>六</span>
          <span>日</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 数据统计页面逻辑
</script>

<style lang="scss" scoped>
.stats-page {
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
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 20px;
    
    .stat-card {
      background: rgba(52, 152, 219, 0.1);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      
      .stat-number {
        font-size: 20px;
        font-weight: 700;
        color: #3498db;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 11px;
        color: #7f8c8d;
      }
    }
  }
  
  .chart-section {
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: inherit;
    }
    
    .chart-placeholder {
      display: flex;
      align-items: end;
      gap: 4px;
      height: 60px;
      margin-bottom: 8px;
      
      .chart-bar {
        flex: 1;
        background: linear-gradient(to top, #3498db, #2980b9);
        border-radius: 2px 2px 0 0;
        min-height: 4px;
      }
    }
    
    .chart-labels {
      display: flex;
      justify-content: space-between;
      
      span {
        font-size: 10px;
        color: #7f8c8d;
        flex: 1;
        text-align: center;
      }
    }
  }
}
</style> 