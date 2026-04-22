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

module.exports = {
  CATEGORIES,
  POST_CATEGORIES,
  timeAgo,
  checkContent,
  getCategoryName,
  SENSITIVE_WORDS
}
