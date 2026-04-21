const app = getApp()

Page({
  data: {
    content: '',
    charCount: 0,
    usedCount: 0,
    canPost: false,
    category: 'truth',
    categories: [
      { key: 'truth', name: '💬 真心话' },
      { key: 'chat', name: '🗣️ 闲聊' },
      { key: 'life', name: '🏠 家常趣事' },
      { key: 'horror', name: '👻 灵异话题' },
      { key: 'positive', name: '✨ 正能量' },
      { key: 'funny', name: '😂 搞笑' }
    ]
  },

  onLoad() {
    this.updateUsedCount()
  },

  onShow() {
    this.updateUsedCount()
  },

  // 选择类目
  onSelectCategory(e) {
    this.setData({ category: e.currentTarget.dataset.key })
  },

  // 更新已用次数
  updateUsedCount() {
    const usedCount = wx.getStorageSync('dailyCount') || 0
    this.setData({
      usedCount,
      canPost: usedCount < 5 && this.data.content.trim().length > 0
    })
  },

  // 输入监听
  onInput(e) {
    const content = e.detail.value
    const charCount = content.length
    const usedCount = wx.getStorageSync('dailyCount') || 0

    this.setData({
      content,
      charCount,
      canPost: usedCount < 5 && charCount > 0 && charCount <= 200
    })
  },

  // 提交
  async onSubmit() {
    const { content, usedCount } = this.data

    if (!content.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    if (usedCount >= 5) {
      wx.showToast({ title: '今日次数已用完', icon: 'none' })
      return
    }

    wx.showLoading({ title: '发布中...' })

    try {
      const db = wx.cloud.database()
      const anonymousId = wx.getStorageSync('anonymousId')

      await db.collection('posts').add({
        data: {
          content: content.trim(),
          category: this.data.category,
          likes: 0,
          commentCount: 0,
          createdAt: Date.now(),
          authorId: anonymousId,
          isDeleted: false
        }
      })

      // 更新使用次数
      const newCount = usedCount + 1
      wx.setStorageSync('dailyCount', newCount)

      wx.hideLoading()
      wx.showToast({ title: '发布成功', icon: 'success' })

      // 清空内容并返回首页
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 1500)

    } catch (e) {
      console.error('发布失败', e)
      wx.hideLoading()
      wx.showToast({ title: '发布失败', icon: 'none' })
    }
  },

  goBack() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
