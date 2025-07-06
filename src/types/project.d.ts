// TaskFlow 项目数据结构
// 参考滴答清单设计

// 项目状态枚举
export enum ProjectStatus {
  ACTIVE = 'active',        // 活跃
  PAUSED = 'paused',        // 暂停
  COMPLETED = 'completed',  // 已完成
  ARCHIVED = 'archived'     // 已归档
}

// 项目类型枚举 - 基于人生九宫格设计
// 参考：https://goalmapapp.com/concepts/how-to-find-goal.html
export enum ProjectType {
  LEARNING_GROWTH = 'learning_growth',     // 学习成长
  EXPERIENCE_BREAKTHROUGH = 'experience_breakthrough', // 体验突破
  LEISURE_ENTERTAINMENT = 'leisure_entertainment', // 休闲娱乐
  WORK_CAREER = 'work_career',             // 工作事业
  FAMILY_LIFE = 'family_life',             // 家庭生活
  PHYSICAL_HEALTH = 'physical_health',     // 身体健康
  FINANCIAL_MANAGEMENT = 'financial_management', // 财务理财
  SOCIAL_RELATIONSHIPS = 'social_relationships', // 人际社群
}

// 项目数据结构
export interface Project {
  id: string;                    // 项目唯一ID
  name: string;                  // 项目名称
  description?: string;          // 项目描述
  type: ProjectType;             // 项目类型
  status: ProjectStatus;         // 项目状态
  color: string;                 // 项目颜色
  icon?: string;                 // 项目图标
  startDate?: number;            // 开始时间（时间戳）
  endDate?: number;              // 结束时间（时间戳）
  dueDate?: number;              // 截止时间（时间戳）
  createdAt: number;             // 创建时间
  updatedAt: number;             // 更新时间
  completedAt?: number;          // 完成时间
  isArchived: boolean;           // 是否归档
  order: number;                 // 排序权重
  taskCount: number;             // 任务数量
  completedTaskCount: number;    // 已完成任务数量
  completionRate: number;        // 完成率（0-100）
}

// 项目创建参数
export interface CreateProjectParams {
  name: string;
  description?: string;
  type?: ProjectType;
  color?: string;
  icon?: string;
  startDate?: number;
  endDate?: number;
  dueDate?: number;
}

// 项目更新参数
export interface UpdateProjectParams {
  name?: string;
  description?: string;
  type?: ProjectType;
  status?: ProjectStatus;
  color?: string;
  icon?: string;
  startDate?: number;
  endDate?: number;
  dueDate?: number;
  isArchived?: boolean;
  isFavorite?: boolean;
  order?: number;
}

// 项目查询参数
export interface ProjectQueryParams {
  type?: ProjectType;
  status?: ProjectStatus;
  isArchived?: boolean;
  isFavorite?: boolean;
  keyword?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'order';
  sortOrder?: 'asc' | 'desc';
}

// 项目列表结果
export interface ProjectListResult {
  projects: Project[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} 