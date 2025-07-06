<template>
  <div class="taskmap-sidebar" :data-theme="currentTheme">
    <el-container class="sidebar-container">
      <!-- 上部分：四个图标横向排列 -->
      <el-header class="sidebar-header">
        <div class="icon-row">
          <el-button
            v-for="(icon, index) in topIcons"
            :key="index"
            :icon="icon.icon"
            circle
            size="large"
            :class="['top-icon-btn', { 'active': currentPage === icon.action }]"
            @click="handleIconClick(icon.action)"
          />
        </div>
      </el-header>

      <!-- 中间部分：带图标的输入框 -->
      <el-main class="sidebar-main">
        <div class="input-section">
          <el-input
            v-model="inputText"
            :placeholder="inputPlaceholder"
            class="main-input"
            clearable
            :suffix-icon="Calendar"
            @keyup.enter="handleEnter"
            @clear="handleClear"
          />
        </div>
      </el-main>

      <!-- 下部分：动态页面内容 -->
      <el-footer class="sidebar-footer">
        <div class="footer-content">
          <!-- 根据当前页面显示不同内容 -->
          <div v-if="currentPage === 'project'" class="project-list">
            <ProjectPage 
              v-for="project in projects"
              :key="project.id"
              :project="{
                id: project.id,
                name: project.name,
                daysLeft: 0, // 默认剩余天数
                completedTasks: project.completedTaskCount || 0,
                totalTasks: project.taskCount || 0
              }"
              :theme="currentTheme as 'light' | 'dark'"
            />
            <div v-if="projects.length === 0" class="empty-state">
              <p>暂无项目，请输入项目名称创建新项目</p>
            </div>
          </div>
          
          <TaskPage v-else-if="currentPage === 'task'" />
          <TimerPage v-else-if="currentPage === 'timer'" />
          <StatsPage v-else-if="currentPage === 'stats'" />
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Document,
  Edit,
  Timer,
  DataAnalysis,
  Calendar
} from '@element-plus/icons-vue'
import ProjectPage from './ProjectPage.vue'
import TaskPage from './TaskPage.vue'
import TimerPage from './TimerPage.vue'
import StatsPage from './StatsPage.vue'
import { projectDB } from '@/utils/dbManager'
import { ProjectStatus, ProjectType } from '@/types/project.d'

// 响应式数据
const inputText = ref('')
const currentTheme = ref('dark')
const currentPage = ref('project') // 当前显示的页面
const projects = ref<any[]>([]) // 项目列表

// 计算属性
const inputPlaceholder = computed(() => {
  return currentPage.value === 'project' ? '添加一个新项目...' : '添加一个新任务...'
})

// 顶部图标配置
const topIcons = [
  {
    icon: Document,
    action: 'project',
    title: '项目管理'
  },
  {
    icon: Edit,
    action: 'task',
    title: '任务管理'
  },
  {
    icon: Timer,
    action: 'timer',
    title: '任务计时'
  },
  {
    icon: DataAnalysis,
    action: 'stats',
    title: '数据统计'
  }
]

// 主题监听器
let themeObserver: MutationObserver | null = null
let themeCheckInterval: number | null = null

