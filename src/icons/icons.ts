// 插件所有SVG图标集中管理
// 参考 siyuan-plugin-task-note-management 项目的图标管理方式

// 所有图标的SVG symbol字符串
export const ICONS_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <!-- 顶栏图标 -->
  <symbol id="iconTaskmap" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="5" width="6" height="6" rx="1"/>
    <path d="m3 17 2 2 4-4"/>
    <path d="M13 6h8"/>
    <path d="M13 12h8"/>
    <path d="M13 18h8"/>
  </symbol>
  
  <!-- 侧边栏图标 -->
  <symbol id="iconTaskmapDock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
    <path d="m9 11 3 3L22 4"/>
  </symbol>
  
  <!-- 加号图标 -->
  <symbol id="iconAdd" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </symbol>
  
  <!-- 项目管理图标 -->
  <symbol id="iconProject" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/>
    <circle cx="14" cy="15" r="1"/>
  </symbol>
  
  <!-- 任务管理图标 -->
  <symbol id="iconTask" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </symbol>
  
  <!-- 任务计时图标 -->
  <symbol id="iconTimer" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </symbol>
  
  <!-- 数据统计图标 -->
  <symbol id="iconStats" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </symbol>
  
  <!-- 设置图标 -->
  <symbol id="iconSettings" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </symbol>
  
  <!-- 新增更多项目可用图标（不与顶栏/侧边栏重复） -->
  <symbol id="iconBook" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 7H20"/>
    <rect x="4" y="2" width="16" height="20" rx="2"/>
  </symbol>
  <symbol id="iconStar" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2"/>
  </symbol>
  <symbol id="iconHeart" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.3l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>
  </symbol>
  <symbol id="iconFlag" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 4v16"/>
    <path d="M4 4h16l-2 5 2 5H4"/>
  </symbol>
  <symbol id="iconMusic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="18" r="3"/>
    <path d="M6 15V6l15-2v9"/>
  </symbol>
  <symbol id="iconCoffee" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <rect x="2" y="8" width="16" height="8" rx="4"/>
    <line x1="6" y1="2" x2="6" y2="4"/>
    <line x1="10" y1="2" x2="10" y2="4"/>
    <line x1="14" y1="2" x2="14" y2="4"/>
  </symbol>
  <symbol id="iconSun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </symbol>
  <symbol id="iconMoon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
  </symbol>
  <symbol id="iconGift" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M12 7V21"/>
    <path d="M2 11h20"/>
    <path d="M12 7a3 3 0 1 1 3-3c0 1.5-3 3-3 3z"/>
    <path d="M12 7a3 3 0 1 0-3-3c0 1.5 3 3 3 3z"/>
  </symbol>
</svg>
`;

// 图标ID常量
export const ICON_IDS = {
  Taskmap: 'iconTaskmap',
  Taskmap_DOCK: 'iconTaskmapDock',
  ADD: 'iconAdd',
  PROJECT: 'iconProject', 
  TASK: 'iconTask',
  TIMER: 'iconTimer',
  STATS: 'iconStats',
  SETTINGS: 'iconSettings',
  BOOK: 'iconBook',
  STAR: 'iconStar',
  HEART: 'iconHeart',
  FLAG: 'iconFlag',
  MUSIC: 'iconMusic',
  COFFEE: 'iconCoffee',
  SUN: 'iconSun',
  MOON: 'iconMoon',
  GIFT: 'iconGift',
} as const;

// 获取图标SVG字符串的函数
export function getIconSVG(iconId: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <use xlink:href="#${iconId}"></use>
  </svg>`;
}