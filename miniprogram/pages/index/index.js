const app = getApp()

Page({
  data: {
    posts: [],
    showCategoryPicker: false,
    loading: false,
    noMore: false,
    page: 0,
    pageSize: 20,
    category: 'all',
    currentCategoryName: '全部',
    categories: [
      { key: 'all', name: '全部' },
      { key: 'truth', name: '💬 真心话' },
      { key: 'chat', name: '🗣️ 闲聊' },
      { key: 'life', name: '🏠 家常趣事' },
      { key: 'horror', name: '👻 灵异话题' },
      { key: 'positive', name: '✨ 正能量' },
      { key: 'funny', name: '😂 搞笑' }
    ]
  },

  onLoad() {
    const cats = this.data.categories
    const name = cats.find(c => c.key === 'all')?.name || '全部'
    this.setData({ currentCategoryName: name })
    wx.setNavigationBarTitle({ title: name })
    this.loadPosts()
  },

  onShow() {
    const cats = this.data.categories
    const cat = cats.find(c => c.key === this.data.category)
    const name = cat?.name || this.data.currentCategoryName || '全部'
    this.setData({ page: 0, posts: [], noMore: false, currentCategoryName: name, showCategoryPicker: false })
    wx.setNavigationBarTitle({ title: name })
    this.loadPosts()
  },

  // 加载帖子列表
  async loadPosts() {
    if (this.data.loading || this.data.noMore) return

    this.setData({ loading: true })

    try {
      const db = wx.cloud.database()
      const _ = db.command

      const query = this.data.category === 'all'
        ? db.collection('posts')
        : db.collection('posts').where({ category: this.data.category })

      const result = await query
        .orderBy('createdAt', 'desc')
        .skip(this.data.page * this.data.pageSize)
        .limit(this.data.pageSize)
        .get()

      // 获取当前用户的点赞记录
      const likedPosts = wx.getStorageSync('likedPosts') || []
      const now = Date.now()

      const posts = result.data.map(item => {
        // 计算时间差
        const diff = now - item.createdAt
        let timeAgo = ''
        if (diff < 60000) timeAgo = '刚刚'
        else if (diff < 3600000) timeAgo = `${Math.floor(diff/60000)}分钟前`
        else if (diff < 86400000) timeAgo = `${Math.floor(diff/3600000)}小时前`
        else timeAgo = `${Math.floor(diff/86400000)}天前`

        return {
          ...item,
          timeAgo,
          isLiked: likedPosts.includes(item._id)
        }
      })

      this.setData({
        posts: this.data.page === 0 ? posts : [...this.data.posts, ...posts],
        page: this.data.page + 1,
        loading: false,
        noMore: posts.length < this.data.pageSize
      })
    } catch (e) {
      console.error('加载失败', e)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 选择类目
  onSelectCategory(e) {
    const key = e.currentTarget.dataset.key
    const cats = this.data.categories
    const name = cats.find(c => c.key === key)?.name || '全部'
    this.setData({ category: key, currentCategoryName: name, page: 0, posts: [], noMore: false, showCategoryPicker: false })
    wx.setNavigationBarTitle({ title: name })
    this.loadPosts()
  },

  toggleCategoryPicker() {
    this.setData({ showCategoryPicker: !this.data.showCategoryPicker })
  },

  // 加载更多
  onLoadMore() {
    this.loadPosts()
  },

  // 跳转详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  // 点赞
  async onLike(e) {
    const id = e.currentTarget.dataset.id
    const posts = this.data.posts
    const postIndex = posts.findIndex(p => p._id === id)
    if (postIndex === -1) return

    const post = posts[postIndex]
    const isLiked = post.isLiked
    const likedPosts = wx.getStorageSync('likedPosts') || []

    try {
      const db = wx.cloud.database()

      // 更新数据库
      await db.collection('posts').doc(id).update({
        data: {
          likes: isLiked ? _.inc(-1) : _.inc(1)
        }
      })

      // 更新本地状态
      posts[postIndex].likes += isLiked ? -1 : 1
      posts[postIndex].isLiked = !isLiked

      // 更新点赞记录
      if (!isLiked) {
        likedPosts.push(id)
      } else {
        const index = likedPosts.indexOf(id)
        if (index > -1) likedPosts.splice(index, 1)
      }
      wx.setStorageSync('likedPosts', likedPosts)

      this.setData({ posts })
    } catch (e) {
      console.error('点赞失败', e)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ page: 0, posts: [], noMore: false })
    this.loadPosts().finally(() => {
      wx.stopPullDownRefresh()
    })
  }
})
