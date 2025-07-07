<template>
  <div class="project-page" :class="{ 'is-dark': isDarkTheme }" @click="$emit('click')" style="cursor: pointer;">
    <!-- 项目头部信息 -->
    <div class="project-header">
      <div class="project-info">
        <div class="project-icon">
          <span v-if="project.icon" v-html="getIconSVG(project.icon)" style="width:24px;height:24px;"></span>
          <el-icon v-else :size="20">
            <Folder />
          </el-icon>
        </div>
        <div class="project-details">
          <div class="project-name">{{ project.name }}</div>
        </div>
      </div>
      <div class="project-days">剩余 {{ project.daysLeft }} 天</div>
    </div>

    <!-- 任务完成状态 -->
    <div class="task-status">
      <span class="completed-count">{{ project.completedTasks }}</span>
      <span class="separator">/</span>
      <span class="total-count">{{ project.totalTasks }}</span>
      <span class="status-text">任务已完成</span>
    </div>

    <!-- 进度条 -->
    <div class="progress-section">
      <el-progress 
        :percentage="progressPercentage" 
        :stroke-width="16"
        :show-text="false"
        class="project-progress"
      />
      <div class="progress-text">{{ progressPercentage }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Folder } from '@element-plus/icons-vue'
import { getIconSVG } from '@/icons/icons'

// 定义组件属性
interface Props {
  project?: {
    id: string
    name: string
    icon?: string
    daysLeft: number
    completedTasks: number
    totalTasks: number
  }
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  project: () => ({
    id: '1',
    name: '示例项目',
    daysLeft: 15,
    completedTasks: 8,
    totalTasks: 12
  }),
  theme: 'light'
})

// 计算属性
const isDarkTheme = computed(() => props.theme === 'dark')
const progressPercentage = computed(() => {
  if (props.project.totalTasks === 0) return 0
  return Math.round((props.project.completedTasks / props.project.totalTasks) * 100)
})
</script>

<style lang="scss" scoped>
.project-page {
  background: transparent;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  &:hover {
    border-color: #4285f4;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  // 暗色主题
  &.is-dark {
    background: transparent;
    border-color: #5f6368;
    color: #ecf0f1;
    
    &:hover {
      border-color: #4285f4;
    }
    
    .project-name {
      color: #ecf0f1;
    }
    
    .project-days {
      color: #bdc3c7;
      background: rgba(52, 152, 219, 0.2);
    }
    
    .task-status {
      .completed-count {
        color: #3498db;
      }
      
      .total-count {
        color: #95a5a6;
      }
      
      .status-text {
        color: #bdc3c7;
      }
    }
  }
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.project-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.project-icon {
  width: 36px;
  height: 36px;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  background: none !important;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.project-details {
  flex: 1;
  min-width: 0;
}

.project-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-days {
  font-size: 11px;
  color: #7f8c8d;
  font-weight: 500;
  background: rgba(52, 152, 219, 0.1);
  padding: 3px 6px;
  border-radius: 10px;
  flex-shrink: 0;
  white-space: nowrap;
}

.task-status {
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 500;
  
  .completed-count {
    color: #3498db;
    font-weight: 600;
    font-size: 14px;
  }
  
  .separator {
    color: #7f8c8d;
    margin: 0 4px;
  }
  
  .total-count {
    color: #7f8c8d;
    font-weight: 600;
    font-size: 14px;
  }
  
  .status-text {
    color: #7f8c8d;
    margin-left: 8px;
  }
}

.progress-section {
  position: relative;
  
  .project-progress {
    :deep(.el-progress-bar__outer) {
      background-color: #ecf0f1;
      border-radius: 6px;
    }
    
    :deep(.el-progress-bar__inner) {
      background: linear-gradient(90deg, #3498db 0%, #2980b9 100%);
      border-radius: 6px;
      transition: all 0.3s ease;
    }
  }
  
  .progress-text {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    font-weight: 600;
    color: #3498db;
    line-height: 1;
  }
}

// 暗色主题下的进度条样式
.is-dark {
  .progress-section {
    .project-progress {
      :deep(.el-progress-bar__outer) {
        background-color: #34495e;
      }
      
      :deep(.el-progress-bar__inner) {
        background: linear-gradient(90deg, #3498db 0%, #2980b9 100%);
      }
    }
    
    .progress-text {
      color: #3498db;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .project-card {
    padding: 12px;
    margin-bottom: 8px;
  }
  
  .project-icon {
    width: 40px;
    height: 40px;
  }
  
  .project-name {
    font-size: 14px;
  }
  
  .project-days {
    font-size: 12px;
  }
  
  .task-status {
    font-size: 13px;
    
    .completed-count,
    .total-count {
      font-size: 14px;
    }
  }
}
</style> 