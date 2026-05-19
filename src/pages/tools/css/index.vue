<template>
  <view class="page">
    <!-- 分类 Tab -->
    <scroll-view scroll-x class="tab_scroll">
      <view class="tab_list">
        <view
          v-for="cat in categories"
          :key="cat"
          :class="['tab_item', activeCategory === cat ? 'tab_active' : '']"
          @tap="activeCategory = cat"
        >{{ cat }}</view>
      </view>
    </scroll-view>

    <!-- 片段列表 -->
    <view class="snippet_list">
      <view
        class="snippet_card"
        v-for="(item, idx) in filteredSnippets"
        :key="idx"
      >
        <view class="snippet_header">
          <view class="snippet_name">{{ item.name }}</view>
          <view class="snippet_copy" @tap="copyCode(item.code)">复制</view>
        </view>
        <!-- 预览区域 -->
        <view class="snippet_preview">
          <view class="preview_demo" :style="item.previewStyle">
            <view :class="'demo_el ' + (item.demoClass || '')">{{ item.demoText || 'Demo' }}</view>
          </view>
        </view>
        <!-- 代码区域 -->
        <view class="snippet_code_wrap" v-if="expandedIdx === idx">
          <scroll-view scroll-x class="snippet_code_scroll">
            <text class="snippet_code selectable">{{ item.code }}</text>
          </scroll-view>
        </view>
        <view class="snippet_toggle" @tap="expandedIdx = expandedIdx === idx ? -1 : idx">
          {{ expandedIdx === idx ? '收起代码 ▲' : '查看代码 ▼' }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'

onMounted(() => {
  const count = Taro.getStorageSync('nj_tools_used_count') || 0
  Taro.setStorageSync('nj_tools_used_count', count + 1)
})

interface CssSnippet {
  name: string
  code: string
  category: string
  previewStyle?: Record<string, string>
  demoClass?: string
  demoText?: string
}

const categories = ['按钮', '文字', '阴影', '动画', '布局']
const activeCategory = ref('按钮')
const expandedIdx = ref(-1)

const snippets: CssSnippet[] = [
  // 按钮
  {
    name: '渐变按钮',
    category: '按钮',
    code: `background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);\nborder: none;\ncolor: #fff;\npadding: 10px 24px;\nborder-radius: 24px;\nfont-weight: 600;`,
    previewStyle: { display: 'flex', justifyContent: 'center', padding: '16px' },
    demoClass: 'demo_btn_gradient',
    demoText: 'Button',
  },
  {
    name: '发光按钮',
    category: '按钮',
    code: `background: #6c5ce7;\ncolor: #fff;\npadding: 10px 24px;\nborder-radius: 8px;\nbox-shadow: 0 0 15px rgba(108, 92, 231, 0.6),\n  0 0 30px rgba(108, 92, 231, 0.3);`,
    previewStyle: { display: 'flex', justifyContent: 'center', padding: '16px' },
    demoClass: 'demo_btn_glow',
    demoText: 'Glow',
  },
  {
    name: '悬浮立体按钮',
    category: '按钮',
    code: `background: #0984e3;\ncolor: #fff;\npadding: 10px 24px;\nborder-radius: 8px;\nbox-shadow: 0 6px 0 #065f9e;\ntransform: translateY(-2px);`,
    previewStyle: { display: 'flex', justifyContent: 'center', padding: '16px' },
    demoClass: 'demo_btn_3d',
    demoText: '3D',
  },
  // 文字
  {
    name: '渐变文字',
    category: '文字',
    code: `background: linear-gradient(to right, #f83600, #f9d423);\n-webkit-background-clip: text;\n-webkit-text-fill-color: transparent;\nfont-size: 24px;\nfont-weight: bold;`,
    previewStyle: { display: 'flex', justifyContent: 'center', padding: '16px' },
    demoClass: 'demo_text_gradient',
    demoText: 'Gradient Text',
  },
  {
    name: '文字描边',
    category: '文字',
    code: `-webkit-text-stroke: 1px #333;\ncolor: transparent;\nfont-size: 24px;\nfont-weight: bold;`,
    previewStyle: { display: 'flex', justifyContent: 'center', padding: '16px' },
    demoClass: 'demo_text_stroke',
    demoText: 'Stroke',
  },
  {
    name: '长阴影文字',
    category: '文字',
    code: `color: #fff;\nfont-size: 24px;\nfont-weight: bold;\ntext-shadow:\n  1px 1px 0 #fda085,\n  2px 2px 0 #fda085,\n  3px 3px 0 #fda085,\n  4px 4px 0 #f6d365;`,
    previewStyle: { display: 'flex', justifyContent: 'center', padding: '16px', background: '#fda085' },
    demoClass: 'demo_text_shadow',
    demoText: 'Shadow',
  },
  // 阴影
  {
    name: '新拟态效果',
    category: '阴影',
    code: `background: #e0e5ec;\nborder-radius: 16px;\nbox-shadow:\n  8px 8px 16px #b8bec7,\n  -8px -8px 16px #ffffff;`,
    previewStyle: { display: 'flex', justifyContent: 'center', padding: '20px', background: '#e0e5ec' },
    demoClass: 'demo_shadow_neu',
    demoText: '',
  },
  {
    name: '毛玻璃效果',
    category: '阴影',
    code: `background: rgba(255, 255, 255, 0.2);\nbackdrop-filter: blur(10px);\nborder-radius: 16px;\nborder: 1px solid rgba(255, 255, 255, 0.3);`,
    previewStyle: { display: 'flex', justifyContent: 'center', padding: '20px', background: 'linear-gradient(135deg, #667eea, #764ba2)' },
    demoClass: 'demo_shadow_glass',
    demoText: 'Glass',
  },
  {
    name: '多层彩色阴影',
    category: '阴影',
    code: `border-radius: 12px;\nbox-shadow:\n  0 4px 6px rgba(253, 160, 133, 0.4),\n  0 8px 20px rgba(246, 211, 101, 0.3),\n  0 12px 40px rgba(253, 160, 133, 0.2);`,
    previewStyle: { display: 'flex', justifyContent: 'center', padding: '24px' },
    demoClass: 'demo_shadow_multi',
    demoText: '',
  },
  // 动画
  {
    name: '脉冲动画',
    category: '动画',
    code: `@keyframes pulse {\n  0% { transform: scale(1); }\n  50% { transform: scale(1.08); }\n  100% { transform: scale(1); }\n}\nanimation: pulse 1.5s infinite;`,
    previewStyle: { display: 'flex', justifyContent: 'center', padding: '20px' },
    demoClass: 'demo_anim_pulse',
    demoText: '',
  },
  {
    name: '旋转加载',
    category: '动画',
    code: `width: 32px; height: 32px;\nborder: 3px solid #f0f0f0;\nborder-top-color: #fda085;\nborder-radius: 50%;\nanimation: spin 0.8s linear infinite;\n\n@keyframes spin {\n  to { transform: rotate(360deg); }\n}`,
    previewStyle: { display: 'flex', justifyContent: 'center', padding: '20px' },
    demoClass: 'demo_anim_spin',
    demoText: '',
  },
  {
    name: '弹跳动画',
    category: '动画',
    code: `@keyframes bounce {\n  0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-12px); }\n}\nanimation: bounce 0.8s infinite;`,
    previewStyle: { display: 'flex', justifyContent: 'center', padding: '20px' },
    demoClass: 'demo_anim_bounce',
    demoText: '',
  },
  // 布局
  {
    name: '完美居中',
    category: '布局',
    code: `display: flex;\njustify-content: center;\nalign-items: center;`,
    previewStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80px', border: '1px dashed #ccc', borderRadius: '8px' },
    demoClass: 'demo_layout_center',
    demoText: '居中',
  },
  {
    name: '等分布局',
    category: '布局',
    code: `display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 8px;`,
    previewStyle: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', padding: '8px' },
    demoClass: 'demo_layout_grid',
    demoText: '',
  },
  {
    name: '文字截断省略',
    category: '布局',
    code: `overflow: hidden;\ntext-overflow: ellipsis;\nwhite-space: nowrap;\n/* 多行截断 */\ndisplay: -webkit-box;\n-webkit-line-clamp: 2;\n-webkit-box-orient: vertical;`,
    previewStyle: { padding: '8px' },
    demoClass: 'demo_layout_ellipsis',
    demoText: '这是一段很长很长的文字，它会被截断显示为省略号...',
  },
]

const filteredSnippets = computed(() =>
  snippets.filter(s => s.category === activeCategory.value)
)

const copyCode = (code: string) => {
  Taro.setClipboardData({
    data: code,
    success: () => Taro.showToast({ title: '已复制', icon: 'success' }),
  })
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 30px;
}

.tab_scroll {
  white-space: nowrap;
  background: #fff;
  padding: 12px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.tab_list {
  display: inline-flex;
  gap: 10px;
}

.tab_item {
  display: inline-block;
  padding: 6px 16px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  border-radius: 16px;
  &:active { opacity: 0.8; }
}

.tab_active {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #fff;
  font-weight: 600;
}

.snippet_list {
  padding: 12px 16px;
}

.snippet_card {
  background: #fff;
  border-radius: 14px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  overflow: hidden;
}

.snippet_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 0;
}

.snippet_name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.snippet_copy {
  font-size: 12px;
  color: #fda085;
  padding: 2px 10px;
  border: 1px solid #fda085;
  border-radius: 12px;
  &:active { opacity: 0.7; }
}

.snippet_preview {
  padding: 12px 16px;
}

.preview_demo {
  background: #fafafa;
  border-radius: 10px;
  min-height: 60px;
  overflow: hidden;
}

.snippet_code_wrap {
  padding: 0 16px 12px;
}

.snippet_code_scroll {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 12px;
  max-height: 200px;
}

.snippet_code {
  font-size: 12px;
  font-family: monospace;
  color: #d4d4d4;
  line-height: 1.8;
  white-space: pre-wrap;
}

.snippet_toggle {
  text-align: center;
  padding: 10px;
  font-size: 12px;
  color: #999;
  border-top: 1px solid #f5f5f5;
  &:active { background: #fafafa; }
}

/* Demo 样式 */
.demo_btn_gradient {
  display: inline-block;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #fff;
  padding: 10px 24px;
  border-radius: 24px;
  font-weight: 600;
  font-size: 14px;
}

.demo_btn_glow {
  display: inline-block;
  background: #6c5ce7;
  color: #fff;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 0 15px rgba(108, 92, 231, 0.6), 0 0 30px rgba(108, 92, 231, 0.3);
}

.demo_btn_3d {
  display: inline-block;
  background: #0984e3;
  color: #fff;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 6px 0 #065f9e;
  transform: translateY(-2px);
}

.demo_text_gradient {
  background: linear-gradient(to right, #f83600, #f9d423);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 22px;
  font-weight: bold;
}

.demo_text_stroke {
  -webkit-text-stroke: 1px #333;
  color: transparent;
  font-size: 22px;
  font-weight: bold;
}

.demo_text_shadow {
  color: #fff;
  font-size: 22px;
  font-weight: bold;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.15), 2px 2px 0 rgba(0,0,0,0.12), 3px 3px 0 rgba(0,0,0,0.1), 4px 4px 0 rgba(0,0,0,0.08);
}

.demo_shadow_neu {
  width: 60px;
  height: 60px;
  background: #e0e5ec;
  border-radius: 16px;
  box-shadow: 8px 8px 16px #b8bec7, -8px -8px 16px #ffffff;
}

.demo_shadow_glass {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 14px;
}

.demo_shadow_multi {
  width: 80px;
  height: 50px;
  background: linear-gradient(135deg, #f6d365, #fda085);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(253, 160, 133, 0.4), 0 8px 20px rgba(246, 211, 101, 0.3), 0 12px 40px rgba(253, 160, 133, 0.2);
}

.demo_anim_pulse {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #f6d365, #fda085);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.demo_anim_spin {
  width: 32px;
  height: 32px;
  border: 3px solid #f0f0f0;
  border-top-color: #fda085;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.demo_anim_bounce {
  width: 24px;
  height: 24px;
  background: #fda085;
  border-radius: 50%;
  animation: bounce 0.8s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.demo_layout_center {
  font-size: 13px;
  color: #fda085;
  font-weight: 600;
}

.demo_layout_grid {
  width: 100%;
  height: 24px;
  background: linear-gradient(135deg, rgba(246, 211, 101, 0.3), rgba(253, 160, 133, 0.3));
  border-radius: 4px;
}

.demo_layout_ellipsis {
  font-size: 13px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}
</style>
