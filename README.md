# EXIF编辑器

EXIF编辑器是一个用于查看和编辑图片EXIF元数据的跨平台应用程序，基于Vue 3和Capacitor构建。

## 功能特性

- 🖼️ 查看图片的EXIF信息
- ✏️ 编辑EXIF元数据（相机型号、拍摄时间、位置等）
- 📝 添加自定义EXIF字段
- 🗺️ 内置地图选择器，编辑地理位置信息
- 💾 保存修改后的图片，保留原图
- 🔍 链接到在线图片搜索工具
- 📱 支持Web和Android平台

## 技术栈

- Vue 3
- TypeScript
- Vite
- Capacitor 7
- piexifjs (用于EXIF数据操作)
- exif-js (用于EXIF数据读取)

## 开发指南

### 环境准备

1. 安装Node.js (推荐v16或更高版本)
2. 安装依赖：`npm install`

### Web开发

1. 启动开发服务器：`npm run dev`
2. 构建生产版本：`npm run build`
3. 预览生产版本：`npm run preview`

### Android开发

1. 确保已安装Java JDK和Android Studio
2. 构建Web资源：`npm run build`
3. 同步Android项目：`npx cap sync android`
4. 打开Android Studio：`npx cap open android`
5. 从Android Studio构建和运行应用

## 项目结构

```
exifEditor/
├── android/              # Android平台文件
├── public/               # 静态资源
├── src/                  # 源代码
│   ├── assets/           # 图片和样式资源
│   ├── components/       # Vue组件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia状态管理
│   ├── views/            # 页面视图
│   ├── App.vue           # 主应用组件
│   └── main.ts           # 入口文件
├── capacitor.config.ts   # Capacitor配置
└── package.json          # 项目配置
```

## 主要功能模块

### EXIF修改器

EXIF修改器是应用的核心功能，允许用户：

1. 上传图片并查看其EXIF数据
2. 编辑现有的EXIF字段
3. 添加新的EXIF字段
4. 使用地图选择器添加/修改地理位置
5. 保存修改后的图片

### 在线查询

提供链接到多个在线搜图工具，包括：

- Google图片搜索
- 百度图片
- TinEye
- Yandex图片
- SauceNAO
- Bing图片
- 搜狗图片

## Android构建

在Android平台上构建应用程序时需要注意：

1. 确保在`android/app/src/main/AndroidManifest.xml`中配置了正确的权限
2. 应用需要以下权限：
   - 互联网访问权限（用于在线搜索）
   - 存储读取权限（用于加载图片）
   - 存储写入权限（用于保存修改后的图片）

## 许可证

MIT

## 项目设置

### 安装依赖
```bash
npm install
```

### 开发调试
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 代码格式化
```bash
npm run format
```

## 兼容性要求
- **网页端**: 支持主流桌面浏览器及其近两个版本
- **移动端**: 支持iOS 13及以上、Android 6.0及以上版本

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

