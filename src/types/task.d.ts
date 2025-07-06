// TaskFlow 任务数据结构
// 参考滴答清单设计

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',      // 待处理
  IN_PROGRESS = 'in_progress', // 进行中
  COMPLETED = 'completed',  // 已完成
  CANCELLED = 'cancelled'   // 已取消
}

// 任务数据结构
export interface Task {
  id: string;                    // 任务唯一ID
  name: string;                  // 任务名称
  description?: string;          // 任务描述
  projectId?: string;            // 所属项目ID
  parentId?: string;             // 父任务ID
  subTasks?: string[];           // 子任务ID数组
  status: TaskStatus;            // 任务状态
  dueDate?: number;              // 截止时间（时间戳）
  startDate?: number;            // 开始时间（时间戳）
  completedAt?: number;          // 完成时间（时间戳）
  referenceNote?: string[];      // 参考笔记（思源笔记块ID或文档ID）
  tags?: string[];               // 标签
  createdAt: number;             // 创建时间
  updatedAt: number;             // 更新时间
  isArchived: boolean;           // 是否归档
  isExpanded?: boolean;          // 是否展开子任务
  order: number;                 // 排序权重
  estimatedTime?: number;        // 预估时间（分钟）
  actualTime?: number;           // 实际耗时（分钟）
  notes?: string;                // 备注
}

// 任务创建参数
export interface CreateTaskParams {
  name: string;
  description?: string;
  projectId?: string;
  dueDate?: number;
  startDate?: number;
  referenceNote?: string[];
  tags?: string[];
  estimatedTime?: number;
  notes?: string;
}

// 任务更新参数
export interface UpdateTaskParams {
  name?: string;
  description?: string;
  projectId?: string;
  status?: TaskStatus;
  dueDate?: number;
  startDate?: number;
  completedAt?: number;
  referenceNote?: string[];
  tags?: string[];
  isArchived?: boolean;
  order?: number;
  estimatedTime?: number;
  actualTime?: number;
  notes?: string;
}

// 任务查询参数
export interface TaskQueryParams {
  projectId?: string;
  status?: TaskStatus;
  referenceNote?: string[];
  isArchived?: boolean;
  keyword?: string;
  dueDateRange?: {
    start: number;
    end: number;
  };
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'dueDate' | 'order';
  sortOrder?: 'asc' | 'desc';
}

// 任务列表结果
export interface TaskListResult {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} 