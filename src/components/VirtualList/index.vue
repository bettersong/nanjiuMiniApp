<template>
  <view class="virtual_list" :style="{ height: height }">
    <!-- 骨架屏 -->
    <view class="ske_box" v-if="customSlots.renderSkeleton">
      <slot name="renderSkeleton"></slot>
    </view>
    <scroll-view
      v-if="list?.length"
      class="list"
      :scrollY="true"
      :showScrollbar="false"
      :lowerThreshold="lowerThreshold"
      :scrollTop="scrollTop"
      @scrollToLower="renderNext"
      :enhanced="true"
      :bounces="false"
      :enablePassive="true"
      :style="{ height: height }"
    >
      <view
        :class="[`inner_list_${pageIndex}`]"
        :id="`inner_list_${pageIndex}`"
        v-for="(page, pageIndex) in towList"
        :key="pageIndex"
      >
        <template v-if="page?.length > 0">
          <view
            :id="`item_${pageIndex}_${index}`"
            v-for="(item, index) in page"
            :key="index"
          >
            <slot v-if="item" name="listItem" :item="item"></slot>
          </view>
        </template>
        <view v-else :style="{ height: `${pageHeightArr[pageIndex]}px` }">
        </view>
      </view>
      <!-- 底部自定义内容 -->
      <slot name="renderBottom"></slot>
    </scroll-view>
    <view
      v-if="itemHeight"
      class="render_box"
      :style="{ height: pxTransform(itemHeight) }"
    ></view>
  </view>
</template>

<script setup lang="ts">
import "./index.module.scss";
import { onBeforeUnmount, onMounted, ref, useSlots, watch } from "vue";
import Taro, { pxTransform } from "@tarojs/taro";
import type { VirtualListProps, VirtualListEmits } from "./index.d";
import { ListType } from "../../enums/index";
import { throttle } from "../../utils/index";
const customSlots = useSlots();
// console.log("ListType", ListType);
const props = withDefaults(defineProps<VirtualListProps>(), {
  segmentNum: 20,
  screenNum: 5,
  height: "100vh",
  listType: ListType.NORMAL,
  lowerThreshold: 200,
});

const emits = defineEmits<VirtualListEmits>();

watch(
  () => props.scrollToIndex,
  (nv = 0) => {
    console.log("scrollToIndex", nv);
    if (nv < 0) return;
    formateList(props?.list);
  },
);

watch(
  () => props.pageNum,
  (nv = 1, ov = 1) => {
    if (props?.listType === ListType.PAGE) {
      // formateMultiList(nv, 1);
      const pageNum = nv ?? 1;
      if (nv > ov) {
        formateMultiList(props?.list, pageNum);
      }
    }
  },
);

const renderPageIndex = ref(0); // 每一屏的索引
const towList = ref<any[]>([]); // 分段列表，二维数组
const pageHeightArr = ref<any[]>([]); // 每一页的高度
let pageHeight = 0; // 一屏的高度
let initList: any[] = []; // 初始列表(备用)
const currentPage = Taro.getCurrentInstance();
const scrollTop = ref(0); // 滚动高度
let observer: any = null;
let pageWidth = 375; // 屏幕宽度
const itemRenderHeight = ref(0); // 每一项的渲染高度

// 框架默认
// const isComplete = ref(false); // 是否加载完成

try {
  const res = Taro.getSystemInfoSync();
  pageHeight = res.windowHeight;
  pageWidth = res.windowWidth;

  // console.log("-----", pageWidth, pxTransform(props?.itemHeight ?? 0));
} catch (e) {
  console.log("getSystemInfoSync failed!");
}

// const targetDom = ref("");
// 处理列表数据，按规则分割
const dealList = (list: any[]) => {
  const segmentNum = props?.segmentNum; // 每页显示数量
  let arr: any[] = [];
  const _list: any[] = [];
  list.forEach((item, index) => {
    arr.push(item);
    if ((index + 1) % segmentNum === 0) {
      _list.push(arr);
      arr = [];
    }
  });
  // 处理余数
  const restList = list.slice(_list.length * segmentNum);
  if (restList.length) {
    _list.push(restList);
  }
  initList = _list;
};