// 更新主题 - 直接从思源设置文件读取
const updateTheme = async () => {
  try {
    // 方式1：通过API获取思源设置
    const siyuan = (window as any).siyuan
    if (siyuan && siyuan.ws) {
      try {
        // 获取思源的外观设置
        const response = await fetch('/api/setting/getAppearance')
        
        if (response.ok) {
          const responseText = await response.text()
          
          if (responseText) {
            try {
              const appearance = JSON.parse(responseText)
              
              // 获取主题设置
              const theme = appearance.data?.theme || appearance.data?.mode || appearance.theme || appearance.mode
              
              if (theme !== undefined) {
                // 思源的主题值：0=明亮, 1=暗黑, 2=跟随系统
                if (theme === 1 || theme === 'dark') {
                  currentTheme.value = 'dark'
                } else if (theme === 0 || theme === 'light') {
                  currentTheme.value = 'light'
                } else if (theme === 2 || theme === 'system') {
                  // 跟随系统时，检查系统主题
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                  currentTheme.value = prefersDark ? 'dark' : 'light'
                }
                return
              }
            } catch (parseError) {
              // API解析失败，继续尝试其他方式
            }
          }
        }
      } catch (apiError) {
        // API获取失败，继续尝试其他方式
      }
    }
    
    // 方式2：从window.siyuan.config获取
    if (siyuan && siyuan.config) {
      // 尝试多种配置路径
      const configPaths = [
        'appearance.theme',
        'appearance.mode',
        'theme',
        'mode',
        'appearance.themeMode'
      ]
      
      for (const path of configPaths) {
        const value = path.split('.').reduce((obj, key) => obj?.[key], siyuan.config)
        if (value !== undefined) {
          if (value === 1 || value === 'dark') {
            currentTheme.value = 'dark'
            return
          } else if (value === 0 || value === 'light') {
            currentTheme.value = 'light'
            return
          } else if (value === 2 || value === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            currentTheme.value = prefersDark ? 'dark' : 'light'
            return
          }
        }
      }
    }
    
    // 方式3：检查HTML的data-theme属性
    console.log('使用备用方案 - 检查HTML属性')
    const htmlElement = document.documentElement
    const isDark = htmlElement.getAttribute('data-theme') === 'dark'
    currentTheme.value = isDark ? 'dark' : 'light'
    console.log('备用方案 - 当前主题:', currentTheme.value)
    
  } catch (error) {
    console.error('获取思源主题设置失败:', error)
    // 最终备用方案
    const htmlElement = document.documentElement
    const isDark = htmlElement.getAttribute('data-theme') === 'dark'
    currentTheme.value = isDark ? 'dark' : 'light'
    console.log('错误处理 - 当前主题:', currentTheme.value)
  }
}

// 处理图标点击
const handleIconClick = (action: string) => {
  console.log(`点击了 ${action} 图标`)
  currentPage.value = action
}

// 处理回车输入
const handleEnter = async () => {
  if (currentPage.value === 'project') {
    // 新建项目
    const projectName = inputText.value.trim() || '未命名'
    try {
      const newProject = await projectDB.create({
        name: projectName,
        type: ProjectType.WORK_CAREER, // 默认类型
        status: ProjectStatus.ACTIVE,
        color: '#3498db', // 默认颜色
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isArchived: false,
        order: projects.value.length,
        taskCount: 0,
        completedTaskCount: 0,
        completionRate: 0
      })
      
      // 添加到本地项目列表
      projects.value.push(newProject)
      console.log('新建项目成功:', newProject)
      
      // 清空输入框
      inputText.value = ''
    } catch (error) {
      console.error('新建项目失败:', error)
    }
  } else {
    // 新建任务
    console.log('新建任务:', inputText.value)
    // 后续实现新建任务功能
    inputText.value = '' // 清空输入框
  }
}

// 加载项目列表
const loadProjects = async () => {
  try {
    const projectList = await projectDB.getAll()
    projects.value = projectList
    console.log('项目列表加载成功:', projectList)
  } catch (error) {
    console.error('加载项目列表失败:', error)
  }
}

// 处理清空
const handleClear = () => {
  console.log('输入框已清空')
}

// 组件挂载时设置主题监听和加载数据
onMounted(async () => {
  await updateTheme()
  await loadProjects()
  
  // 监听思源主题变化 - 使用事件总线
  const siyuan = (window as any).siyuan
  if (siyuan && siyuan.eventBus) {
    console.log('思源事件总线可用')
    
    // 监听主题变化事件
    siyuan.eventBus.on('ws-main', (data: any) => {
      if (data && data.cmd === 'setAppearance') {
        console.log('检测到思源主题变化事件:', data)
        setTimeout(() => updateTheme(), 100) // 延迟一点确保设置已更新
      }
    })
  } else {
    console.log('思源事件总线不可用')
  }
  
  // 备用方案：监听HTML属性变化
  themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        console.log('检测到HTML主题属性变化')
        updateTheme()
      }
    })
  })
  
  // 开始监听
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
  
  // 监听系统主题变化（当思源设置为跟随系统时）
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => updateTheme())
  
  // 定时检查主题变化（备用方案）
  themeCheckInterval = window.setInterval(() => {
    updateTheme()
  }, 3000) // 每3秒检查一次
})

// 组件卸载时清理监听器
onUnmounted(() => {
  if (themeObserver) {
    themeObserver.disconnect()
    themeObserver = null
  }
  
  // 清理思源事件监听
  const siyuan = (window as any).siyuan
  if (siyuan && siyuan.eventBus) {
    siyuan.eventBus.off('ws-main')
  }
  
  // 清理定时器
  if (themeCheckInterval) {
    clearInterval(themeCheckInterval)
    themeCheckInterval = null
  }
})
</script>

