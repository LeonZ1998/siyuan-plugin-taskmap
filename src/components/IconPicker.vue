<template>
  <div class="icon-picker-panel">
    <div class="icon-grid">
      <div
        v-for="iconId in iconIds"
        :key="iconId"
        :class="['icon-item', { active: iconId === modelValue }]"
        @click="$emit('update:modelValue', iconId)"
        :title="iconId"
      >
        <span v-html="getIconSVG(iconId)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ICON_IDS, getIconSVG } from '@/icons/icons'
import { computed } from 'vue'
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits(['update:modelValue'])
const iconIds = computed(() => [
  ICON_IDS.BOOK,
  ICON_IDS.STAR,
  ICON_IDS.HEART,
  ICON_IDS.FLAG,
  ICON_IDS.MUSIC,
  ICON_IDS.COFFEE,
  ICON_IDS.SUN,
  ICON_IDS.MOON,
  ICON_IDS.GIFT,
])
</script>

<style scoped>
.icon-picker-panel {
  padding: 12px 8px;
  background: var(--el-bg-color, #fff);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  min-width: 220px;
}
.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.icon-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border 0.2s, background 0.2s;
  background: none !important;
}
.icon-item.active {
  border: 2px solid #409EFF;
  /* background: #e6f7ff; */
}
.icon-item:hover {
  /* background: #f5f7fa; */
}
.icon-item span svg {
  background: none !important;
}
</style> 