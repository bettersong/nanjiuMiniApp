## 虚拟列表组件


### API

| 参数            | 说明                    | 类型      |是否必传             | 默认值    |
|-----------------|------------------------|-----------|-------|-----------|
|list             |列表数据                  |array     | 是       |无        |
|segmentNum       |每一屏的item数量           |number    |否      |20    |
|screenNum        |指定监听页面显示区域基准值     |Number   |否       |2          |
|itemHeight       |列表子项高度，传了则代表定高    |String   |否      |无|
|scrollToIndex    |需要滚到的位置索引，如果传了该值，则必须传itemHeight，否则无法滚动|Boolean | 否 |无|
|height           |滚动容器高度                |    string     |否      | 100vh

### slots

| 名称    |             说明                  |
|--------|-----------------------------------|
|listItem |     虚拟列表子项                   |
|renderSkeleton| 自定义骨架屏，防止滚动过快导致白屏，提高体验|
|renderBottom|  自定义底部渲染内容，如加载中、已完成...|


slot name="listItem"