<style lang="scss" scoped>
.taskmap-sidebar {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  
  // 明色主题
  &[data-theme="light"] {
    background: #ffffff;
    color: #202124;
    
    .sidebar-header {
      border-bottom: 1px solid #dadce0;
      background: #ffffff; // 统一背景色
      
      .top-icon-btn {
        background: #ffffff;
        border: 1px solid #dadce0;
        color: #202124;
        
        &:hover {
          background: #4285f4;
          color: white;
        }
        
        &.active {
          background: #4285f4;
          color: white;
          border-color: #4285f4;
        }
      }
    }
    
    .sidebar-main {
      background: #ffffff; // 统一背景色
      
      .main-input {
        :deep(.el-input__wrapper) {
          background: #ffffff;
          border: 1px solid #dadce0;
          
          &:hover {
            border-color: #4285f4;
          }
          
          &.is-focus {
            border-color: #4285f4;
            box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
          }
        }
        
        :deep(.el-input__inner) {
          color: #202124;
          
          &::placeholder {
            color: #5f6368;
          }
        }
        
        :deep(.el-input__suffix) {
          color: #5f6368;
        }
        
        :deep(.el-input__clear) {
          color: #5f6368;
          
          &:hover {
            color: #202124;
          }
        }
      }
    }
    
    .sidebar-footer {
      border-top: 1px solid #dadce0;
      background: #ffffff; // 统一背景色
      
      .footer-content {
        color: #5f6368;
      }
    }
  }
  
  // 暗色主题
  &[data-theme="dark"] {
    background: #202124;
    color: #e8eaed;
    
    .sidebar-header {
      border-bottom: 1px solid #5f6368;
      background: #202124; // 统一背景色
      
      .top-icon-btn {
        background: #202124;
        border: 1px solid #5f6368;
        color: #e8eaed;
        
        &:hover {
          background: #4285f4;
          color: white;
        }
        
        &.active {
          background: #4285f4;
          color: white;
          border-color: #4285f4;
        }
      }
    }
    
    .sidebar-main {
      background: #202124; // 统一背景色
      
      .main-input {
        :deep(.el-input__wrapper) {
          background: #202124;
          border: 1px solid #5f6368;
          
          &:hover {
            border-color: #4285f4;
          }
          
          &.is-focus {
            border-color: #4285f4;
            box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
          }
        }
        
        :deep(.el-input__inner) {
          color: #e8eaed;
          
          &::placeholder {
            color: #9aa0a6;
          }
        }
        
        :deep(.el-input__suffix) {
          color: #9aa0a6;
        }
        
        :deep(.el-input__clear) {
          color: #9aa0a6;
          
          &:hover {
            color: #e8eaed;
          }
        }
      }
    }
    
    .sidebar-footer {
      border-top: 1px solid #5f6368;
      background: #202124; // 统一背景色
      
      .footer-content {
        color: #9aa0a6;
      }
    }
  }
}

.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.sidebar-header {
  padding: 12px;
  height: auto !important;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  .icon-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    gap: 6px;

    .top-icon-btn {
      flex: 1;
      max-width: 45px;
      height: 45px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

.sidebar-main {
  flex: none; // 改为固定高度，不占用剩余空间
  padding: 8px 20px; // 减少上下内边距
  transition: all 0.3s ease;
  overflow: hidden;
  height: auto; // 自适应高度

  .input-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;

    .main-input {
      width: 100%;
      margin: 0; // 移除外边距
      
      :deep(.el-input__wrapper) {
        border-radius: 8px;
        transition: all 0.3s ease;
        box-shadow: none;
        width: 100%;
      }

      :deep(.el-input__inner) {
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }
}

.sidebar-footer {
  padding: 16px;
  height: auto !important;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  .footer-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    font-size: 13px;
    overflow-y: auto;
    padding: 0;
  }
  
  .project-list {
    width: 100%;
    padding: 8px 0;
  }
  
  .empty-state {
    text-align: center;
    padding: 20px;
    color: #7f8c8d;
    font-size: 13px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .sidebar-header {
    padding: 10px;

    .icon-row {
      gap: 4px;

      .top-icon-btn {
        max-width: 40px;
        height: 40px;
      }
    }
  }

  .sidebar-main {
    padding: 16px;
  }

  .sidebar-footer {
    padding: 12px;
  }
}
</style> 