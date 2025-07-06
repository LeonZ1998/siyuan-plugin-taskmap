<template>
  <div class="task-page">
    <div class="page-content">
      <div class="task-list">
        <!-- 任务卡片示例 -->
        <div class="task-card">
          <div class="task-main">
            <div class="task-left">
              <el-button 
                type="text" 
                size="small" 
                class="expand-btn"
                :class="{ 'has-children': true, 'expanded': false }"
              >
                <el-icon><ArrowRight /></el-icon>
              </el-button>
              <el-checkbox class="task-checkbox" />
            </div>
                    <div class="task-content">
          <div class="task-name">完成项目文档</div>
        </div>
        <div class="task-meta">
          <span class="project-name">学习Vue3开发</span>
          <span class="task-date">今天</span>
        </div>
          </div>
        </div>

        <div class="task-card">
          <div class="task-main">
            <div class="task-left">
              <el-button 
                type="text" 
                size="small" 
                class="expand-btn"
                :class="{ 'has-children': false }"
              >
                <el-icon><ArrowRight /></el-icon>
              </el-button>
              <el-checkbox class="task-checkbox" />
            </div>
                    <div class="task-content">
          <div class="task-name">代码审查</div>
        </div>
        <div class="task-meta">
          <span class="task-date">明天</span>
        </div>
          </div>
        </div>

        <div class="task-card">
          <div class="task-main">
            <div class="task-left">
              <el-button 
                type="text" 
                size="small" 
                class="expand-btn"
                :class="{ 'has-children': true, 'expanded': true }"
              >
                <el-icon><ArrowRight /></el-icon>
              </el-button>
              <el-checkbox class="task-checkbox" />
            </div>
                    <div class="task-content">
          <div class="task-name">团队会议</div>
        </div>
        <div class="task-meta">
          <span class="project-name">项目重构计划</span>
          <span class="task-date">本周</span>
        </div>
          </div>
          <!-- 子任务 -->
          <div class="sub-tasks">
            <div class="task-card sub-task">
              <div class="task-main">
                <div class="task-left">
                  <div class="sub-task-indent"></div>
                  <el-checkbox class="task-checkbox" />
                </div>
                <div class="task-content">
                  <div class="task-name">准备会议材料</div>
                </div>
              </div>
            </div>
            <div class="task-card sub-task">
              <div class="task-main">
                <div class="task-left">
                  <div class="sub-task-indent"></div>
                  <el-checkbox class="task-checkbox" />
                </div>
                <div class="task-content">
                  <div class="task-name">邀请参会人员</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
// 任务管理页面逻辑
</script>

<style lang="scss" scoped>
.task-page {
  width: 100%;
  height: 100%;
  padding: 8px 0;
}



.page-content {
  .task-list {
    .task-card {
      margin-bottom: 2px;
      
      .task-main {
        display: flex;
        align-items: center;
        padding: 8px 4px;
        border-radius: 6px;
        transition: background-color 0.2s ease;
        
        &:hover {
          background-color: rgba(52, 152, 219, 0.1);
        }
        
        .task-left {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-right: 8px;
          
          .expand-btn {
            width: 20px;
            height: 20px;
            padding: 0;
            color: #7f8c8d;
            transition: all 0.2s ease;
            
            &.has-children {
              color: #3498db;
              
              &.expanded {
                transform: rotate(90deg);
              }
            }
            
            &:not(.has-children) {
              opacity: 0.3;
              cursor: default;
            }
            
            &:hover {
              background-color: rgba(52, 152, 219, 0.1);
            }
          }
          
          .task-checkbox {
            margin: 0;
          }
          
          .sub-task-indent {
            width: 16px;
            height: 1px;
            background-color: #e4e7ed;
            margin-left: 4px;
          }
        }
        
        .task-content {
          flex: 1;
          min-width: 0;
          margin-right: 8px;
          
          .task-name {
            font-size: 13px;
            font-weight: 500;
            color: inherit;
            line-height: 1.4;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        
        .task-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          
          .project-name {
            font-size: 11px;
            color: #3498db;
            background: rgba(52, 152, 219, 0.1);
            padding: 2px 6px;
            border-radius: 8px;
            white-space: nowrap;
          }
          
          .task-date {
            font-size: 11px;
            color: #7f8c8d;
            background: rgba(52, 152, 219, 0.1);
            padding: 2px 6px;
            border-radius: 8px;
            white-space: nowrap;
          }
        }
      }
      
      .sub-tasks {
        margin-left: 20px;
        border-left: 1px solid #e4e7ed;
        padding-left: 8px;
        
        .sub-task {
          margin-bottom: 1px;
          
          .task-main {
            padding: 6px 4px;
            
            .task-left {
              .sub-task-indent {
                width: 12px;
              }
            }
            
            .task-content {
              .task-info {
                .task-name {
                  font-size: 12px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style> 