const formateList = (list: any[]): void => {
  const scrollToIndex = props?.scrollToIndex; // 滚动到指定位置
  const itemHeight =
    itemRenderHeight.value || (props?.itemHeight ?? 0) * (pageWidth / 375); // 每一项的真实渲染高度
  const segmentNum = props?.segmentNum; // 每页显示数量
  dealList(list);
  if (itemHeight && scrollToIndex !== undefined) {
    // 定高，可滚动至指定位置
    // console.log("scrollToIndex", scrollToIndex);
    const startIndex = Math.floor(scrollToIndex / segmentNum); // 找到当前索引所在的页面
    console.log("startIndex", startIndex);
    renderPageIndex.value = startIndex; // 更新当前页索引
    const pageHeight = segmentNum * itemHeight; // 一屏的高度
    console.log("pageHeight", pageHeight, itemHeight);
    // readyList
    for (let i = 0; i < startIndex; i++) {
      // console.log("pageHeight", i, pageHeight);
      pageHeightArr.value[i] = pageHeight;
      towList.value[i] = {
        height: pageHeight,
      };
    }
    towList.value[startIndex] = initList[startIndex];
    if (startIndex + 1 < initList.length) {
      towList.value[startIndex + 1] = initList[startIndex + 1];
    }
    Taro.nextTick(() => {
      for (let i = 0; i < startIndex; i++) {
        // observePageHeight(i);
        setheight(list, i);
      }

      // const targetDom = `#item_${startIndex}_${scrollToIndex - startIndex * segmentNum}`;
      // const query = Taro.createSelectorQuery();
      // query.select(targetDom).boundingClientRect();
      // query.exec((res) => {
      //   console.log(targetDom, res);
      //   if (res?.[0]?.top < 0 || res?.[0]?.top > pageHeight) {
      //     scrollTop.value = scrollTop.value + res?.[0]?.top - itemHeight * 4;
      //     // scrollTop.value = scrollToIndex * itemHeight;
      //     scrollTop.value = scrollToIndex * itemHeight;
      //   }
      // });

      // 计算滚动高度
      // let height = pageHeightArr.value
      //   .slice(0, startIndex)
      //   ?.reduce((a, b) => a + b, 0);
      scrollTop.value = scrollToIndex * itemHeight;
      console.log("scrollTop---", scrollTop.value);
    });
  } else {
    // console.log("当前为不定高虚拟列表");
    towList.value = initList.slice(0, 1);
    Taro.nextTick(() => {
      setheight(list);
    });
  }
};

const formateMultiList = (list: any[], pageNum = 1) => {
  if (!list?.length) return;
  dealList(list);
  towList.value[pageNum - 1] = initList[pageNum - 1];
  renderPageIndex.value = pageNum - 1;
  Taro.nextTick(() => {
    setheight(list);
  });
};

// 计算每一页数据渲染完成后所占的高度
const setheight = (list: any[], pageIndex?: number): void => {
  const index = pageIndex ?? renderPageIndex.value;
  const query = Taro.createSelectorQuery();

  query.select(`.inner_list_${index}`).boundingClientRect();
  query.exec((res) => {
    if (list?.length) {
      // console.log("res", res?.[0]?.height);
      pageHeightArr.value.push(res?.[0]?.height);
    }
  });
  observePageHeight(pageIndex); // 监听页面高度
};

const observePageHeight = (pageIndex?: number) => {
  const index = pageIndex ?? renderPageIndex.value;
  observer = Taro.createIntersectionObserver(
    currentPage.page as any,
  ).relativeToViewport({
    top: props?.screenNum * pageHeight,
    bottom: props?.screenNum * pageHeight,
  });
  console.log('observer', observer);
  // console.log("index", `.inner_list_${index}`);
  observer?.observe(`.inner_list_${index}`, (res) => {
    console.log(`.inner_list_${index}`, res.intersectionRatio);
    if (res.intersectionRatio <= 0) {
      // 当没有交集时，说明当前页面已经不在视口内，则将该屏数据修改为该屏高度进行占位
      towList.value[index] = {
        height: pageHeightArr.value[index],
      };
    } else {
      // 当有交集时，说明当前页面在视口内
      if (!towList.value[index]?.length) {
        // 当前页面没有渲染过
        towList.value[index] = initList[index];
      }
    }
  });
};

const scrollToLower = throttle(() => {
  emits("scrollToLower");
}, 300);

// 渲染下一页
const renderNext = () => {
  // if (!towList.value[pageIndex]?.length) {
  //   // 无数据
  // }
  console.log("renderNext");
  if (props.listType === ListType.PAGE) {
    scrollToLower();
  } else {
    renderPageIndex.value += 1; // 更新当前页索引
    if (renderPageIndex.value >= initList.length) {
      // 已经到底
      return;
    }
    towList.value[renderPageIndex.value] = initList[renderPageIndex.value];

    Taro.nextTick(() => {
      setheight(props?.list);
    });
  }
};

// const onscroll = (e) => {
//   // scrollTop.value = e.detail.scrollTop;
//   // console.log("scrollTop", e.detail.scrollTop);
// };

onMounted(() => {
  if (props?.listType === ListType.PAGE) {
    formateMultiList(props?.list, 1);
  } else {
    formateList(props?.list);
  }
  if (props?.itemHeight) {
    Taro.nextTick(() => {
      const query = Taro.createSelectorQuery();
      query.select(".render_box").boundingClientRect();
      query.exec((res) => {
        if (res?.[0]?.height) {
          itemRenderHeight.value = res?.[0]?.height || 0;
          // console.log("----itemHeight", itemHeight);
        }
      });
    });
  }
  // formateList(props?.list);
  // console.log("1111towList", towList.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>
