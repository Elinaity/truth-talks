const app = getApp()
const { timeAgo, getLevelByExp, getLevelProgress } = require('../../utils.js')

Page({
  data: {
    anonymousId: '',
    remainCount: 5,
    stats: {
      posts: 0,
      comments: 0,
      likes: 0
    },
    myPosts: [],
    loadingPosts: false,
    levelInfo: null,
    expProgress: null
  },

  onLoad() {
    this.setData({ anonymousId: wx.getStorageSync('anonymousId') || '匿名用户' })
    this.updateRemainCount()
    this.loadStats()
    this.loadMyPosts()
    this.loadLevelInfo()
  },

  onShow() {
    this.updateRemainCount()
    this.loadStats()
    this.loadMyPosts()
    this.loadLevelInfo()
  },

  // 加载等级信息
  loadLevelInfo() {
    const exp = wx.getStorageSync('userExp') || 0
    const levelInfo = getLevelByExp(exp)
    const expProgress = getLevelProgress(exp)
    this.setData({ levelInfo, expProgress })
  },

  // 更新剩余次数
  updateRemainCount() {
    const usedCount = wx.getStorageSync('dailyCount') || 0
    this.setData({ remainCount: Math.max(0, 5 - usedCount) })
  },

  // 加载统计数据
  async loadStats() {
    try {
      const db = wx.cloud.database()
      const anonymousId = wx.getStorageSync('anonymousId')

      // 查询我的发布
      const postsResult = await db.collection('posts')
        .where({ authorId: anonymousId, isDeleted: false })
        .count()

      // 查询我的评论
      const commentsResult = await db.collection('comments')
        .where({ authorId: anonymousId })
        .count()

      // 统计获赞数（从所有帖子的点赞数累加）
      const postsList = await db.collection('posts')
        .where({ authorId: anonymousId, isDeleted: false })
        .field({ likes: true })
        .get()

      const totalLikes = postsList.data.reduce((sum, post) => sum + (post.likes || 0), 0)

      this.setData({
        stats: {
          posts: postsResult.total,
          comments: commentsResult.total,
          likes: totalLikes
        }
      })
    } catch (e) {
      console.error('加载统计失败', e)
    }
  },

  // 加载我的帖子
  async loadMyPosts() {
    this.setData({ loadingPosts: true })
    try {
      const db = wx.cloud.database()
      const anonymousId = wx.getStorageSync('anonymousId')

      const result = await db.collection('posts')
        .where({ authorId: anonymousId, isDeleted: false })
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get()

      const myPosts = result.data.map(item => ({
        ...item,
        timeAgo: timeAgo(item.createdAt)
      }))

      this.setData({ myPosts, loadingPosts: false })
    } catch (e) {
      console.error('加载我的帖子失败', e)
      this.setData({ loadingPosts: false })
    }
  },

  // 跳转详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    Promise.all([this.loadStats(), this.loadMyPosts()]).finally(() => {
      wx.stopPullDownRefresh()
    })
  }
})
