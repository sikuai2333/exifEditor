<template>
  <div class="search-container">
    <h1>在线图片搜索</h1>
    <p class="description">选择以下搜图网站进行搜索，点击列表项将打开对应网站</p>
    
    <div class="search-list">
      <div 
        v-for="site in searchSites" 
        :key="site.id" 
        class="search-item"
        @click="openSite(site.url)"
      >
        <div class="site-icon">
          <img :src="site.icon" :alt="site.name" class="icon-img" />
        </div>
        <div class="site-info">
          <h3 class="site-name">{{ site.name }}</h3>
          <p class="site-description">{{ site.description }}</p>
        </div>
        <div class="site-arrow">
          <span>→</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'

// 搜图网站列表
const searchSites = ref([
  {
    id: 1,
    name: 'Google图片搜索',
    description: '全球最大的图片搜索引擎，支持上传图片进行反向搜索',
    url: 'https://images.google.com/',
    icon: 'https://www.google.com/favicon.ico'
  },
  {
    id: 2,
    name: '百度图片',
    description: '中国最大的图片搜索引擎，提供海量图片搜索服务',
    url: 'https://image.baidu.com/',
    icon: 'https://www.baidu.com/favicon.ico'
  },
  {
    id: 3,
    name: 'TinEye',
    description: '专业的反向图片搜索网站，可精确找到图片来源',
    url: 'https://tineye.com/',
    icon: 'https://tineye.com/favicon.ico'
  },
  {
    id: 4,
    name: 'Yandex图片',
    description: '俄罗斯搜索引擎，强大的反向图片搜索功能',
    url: 'https://yandex.com/images/',
    icon: 'https://yandex.com/favicon.ico'
  },
  {
    id: 5,
    name: 'SauceNAO',
    description: '专注于动漫、插画作品的图片搜索引擎',
    url: 'https://saucenao.com/',
    icon: 'https://saucenao.com/favicon.ico'
  },
  {
    id: 6,
    name: 'Bing图片',
    description: '微软提供的图片搜索服务，界面简洁',
    url: 'https://www.bing.com/images/',
    icon: 'https://www.bing.com/favicon.ico'
  },
  {
    id: 7,
    name: '搜狗图片',
    description: '中文搜索引擎，提供丰富的中文图片资源',
    url: 'https://pic.sogou.com/',
    icon: 'https://www.sogou.com/favicon.ico'
  }
])

// 打开网站
const openSite = async (url: string) => {
  if (Capacitor.isNativePlatform()) {
    // 在移动端环境中，使用Capacitor的Browser插件打开
    await Browser.open({ url });
  } else {
    // 在网页端环境中，直接使用window.open
    window.open(url, '_blank');
  }
}
</script>

<style scoped>
.search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.description {
  color: #666;
  margin-bottom: 20px;
}

.search-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.search-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.search-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.site-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.icon-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.site-info {
  flex: 1;
}

.site-name {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.site-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.site-arrow {
  margin-left: 10px;
  font-size: 20px;
  color: #999;
}

/* 移动端样式适配 */
@media (max-width: 600px) {
  .search-container {
    padding: 15px;
  }
  
  .search-item {
    padding: 12px;
  }
  
  .site-icon {
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }
  
  .site-name {
    font-size: 16px;
  }
  
  .site-description {
    font-size: 12px;
  }
}
</style> 