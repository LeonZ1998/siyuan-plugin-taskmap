<template>
  <div class="habit-page" :data-theme="currentTheme">
    <!-- 顶部导航栏 -->
    <header class="habit-header">
      <div class="header-content">
        <h2 class="page-title">习惯打卡</h2>
        <el-button
          type="primary"
          size="small"
          class="add-habit-btn"
          @click="showAddHabitDialog = true"
        >
          <el-icon><Plus /></el-icon>
          新建习惯
        </el-button>
      </div>
    </header>

    <!-- 习惯列表区域 -->
    <section class="habit-list-section">
      <div class="habit-list">
        <HabitCard
          v-for="habit in habits"
          :key="habit.id"
          :habit="habit"
          @check-in="handleCheckIn"
          @edit="handleEditHabit"
          @delete="handleDeleteHabit"
        />
        
        <!-- 空状态 -->
        <div v-if="habits.length === 0" class="empty-state">
          <div class="empty-icon">
            <el-icon size="48"><Calendar /></el-icon>
          </div>
          <p class="empty-text">还没有习惯，开始创建你的第一个习惯吧！</p>
          <el-button type="primary" @click="showAddHabitDialog = true">
            创建习惯
          </el-button>
        </div>
      </div>
    </section>

    <!-- 统计区域 -->
    <footer class="habit-stats-section" v-if="habits.length > 0">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ totalHabits }}</div>
          <div class="stat-label">总习惯数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ todayCheckedCount }}</div>
          <div class="stat-label">今日已打卡</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ longestStreak }}</div>
          <div class="stat-label">最长连续天数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ completionRate }}%</div>
          <div class="stat-label">完成率</div>
        </div>
      </div>
    </footer>

    <!-- 新建/编辑习惯弹窗 -->
    <el-dialog
      v-model="showAddHabitDialog"
      :title="editingHabit ? '编辑习惯' : '新建习惯'"
      width="500px"
      class="habit-dialog"
    >
      <el-form
        ref="habitFormRef"
        :model="habitForm"
        :rules="habitRules"
        label-width="80px"
      >
        <el-form-item label="习惯名称" prop="name">
          <el-input
            v-model="habitForm.name"
            placeholder="请输入习惯名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="习惯图标" prop="icon">
          <IconPicker v-model="habitForm.icon" />
        </el-form-item>
        
        <el-form-item label="习惯颜色" prop="color">
          <el-color-picker v-model="habitForm.color" />
        </el-form-item>
        
        <el-form-item label="重复周期" prop="frequency">
          <el-select v-model="habitForm.frequency" placeholder="选择重复周期">
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="目标天数" prop="targetDays">
          <el-input-number
            v-model="habitForm.targetDays"
            :min="1"
            :max="365"
            placeholder="设置目标天数"
          />
        </el-form-item>
        
        <el-form-item label="备注" prop="description">
          <el-input
            v-model="habitForm.description"
            type="textarea"
            :rows="3"
            placeholder="添加备注信息（可选）"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddHabitDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSaveHabit" :loading="saving">
            {{ editingHabit ? '保存' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Calendar } from '@element-plus/icons-vue'
import HabitCard from './HabitCard.vue'
import IconPicker from './IconPicker.vue'
import { useTheme } from '@/composables/useTheme'
import { habitDB } from '@/utils/dbManager'
import type { Habit } from '../types/habit.d'

// 使用主题管理
const { currentTheme } = useTheme()

// 响应式数据
const habits = ref<Habit[]>([])
const showAddHabitDialog = ref(false)
const editingHabit = ref<Habit | null>(null)
const saving = ref(false)
const habitFormRef = ref()

// 表单数据
const habitForm = ref({
  name: '',
  icon: 'calendar',
  color: '#3498db',
  frequency: 'daily',
  targetDays: 30,
  description: ''
})

// 表单验证规则
const habitRules = {
  name: [
    { required: true, message: '请输入习惯名称', trigger: 'blur' },
    { min: 1, max: 20, message: '习惯名称长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: '请选择习惯图标', trigger: 'change' }
  ],
  color: [
    { required: true, message: '请选择习惯颜色', trigger: 'change' }
  ],
  frequency: [
    { required: true, message: '请选择重复周期', trigger: 'change' }
  ],
  targetDays: [
    { required: true, message: '请设置目标天数', trigger: 'blur' },
    { type: 'number', min: 1, max: 365, message: '目标天数在 1 到 365 之间', trigger: 'blur' }
  ]
}

// 计算属性
const totalHabits = computed(() => habits.value.length)

const todayCheckedCount = computed(() => {
  const today = new Date().toDateString()
  return habits.value.filter(habit => 
    habit.checkInHistory?.some(checkIn => 
      new Date(checkIn.date).toDateString() === today
    )
  ).length
})

const longestStreak = computed(() => {
  if (habits.value.length === 0) return 0
  return Math.max(...habits.value.map(habit => habit.longestStreak || 0))
})

const completionRate = computed(() => {
  if (habits.value.length === 0) return 0
  const totalTarget = habits.value.reduce((sum, habit) => sum + (habit.targetDays || 30), 0)
  const totalCompleted = habits.value.reduce((sum, habit) => sum + (habit.currentStreak || 0), 0)
  return Math.round((totalCompleted / totalTarget) * 100)
})

// 方法
const loadHabits = async () => {
  try {
    const habitList = await habitDB.getAll()
    habits.value = habitList
  } catch (error) {
    console.error('加载习惯列表失败:', error)
    ElMessage.error('加载习惯列表失败')
  }
}

const handleCheckIn = async (habitId: string) => {
  try {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return

    const today = new Date().toDateString()
    const alreadyCheckedIn = habit.checkInHistory?.some(checkIn => 
      new Date(checkIn.date).toDateString() === today
    )

    if (alreadyCheckedIn) {
      ElMessage.warning('今天已经打卡了')
      return
    }

    // 更新习惯数据
    const updatedHabit = {
      ...habit,
      currentStreak: (habit.currentStreak || 0) + 1,
      totalCheckIns: (habit.totalCheckIns || 0) + 1,
      checkInHistory: [
        ...(habit.checkInHistory || []),
        { date: new Date().toISOString(), timestamp: Date.now() }
      ],
      lastCheckIn: new Date().toISOString(),
      updatedAt: Date.now()
    }

    // 更新最长连续天数
    if (updatedHabit.currentStreak > (updatedHabit.longestStreak || 0)) {
      updatedHabit.longestStreak = updatedHabit.currentStreak
    }

    await habitDB.update(habitId, updatedHabit)
    await loadHabits()
    
    ElMessage.success('打卡成功！')
  } catch (error) {
    console.error('打卡失败:', error)
    ElMessage.error('打卡失败，请重试')
  }
}

const handleEditHabit = (habit: Habit) => {
  editingHabit.value = habit
  habitForm.value = {
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    frequency: habit.frequency,
    targetDays: habit.targetDays,
    description: habit.description || ''
  }
  showAddHabitDialog.value = true
}

const handleDeleteHabit = async (habitId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个习惯吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await habitDB.delete(habitId)
    await loadHabits()
    ElMessage.success('习惯已删除')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除习惯失败:', error)
      ElMessage.error('删除习惯失败')
    }
  }
}

