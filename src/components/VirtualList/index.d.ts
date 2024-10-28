import { ListType } from "@/common/enums/index";

export interface VirtualListProps {
  /**
   * 列表数据
   */
  list: any[];

  /**
   * 列表类型, 默认为normal，一次性拉取所有数据
   */
  listType?: ListType;

  /**
   * 虚拟列表容器高度，不传默认为100vh
   */
  height?: string;

  /**
   * 每一屏的item数量, 不传默认为20
   */
  segmentNum?: number;

  /**
   * 指定监听页面显示区域基准值，例如2，则组件会监听 2 * scrollHeight高度的上下区域范围
   * (该值会影响页面真实节点的渲染数量，值越大，白屏几率越小，但是页面性能也就越差)
   * 不传默认为3
   */
  screenNum?: number;

  /**
   * 列表子项高度，传了则代表定高
   */
  itemHeight?: number;

  /**
   * 需要滚到的位置索引，如果传了该值，则必须传itemHeight，否则无法滚动
   */
  scrollToIndex?: number;

  /**
   * 分页索引
   */
  pageNum?: number;

  /**
   * 距离底部多少距离触发加载更多
   */
  lowerThreshold?: number;
}

export interface VirtualListEmits {
  /**
   * 滚动到底部
   */
  (e: "scrollToLower"): void;
}
