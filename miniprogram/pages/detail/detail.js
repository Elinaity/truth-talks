const app = getApp()

Page({
  data: {
    postId: '',
    post: {},
    comments: [],
    commentText: '',
    loading: false
  },

  onLoad(options) {
    this.setData({ postId: options.id })
    this.loadPost()
    this.loadComments()
  },

  // 加载帖子
  async loadPost() {
    try {
      const db = wx.cloud.database()
      const result = await db.collection('posts').doc(this.data.postId).get()

      if (!result.data) {
        wx.showToast({ title: '帖子不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }

      const post = result.data
      const now = Date.now()
      const diff = now - post.createdAt
      let timeAgo = ''
      if (diff < 60000) timeAgo = '刚刚'
      else if (diff < 3600000) timeAgo = `${Math.floor(diff/60000)}分钟前`
      else if (diff < 86400000) timeAgo = `${Math.floor(diff/3600000)}小时前`
      else timeAgo = `${Math.floor(diff/86400000)}天前`

      // 检查是否点赞
      const likedPosts = wx.getStorageSync('likedPosts') || []

      this.setData({
        post: {
          ...post,
          timeAgo,
          isLiked: likedPosts.includes(post._id)
        }
      })
    } catch (e) {
      console.error('加载帖子失败', e)
    }
  },

  // 加载评论
  async loadComments() {
    this.setData({ loading: true })

    try {
      const db = wx.cloud.database()
      const result = await db.collection('comments')
        .where({ postId: this.data.postId })
        .orderBy('createdAt', 'asc')
        .get()

      const now = Date.now()
      const comments = result.data.map(item => {
        const diff = now - item.createdAt
        let timeAgo = ''
        if (diff < 60000) timeAgo = '刚刚'
        else if (diff < 3600000) timeAgo = `${Math.floor(diff/60000)}分钟前`
        else if (diff < 86400000) timeAgo = `${Math.floor(diff/3600000)}小时前`
        else timeAgo = `${Math.floor(diff/86400000)}天前`

        return { ...item, timeAgo }
      })

      this.setData({ comments, loading: false })
    } catch (e) {
      console.error('加载评论失败', e)
      this.setData({ loading: false })
    }
  },

  // 点赞
  async onLike() {
    const { post, postId } = this.data
    const isLiked = post.isLiked
    const likedPosts = wx.getStorageSync('likedPosts') || []

    try {
      const db = wx.cloud.database()
      const _ = db.command

      await db.collection('posts').doc(postId).update({
        data: {
          likes: isLiked ? _.inc(-1) : _.inc(1)
        }
      })

      // 更新本地状态
      this.setData({
        'post.likes': post.likes + (isLiked ? -1 : 1),
        'post.isLiked': !isLiked
      })

      // 更新点赞记录
      if (!isLiked) {
        likedPosts.push(postId)
      } else {
        const index = likedPosts.indexOf(postId)
        if (index > -1) likedPosts.splice(index, 1)
      }
      wx.setStorageSync('likedPosts', likedPosts)

    } catch (e) {
      console.error('点赞失败', e)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  // 提交评论
  async onSubmitComment(e) {
    const content = e.detail.value || this.data.commentText

    if (!content.trim()) {
      wx.showToast({ title: '请输入评论', icon: 'none' })
      return
    }

    try {
      const db = wx.cloud.database()
      const anonymousId = wx.getStorageSync('anonymousId')

      await db.collection('comments').add({
        data: {
          postId: this.data.postId,
          content: content.trim(),
          authorId: anonymousId,
          createdAt: Date.now()
        }
      })

      // 更新帖子评论数
      const _ = db.command
      await db.collection('posts').doc(this.data.postId).update({
        data: {
          commentCount: _.inc(1)
        }
      })

      this.setData({ commentText: '' })

      // 刷新评论和帖子
      this.loadComments()
      this.loadPost()

      wx.showToast({ title: '评论成功', icon: 'success' })

    } catch (e) {
      console.error('评论失败', e)
      wx.showToast({ title: '评论失败', icon: 'none' })
    }
  },

  // 输入监听
  onCommentInput(e) {
    this.setData({ commentText: e.detail.value })
  },

  goBack() {
    wx.navigateBack()
  }
})
