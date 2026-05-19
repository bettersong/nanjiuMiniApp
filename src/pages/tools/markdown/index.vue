<template>
  <view class="page">
    <!-- 操作栏 -->
    <view class="toolbar">
      <view class="btn btn_ghost" @tap="loadExample">示例</view>
      <view class="btn btn_ghost" @tap="pasteFromClipboard">粘贴</view>
      <view class="btn btn_ghost" @tap="clearAll">清空</view>
      <view class="btn btn_primary" @tap="copyHtml">复制HTML</view>
    </view>

    <!-- 输入区 -->
    <view class="card">
      <view class="card_title">📝 Markdown 输入</view>
      <textarea
        class="textarea"
        v-model="input"
        placeholder="输入 Markdown 内容...\n\n支持: # 标题, **加粗**, *斜体*, - 列表, `代码`, > 引用, --- 分割线"
        @input="render"
      />
    </view>

    <!-- 预览区 -->
    <view class="card" v-if="htmlOutput">
      <view class="card_title">👁 预览</view>
      <view class="preview_box">
        <rich-text :nodes="htmlOutput" />
      </view>
    </view>

    <!-- 语法帮助 -->
    <view class="card help_card">
      <view class="card_title">📖 语法参考</view>
      <view class="help_row" v-for="item in helpList" :key="item.syntax">
        <text class="help_syntax">{{ item.syntax }}</text>
        <text class="help_desc">{{ item.desc }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'

onMounted(() => {
  const count = Taro.getStorageSync('nj_tools_used_count') || 0
  Taro.setStorageSync('nj_tools_used_count', count + 1)
})

const input = ref('')
const htmlOutput = ref('')

// 简单 Markdown 解析器
const parseMarkdown = (md: string): string => {
  let html = md
    // 转义 HTML 特殊字符
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 分割线
  html = html.replace(/^---$/gm, '<div style="border-top:1px solid #e0e0e0;margin:12px 0;"></div>')

  // 标题 (### → h3, ## → h2, # → h1)
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:15px;font-weight:600;color:#333;margin:10px 0 6px;">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:17px;font-weight:700;color:#333;margin:12px 0 6px;">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:20px;font-weight:700;color:#333;margin:14px 0 8px;">$1</h1>')

  // 引用
  html = html.replace(/^&gt; (.+)$/gm, '<div style="border-left:3px solid #fda085;padding:6px 12px;color:#666;background:#fafafa;margin:8px 0;border-radius:0 6px 6px 0;">$1</div>')

  // 无序列表
  html = html.replace(/^- (.+)$/gm, '<div style="padding:2px 0 2px 16px;position:relative;"><span style="position:absolute;left:4px;color:#fda085;">•</span>$1</div>')

  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:12px;color:#d81e06;">$1</code>')

  // 加粗
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:700;">$1</strong>')

  // 斜体
  html = html.replace(/\*([^*]+)\*/g, '<em style="font-style:italic;">$1</em>')

  // 换行
  html = html.replace(/\n/g, '<br/>')

  return `<div style="font-size:14px;color:#333;line-height:1.8;">${html}</div>`
}

const render = () => {
  if (input.value.trim()) {
    htmlOutput.value = parseMarkdown(input.value)
  } else {
    htmlOutput.value = ''
  }
}

const clearAll = () => {
  input.value = ''
  htmlOutput.value = ''
}

const loadExample = () => {
  input.value = `# Markdown 预览示例

## 基础语法

**加粗文本** 和 *斜体文本*

### 列表

- 第一项
- 第二项
- 第三项

### 代码

使用 \`console.log()\` 来调试代码

> 这是一段引用文字

---

感谢使用前端南玖工具箱！`
  render()
}

const copyHtml = () => {
  if (!htmlOutput.value) {
    Taro.showToast({ title: '请先输入内容', icon: 'none' })
    return
  }
  Taro.setClipboardData({
    data: htmlOutput.value,
    success: () => Taro.showToast({ title: '已复制', icon: 'success' }),
  })
}

const pasteFromClipboard = () => {
  Taro.getClipboardData({
    success: (res) => {
      input.value = res.data
      render()
    },
    fail: () => Taro.showToast({ title: '读取失败', icon: 'none' }),
  })
}

const helpList = [
  { syntax: '# 标题', desc: '一级标题' },
  { syntax: '## 标题', desc: '二级标题' },
  { syntax: '**文字**', desc: '加粗' },
  { syntax: '*文字*', desc: '斜体' },
  { syntax: '- 内容', desc: '无序列表' },
  { syntax: '`代码`', desc: '行内代码' },
  { syntax: '> 文字', desc: '引用' },
  { syntax: '---', desc: '分割线' },
]
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 16px;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.btn {
  flex: 1;
  height: 36px;
  line-height: 36px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  &:active { opacity: 0.75; }
}

.btn_primary {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #fff;
}

.btn_ghost {
  background: #fff;
  color: #666;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card_title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.textarea {
  width: 100%;
  height: 180px;
  background: #f7f7f7;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  color: #333;
  box-sizing: border-box;
  font-family: monospace;
  line-height: 1.6;
  border: 1px solid #eee;
}

.preview_box {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  min-height: 100px;
}

.help_card {
  .card_title {
    margin-bottom: 8px;
  }
}

.help_row {
  display: flex;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #f5f5f5;
  &:last-child { border-bottom: none; }
}

.help_syntax {
  font-size: 12px;
  font-family: monospace;
  color: #d81e06;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 12px;
  min-width: 80px;
}

.help_desc {
  font-size: 12px;
  color: #999;
}
</style>