const handleSaveHabit = async () => {
  try {
    await habitFormRef.value.validate()
    saving.value = true

    const habitData = {
      ...habitForm.value,
      createdAt: editingHabit.value?.createdAt || Date.now(),
      updatedAt: Date.now(),
      currentStreak: editingHabit.value?.currentStreak || 0,
      longestStreak: editingHabit.value?.longestStreak || 0,
      totalCheckIns: editingHabit.value?.totalCheckIns || 0,
      checkInHistory: editingHabit.value?.checkInHistory || [],
      lastCheckIn: editingHabit.value?.lastCheckIn || null
    }

    if (editingHabit.value) {
      // 编辑现有习惯
      await habitDB.update(editingHabit.value.id, habitData)
      ElMessage.success('习惯已更新')
    } else {
      // 创建新习惯
      await habitDB.create(habitData)
      ElMessage.success('习惯创建成功')
    }

    showAddHabitDialog.value = false
    editingHabit.value = null
    resetForm()
    await loadHabits()
  } catch (error) {
    console.error('保存习惯失败:', error)
    ElMessage.error('保存习惯失败')
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  habitForm.value = {
    name: '',
    icon: 'calendar',
    color: '#3498db',
    frequency: 'daily',
    targetDays: 30,
    description: ''
  }
  habitFormRef.value?.resetFields()
}

// 监听弹窗关闭
const handleDialogClose = () => {
  editingHabit.value = null
  resetForm()
}

// 组件挂载时加载数据
onMounted(() => {
  loadHabits()
})
</script>

<style lang="scss" scoped>
.habit-page {
  width: 100%;
  min-width: 320px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  transition: all 0.3s ease;

  // 明色主题
  &[data-theme="light"] {
    .habit-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      
      .page-title {
        color: white;
      }
      
      .add-habit-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        
        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }
    
    .habit-list-section {
      background: #ffffff;
      
      .empty-state {
        .empty-icon {
          color: #bdc3c7;
        }
        
        .empty-text {
          color: #7f8c8d;
        }
      }
    }
    
    .habit-stats-section {
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      
      .stat-card {
        background: white;
        border: 1px solid #e9ecef;
        
        .stat-number {
          color: #2c3e50;
        }
        
        .stat-label {
          color: #6c757d;
        }
      }
    }
  }

  // 暗色主题
  &[data-theme="dark"] {
    .habit-header {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      
      .page-title {
        color: #ecf0f1;
      }
      
      .add-habit-btn {
        background: rgba(236, 240, 241, 0.2);
        border: 1px solid rgba(236, 240, 241, 0.3);
        color: #ecf0f1;
        
        &:hover {
          background: rgba(236, 240, 241, 0.3);
        }
      }
    }
    
    .habit-list-section {
      background: #2c3e50;
      
      .empty-state {
        .empty-icon {
          color: #7f8c8d;
        }
        
        .empty-text {
          color: #bdc3c7;
        }
      }
    }
    
    .habit-stats-section {
      background: #34495e;
      border-top: 1px solid #5a6c7d;
      
      .stat-card {
        background: #2c3e50;
        border: 1px solid #5a6c7d;
        
        .stat-number {
          color: #ecf0f1;
        }
        
        .stat-label {
          color: #bdc3c7;
        }
      }
    }
  }
}

