<template>
  <div class="modifier-container">
    <h1>EXIF修改器</h1>
    
    <div class="file-upload">
      <input 
        type="file" 
        @change="handleFileSelect" 
        accept="image/*" 
        id="file-input"
        ref="fileInput"
        class="file-input"
      />
      <button @click="triggerFileInput" class="upload-btn">选择图片</button>
      <p v-if="selectedFile">已选择: {{ selectedFile.name }}</p>
    </div>
    
    <div v-if="exifData" class="exif-container">
      <h2>EXIF信息</h2>
      
      <div class="exif-actions">
        <button @click="addExifField" class="action-btn" :disabled="availableFields.length === 0">
          添加字段
        </button>
        <button 
          @click="saveChanges" 
          class="action-btn save-btn"
          :disabled="processingFile"
        >
          {{ processingFile ? '处理中...' : '保存修改' }}
        </button>
      </div>
      
      <!-- 错误信息显示 -->
      <div v-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
      </div>
      
      <!-- 添加字段面板 -->
      <div v-if="showAddField" class="add-field-panel">
        <div class="field-select-container">
          <label for="field-select">选择要添加的字段</label>
          <select v-model="newFieldKey" id="field-select" class="field-select">
            <option value="" disabled>-- 请选择字段 --</option>
            <option v-for="field in availableFields" :key="field.key" :value="field.key">
              {{ field.name }}
            </option>
          </select>
        </div>
        
        <div v-if="newFieldKey" class="field-description">
          {{ getFieldDescription(newFieldKey) }}
        </div>
        
        <div v-if="newFieldKey" class="field-value-input">
          <!-- 根据字段类型显示不同的输入控件 -->
          <template v-if="getEditMode(newFieldKey) === 'select'">
            <div class="select-with-custom">
              <select v-model="newFieldValue" class="value-select">
                <option value="" disabled>-- 请选择 --</option>
                <option v-for="option in getFieldOptions(newFieldKey)" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
                <option value="custom">-- 自定义 --</option>
              </select>
              <input 
                v-if="newFieldValue === 'custom'" 
                v-model="customFieldValue" 
                class="value-input custom-input"
                placeholder="输入自定义值" 
              />
            </div>
          </template>
          
          <template v-else-if="getEditMode(newFieldKey) === 'date'">
            <input 
              type="datetime-local" 
              v-model="newFieldValue" 
              class="value-input datetime-input" 
            />
          </template>
          
          <template v-else-if="getEditMode(newFieldKey) === 'number'">
            <div class="number-input-container">
              <input 
                type="number" 
                v-model="newFieldValue" 
                class="value-input number-input"
                :min="getFieldNumberConfig(newFieldKey).min"
                :max="getFieldNumberConfig(newFieldKey).max"
                :step="getFieldNumberConfig(newFieldKey).step"
              />
              <span class="unit-label">{{ getFieldNumberConfig(newFieldKey).unit }}</span>
            </div>
          </template>
          
          <template v-else>
            <input 
              type="text" 
              v-model="newFieldValue" 
              class="value-input text-input"
              placeholder="输入字段值" 
            />
          </template>
        </div>
        
        <div class="field-actions">
          <button @click="confirmAddField" class="confirm-btn">添加</button>
          <button @click="cancelAddField" class="cancel-btn">取消</button>
        </div>
      </div>
      
      <!-- EXIF字段列表 -->
      <div class="exif-list">
        <div v-for="(value, key) in editableExifData" :key="key" class="exif-item">
          <div class="exif-field-header">
            <div class="exif-key">{{ getFieldName(key) }}</div>
            <button @click="deleteExifField(key)" class="delete-btn">删除</button>
          </div>
          
          <div class="exif-field-description">
            {{ getFieldDescription(key) }}
          </div>
          
          <div class="exif-value">
            <!-- 根据字段类型显示不同的编辑控件 -->
            <template v-if="getEditMode(key) === 'select'">
              <div class="select-with-custom">
                <select v-model="editableExifData[key]" class="value-select">
                  <option v-for="option in getFieldOptions(key)" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                  <option value="custom">-- 自定义 --</option>
                </select>
                <input 
                  v-if="editableExifData[key] === 'custom'" 
                  v-model="customValues[key]" 
                  class="value-input custom-input"
                  placeholder="输入自定义值" 
                />
              </div>
            </template>
            
            <template v-else-if="getEditMode(key) === 'date'">
              <input 
                type="datetime-local" 
                :value="convertExifDateToHtmlFormat(editableExifData[key])" 
                @input="e => { formatDateTimeInput(key, (e.target as HTMLInputElement).value) }"
                class="value-input datetime-input" 
              />
            </template>
            
            <template v-else-if="getEditMode(key) === 'number'">
              <div class="number-input-container">
                <input 
                  type="number" 
                  v-model="editableExifData[key]" 
                  class="value-input number-input"
                  :min="getFieldNumberConfig(key).min"
                  :max="getFieldNumberConfig(key).max"
                  :step="getFieldNumberConfig(key).step"
                />
                <span class="unit-label">{{ getFieldNumberConfig(key).unit }}</span>
              </div>
            </template>
            
            <template v-else-if="getEditMode(key) === 'location'">
              <div class="location-input-container">
                <input 
                  type="text" 
                  v-model="editableExifData[key]" 
                  class="value-input location-input"
                  :readonly="true"
                />
                <button @click="openMapPicker(key)" class="map-btn">选择位置</button>
              </div>
            </template>
            
            <template v-else>
              <input v-model="editableExifData[key]" class="value-input text-input" />
            </template>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="selectedFile" class="loading">
      加载EXIF数据中...
    </div>
    
    <div v-else class="no-image">
      请选择一张图片以查看并编辑EXIF信息
    </div>
    
    <!-- 地图选择器对话框 -->
    <div v-if="showMapPicker" class="map-picker-overlay">
      <div class="map-picker-container">
        <h3>选择位置</h3>
        
        <div class="location-search">
          <button 
            @click="togglePresetLocations" 
            class="preset-toggle-btn"
            :class="{ 'active': showPresetLocations }"
          >
            预设地点
          </button>
          
          <div class="search-box">
            <input 
              type="text" 
              placeholder="搜索地点..." 
              v-model="searchQuery"
              @focus="showPresetLocations = true"
              class="search-input"
            />
            <span class="search-icon">🔍</span>
          </div>
        </div>
        
        <!-- 预设位置列表 -->
        <div v-if="showPresetLocations" class="preset-locations">
          <div v-if="filteredLocations.length === 0" class="no-results">
            没有找到匹配的地点
          </div>
          <div 
            v-for="location in filteredLocations" 
            :key="location.name"
            class="location-item"
            @click="selectPresetLocation(location)"
          >
            <span class="location-name">{{ location.name }}</span>
            <span class="location-coords">{{ location.lat.toFixed(4) }}, {{ location.lng.toFixed(4) }}</span>
          </div>
        </div>
        
        <div class="map-container">
          <!-- 模拟地图组件 -->
          <div class="mock-map">
            <div class="map-instructions">
              <h4>地图区域</h4>
              <p>在实际应用中，这里会显示交互式地图</p>
              <p>您可以直接输入坐标或使用预设地点</p>
            </div>
            
            <div class="map-visual">
              <div class="map-indicator">
                <div class="map-pin">📍</div>
                <div class="ripple"></div>
              </div>
            </div>
            
            <div class="selected-coords">
              <p>当前选择坐标</p>
              <p class="coords-display">
                <span class="coord-label">纬度:</span> 
                <span class="coord-value">{{ selectedLocation.lat.toFixed(6) }}°</span>
                <span class="coord-type">{{ selectedLocation.lat >= 0 ? '北纬(N)' : '南纬(S)' }}</span>
              </p>
              <p class="coords-display">
                <span class="coord-label">经度:</span> 
                <span class="coord-value">{{ selectedLocation.lng.toFixed(6) }}°</span>
                <span class="coord-type">{{ selectedLocation.lng >= 0 ? '东经(E)' : '西经(W)' }}</span>
              </p>
            </div>
            
            <!-- 手动输入区域 -->
            <div class="manual-coords">
              <div class="coord-group">
                <div class="coord-input">
                  <label>纬度 (°):</label>
                  <div class="input-with-controls">
                    <button @click="selectedLocation.lat -= 0.01" class="adjust-btn">−</button>
                    <input 
                      type="number" 
                      v-model.number="selectedLocation.lat" 
                      step="0.000001"
                      min="-90"
                      max="90"
                    />
                    <button @click="selectedLocation.lat += 0.01" class="adjust-btn">+</button>
                  </div>
                </div>
                <div class="hemisphere">
                  <label class="hemisphere-label">{{ selectedLocation.lat >= 0 ? '北纬(N)' : '南纬(S)' }}</label>
                </div>
              </div>
              
              <div class="coord-group">
                <div class="coord-input">
                  <label>经度 (°):</label>
                  <div class="input-with-controls">
                    <button @click="selectedLocation.lng -= 0.01" class="adjust-btn">−</button>
                    <input 
                      type="number" 
                      v-model.number="selectedLocation.lng" 
                      step="0.000001"
                      min="-180"
                      max="180"
                    />
                    <button @click="selectedLocation.lng += 0.01" class="adjust-btn">+</button>
                  </div>
                </div>
                <div class="hemisphere">
                  <label class="hemisphere-label">{{ selectedLocation.lng >= 0 ? '东经(E)' : '西经(W)' }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="map-actions">
          <button @click="confirmLocationSelection" class="confirm-btn">确认位置</button>
          <button @click="cancelMapSelection" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>
    
    <!-- 保存对话框 -->
    <div v-if="showSaveDialog" class="save-dialog-overlay">
      <div class="save-dialog-container">
        <h3>保存修改后的图片</h3>
        
        <div class="image-preview-container">
          <img v-if="imagePreview" :src="imagePreview" alt="预览" class="image-preview" />
          <div v-else class="no-preview">无法预览图片</div>
        </div>
        
        <div class="filename-editor">
          <label for="filename-input">文件名:</label>
          <input 
            type="text" 
            id="filename-input" 
            v-model="fileName" 
            class="filename-input"
          />
        </div>
        
        <div class="save-dialog-actions">
          <button @click="downloadImage" class="download-btn">下载图片</button>
          <button @click="closeSaveDialog" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import EXIF from 'exif-js'
import piexif from 'piexifjs'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const exifData = ref<any>(null)
const editableExifData = reactive<Record<string, any>>({})
const showAddField = ref(false)
const newFieldKey = ref('')
const newFieldValue = ref('')
const customFieldValue = ref('') // 添加字段时的自定义值输入
const customValues = reactive<Record<string, string>>({}) // 已有字段的自定义值
const showMapPicker = ref(false)
const mapCenter = reactive({ lat: 39.9042, lng: 116.4074 }) // 默认北京位置
const selectedLocation = reactive({ lat: 0, lng: 0 })
const showPresetLocations = ref(false)
const searchQuery = ref('')
const processingFile = ref(false)
const resultImage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const showSaveDialog = ref(false)
const imagePreview = ref<string | null>(null)
const fileName = ref('')

// 编辑模式类型
enum EditModeType {
  TEXT = 'text',
  SELECT = 'select',
  DATE = 'date',
  LOCATION = 'location',
  NUMBER = 'number',
}

// 字段编辑模式配置
interface FieldConfig {
  key: string
  name: string
  description: string
  mode: EditModeType
  options?: Array<{ value: string, label: string }>
  min?: number
  max?: number
  step?: number
  unit?: string
}

// 常用相机品牌及型号
const cameraMakes = [
  { value: 'Canon', label: 'Canon/佳能' },
  { value: 'Nikon', label: 'Nikon/尼康' },
  { value: 'Sony', label: 'Sony/索尼' },
  { value: 'Fujifilm', label: 'Fujifilm/富士' },
  { value: 'Panasonic', label: 'Panasonic/松下' },
  { value: 'Olympus', label: 'Olympus/奥林巴斯' },
  { value: 'LEICA', label: 'LEICA/徕卡' },
  { value: 'Apple', label: 'Apple/苹果' },
  { value: 'HUAWEI', label: 'HUAWEI/华为' },
  { value: 'Samsung', label: 'Samsung/三星' },
  { value: 'Xiaomi', label: 'Xiaomi/小米' },
  { value: 'OPPO', label: 'OPPO' },
  { value: 'vivo', label: 'vivo' }
]

// 常用软件
const softwareOptions = [
  { value: 'Adobe Photoshop', label: 'Adobe Photoshop' },
  { value: 'Adobe Lightroom', label: 'Adobe Lightroom' },
  { value: 'Capture One', label: 'Capture One' },
  { value: 'GIMP', label: 'GIMP' },
  { value: 'Luminar', label: 'Luminar' },
  { value: 'Affinity Photo', label: 'Affinity Photo' },
  { value: 'Photos (Apple)', label: 'Photos (Apple)' }
]

// 光圈值选项
const apertureOptions = [
  { value: '1.0', label: 'f/1.0' },
  { value: '1.2', label: 'f/1.2' },
  { value: '1.4', label: 'f/1.4' },
  { value: '1.8', label: 'f/1.8' },
  { value: '2.0', label: 'f/2.0' },
  { value: '2.2', label: 'f/2.2' },
  { value: '2.8', label: 'f/2.8' },
  { value: '3.2', label: 'f/3.2' },
  { value: '3.5', label: 'f/3.5' },
  { value: '4.0', label: 'f/4.0' },
  { value: '4.5', label: 'f/4.5' },
  { value: '5.0', label: 'f/5.0' },
  { value: '5.6', label: 'f/5.6' },
  { value: '6.3', label: 'f/6.3' },
  { value: '7.1', label: 'f/7.1' },
  { value: '8.0', label: 'f/8.0' },
  { value: '9.0', label: 'f/9.0' },
  { value: '10', label: 'f/10' },
  { value: '11', label: 'f/11' },
  { value: '13', label: 'f/13' },
  { value: '14', label: 'f/14' },
  { value: '16', label: 'f/16' },
  { value: '18', label: 'f/18' },
  { value: '20', label: 'f/20' },
  { value: '22', label: 'f/22' }
]

// 曝光时间选项
const exposureTimeOptions = [
  { value: '1/8000', label: '1/8000秒' },
  { value: '1/6400', label: '1/6400秒' },
  { value: '1/5000', label: '1/5000秒' },
  { value: '1/4000', label: '1/4000秒' },
  { value: '1/3200', label: '1/3200秒' },
  { value: '1/2500', label: '1/2500秒' },
  { value: '1/2000', label: '1/2000秒' },
  { value: '1/1600', label: '1/1600秒' },
  { value: '1/1250', label: '1/1250秒' },
  { value: '1/1000', label: '1/1000秒' },
  { value: '1/800', label: '1/800秒' },
  { value: '1/640', label: '1/640秒' },
  { value: '1/500', label: '1/500秒' },
  { value: '1/400', label: '1/400秒' },
  { value: '1/320', label: '1/320秒' },
  { value: '1/250', label: '1/250秒' },
  { value: '1/200', label: '1/200秒' },
  { value: '1/160', label: '1/160秒' },
  { value: '1/125', label: '1/125秒' },
  { value: '1/100', label: '1/100秒' },
  { value: '1/80', label: '1/80秒' },
  { value: '1/60', label: '1/60秒' },
  { value: '1/50', label: '1/50秒' },
  { value: '1/40', label: '1/40秒' },
  { value: '1/30', label: '1/30秒' },
  { value: '1/25', label: '1/25秒' },
  { value: '1/20', label: '1/20秒' },
  { value: '1/15', label: '1/15秒' },
  { value: '1/13', label: '1/13秒' },
  { value: '1/10', label: '1/10秒' },
  { value: '1/8', label: '1/8秒' },
  { value: '1/6', label: '1/6秒' },
  { value: '1/5', label: '1/5秒' },
  { value: '1/4', label: '1/4秒' },
  { value: '0.3', label: '0.3秒' },
  { value: '0.4', label: '0.4秒' },
  { value: '0.5', label: '0.5秒' },
  { value: '0.6', label: '0.6秒' },
  { value: '0.8', label: '0.8秒' },
  { value: '1', label: '1秒' },
  { value: '1.3', label: '1.3秒' },
  { value: '1.6', label: '1.6秒' },
  { value: '2', label: '2秒' },
  { value: '2.5', label: '2.5秒' },
  { value: '3.2', label: '3.2秒' },
  { value: '4', label: '4秒' },
  { value: '5', label: '5秒' },
  { value: '6', label: '6秒' },
  { value: '8', label: '8秒' },
  { value: '10', label: '10秒' },
  { value: '13', label: '13秒' },
  { value: '15', label: '15秒' },
  { value: '20', label: '20秒' },
  { value: '25', label: '25秒' },
  { value: '30', label: '30秒' }
]

// ISO感光度选项
const isoOptions = [
  { value: '50', label: 'ISO 50' },
  { value: '64', label: 'ISO 64' },
  { value: '80', label: 'ISO 80' },
  { value: '100', label: 'ISO 100' },
  { value: '125', label: 'ISO 125' },
  { value: '160', label: 'ISO 160' },
  { value: '200', label: 'ISO 200' },
  { value: '250', label: 'ISO 250' },
  { value: '320', label: 'ISO 320' },
  { value: '400', label: 'ISO 400' },
  { value: '500', label: 'ISO 500' },
  { value: '640', label: 'ISO 640' },
  { value: '800', label: 'ISO 800' },
  { value: '1000', label: 'ISO 1000' },
  { value: '1250', label: 'ISO 1250' },
  { value: '1600', label: 'ISO 1600' },
  { value: '2000', label: 'ISO 2000' },
  { value: '2500', label: 'ISO 2500' },
  { value: '3200', label: 'ISO 3200' },
  { value: '4000', label: 'ISO 4000' },
  { value: '5000', label: 'ISO 5000' },
  { value: '6400', label: 'ISO 6400' },
  { value: '8000', label: 'ISO 8000' },
  { value: '10000', label: 'ISO 10000' },
  { value: '12800', label: 'ISO 12800' },
  { value: '16000', label: 'ISO 16000' },
  { value: '20000', label: 'ISO 20000' },
  { value: '25600', label: 'ISO 25600' },
  { value: '32000', label: 'ISO 32000' },
  { value: '40000', label: 'ISO 40000' },
  { value: '51200', label: 'ISO 51200' },
  { value: '64000', label: 'ISO 64000' },
  { value: '80000', label: 'ISO 80000' },
  { value: '102400', label: 'ISO 102400' }
]

// 所有可用的EXIF字段定义
const fieldConfigurations: FieldConfig[] = [
  { 
    key: 'Make', 
    name: '设备制造商', 
    description: '拍摄设备的制造商',
    mode: EditModeType.SELECT,
    options: cameraMakes
  },
  { 
    key: 'Model', 
    name: '设备型号', 
    description: '相机/设备的具体型号',
    mode: EditModeType.TEXT
  },
  { 
    key: 'Software', 
    name: '软件', 
    description: '处理图片使用的软件',
    mode: EditModeType.SELECT,
    options: softwareOptions
  },
  { 
    key: 'DateTimeOriginal', 
    name: '拍摄时间', 
    description: '图片拍摄的原始时间',
    mode: EditModeType.DATE
  },
  { 
    key: 'DateTimeDigitized', 
    name: '数字化时间', 
    description: '图片被数字化处理的时间',
    mode: EditModeType.DATE
  },
  { 
    key: 'ExposureTime', 
    name: '曝光时间', 
    description: '快门速度，以秒为单位',
    mode: EditModeType.SELECT,
    options: exposureTimeOptions
  },
  { 
    key: 'FNumber', 
    name: '光圈值', 
    description: '镜头光圈的F值',
    mode: EditModeType.SELECT,
    options: apertureOptions
  },
  { 
    key: 'ISOSpeedRatings', 
    name: 'ISO感光度', 
    description: '传感器的ISO感光度设置',
    mode: EditModeType.SELECT,
    options: isoOptions
  },
  { 
    key: 'FocalLength', 
    name: '焦距', 
    description: '镜头焦距，单位为毫米',
    mode: EditModeType.NUMBER,
    min: 0,
    max: 2000,
    step: 0.1,
    unit: 'mm'
  },
  { 
    key: 'GPSLatitude', 
    name: 'GPS纬度', 
    description: '拍摄地点的纬度坐标',
    mode: EditModeType.LOCATION
  },
  { 
    key: 'GPSLongitude', 
    name: 'GPS经度', 
    description: '拍摄地点的经度坐标',
    mode: EditModeType.LOCATION
  },
  { 
    key: 'GPSAltitude', 
    name: 'GPS高度', 
    description: '拍摄地点的海拔高度',
    mode: EditModeType.NUMBER,
    min: -500,
    max: 10000,
    step: 0.1,
    unit: 'm'
  },
  { 
    key: 'Copyright', 
    name: '版权', 
    description: '图片的版权信息',
    mode: EditModeType.TEXT 
  },
  { 
    key: 'Artist', 
    name: '作者', 
    description: '图片的作者或摄影师姓名',
    mode: EditModeType.TEXT
  },
  { 
    key: 'WhiteBalance', 
    name: '白平衡', 
    description: '相机白平衡设置',
    mode: EditModeType.SELECT,
    options: [
      { value: '0', label: '自动' },
      { value: '1', label: '手动' }
    ]
  },
  { 
    key: 'MeteringMode', 
    name: '测光模式', 
    description: '相机的测光模式',
    mode: EditModeType.SELECT,
    options: [
      { value: '0', label: '未知' },
      { value: '1', label: '平均测光' },
      { value: '2', label: '中央重点测光' },
      { value: '3', label: '点测光' },
      { value: '4', label: '多区域测光' },
      { value: '5', label: '评价测光' },
      { value: '6', label: '局部测光' }
    ]
  }
]

// 当前可用的字段列表（排除已添加的字段）
const availableFields = computed(() => {
  return fieldConfigurations.filter(field => 
    !Object.keys(editableExifData).includes(field.key)
  )
})

// 获取字段配置
const getFieldConfig = (key: string): FieldConfig | undefined => {
  return fieldConfigurations.find(field => field.key === key)
}

// 根据字段类型获取编辑模式
const getEditMode = (key: string): EditModeType => {
  const config = getFieldConfig(key)
  return config ? config.mode : EditModeType.TEXT
}

// 获取字段名称
const getFieldName = (key: string): string => {
  const config = getFieldConfig(key)
  return config ? config.name : key
}

// 获取字段描述
const getFieldDescription = (key: string): string => {
  const config = getFieldConfig(key)
  return config ? config.description : ''
}

// 获取字段选项
const getFieldOptions = (key: string): Array<{ value: string, label: string }> | undefined => {
  const config = getFieldConfig(key)
  return config ? config.options : undefined
}

// 获取字段数字范围
const getFieldNumberConfig = (key: string) => {
  const config = getFieldConfig(key)
  return {
    min: config?.min || 0,
    max: config?.max || 100,
    step: config?.step || 1,
    unit: config?.unit || ''
  }
}

// 触发文件选择
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0]
    loadExifData()
  }
}

