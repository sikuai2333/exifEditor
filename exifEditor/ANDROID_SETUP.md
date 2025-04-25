# Android平台设置指南

本文档提供了如何在Android Studio中设置和构建EXIF编辑器Android应用的详细步骤。

## 前提条件

1. 安装[Android Studio](https://developer.android.com/studio)
2. 安装[Java Development Kit (JDK)](https://www.oracle.com/java/technologies/javase-downloads.html) 11或更高版本

## 配置步骤

### 1. 打开Android项目

在完成Web项目构建和Capacitor同步后，使用以下命令打开Android Studio：

```bash
# 构建Web项目
npm run build

# 同步Android项目
npx cap sync android

# 打开Android Studio
npx cap open android
```

如果上述命令无法打开Android Studio，您可以手动打开Android Studio并选择导入项目，然后导航到项目的`android`目录。

### 2. 确认项目设置

在Android Studio中打开项目后，请确认以下设置：

- **应用ID**: 在`app/build.gradle`中确认`applicationId`为`com.exifeditor.app`
- **最低SDK版本**: 确认`minSdkVersion`至少为23 (Android 6.0)
- **目标SDK版本**: 确认`targetSdkVersion`为最新版本(建议33或更高)

### 3. 配置应用图标

默认图标位于`app/src/main/res/mipmap`目录。您可以使用Android Studio的Asset Studio工具替换这些图标：

1. 右键点击`res`目录
2. 选择`New > Image Asset`
3. 选择`Icon Type` > `Launcher Icons`
4. 配置您的图标并点击`Next`，然后`Finish`

### 4. 验证AndroidManifest.xml

确保`app/src/main/AndroidManifest.xml`包含所有必要的权限：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

### 5. 构建和运行应用

1. 将Android设备连接到计算机，或设置Android模拟器
2. 在Android Studio中点击"运行"按钮（绿色三角形）
3. 选择目标设备并点击"确定"

### 6. 生成APK文件

要生成可分发的APK文件：

1. 在Android Studio中选择`Build > Build Bundle(s) / APK(s) > Build APK(s)`
2. 构建完成后，点击"定位"以找到APK文件

## 故障排除

### 构建错误

如果遇到构建错误，请尝试以下步骤：

1. 在Android Studio中选择`File > Invalidate Caches / Restart`
2. 确保所有依赖项都已正确安装：`npm install`，然后再次同步：`npx cap sync android`
3. 检查是否有版本冲突的依赖项

### 运行时权限问题

如果应用在运行时出现权限问题：

1. 确保AndroidManifest.xml中包含了所有必要的权限
2. 对于Android 6.0及以上版本，确保应用在运行时请求敏感权限

## 发布到Google Play

要将应用发布到Google Play，您需要：

1. 创建签名密钥：
   ```
   keytool -genkey -v -keystore exifeditor-key.keystore -alias exifeditor -keyalg RSA -keysize 2048 -validity 10000
   ```

2. 在`app/build.gradle`中配置签名信息
3. 生成已签名的APK或AAB文件
4. 在[Google Play Console](https://play.google.com/console)上创建开发者账户并上传您的应用

## 参考资源

- [Capacitor文档](https://capacitorjs.com/docs)
- [Android开发者文档](https://developer.android.com/docs)
- [Google Play发布流程](https://developer.android.com/studio/publish) 