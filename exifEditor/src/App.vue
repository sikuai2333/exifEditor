<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { Capacitor } from '@capacitor/core'

// 检测是否为移动设备
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 计算内容样式
const contentStyle = computed(() => {
  return {
    paddingBottom: isMobile.value ? '60px' : '0'
  }
})

// 监听窗口大小变化
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
</script>

<template>
  <div class="app-container">
    <!-- 网页端顶部导航 -->
    <header v-if="!isMobile" class="web-header">
      <div class="logo">
        <h1>EXIF编辑器</h1>
      </div>
      <nav class="web-nav">
        <RouterLink to="/modifier">EXIF修改器</RouterLink>
        <RouterLink to="/search">在线查询</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
    </header>

    <!-- 页面内容区域 -->
    <main :style="contentStyle">
      <RouterView />
    </main>

    <!-- 移动端底部导航栏 -->
    <nav v-if="isMobile" class="mobile-nav">
      <RouterLink to="/modifier" class="nav-item">
        <div class="nav-icon">📷</div>
        <div class="nav-text">修改器</div>
      </RouterLink>
      <RouterLink to="/search" class="nav-item">
        <div class="nav-icon">🔍</div>
        <div class="nav-text">在线查询</div>
      </RouterLink>
      <RouterLink to="/about" class="nav-item">
        <div class="nav-icon">ℹ️</div>
        <div class="nav-text">关于</div>
      </RouterLink>
    </nav>
  </div>
</template>

<style>
/* 全局样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
}

.app-container {
  min-height: 100vh;
  position: relative;
}

/* 网页端顶部导航 */
.web-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo h1 {
  font-size: 1.5rem;
  margin: 0;
  color: #4CAF50;
}

.web-nav {
  display: flex;
  gap: 20px;
}

.web-nav a {
  text-decoration: none;
  color: #555;
  font-weight: bold;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.web-nav a:hover {
  background-color: #f0f0f0;
}

.web-nav a.router-link-active {
  color: #4CAF50;
  background-color: #eaf7ea;
}

/* 移动端底部导航栏 */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  width: 33.333%;
  text-decoration: none;
  color: #777;
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 2px;
}

.nav-text {
  font-size: 12px;
}

.mobile-nav a.router-link-active {
  color: #4CAF50;
}

/* 内容区域样式已删除 */
</style>