// 加载EXIF数据
const loadExifData = () => {
  if (!selectedFile.value) return
  
  exifData.value = null
  Object.keys(editableExifData).forEach(key => delete editableExifData[key])
  processingFile.value = true
  errorMessage.value = null
  
  try {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        if (e.target?.result) {
          const imageData = e.target.result as string
          
          // 使用piexifjs读取EXIF数据
          const exifObject = piexif.load(imageData)
          
          // 处理从piexifjs获取的数据
          if (exifObject) {
            const data: Record<string, any> = {}
            
            // 处理0th段数据（基本图像信息）
            if (exifObject["0th"]) {
              // 相机制造商
              if (piexif.ImageIFD.Make in exifObject["0th"]) {
                data.Make = exifObject["0th"][piexif.ImageIFD.Make]
              }
              // 相机型号
              if (piexif.ImageIFD.Model in exifObject["0th"]) {
                data.Model = exifObject["0th"][piexif.ImageIFD.Model]
              }
              // 软件
              if (piexif.ImageIFD.Software in exifObject["0th"]) {
                data.Software = exifObject["0th"][piexif.ImageIFD.Software]
              }
              // 版权
              if (piexif.ImageIFD.Copyright in exifObject["0th"]) {
                data.Copyright = exifObject["0th"][piexif.ImageIFD.Copyright]
              }
              // 作者
              if (piexif.ImageIFD.Artist in exifObject["0th"]) {
                data.Artist = exifObject["0th"][piexif.ImageIFD.Artist]
              }
            }
            
            // 处理Exif段数据（详细EXIF信息）
            if (exifObject["Exif"]) {
              // 拍摄时间
              if (piexif.ExifIFD.DateTimeOriginal in exifObject["Exif"]) {
                data.DateTimeOriginal = exifObject["Exif"][piexif.ExifIFD.DateTimeOriginal]
              }
              // 数字化时间
              if (piexif.ExifIFD.DateTimeDigitized in exifObject["Exif"]) {
                data.DateTimeDigitized = exifObject["Exif"][piexif.ExifIFD.DateTimeDigitized]
              }
              // 曝光时间
              if (piexif.ExifIFD.ExposureTime in exifObject["Exif"]) {
                const expTimeRational = exifObject["Exif"][piexif.ExifIFD.ExposureTime]
                if (Array.isArray(expTimeRational) && expTimeRational.length === 2) {
                  // 转换有理数格式为字符串
                  if (expTimeRational[0] < expTimeRational[1]) {
                    data.ExposureTime = `${expTimeRational[0]}/${expTimeRational[1]}`
                  } else {
                    data.ExposureTime = (expTimeRational[0] / expTimeRational[1]).toString()
                  }
                }
              }
              // 光圈值
              if (piexif.ExifIFD.FNumber in exifObject["Exif"]) {
                const fNumberRational = exifObject["Exif"][piexif.ExifIFD.FNumber]
                if (Array.isArray(fNumberRational) && fNumberRational.length === 2) {
                  data.FNumber = (fNumberRational[0] / fNumberRational[1]).toString()
                }
              }
              // ISO感光度
              if (piexif.ExifIFD.ISOSpeedRatings in exifObject["Exif"]) {
                data.ISOSpeedRatings = exifObject["Exif"][piexif.ExifIFD.ISOSpeedRatings].toString()
              }
              // 焦距
              if (piexif.ExifIFD.FocalLength in exifObject["Exif"]) {
                const focalLengthRational = exifObject["Exif"][piexif.ExifIFD.FocalLength]
                if (Array.isArray(focalLengthRational) && focalLengthRational.length === 2) {
                  data.FocalLength = (focalLengthRational[0] / focalLengthRational[1]).toString()
                }
              }
              // 白平衡
              if (piexif.ExifIFD.WhiteBalance in exifObject["Exif"]) {
                data.WhiteBalance = exifObject["Exif"][piexif.ExifIFD.WhiteBalance].toString()
              }
              // 测光模式
              if (piexif.ExifIFD.MeteringMode in exifObject["Exif"]) {
                data.MeteringMode = exifObject["Exif"][piexif.ExifIFD.MeteringMode].toString()
              }
            }

            // 处理GPS数据
            if (exifObject["GPS"]) {
              // 纬度
              if (piexif.GPSIFD.GPSLatitude in exifObject["GPS"] && 
                  piexif.GPSIFD.GPSLatitudeRef in exifObject["GPS"]) {
                const latitudeRationals = exifObject["GPS"][piexif.GPSIFD.GPSLatitude]
                const latitudeRef = exifObject["GPS"][piexif.GPSIFD.GPSLatitudeRef]
                
                if (Array.isArray(latitudeRationals) && latitudeRationals.length === 3) {
                  let degrees = 0
                  // 度
                  if (Array.isArray(latitudeRationals[0]) && latitudeRationals[0].length === 2) {
                    degrees += latitudeRationals[0][0] / latitudeRationals[0][1]
                  }
                  // 分
                  if (Array.isArray(latitudeRationals[1]) && latitudeRationals[1].length === 2) {
                    degrees += (latitudeRationals[1][0] / latitudeRationals[1][1]) / 60
                  }
                  // 秒
                  if (Array.isArray(latitudeRationals[2]) && latitudeRationals[2].length === 2) {
                    degrees += (latitudeRationals[2][0] / latitudeRationals[2][1]) / 3600
                  }
                  
                  // 南纬为负
                  if (latitudeRef === 'S') {
                    degrees = -degrees
                  }
                  
                  data.GPSLatitude = degrees.toFixed(6)
                  data.GPSLatitudeRef = latitudeRef
                }
              }
              
              // 经度
              if (piexif.GPSIFD.GPSLongitude in exifObject["GPS"] && 
                  piexif.GPSIFD.GPSLongitudeRef in exifObject["GPS"]) {
                const longitudeRationals = exifObject["GPS"][piexif.GPSIFD.GPSLongitude]
                const longitudeRef = exifObject["GPS"][piexif.GPSIFD.GPSLongitudeRef]
                
                if (Array.isArray(longitudeRationals) && longitudeRationals.length === 3) {
                  let degrees = 0
                  // 度
                  if (Array.isArray(longitudeRationals[0]) && longitudeRationals[0].length === 2) {
                    degrees += longitudeRationals[0][0] / longitudeRationals[0][1]
                  }
                  // 分
                  if (Array.isArray(longitudeRationals[1]) && longitudeRationals[1].length === 2) {
                    degrees += (longitudeRationals[1][0] / longitudeRationals[1][1]) / 60
                  }
                  // 秒
                  if (Array.isArray(longitudeRationals[2]) && longitudeRationals[2].length === 2) {
                    degrees += (longitudeRationals[2][0] / longitudeRationals[2][1]) / 3600
                  }
                  
                  // 西经为负
                  if (longitudeRef === 'W') {
                    degrees = -degrees
                  }
                  
                  data.GPSLongitude = degrees.toFixed(6)
                  data.GPSLongitudeRef = longitudeRef
                }
              }
              
              // 高度
              if (piexif.GPSIFD.GPSAltitude in exifObject["GPS"]) {
                const altitudeRational = exifObject["GPS"][piexif.GPSIFD.GPSAltitude]
                if (Array.isArray(altitudeRational) && altitudeRational.length === 2) {
                  const altitude = altitudeRational[0] / altitudeRational[1]
                  data.GPSAltitude = altitude.toString()
                }
              }
            }
            
            // 设置EXIF数据对象
            exifData.value = data
            
            // 复制到可编辑对象
            Object.keys(data).forEach(key => {
              editableExifData[key] = data[key]
            })
          }
        }
      } catch (err) {
        console.error('解析EXIF数据时出错:', err)
        errorMessage.value = '无法读取图片的EXIF数据，请尝试其他图片'
      } finally {
        processingFile.value = false
      }
    }
    
    reader.onerror = () => {
      console.error('读取图片文件失败')
      errorMessage.value = '读取图片文件失败'
      processingFile.value = false
    }
    
    reader.readAsDataURL(selectedFile.value)
  } catch (err) {
    console.error('加载EXIF数据出错:', err)
    errorMessage.value = '加载图片数据时出错'
    processingFile.value = false
  }
}

