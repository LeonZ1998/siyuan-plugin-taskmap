<template>
  <div class="task-page">
    <div class="task-groups">
      <!-- 待安排任务 -->
      <div class="task-group">
        <div class="group-header">
          <div class="group-title">
            <el-icon class="group-icon"><Clock /></el-icon>
            <span>待安排</span>
            <el-tag size="small" type="info" class="task-count">{{ unscheduledTasks.length }}</el-tag>
          </div>
        </div>
        <div class="group-content">
          <div v-if="unscheduledTasks.length === 0" class="empty-group">
            <el-empty description="暂无待安排任务" :image-size="60" />
          </div>
          <TaskList 
            v-else
            :tasks="unscheduledTasks" 
            :all-projects="allProjects" 
            :show-project-name="true"
            @refresh="loadTasks"
          />
        </div>
      </div>

      <!-- 今日待办任务 -->
      <div class="task-group">
        <div class="group-header">
          <div class="group-title">
            <el-icon class="group-icon"><Sunny /></el-icon>
            <span>今日待办</span>
            <el-tag size="small" type="warning" class="task-count">{{ todayTasks.length }}</el-tag>
          </div>
        </div>
        <div class="group-content">
          <div v-if="todayTasks.length === 0" class="empty-group">
            <el-empty description="今日任务已完成" :image-size="60" />
          </div>
          <TaskList 
            v-else
            :tasks="todayTasks" 
            :all-projects="allProjects" 
            :show-project-name="true"
            @refresh="loadTasks"
          />
        </div>
      </div>

      <!-- 未来一周任务 -->
      <div class="task-group">
        <div class="group-header">
          <div class="group-title">
            <el-icon class="group-icon"><Calendar /></el-icon>
            <span>未来一周</span>
            <el-tag size="small" type="success" class="task-count">{{ weekTasks.length }}</el-tag>
          </div>
        </div>
        <div class="group-content">
          <div v-if="weekTasks.length === 0" class="empty-group">
            <el-empty description="暂无未来一周任务" :image-size="60" />
          </div>
          <TaskList 
            v-else
            :tasks="weekTasks" 
            :all-projects="allProjects" 
            :show-project-name="true"
            @refresh="loadTasks"
          />
        </div>
      </div>

      <!-- 已完成任务 -->
      <div class="task-group">
        <div class="group-header">
          <div class="group-title">
            <el-icon class="group-icon"><Check /></el-icon>
            <span>已完成</span>
            <el-tag size="small" type="success" class="task-count">{{ completedTasks.length }}</el-tag>
          </div>
        </div>
        <div class="group-content">
          <div v-if="completedTasks.length === 0" class="empty-group">
            <el-empty description="暂无已完成任务" :image-size="60" />
          </div>
          <TaskList 
            v-else
            :tasks="completedTasks" 
            :all-projects="allProjects" 
            :show-project-name="true"
            @refresh="loadTasks"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount } from 'vue'
import { Clock, Sunny, Calendar, Check } from '@element-plus/icons-vue'
import { taskDB, projectDB } from '@/utils/dbManager'
import TaskList from './TaskList.vue'
import { buildTaskTree } from '@/utils/example'
import { eventBus } from '@/utils/eventBus'

// 响应式数据
const tasks = ref<any[]>([])
const allProjects = ref<any[]>([])

// 加载所有任务和项目
async function loadTasks() {
  console.log('[TaskPage] 开始加载任务...')
  const allTasks = await taskDB.getAll()
  console.log('[TaskPage] 加载到的任务:', allTasks.length)
  const projects = await projectDB.getAll()
  allProjects.value = projects
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p.name]))
  tasks.value = buildTaskTree(allTasks.map(task => ({
    ...task,
    projectName: task.projectId ? projectMap[task.projectId] : ''
  })))
  console.log('[TaskPage] 任务加载完成，分组统计:', {
    待安排: unscheduledTasks.value.length,
    今日待办: todayTasks.value.length,
    未来一周: weekTasks.value.length,
    已完成: completedTasks.value.length
  })
}

// 计算属性：按时间分组
const unscheduledTasks = computed(() => {
  // 先拍平所有任务
  const all = flattenTasks(tasks.value);
  // 只保留未完成且没有日期的
  const filtered = all.filter(t => !t.isCompleted && !t.dueDate);
  // 再用buildTaskTree构建只包含这些任务的树
  return buildTaskTree(filtered);
});

const todayTasks = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // 先拍平所有任务
  const all = flattenTasks(tasks.value);
  // 筛选今日任务
  const filtered = all.filter(t => {
    if (t.isCompleted || !t.dueDate) return false
    const taskDate = new Date(t.dueDate)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate < tomorrow
  })
  // 再用buildTaskTree构建只包含这些任务的树
  return buildTaskTree(filtered);
})

const weekTasks = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  
  // 先拍平所有任务
  const all = flattenTasks(tasks.value);
  // 筛选未来一周任务
  const filtered = all.filter(t => {
    if (t.isCompleted || !t.dueDate) return false
    const taskDate = new Date(t.dueDate)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate >= tomorrow && taskDate < nextWeek
  })
  // 再用buildTaskTree构建只包含这些任务的树
  return buildTaskTree(filtered);
})

// 递归拍平所有任务
function flattenTasks(tasks) {
  let result = [];
  for (const t of tasks) {
    result.push(t);
    if (t.subTasks && t.subTasks.length > 0) {
      result = result.concat(flattenTasks(t.subTasks));
    }
  }
  return result;
}

const completedTasks = computed(() => {
  // 先拍平所有任务
  const all = flattenTasks(tasks.value);
  // 只保留已完成
  const completed = all.filter(t => t.isCompleted);
  // 再用buildTaskTree构建只包含已完成任务的树
  return buildTaskTree(completed);
});

onMounted(() => {
  loadTasks()
  eventBus.on('global-refresh', loadTasks)
})

onBeforeUnmount(() => {
  eventBus.off('global-refresh', loadTasks)
})
</script>

<style lang="scss" scoped>
.task-page {
  width: 100%;
}

.task-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.task-group {
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
}

.group-header {
  padding: 16px 20px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  
  .group-icon {
    font-size: 18px;
    color: var(--el-color-primary);
  }
  
  .task-count {
    margin-left: auto;
  }
}

.group-content {
  padding: 16px 20px;
}

.empty-group {
  padding: 20px 0;
}

// 响应式设计
@media (max-width: 768px) {
  .task-groups {
    gap: 16px;
  }
  
  .group-header {
    padding: 12px 16px;
  }
  
  .group-content {
    padding: 12px 16px;
  }
}
</style> 