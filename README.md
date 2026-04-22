# 真心话小程序 - 项目说明

一个匿名吐槽/真心话社交小程序，基于微信云开发。

## 功能特性（第一期）

- ✅ 瀑布流首页展示真心话
- ✅ 发布真心话（每天5次限制）
- ✅ 点赞功能
- ✅ 评论功能
- ✅ 匿名ID系统
- ✅ 每日次数重置
- ✅ 个人数据中心
- ✅ 分享功能（可分享帖子到好友）
- ✅ 下拉刷新
- ✅ 内容安全检查（敏感词过滤）
- ✅ 我的帖子列表
- ✅ 代码模块化（共享工具函数）

## 项目结构

```
truth-talks/
├── miniprogram/           # 小程序前端代码
│   ├── app.js            # 全局入口
│   ├── app.json          # 全局配置
│   ├── app.wxss          # 全局样式
│   ├── pages/
│   │   ├── index/        # 首页（瀑布流）
│   │   ├── post/         # 发布页
│   │   ├── detail/       # 详情页
│   │   └── mine/         # 我的页面
│   └── styles/
│       └── icons/        # TabBar图标
├── cloud/                 # 云开发云函数
└── prototype.html         # 界面原型图
```

## 快速开始

### 1. 开通云开发

1. 打开 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 创建新项目，选择「小程序·云开发」
3. 开通云开发服务

### 2. 配置云环境

1. 在 `miniprogram/app.js` 中替换云环境ID：
```javascript
wx.cloud.init({
  env: 'your-env-id', // 替换为你的云环境ID
  traceUser: true
})
```

2. 在 `project.config.json` 中填写你的 AppID：
```json
"appid": "your-appid"
```

### 3. 创建数据库集合

在云开发控制台创建以下集合：

**posts（帖子集合）**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| content | string | 帖子内容 |
| likes | number | 点赞数 |
| commentCount | number | 评论数 |
| createdAt | number | 创建时间戳 |
| authorId | string | 作者匿名ID |
| isDeleted | boolean | 是否删除 |

**comments（评论集合）**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| postId | string | 所属帖子ID |
| content | string | 评论内容 |
| authorId | string | 评论者匿名ID |
| createdAt | number | 创建时间戳 |

### 4. TabBar图标

图标目录 `miniprogram/styles/icons/` 已包含占位图标。如需自定义，可替换以下文件：
- `home.png` / `home-active.png`
- `post.png` / `post-active.png`
- `mine.png` / `mine-active.png`

（图标尺寸建议：81×81 px，PNG格式）

### 5. 导入项目

1. 打开微信开发者工具
2. 导入项目，选择 `truth-talks` 文件夹
3. 填写 AppID（需在微信公众平台注册）
4. 编译运行

## 界面设计

详见 `prototype.html` 原型文件

## 待实现功能

- [ ] 用户举报功能
- [ ] 图片理解 & 网络搜索 MCP（需单独配置）
- [ ] 深色模式支持
- [ ] 更多类目管理

## 技术栈

- 微信小程序
- 微信云开发
- JavaScript / WXML / WXSS

## 许可证

MIT