// 添加EXIF字段面板
const addExifField = () => {
  showAddField.value = true
  newFieldKey.value = availableFields.value.length > 0 ? availableFields.value[0].key : ''
  newFieldValue.value = ''
}

// 确认添加字段
const confirmAddField = () => {
  if (newFieldKey.value) {
    // 如果是日期类型，设置默认值为当前时间
    if (getEditMode(newFieldKey.value) === EditModeType.DATE && !newFieldValue.value) {
      const now = new Date()
      // 格式化为 YYYY:MM:DD HH:MM:SS
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      newFieldValue.value = `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`
    }

    // 处理自定义选项
    if (newFieldValue.value === 'custom' && getEditMode(newFieldKey.value) === EditModeType.SELECT) {
      // 使用自定义输入的值
      editableExifData[newFieldKey.value] = customFieldValue.value || ''
    } else {
      // 使用选择的值
      editableExifData[newFieldKey.value] = newFieldValue.value || ''
    }
    
    // 重置自定义输入
    customFieldValue.value = ''
    showAddField.value = false
  }
}

// 取消添加字段
const cancelAddField = () => {
  showAddField.value = false
}

// 删除EXIF字段
const deleteExifField = (key: string) => {
  delete editableExifData[key]
}

// 将十进制度转换为度分秒格式
const convertDDToDMS = (decimalDegrees: number): [number, number, number] => {
  const absolute = Math.abs(decimalDegrees)
  const degrees = Math.floor(absolute)
  const minutesNotTruncated = (absolute - degrees) * 60
  const minutes = Math.floor(minutesNotTruncated)
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2)
  
  return [degrees, minutes, parseFloat(seconds)]
}

