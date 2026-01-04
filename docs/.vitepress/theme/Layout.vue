<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { ElMessage } from 'element-plus'
import ThemeSettings from './ThemeSettings.vue'

const { Layout } = DefaultTheme
const { page, frontmatter } = useData()

const copyAsMarkdown = async () => {
  try {
    // VitePress doesn't easily expose the raw markdown content in the client
    // Usually, you'd fetch it or have it pre-rendered. 
    // For now, we'll simulate or provide a message.
    const url = window.location.href
    await navigator.clipboard.writeText(`Page content from ${url}`)
    ElMessage.success('已复制页面链接 (模拟 Markdown 复制)')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

const downloadAsMarkdown = () => {
  const fileName = `${page.value.title || 'note'}.md`
  const blob = new Blob(['# ' + page.value.title + '\n\n' + '页面内容下载功能开发中...'], { type: 'text/markdown' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  ElMessage.success('正在准备下载...')
}

const sharePage = () => {
  navigator.clipboard.writeText(window.location.href)
  ElMessage.success('页面链接已复制到剪贴板')
}
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <ThemeSettings />
    </template>
    <template #doc-before>
      <div class="custom-breadcrumb" v-if="!frontmatter.home">
        <span class="home-icon">🏠</span>
        <span class="date">{{ new Date().toLocaleDateString() }}</span>
      </div>
      <div class="custom-actions" v-if="!frontmatter.home">
        <el-button-group>
          <el-button size="small" @click="copyAsMarkdown">
            <el-icon><CopyDocument /></el-icon> Copy as Markdown
          </el-button>
          <el-button size="small" @click="downloadAsMarkdown">
            <el-icon><Download /></el-icon> Download as Markdown
          </el-button>
        </el-button-group>
      </div>
    </template>

    <template #aside-top>
      <div class="share-action" v-if="!frontmatter.home">
        <el-button type="primary" plain size="small" @click="sharePage" class="share-btn">
          <el-icon><Share /></el-icon> 分享此页面
        </el-button>
      </div>
    </template>

    <template #doc-after>
      <el-backtop :right="100" :bottom="100" />
    </template>
  </Layout>
</template>

<style scoped>
.custom-breadcrumb {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--vp-c-text-3);
}

.custom-actions {
  margin-bottom: 24px;
  display: flex;
  gap: 8px;
}

.share-action {
  margin-bottom: 16px;
  padding: 0 16px;
}

.share-btn {
  width: 100%;
  border-radius: 20px;
}

.home-icon {
  font-size: 18px;
  cursor: pointer;
}

.date {
  font-family: monospace;
}
</style>
