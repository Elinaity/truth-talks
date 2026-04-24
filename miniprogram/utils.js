// 共享工具函数

// 类目配置
const CATEGORIES = [
  { key: 'all', name: '全部' },
  { key: 'truth', name: '💬 真心话' },
  { key: 'chat', name: '🗣️ 闲聊' },
  { key: 'life', name: '🏠 家常趣事' },
  { key: 'horror', name: '👻 灵异话题' },
  { key: 'positive', name: '✨ 正能量' },
  { key: 'funny', name: '😂 搞笑' }
]

// 发布页类目（不含"全部"）
const POST_CATEGORIES = CATEGORIES.filter(c => c.key !== 'all')

// 计算时间差
function timeAgo(timestamp) {
  const diff = Date.now() - timestamp
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

// 敏感词列表（简单示例，实际项目需要更完整的词库）
const SENSITIVE_WORDS = [
  '反动', '暴力', '色情', '赌博', '毒品', '诈骗',
  '枪支', '弹药', '炸药', '恐怖', '分裂', '颠覆'
]

// 内容安全检查
function checkContent(text) {
  if (!text) return { safe: true }
  
  const lowerText = text.toLowerCase()
  for (const word of SENSITIVE_WORDS) {
    if (lowerText.includes(word)) {
      return { safe: false, word }
    }
  }
  return { safe: true }
}

// 获取类目名称
function getCategoryName(key) {
  const cat = CATEGORIES.find(c => c.key === key)
  return cat?.name || '全部'
}

// ============ 等级系统 ============
const LEVELS = [
  { level: 1, name: '新手', minExp: 0, icon: '🌱' },
  { level: 2, name: '入门', minExp: 100, icon: '🌿' },
  { level: 3, name: '成长', minExp: 300, icon: '🌾' },
  { level: 4, name: '熟手', minExp: 600, icon: '🌳' },
  { level: 5, name: '老手', minExp: 1000, icon: '🍃' },
  { level: 6, name: '达人', minExp: 1500, icon: '🌲' },
  { level: 7, name: '精英', minExp: 2200, icon: '🏵️' },
  { level: 8, name: '大师', minExp: 3000, icon: '🎖️' },
  { level: 9, name: '传奇', minExp: 4000, icon: '👑' },
  { level: 10, name: '神话', minExp: 5500, icon: '✨' }
]

// 经验值常量
const EXP = {
  POST: 20,      // 发布帖子
  COMMENT: 10,   // 发表评论
  RECEIVE_LIKE: 5 // 帖子被点赞
}

// 根据经验计算等级
function getLevelByExp(exp) {
  let level = LEVELS[0]
  for (const l of LEVELS) {
    if (exp >= l.minExp) {
      level = l
    } else {
      break
    }
  }
  return level
}

// 获取当前等级到下一级的进度
function getLevelProgress(exp) {
  const current = getLevelByExp(exp)
  const currentIndex = LEVELS.findIndex(l => l.level === current.level)
  const nextLevel = LEVELS[currentIndex + 1]

  if (!nextLevel) {
    return { current, next: null, progress: 100, expToNext: 0 }
  }

  const expInCurrentLevel = exp - current.minExp
  const expNeededForLevel = nextLevel.minExp - current.minExp
  const progress = Math.min(100, Math.round((expInCurrentLevel / expNeededForLevel) * 100))
  const expToNext = nextLevel.minExp - exp

  return { current, next: nextLevel, progress, expToNext }
}

module.exports = {
  CATEGORIES,
  POST_CATEGORIES,
  timeAgo,
  checkContent,
  getCategoryName,
  SENSITIVE_WORDS,
  LEVELS,
  EXP,
  getLevelByExp,
  getLevelProgress
}