// 准备EXIF数据以便写入
const prepareExifData = () => {
  const exifObj: any = {}
  
  // 初始化各个EXIF段
  exifObj["0th"] = {}
  exifObj["Exif"] = {}
  exifObj["GPS"] = {}
  exifObj["1st"] = {}
  exifObj["thumbnail"] = null
  
  // 处理编辑后的数据
  Object.keys(editableExifData).forEach(key => {
    // 转换GPS数据回度分秒格式
    if (key === 'GPSLatitude' && !Array.isArray(editableExifData[key])) {
      const lat = parseFloat(editableExifData[key])
      const dms = convertDDToDMS(lat)
      exifObj["GPS"][piexif.GPSIFD.GPSLatitude] = [
        [dms[0], 1],
        [dms[1], 1],
        [dms[2] * 100, 100]
      ]
      exifObj["GPS"][piexif.GPSIFD.GPSLatitudeRef] = lat >= 0 ? "N" : "S"
    }
    else if (key === 'GPSLongitude' && !Array.isArray(editableExifData[key])) {
      const lng = parseFloat(editableExifData[key])
      const dms = convertDDToDMS(lng)
      exifObj["GPS"][piexif.GPSIFD.GPSLongitude] = [
        [dms[0], 1],
        [dms[1], 1],
        [dms[2] * 100, 100]
      ]
      exifObj["GPS"][piexif.GPSIFD.GPSLongitudeRef] = lng >= 0 ? "E" : "W"
    }
    // 处理日期时间字段
    else if (key === 'DateTimeOriginal') {
      exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal] = editableExifData[key]
    }
    else if (key === 'DateTimeDigitized') {
      exifObj["Exif"][piexif.ExifIFD.DateTimeDigitized] = editableExifData[key]
    }
    // 处理相机参数
    else if (key === 'Make') {
      exifObj["0th"][piexif.ImageIFD.Make] = editableExifData[key]
    }
    else if (key === 'Model') {
      exifObj["0th"][piexif.ImageIFD.Model] = editableExifData[key]
    }
    else if (key === 'Software') {
      exifObj["0th"][piexif.ImageIFD.Software] = editableExifData[key]
    }
    else if (key === 'Copyright') {
      exifObj["0th"][piexif.ImageIFD.Copyright] = editableExifData[key]
    }
    else if (key === 'Artist') {
      exifObj["0th"][piexif.ImageIFD.Artist] = editableExifData[key]
    }
    // 处理曝光参数
    else if (key === 'ExposureTime') {
      // 处理不同格式的曝光时间
      let value = editableExifData[key]
      // 如果是自定义值，使用customValues中的值
      if (value === 'custom' && customValues[key]) {
        value = customValues[key]
      }

      if (value.includes('/')) {
        const [numerator, denominator] = value.split('/').map(Number)
        if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
          exifObj["Exif"][piexif.ExifIFD.ExposureTime] = [numerator, denominator]
        }
      } else {
        const floatValue = parseFloat(value)
        if (!isNaN(floatValue)) {
          if (floatValue < 1) {
            // 例如 0.5 -> [1, 2]
            const denominator = Math.round(1 / floatValue)
            exifObj["Exif"][piexif.ExifIFD.ExposureTime] = [1, denominator]
          } else {
            // 例如 2 -> [2, 1]
            exifObj["Exif"][piexif.ExifIFD.ExposureTime] = [Math.round(floatValue), 1]
          }
        }
      }
    }
    else if (key === 'FNumber') {
      let value = editableExifData[key]
      // 如果是自定义值，使用customValues中的值
      if (value === 'custom' && customValues[key]) {
        value = customValues[key]
      }
      
      const fNumberValue = parseFloat(value)
      if (!isNaN(fNumberValue)) {
        // 将光圈值存储为有理数
        exifObj["Exif"][piexif.ExifIFD.FNumber] = [fNumberValue * 10, 10]
      }
    }
    else if (key === 'ISOSpeedRatings') {
      let value = editableExifData[key]
      // 如果是自定义值，使用customValues中的值
      if (value === 'custom' && customValues[key]) {
        value = customValues[key]
      }
      
      const isoValue = parseInt(value, 10)
      if (!isNaN(isoValue)) {
        exifObj["Exif"][piexif.ExifIFD.ISOSpeedRatings] = isoValue
      }
    }
    else if (key === 'Make' || key === 'Model' || key === 'Software') {
      let value = editableExifData[key]
      // 如果是自定义值，使用customValues中的值
      if (value === 'custom' && customValues[key]) {
        value = customValues[key]
      }
      
      if (key === 'Make') {
        exifObj["0th"][piexif.ImageIFD.Make] = value
      } 
      else if (key === 'Model') {
        exifObj["0th"][piexif.ImageIFD.Model] = value
      }
      else if (key === 'Software') {
        exifObj["0th"][piexif.ImageIFD.Software] = value
      }
    }
    else if (key === 'FocalLength') {
      let value = editableExifData[key]
      const focalValue = parseFloat(value)
      if (!isNaN(focalValue)) {
        exifObj["Exif"][piexif.ExifIFD.FocalLength] = [focalValue * 10, 10]
      }
    }
    else if (key === 'MeteringMode') {
      let value = editableExifData[key]
      // 如果是自定义值，使用customValues中的值
      if (value === 'custom' && customValues[key]) {
        value = customValues[key]
      }
      
      const modeValue = parseInt(value, 10)
      if (!isNaN(modeValue)) {
        exifObj["Exif"][piexif.ExifIFD.MeteringMode] = modeValue
      }
    }
    else if (key === 'WhiteBalance') {
      let value = editableExifData[key]
      // 如果是自定义值，使用customValues中的值
      if (value === 'custom' && customValues[key]) {
        value = customValues[key]
      }
      
      const wbValue = parseInt(value, 10)
      if (!isNaN(wbValue)) {
        exifObj["Exif"][piexif.ExifIFD.WhiteBalance] = wbValue
      }
    }
    // 其他普通字段也可以加入
  })
  
  return exifObj
}

