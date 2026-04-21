const app = getApp()

Page({
  data: {
    anonymousId: '',
    remainCount: 5,
    stats: {
      posts: 0,
      comments: 0,
      likes: 0
    }
  },

  onLoad() {
    this.setData({ anonymousId: wx.getStorageSync('anonymousId') || '匿名用户' })
    this.updateRemainCount()
    this.loadStats()
  },

  onShow() {
    this.updateRemainCount()
    this.loadStats()
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
        .where({ authorId: anonymousId })
        .count()

      // 查询我的评论
      const commentsResult = await db.collection('comments')
        .where({ authorId: anonymousId })
        .count()

      // 统计获赞数（从所有帖子的点赞数累加）
      const postsList = await db.collection('posts')
        .where({ authorId: anonymousId })
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
  }
})
