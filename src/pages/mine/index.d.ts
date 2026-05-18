/** 用户个人信息 */
export interface UserProfile {
  nickname: string
  avatar: string
  bio: string
  userId: string
}

/** 用户统计数据 */
export interface UserStats {
  signInDays: number
  visitDays: number
  toolsUsed: number
  lastVisitDate: string
}

/** 菜单项 */
export interface MenuItem {
  icon: string
  label: string
  desc?: string
  action: 'navigate' | 'share' | 'feedback' | 'about' | 'clear-cache'
  path?: string
}