// 保存修改
const saveChanges = async () => {
  if (!selectedFile.value) {
    errorMessage.value = '没有选择图片文件'
    return
  }
  
  processingFile.value = true
  errorMessage.value = null
  resultImage.value = null
  
  try {
    // 读取图片为 base64
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        if (e.target?.result) {
          const imageData = e.target.result as string
          
          // 准备EXIF数据
          const exifObj = prepareExifData()
          
          // 生成EXIF二进制数据
          const exifBytes = piexif.dump(exifObj)
          
          // 将EXIF数据插入图片
          const newImageData = piexif.insert(exifBytes, imageData)
          
          // 保存结果
          resultImage.value = newImageData
          imagePreview.value = newImageData
          fileName.value = selectedFile.value ? selectedFile.value.name : 'edited_image.jpg'
          
          // 显示保存对话框
          showSaveDialog.value = true
        }
      } catch (err: any) {
        console.error('处理图片出错:', err)
        errorMessage.value = `处理图片时出错: ${err.message || '未知错误'}`
      } finally {
        processingFile.value = false
      }
    }
    
    reader.onerror = () => {
      errorMessage.value = '读取图片文件失败'
      processingFile.value = false
    }
    
    reader.readAsDataURL(selectedFile.value)
  } catch (err: any) {
    console.error('保存EXIF数据出错:', err)
    errorMessage.value = `保存EXIF数据时出错: ${err.message || '未知错误'}`
    processingFile.value = false
  }
}

