const app = getApp()
const { CATEGORIES, checkContent } = require('../../utils.js')

Page({
  data: {
    content: '',
    charCount: 0,
    usedCount: 0,
    canPost: false,
    category: 'truth',
    currentCategoryName: '真心话',
    categories: CATEGORIES,
    showCategoryPicker: false
  },

  onLoad() {
    const cats = this.data.categories
    const name = cats.find(c => c.key === 'truth')?.name || '真心话'
    this.setData({ currentCategoryName: name })
    this.updateUsedCount()
  },

  onShow() {
    this.updateUsedCount()
  },

  // 切换类目选择器
  toggleCategoryPicker() {
    this.setData({ showCategoryPicker: !this.data.showCategoryPicker })
  },

  // 选择类目
  onSelectCategory(e) {
    const key = e.currentTarget.dataset.key
    const cats = this.data.categories
    const name = cats.find(c => c.key === key)?.name || '真心话'
    this.setData({ category: key, currentCategoryName: name, showCategoryPicker: false })
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

    // 敏感词检查
    const check = checkContent(content)
    if (!check.safe) {
      wx.showToast({ title: '内容包含敏感词，请修改', icon: 'none' })
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
