<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isDark = ref(false)
const spotlightEnabled = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)

const themes = [
  { name: '预设', color: '#9b59b6', type: 'purple' },
  { name: '绿色', color: '#2ecc71', type: 'green' },
  { name: '黄色', color: '#f1c40f', type: 'yellow' },
  { name: '红色', color: '#e74c3c', type: 'red' }
]

const changeTheme = (theme) => {
  const root = document.documentElement
  root.style.setProperty('--vp-c-brand-1', theme.color)
  root.style.setProperty('--vp-c-brand-2', theme.color)
  root.style.setProperty('--vp-c-brand-3', theme.color)
  root.style.setProperty('--vp-c-brand-soft', `${theme.color}22`)
  root.style.setProperty('--el-color-primary', theme.color)
}

const layoutMode = ref('default') // 'default', 'full', 'no-sidebar', 'compact'

const changeLayout = (mode) => {
  layoutMode.value = mode
  const root = document.documentElement
  const body = document.body
  
  // 重置
  root.style.setProperty('--vp-layout-max-width', '1440px')
  body.classList.remove('no-sidebar')
  
  if (mode === 'full') {
    root.style.setProperty('--vp-layout-max-width', '100%')
  } else if (mode === 'no-sidebar') {
    body.classList.add('no-sidebar')
  } else if (mode === 'compact') {
    root.style.setProperty('--vp-layout-max-width', '960px')
  }
}

const toggleSpotlight = () => {
  spotlightEnabled.value = !spotlightEnabled.value
}

const handleMouseMove = (e) => {
  if (spotlightEnabled.value) {
    mouseX.value = e.clientX
    mouseY.value = e.clientY
    document.documentElement.style.setProperty('--x', `${e.clientX}px`)
    document.documentElement.style.setProperty('--y', `${e.clientY}px`)
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <el-popover placement="bottom" :width="300" trigger="click">
    <template #reference>
      <el-button circle class="settings-btn">
        <el-icon><Setting /></el-icon>
      </el-button>
    </template>

    <div class="settings-container">
      <div class="setting-section">
        <div class="section-title">
          <el-icon><Layout /></el-icon> 布局切换
        </div>
        <div class="layout-grid">
          <div 
            class="layout-item" 
            :class="{ active: layoutMode === 'full' }"
            @click="changeLayout('full')"
            title="全屏"
          >
            <el-icon><FullScreen /></el-icon>
          </div>
          <div 
            class="layout-item" 
            :class="{ active: layoutMode === 'default' }"
            @click="changeLayout('default')"
            title="默认"
          >
            <el-icon><Expand /></el-icon>
          </div>
          <div 
            class="layout-item" 
            :class="{ active: layoutMode === 'no-sidebar' }"
            @click="changeLayout('no-sidebar')"
            title="隐藏侧边栏"
          >
            <el-icon><Fold /></el-icon>
          </div>
          <div 
            class="layout-item" 
            :class="{ active: layoutMode === 'compact' }"
            @click="changeLayout('compact')"
            title="紧凑"
          >
            <el-icon><Crop /></el-icon>
          </div>
        </div>
      </div>

      <div class="setting-section">
        <div class="section-title">
          <el-icon><Brush /></el-icon> 主题色
        </div>
        <div class="theme-grid">
          <div 
            v-for="t in themes" 
            :key="t.name" 
            class="theme-item" 
            @click="changeTheme(t)"
          >
            <div class="color-dot" :style="{ backgroundColor: t.color }"></div>
            <span>{{ t.name }}</span>
          </div>
        </div>
      </div>

      <div class="setting-section">
        <div class="section-title">
          <el-icon><Odometer /></el-icon> 聚光灯
          <el-switch v-model="spotlightEnabled" size="small" style="margin-left: auto" />
        </div>
        <div class="spotlight-actions">
          <el-button-group size="small">
            <el-button :type="spotlightEnabled ? 'primary' : ''" @click="spotlightEnabled = true">ON</el-button>
            <el-button :type="!spotlightEnabled ? 'primary' : ''" @click="spotlightEnabled = false">OFF</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
  </el-popover>

  <teleport to="body">
    <div v-if="spotlightEnabled" class="spotlight-active"></div>
  </teleport>
</template>

<style scoped>
.settings-btn {
  margin-left: 12px;
  border: none;
  background: transparent;
  font-size: 20px;
}

.settings-container {
  padding: 8px;
}

.setting-section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--vp-c-text-1);
}

.layout-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.layout-item {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  cursor: pointer;
  background: var(--vp-c-bg-soft);
}

.layout-item.active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.theme-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.color-dot {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid transparent;
}

.theme-item:hover .color-dot {
  transform: scale(1.1);
}

.theme-item span {
  font-size: 12px;
}

.spotlight-actions {
  display: flex;
  justify-content: center;
}
</style>