// 下载修改后的图片
const downloadImage = async () => {
  if (!resultImage.value) return
  
  // 生成文件名，添加'_edited'前缀
  const dotIndex = fileName.value.lastIndexOf('.')
  let newFileName = fileName.value
  if (dotIndex > 0) {
    newFileName = fileName.value.substring(0, dotIndex) + '_edited' + fileName.value.substring(dotIndex)
  } else {
    newFileName = fileName.value + '_edited'
  }
  
  if (Capacitor.isNativePlatform()) {
    try {
      // 在移动平台上使用Filesystem API保存文件
      const base64Data = resultImage.value.split(',')[1];
      
      const savedFile = await Filesystem.writeFile({
        path: newFileName,
        data: base64Data,
        directory: Directory.Documents, // 保存到文档目录
      });
      
      // 显示成功消息
      errorMessage.value = null;
      alert(`文件已保存到文档目录: ${savedFile.uri}`);
    } catch (error: any) {
      console.error('保存文件出错:', error);
      errorMessage.value = `保存文件出错: ${error.message || '未知错误'}`;
    }
  } else {
    // 在网页端使用传统方式下载
    const link = document.createElement('a');
    link.href = resultImage.value;
    link.download = newFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // 关闭对话框
  closeSaveDialog();
}

// 关闭保存对话框
const closeSaveDialog = () => {
  showSaveDialog.value = false
}

// 打开地图选择器
const openMapPicker = (key: string) => {
  showMapPicker.value = true
  // 如果已有经纬度，更新地图中心
  if (editableExifData.GPSLatitude && editableExifData.GPSLongitude) {
    try {
      const lat = parseFloat(editableExifData.GPSLatitude)
      const lng = parseFloat(editableExifData.GPSLongitude)
      if (!isNaN(lat) && !isNaN(lng)) {
        mapCenter.lat = lat
        mapCenter.lng = lng
        selectedLocation.lat = lat
        selectedLocation.lng = lng
      }
    } catch (e) {
      console.error('Error parsing GPS coordinates:', e)
    }
  }
}

// 确认地图位置选择
const confirmLocationSelection = () => {
  editableExifData.GPSLatitude = selectedLocation.lat.toFixed(6)
  editableExifData.GPSLongitude = selectedLocation.lng.toFixed(6)
  // 设置经纬度参考方向
  editableExifData.GPSLatitudeRef = selectedLocation.lat >= 0 ? 'N' : 'S'
  editableExifData.GPSLongitudeRef = selectedLocation.lng >= 0 ? 'E' : 'W'
  showMapPicker.value = false
}

// 取消地图选择
const cancelMapSelection = () => {
  showMapPicker.value = false
}

// 更新所选位置
const updateSelectedLocation = (event: any) => {
  selectedLocation.lat = event.latLng.lat()
  selectedLocation.lng = event.latLng.lng()
}

// 格式化日期输入
const formatDateTimeInput = (key: string, value: string) => {
  // 如果输入的是标准日期格式，转换为EXIF日期格式 (YYYY:MM:DD HH:MM:SS)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/.test(value)) {
    const date = new Date(value)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    editableExifData[key] = `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`
  }
}