.habit-header {
  padding: 16px 20px;
  border-radius: 12px 12px 0 0;
  margin-bottom: 0;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .page-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    .add-habit-btn {
      border-radius: 8px;
      font-size: 13px;
      padding: 8px 16px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }
}

.habit-list-section {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
  
  .habit-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    
    .empty-icon {
      margin-bottom: 16px;
      opacity: 0.6;
    }
    
    .empty-text {
      margin-bottom: 20px;
      font-size: 14px;
      line-height: 1.5;
    }
  }
}

.habit-stats-section {
  padding: 16px 20px;
  border-radius: 0 0 12px 12px;
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    
    .stat-card {
      padding: 16px;
      border-radius: 12px;
      text-align: center;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }
      
      .stat-number {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 4px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .stat-label {
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }
}

// 弹窗样式
:deep(.habit-dialog) {
  .el-dialog__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px 8px 0 0;
    
    .el-dialog__title {
      color: white;
    }
  }
  
  .el-dialog__body {
    padding: 24px;
  }
  
  .dialog-footer {
    text-align: right;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .habit-header {
    padding: 12px 16px;
    
    .header-content {
      .page-title {
        font-size: 16px;
      }
      
      .add-habit-btn {
        padding: 6px 12px;
        font-size: 12px;
      }
    }
  }
  
  .habit-list-section {
    padding: 12px 16px;
  }
  
  .habit-stats-section {
    padding: 12px 16px;
    
    .stats-grid {
      gap: 8px;
      
      .stat-card {
        padding: 12px;
        
        .stat-number {
          font-size: 20px;
        }
        
        .stat-label {
          font-size: 11px;
        }
      }
    }
  }
}
</style> 