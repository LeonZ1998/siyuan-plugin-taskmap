<template>
  <div class="habit-card" :style="{ borderColor: habit.color }">
    <div class="icon-area" :style="{ background: habit.color }">
      <span class="icon" v-html="iconSVG"></span>
    </div>
    <div class="info-area">
      <div class="habit-title">{{ habit.name }}</div>
      <div class="habit-meta">
        <span class="streak">连续 {{ habit.currentStreak || 0 }} 天</span>
        <span class="target">目标 {{ habit.targetDays || 0 }} 天</span>
      </div>
    </div>
    <div class="action-area">
      <el-button
        type="success"
        size="small"
        class="checkin-btn"
        :disabled="checkedInToday"
        @click.stop="onCheckIn"
      >
        {{ checkedInToday ? '已打卡' : '打卡' }}
      </el-button>
      <el-dropdown trigger="click">
        <el-button icon="el-icon-more" circle size="small" class="more-btn" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click.stop="onEdit">编辑</el-dropdown-item>
            <el-dropdown-item divided @click.stop="onDelete">删除</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getIconSVG } from '../icons/icons'

const props = defineProps({
  habit: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['check-in', 'edit', 'delete'])

const iconSVG = computed(() => getIconSVG(props.habit.icon || 'iconHabit'))

const checkedInToday = computed(() => {
  if (!props.habit.checkInHistory) return false
  const today = new Date().toDateString()
  return props.habit.checkInHistory.some((c: any) => new Date(c.date).toDateString() === today)
})

function onCheckIn() {
  emit('check-in', props.habit.id)
}
function onEdit() {
  emit('edit', props.habit)
}
function onDelete() {
  emit('delete', props.habit.id)
}
</script>

<style lang="scss" scoped>
.habit-card {
  display: flex;
  align-items: center;
  background: var(--el-bg-color, #fff);
  border: 2px solid #e0e0e0;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 12px 16px;
  margin-bottom: 8px;
  transition: box-shadow 0.2s, border-color 0.2s;
  min-height: 64px;
  &:hover {
    box-shadow: 0 6px 24px rgba(66,133,244,0.08);
    border-color: #a0c4ff;
  }
  .icon-area {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    .icon {
      width: 28px;
      height: 28px;
      display: block;
    }
  }
  .info-area {
    flex: 1;
    .habit-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--el-text-color-primary, #222);
    }
    .habit-meta {
      font-size: 12px;
      color: var(--el-text-color-secondary, #888);
      display: flex;
      gap: 12px;
    }
  }
  .action-area {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    .checkin-btn {
      min-width: 56px;
      font-size: 13px;
      border-radius: 8px;
      padding: 4px 12px;
    }
    .more-btn {
      margin-top: 2px;
    }
  }
}
</style> 