// 将EXIF日期格式转换为HTML input[type=datetime-local]格式
const convertExifDateToHtmlFormat = (exifDate: string): string => {
  if (!exifDate) return ''
  // 从EXIF格式 (YYYY:MM:DD HH:MM:SS) 转换为 HTML datetime-local 格式 (YYYY-MM-DDTHH:MM)
  try {
    const [datePart, timePart] = exifDate.split(' ')
    if (!datePart || !timePart) return ''
    
    const [year, month, day] = datePart.split(':')
    const [hours, minutes] = timePart.split(':')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (e) {
    console.error('Error converting EXIF date format:', e)
    return ''
  }
}

// 中国主要城市经纬度数据
const presetLocations = [
  { name: '北京', lat: 39.9042, lng: 116.4074 },
  { name: '上海', lat: 31.2304, lng: 121.4737 },
  { name: '广州', lat: 23.1291, lng: 113.2644 },
  { name: '深圳', lat: 22.5431, lng: 114.0579 },
  { name: '成都', lat: 30.5728, lng: 104.0668 },
  { name: '杭州', lat: 30.2741, lng: 120.1551 },
  { name: '武汉', lat: 30.5928, lng: 114.3055 },
  { name: '西安', lat: 34.3416, lng: 108.9398 },
  { name: '南京', lat: 32.0603, lng: 118.7969 },
  { name: '重庆', lat: 29.5630, lng: 106.5516 },
  { name: '天津', lat: 39.0851, lng: 117.1999 },
  { name: '苏州', lat: 31.2990, lng: 120.5853 },
  { name: '厦门', lat: 24.4797, lng: 118.0819 },
  { name: '青岛', lat: 36.0611, lng: 120.3826 },
  { name: '大连', lat: 38.9140, lng: 121.6147 }
]

// 世界著名地标经纬度数据
const worldLandmarks = [
  { name: '埃菲尔铁塔 (巴黎)', lat: 48.8584, lng: 2.2945 },
  { name: '自由女神像 (纽约)', lat: 40.6892, lng: -74.0445 },
  { name: '大本钟 (伦敦)', lat: 51.5007, lng: -0.1246 },
  { name: '金字塔 (开罗)', lat: 29.9792, lng: 31.1342 },
  { name: '泰姬陵 (阿格拉)', lat: 27.1751, lng: 78.0421 },
  { name: '悉尼歌剧院 (悉尼)', lat: -33.8568, lng: 151.2153 },
  { name: '万里长城 (北京)', lat: 40.4319, lng: 116.5704 },
  { name: '斗兽场 (罗马)', lat: 41.8902, lng: 12.4922 },
  { name: '马丘比丘 (秘鲁)', lat: -13.1631, lng: -72.5450 },
  { name: '富士山 (日本)', lat: 35.3606, lng: 138.7274 }
]

// 合并预设位置数据
const allPresetLocations = [...presetLocations, ...worldLandmarks]

// 根据搜索过滤预设位置
const filteredLocations = computed(() => {
  if (!searchQuery.value) return allPresetLocations
  const query = searchQuery.value.toLowerCase()
  return allPresetLocations.filter(location => 
    location.name.toLowerCase().includes(query)
  )
})

// 选择预设位置
const selectPresetLocation = (location: { name: string, lat: number, lng: number }) => {
  selectedLocation.lat = location.lat
  selectedLocation.lng = location.lng
  showPresetLocations.value = false
}

// 切换预设位置面板显示
const togglePresetLocations = () => {
  showPresetLocations.value = !showPresetLocations.value
  if (showPresetLocations.value) {
    searchQuery.value = ''
  }
}
</script>

<style scoped>
.modifier-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 5%;
}

