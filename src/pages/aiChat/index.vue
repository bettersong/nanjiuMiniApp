<template>
  <view class="ai_container">
    <view class="message_list" :scroll-y="true"
    :scroll-into-view="lastLine">
      <view :class="['message_item', item.role === 'user' ? 'message_item_right' : 'message_item_left' ]" v-for="(item, index) in messageList" :key="index">
        <view class="user_message" v-if="item.role === 'user'">
            {{ item.content }}
        </view>

        <view v-else>
          <view v-if="item.status < 2">思考中💭...</view>
          <view class="ai_message" v-else>
            <towxml :nodes="item.content"></towxml>
          </view>

        </view>

      </view>
      <view :id="lastLine"></view>
    </view>

    <view class="ai_bottom_send">
      <view class="ai_bottom_send_container">
        <input type="text" v-model="userInput" placeholder="说点什么吧" @confirm="send" />
        <view @tap="send" :class="{
          send_btn: true,
          send_btn_disable: userInput.length == 0
          }"
          >
            发送
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { nextTick } from '@tarojs/taro'
import './index.scss'
import { ref } from 'vue'
import { ChatMessage } from './index.d'
import towxmlParse from './components/towxml/index'
// import { markdown } from 'markdown'


let model:any = null
const userInput = ref('')
const messageList = ref<ChatMessage[]>([])

const init = async () => {
  // @ts-ignore
   model = Taro.cloud.extend.AI.createModel("deepseek");
  // 创建模型实例，这里使用 DeepSeek 大模型
}
init()


const scrollToBottom = () => {
  nextTick(() => {
    // lastLine.value.scrollIntoView({
    //   behavior: 'smooth',
    //   block: 'end',
    // })
    // Taro.createSelectorQuery()
    // .select('#lastLine')
    // .node()
    // .exec((res) => {
    //   const scrollView = res[0].node;
    //   scrollView.scrollIntoView({
    //     behavior: 'smooth',
    //     block: 'end',
    //   });
    // })
  })
}

const isGenerating = ref(false)
const lastLine = ref('lastLine')
const send = async () => {
  console.log('发送消息', userInput.value)
  if(isGenerating.value) {
    Taro.showToast({
      title: '正在生成中，请稍后再试',
      icon: 'none',
    })
    return
  }
  isGenerating.value = true
  // status.value = 1


  // 将系统提示词和用户输入，传入大模型
  const res = await model.streamText({
    data: {
      model: "deepseek-r1", // 指定具体的模型
      messages: [
        { role: "user", content: userInput.value },
      ],
    },
    onEvent: (event: any) => {
      console.log('event', event);
      // 处理事件流
      if(event.delta) {
        // 开始返回内容
        console.log('开始返回内容', event.delta);
        messageList.value[messageList.value.length - 1].status = 2;
      }else if(event.data === '[DONE]') {
        // 结束返回内容
        console.log('结束返回内容');
        messageList.value[messageList.value.length - 1].status = 3;
      }
    },
    onFinish: (event: any) => {
      console.log('finish', event);
      // 处理完成事件
      messageList.value[messageList.value.length - 1].status = 3;
    },
  });
  // push 用户输入的消息到消息列表
  messageList.value.push({
    role: 'user',
    content: userInput.value,
    status: 3
  })
  userInput.value = ''
  console.log('res', res.eventStream)

  // res.eventStream


  if(res.textStream) {
      // 接收大模型的响应
    // 由于大模型的返回结果是流式的，所以我们这里需要循环接收完整的响应文本。

    messageList.value.push({
      role: 'ai',
      content: '',
      status: 0,
    })
    let content = ''
    let index = 0
    for await (let str of res.textStream) {
      // messageList.value[messageList.value.length - 1].content += str;
      lastLine.value = 'lastLine' + index
      nextTick(() => {
        content += str;
      // @ts-ignore
      messageList.value[messageList.value.length - 1].content = towxmlParse(content, 'markdown');
      })

      index++
      scrollToBottom()
    }
  }


  isGenerating.value = false
}




</script>
