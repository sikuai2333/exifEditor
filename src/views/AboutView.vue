<template>
  <div class="about-container">
    <h1>关于</h1>
    <div class="about-content">
      <p>EXIF编辑器是一款便捷的图片元数据查看与编辑工具。您可以使用它来查看、编辑和管理图片的EXIF信息。</p>
      
      <div class="feature-list">
        <h2>主要功能</h2>
        <ul>
          <li>查看图片的详细EXIF信息</li>
          <li>编辑现有EXIF数据</li>
          <li>添加新的EXIF信息</li>
          <li>删除不需要的EXIF标签</li>
          <li>提供在线搜图网站导航</li>
        </ul>
      </div>
      
      <div class="about-button-container">
        <button @click="openAuthorWebsite" class="author-button">访问作者网站</button>
      </div>
      
      <div class="version-info">
        <p>版本: 1.0.0</p>
        <p>© 2023 EXIF编辑器</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 打开作者网站函数
const openAuthorWebsite = () => {
  // 使用内置浏览器打开作者网站
  window.open('https://sikuai2333.github.io', '_blank')
}
</script>

<style scoped>
.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.about-content {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.feature-list {
  margin: 20px 0;
}

.feature-list h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.feature-list ul {
  padding-left: 20px;
}

.feature-list li {
  margin-bottom: 8px;
}

.about-button-container {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.author-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.author-button:hover {
  background-color: #45a049;
}

.version-info {
  text-align: center;
  color: #666;
  margin-top: 30px;
  font-size: 14px;
}

.version-info p {
  margin: 5px 0;
}

/* 移动端样式适配 */
@media (max-width: 600px) {
  .about-container {
    padding: 15px;
  }
  
  .about-content {
    padding: 15px;
  }
  
  .feature-list h2 {
    font-size: 1.3rem;
  }
}
</style>