.file-upload {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.file-input {
  display: none;
}

.upload-btn {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.exif-container {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.exif-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background-color: #f0f0f0;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-btn {
  background-color: #2196F3;
  color: white;
}

/* 添加字段面板 */
.add-field-panel {
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.field-select-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-select-container label {
  font-weight: bold;
  font-size: 14px;
}

.field-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
}

.field-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
  font-style: italic;
}

.field-value-input {
  width: 100%;
}

.field-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.confirm-btn, .cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.confirm-btn {
  background-color: #4CAF50;
  color: white;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
}

/* EXIF字段列表 */
.exif-list {
  max-height: 600px;
  overflow-y: auto;
}

.exif-item {
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.exif-field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.exif-key {
  font-weight: bold;
  font-size: 16px;
}

.exif-field-description {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
  font-style: italic;
}

.exif-value {
  margin-top: 8px;
}

.value-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.value-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.datetime-input {
  width: 100%;
}

.number-input-container {
  display: flex;
  align-items: center;
}

.number-input {
  flex: 1;
  padding-right: 40px;
}

.unit-label {
  margin-left: -35px;
  color: #777;
  font-size: 12px;
  pointer-events: none;
}

.location-input-container {
  display: flex;
  gap: 10px;
}

.location-input {
  flex: 1;
}

.map-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  white-space: nowrap;
}

.delete-btn {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
}

.loading, .no-image {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* 地图选择器 */
.map-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.map-picker-container {
  background-color: white;
  width: 90%;
  max-width: 800px;
  border-radius: 12px;
  padding: 24px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.map-picker-container h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  text-align: center;
  color: #333;
}

.location-search {
  display: flex;
  margin-bottom: 15px;
  gap: 10px;
}

.preset-toggle-btn {
  background-color: #f0f0f0;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.preset-toggle-btn.active {
  background-color: #4CAF50;
  color: white;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 8px 15px 8px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.preset-locations {
  max-height: 200px;
  overflow-y: auto;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 15px;
}

.location-item {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.location-item:hover {
  background-color: #f0f7ff;
}

.location-item:last-child {
  border-bottom: none;
}

.location-name {
  font-weight: bold;
}

.location-coords {
  color: #666;
  font-size: 12px;
}

.no-results {
  padding: 15px;
  text-align: center;
  color: #666;
}

.map-container {
  margin: 15px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.mock-map {
  height: 400px;
  background-color: #e8f0fe;
  display: flex;
  flex-direction: column;
  position: relative;
}

.map-instructions {
  padding: 15px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
}

.map-instructions h4 {
  margin: 0 0 5px 0;
}

.map-instructions p {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #666;
}

.map-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-image: linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px);
  background-size: 20px 20px;
}

.map-indicator {
  position: relative;
}

.map-pin {
  font-size: 32px;
  line-height: 1;
  position: relative;
  z-index: 2;
}

.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background-color: rgba(76, 175, 80, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple 2s infinite;
}

@keyframes ripple {
  0% {
    width: 0px;
    height: 0px;
    opacity: 1;
  }
  100% {
    width: 50px;
    height: 50px;
    opacity: 0;
  }
}

.selected-coords {
  padding: 15px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.8);
}

.selected-coords p {
  margin: 0 0 5px 0;
}

.coords-display {
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.coord-label {
  font-weight: bold;
}

.coord-value {
  font-family: monospace;
}

.coord-type {
  color: #4CAF50;
  font-weight: bold;
}

.manual-coords {
  padding: 15px;
  background-color: white;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.coord-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.coord-input {
  flex: 1;
  display: flex;
  align-items: center;
}

.coord-input label {
  min-width: 70px;
  text-align: right;
  font-weight: bold;
}

.input-with-controls {
  flex: 1;
  display: flex;
  align-items: center;
}

.adjust-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 18px;
  user-select: none;
}

.input-with-controls input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ddd;
  text-align: center;
  font-family: monospace;
  border-left: none;
  border-right: none;
}

.hemisphere {
  width: 80px;
  text-align: center;
}

.hemisphere-label {
  font-weight: bold;
  color: #4CAF50;
}

.map-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.confirm-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.confirm-btn {
  background-color: #4CAF50;
  color: white;
}

.confirm-btn:hover {
  background-color: #45a049;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
}

.cancel-btn:hover {
  background-color: #d32f2f;
}

/* 错误信息样式 */
.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  border-left: 4px solid #c62828;
}

/* 保存对话框样式 */
.save-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(3px);
}

.save-dialog-container {
  background-color: white;
  width: 90%;
  max-width: 600px;
  border-radius: 12px;
  padding: 24px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.save-dialog-container h3 {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
  color: #4CAF50;
}

.image-preview-container {
  width: 100%;
  height: 300px;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.no-preview {
  color: #999;
  font-style: italic;
}

.filename-editor {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
}

.filename-editor label {
  font-weight: bold;
  min-width: 70px;
}

.filename-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
}

.save-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.download-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.download-btn:hover {
  background-color: #45a049;
}

/* 移动端适配 */
@media (max-width: 600px) {
  .map-picker-container {
    width: 95%;
    padding: 15px;
  }
  
  .location-search {
    flex-direction: column;
  }
  
  .preset-toggle-btn {
    width: 100%;
  }
  
  .mock-map {
    height: auto;
  }
  
  .map-visual {
    height: 150px;
  }
  
  .coord-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .coord-input {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .coord-input label {
    min-width: auto;
    width: 100%;
    text-align: left;
    margin-bottom: 5px;
  }
  
  .input-with-controls {
    width: 100%;
  }
  
  .hemisphere {
    width: 100%;
    text-align: left;
    margin-top: 5px;
  }
}

/* 自定义输入样式 */
.select-with-custom {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-input {
  padding: 8px 12px;
  border: 1px solid #4CAF50;
  border-radius: 4px;
  background-color: #f8fff8;
}
</style> 