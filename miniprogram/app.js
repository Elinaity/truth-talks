App({
  globalData: {
    userInfo: null,
    anonymousId: null,
    dailyCount: 0,
    lastResetDate: null
  },

  onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: 'cloud1-d8g9f8r5z660e8c0f', // 替换为你的云环境ID
      traceUser: true
    });

    // 检查并生成匿名ID
    this.checkAndGenerateAnonymousId();
    // 检查日期重置次数
    this.checkDailyReset();
  },

  // 生成随机匿名ID
  generateAnonymousId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `匿名用户 #${result}`;
  },

  // 检查并生成匿名ID
  checkAndGenerateAnonymousId() {
    let anonymousId = wx.getStorageSync('anonymousId');
    if (!anonymousId) {
      anonymousId = this.generateAnonymousId();
      wx.setStorageSync('anonymousId', anonymousId);
    }
    this.globalData.anonymousId = anonymousId;
  },

  // 检查日期重置次数
  checkDailyReset() {
    const now = new Date();
    const today = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
    const lastReset = wx.getStorageSync('lastResetDate');
    const storedCount = wx.getStorageSync('dailyCount') || 0;

    if (lastReset !== today) {
      // 新的一天，重置次数
      wx.setStorageSync('dailyCount', 0);
      wx.setStorageSync('lastResetDate', today);
      this.globalData.dailyCount = 0;
      this.globalData.lastResetDate = today;
    } else {
      this.globalData.dailyCount = storedCount;
      this.globalData.lastResetDate = today;
    }
  },

  // 使用一次发布机会
  useDailyCount() {
    this.checkDailyReset();
    if (this.globalData.dailyCount >= 5) {
      return false; // 次数用完
    }
    this.globalData.dailyCount++;
    wx.setStorageSync('dailyCount', this.globalData.dailyCount);
    return true;
  }
})
