// ID生成器工具
// 生成与思源笔记格式一致的ID：YYYYMMDDHHMMSS-随机字符串

/**
 * 生成思源笔记格式的ID
 * 格式：YYYYMMDDHHMMSS-随机字符串
 * 示例：20230613234017-zkw3pr0
 */
export function generateSiyuanId(): string {
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');
  
  // 生成7位随机字符串（字母和数字）
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomStr = '';
  for (let i = 0; i < 7; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${timestamp}-${randomStr}`;
}

/**
 * 验证ID是否为思源笔记格式
 * @param id 要验证的ID
 * @returns 是否为有效格式
 */
export function isValidSiyuanId(id: string): boolean {
  // 格式：YYYYMMDDHHMMSS-随机字符串
  const pattern = /^\d{14}-[a-z0-9]{7}$/;
  return pattern.test(id);
}

/**
 * 从ID中提取时间戳
 * @param id 思源笔记格式的ID
 * @returns Date对象或null
 */
export function extractTimestampFromId(id: string): Date | null {
  if (!isValidSiyuanId(id)) {
    return null;
  }
  
  const timestamp = id.substring(0, 14);
  const year = parseInt(timestamp.substring(0, 4));
  const month = parseInt(timestamp.substring(4, 6)) - 1; // 月份从0开始
  const day = parseInt(timestamp.substring(6, 8));
  const hour = parseInt(timestamp.substring(8, 10));
  const minute = parseInt(timestamp.substring(10, 12));
  const second = parseInt(timestamp.substring(12, 14));
  
  return new Date(year, month, day, hour, minute, second);
}

/**
 * 从ID中提取随机字符串部分
 * @param id 思源笔记格式的ID
 * @returns 随机字符串或null
 */
export function extractRandomStringFromId(id: string): string | null {
  if (!isValidSiyuanId(id)) {
    return null;
  }
  
  return id.substring(15); // 跳过14位时间戳和1位连字符
}

/**
 * 生成批量ID
 * @param count 要生成的ID数量
 * @returns ID数组
 */
export function generateBatchSiyuanIds(count: number): string[] {
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    ids.push(generateSiyuanId());
  }
  return ids;
}

/**
 * 生成带前缀的ID（用于区分不同类型的数据）
 * @param prefix 前缀（1-3个字符）
 * @returns 带前缀的ID
 */
export function generatePrefixedSiyuanId(prefix: string): string {
  if (prefix.length > 3) {
    throw new Error('前缀长度不能超过3个字符');
  }
  
  const baseId = generateSiyuanId();
  return `${prefix}-${baseId}`;
}

/**
 * 从带前缀的ID中提取基础ID
 * @param prefixedId 带前缀的ID
 * @returns 基础ID
 */
export function extractBaseIdFromPrefixed(prefixedId: string): string {
  const parts = prefixedId.split('-');
  if (parts.length < 3) {
    return prefixedId; // 如果不是带前缀的ID，直接返回
  }
  
  // 移除前缀，重新组合时间戳和随机字符串
  return `${parts[1]}-${parts[2]}`;
}

/**
 * 从带前缀的ID中提取前缀
 * @param prefixedId 带前缀的ID
 * @returns 前缀或null
 */
export function extractPrefixFromPrefixed(prefixedId: string): string | null {
  const parts = prefixedId.split('-');
  if (parts.length < 3) {
    return null;
  }
  
  return parts[0];
}

// 预定义的前缀常量
export const ID_PREFIXES = {
  PROJECT: 'prj',
  TASK: 'tsk',
  CATEGORY: 'cat',
  TAG: 'tag',
  SETTING: 'set'
} as const;

// 便捷函数
export const generateProjectId = () => generatePrefixedSiyuanId(ID_PREFIXES.PROJECT);
export const generateTaskId = () => generatePrefixedSiyuanId(ID_PREFIXES.TASK);
export const generateCategoryId = () => generatePrefixedSiyuanId(ID_PREFIXES.CATEGORY);
export const generateTagId = () => generatePrefixedSiyuanId(ID_PREFIXES.TAG);
export const generateSettingId = () => generatePrefixedSiyuanId(ID_PREFIXES.SETTING); 