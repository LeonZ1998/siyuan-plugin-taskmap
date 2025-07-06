// 数据库管理器实例
// 配置各种数据结构的存储和索引

import { IndexedDBManager, DBConfig } from './indexedDB';
import type { Project } from '../types/project';
import { 
  generateProjectId, 
  generateTaskId, 
  generateCategoryId, 
  generateTagId, 
  generateSettingId 
} from './idGenerator';

// 数据库配置
const dbConfig: DBConfig = {
  name: 'TaskFlowDB',
  version: 1,
  stores: [
    {
      name: 'projects',
      keyPath: 'id',
      indexes: [
        { name: 'status', keyPath: 'status' },
        { name: 'priority', keyPath: 'priority' },
        { name: 'startDate', keyPath: 'startDate' },
        { name: 'dueDate', keyPath: 'dueDate' },
        { name: 'category', keyPath: 'category' }
      ]
    },
    {
      name: 'tasks',
      keyPath: 'id',
      indexes: [
        { name: 'projectId', keyPath: 'projectId' },
        { name: 'parentId', keyPath: 'parentId' },
        { name: 'status', keyPath: 'status' },
        { name: 'priority', keyPath: 'priority' },
        { name: 'dueDate', keyPath: 'dueDate' },
        { name: 'referenceNote', keyPath: 'referenceNote' }
      ]
    },
    {
      name: 'categories',
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'name' },
        { name: 'type', keyPath: 'type' }
      ]
    },
    {
      name: 'tags',
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'name' },
        { name: 'color', keyPath: 'color' }
      ]
    },
    {
      name: 'settings',
      keyPath: 'key',
      indexes: [
        { name: 'category', keyPath: 'category' }
      ]
    }
  ]
};

// 创建数据库管理器实例
export const dbManager = new IndexedDBManager(dbConfig);

// 项目相关操作
export const projectDB = {
  // 创建项目
  async create(project: Omit<Project, 'id'>): Promise<Project> {
    const projectWithId = {
      ...project,
      id: generateProjectId()
    };
    return dbManager.create('projects', projectWithId);
  },

  // 获取项目
  async get(id: string): Promise<Project | null> {
    return dbManager.get<Project>('projects', id);
  },

  // 获取所有项目
  async getAll(): Promise<Project[]> {
    return dbManager.getAll<Project>('projects');
  },

  // 查询项目
  async query(params?: any): Promise<any> {
    return dbManager.query<Project>('projects', params);
  },

  // 更新项目
  async update(id: string, data: Partial<Project>): Promise<boolean> {
    return dbManager.update('projects', id, data);
  },

  // 删除项目
  async delete(id: string): Promise<boolean> {
    return dbManager.delete('projects', id);
  },

  // 根据状态查询项目
  async getByStatus(status: string): Promise<Project[]> {
    return dbManager.queryByIndex<Project>('projects', 'status', status);
  },

  // 根据优先级查询项目
  async getByPriority(priority: string): Promise<Project[]> {
    return dbManager.queryByIndex<Project>('projects', 'priority', priority);
  },

  // 根据分类查询项目
  async getByCategory(category: string): Promise<Project[]> {
    return dbManager.queryByIndex<Project>('projects', 'category', category);
  },

  // 获取即将到期的项目
  async getUpcoming(): Promise<Project[]> {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return dbManager.queryByIndexRange<Project>(
      'projects',
      'dueDate',
      IDBKeyRange.bound(now.toISOString(), thirtyDaysLater.toISOString())
    );
  },

  // 获取过期项目
  async getOverdue(): Promise<Project[]> {
    const now = new Date();
    
    return dbManager.queryByIndexRange<Project>(
      'projects',
      'dueDate',
      IDBKeyRange.upperBound(now.toISOString())
    );
  },

  // 导出项目数据
  async export(): Promise<string> {
    return dbManager.exportData('projects');
  },

  // 导入项目数据
  async import(data: string): Promise<boolean> {
    return dbManager.importData('projects', data);
  }
};

// 任务相关操作
export const taskDB = {
  // 创建任务
  async create(task: any): Promise<any> {
    const taskWithId = {
      ...task,
      id: generateTaskId()
    };
    return dbManager.create('tasks', taskWithId);
  },

  // 获取任务
  async get(id: string): Promise<any> {
    return dbManager.get('tasks', id);
  },

  // 获取所有任务
  async getAll(): Promise<any[]> {
    return dbManager.getAll('tasks');
  },

  // 根据项目ID获取任务
  async getByProject(projectId: string): Promise<any[]> {
    return dbManager.queryByIndex('tasks', 'projectId', projectId);
  },

  // 根据父任务ID获取子任务
  async getByParentId(parentId: string): Promise<any[]> {
    return dbManager.queryByIndex('tasks', 'parentId', parentId);
  },

  // 根据状态获取任务
  async getByStatus(status: string): Promise<any[]> {
    return dbManager.queryByIndex('tasks', 'status', status);
  },

  // 根据参考笔记获取任务
  async getByReferenceNote(referenceNote: string[]): Promise<any[]> {
    return dbManager.queryByIndex('tasks', 'referenceNote', referenceNote);
  },

  // 更新任务
  async update(id: string, data: any): Promise<boolean> {
    return dbManager.update('tasks', id, data);
  },

  // 删除任务
  async delete(id: string): Promise<boolean> {
    return dbManager.delete('tasks', id);
  },

  // 批量删除项目相关任务
  async deleteByProject(projectId: string): Promise<boolean> {
    const tasks = await this.getByProject(projectId);
    const taskIds = tasks.map(task => task.id);
    return dbManager.deleteMany('tasks', taskIds);
  }
};

// 分类相关操作
export const categoryDB = {
  // 创建分类
  async create(category: any): Promise<any> {
    const categoryWithId = {
      ...category,
      id: generateCategoryId()
    };
    return dbManager.create('categories', categoryWithId);
  },

  // 获取所有分类
  async getAll(): Promise<any[]> {
    return dbManager.getAll('categories');
  },

  // 根据类型获取分类
  async getByType(type: string): Promise<any[]> {
    return dbManager.queryByIndex('categories', 'type', type);
  },

  // 更新分类
  async update(id: string, data: any): Promise<boolean> {
    return dbManager.update('categories', id, data);
  },

  // 删除分类
  async delete(id: string): Promise<boolean> {
    return dbManager.delete('categories', id);
  }
};

// 标签相关操作
export const tagDB = {
  // 创建标签
  async create(tag: any): Promise<any> {
    const tagWithId = {
      ...tag,
      id: generateTagId()
    };
    return dbManager.create('tags', tagWithId);
  },

  // 获取所有标签
  async getAll(): Promise<any[]> {
    return dbManager.getAll('tags');
  },

  // 根据颜色获取标签
  async getByColor(color: string): Promise<any[]> {
    return dbManager.queryByIndex('tags', 'color', color);
  },

  // 更新标签
  async update(id: string, data: any): Promise<boolean> {
    return dbManager.update('tags', id, data);
  },

  // 删除标签
  async delete(id: string): Promise<boolean> {
    return dbManager.delete('tags', id);
  }
};

// 设置相关操作
export const settingsDB = {
  // 设置配置
  async set(key: string, value: any): Promise<any> {
    const db = await dbManager.waitForDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });

      request.onsuccess = () => {
        console.log(`设置配置成功: ${key}`);
        resolve({ key, value });
      };

      request.onerror = () => {
        console.error(`设置配置失败:`, request.error);
        reject(request.error);
      };
    });
  },

  // 获取配置
  async get(key: string): Promise<any> {
    const db = await dbManager.waitForDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error(`获取配置失败:`, request.error);
        reject(request.error);
      };
    });
  },

  // 更新配置
  async update(key: string, value: any): Promise<boolean> {
    const db = await dbManager.waitForDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });

      request.onsuccess = () => {
        console.log(`更新配置成功: ${key}`);
        resolve(true);
      };

      request.onerror = () => {
        console.error(`更新配置失败:`, request.error);
        reject(request.error);
      };
    });
  },

  // 删除配置
  async delete(key: string): Promise<boolean> {
    const db = await dbManager.waitForDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.delete(key);

      request.onsuccess = () => {
        console.log(`删除配置成功: ${key}`);
        resolve(true);
      };

      request.onerror = () => {
        console.error(`删除配置失败:`, request.error);
        reject(request.error);
      };
    });
  },

  // 获取所有配置
  async getAll(): Promise<any[]> {
    return dbManager.getAll('settings');
  },

  // 根据分类获取配置
  async getByCategory(category: string): Promise<any[]> {
    return dbManager.queryByIndex('settings', 'category', category);
  }
};

// 数据库工具函数
export const dbUtils = {
  // 获取数据库状态
  getStatus() {
    return dbManager.getStatus();
  },

  // 关闭数据库连接
  close() {
    dbManager.close();
  },

  // 清空所有数据
  async clearAll() {
    await dbManager.clear('projects');
    await dbManager.clear('tasks');
    await dbManager.clear('categories');
    await dbManager.clear('tags');
    await dbManager.clear('settings');
  },

  // 导出所有数据
  async exportAll() {
    const projects = await dbManager.exportData('projects');
    const tasks = await dbManager.exportData('tasks');
    const categories = await dbManager.exportData('categories');
    const tags = await dbManager.exportData('tags');
    const settings = await dbManager.exportData('settings');

    return {
      projects,
      tasks,
      categories,
      tags,
      settings,
      exportTime: new Date().toISOString()
    };
  },

  // 导入所有数据
  async importAll(data: any) {
    const results = {
      projects: false,
      tasks: false,
      categories: false,
      tags: false,
      settings: false
    };

    if (data.projects) {
      results.projects = await dbManager.importData('projects', data.projects);
    }
    if (data.tasks) {
      results.tasks = await dbManager.importData('tasks', data.tasks);
    }
    if (data.categories) {
      results.categories = await dbManager.importData('categories', data.categories);
    }
    if (data.tags) {
      results.tags = await dbManager.importData('tags', data.tags);
    }
    if (data.settings) {
      results.settings = await dbManager.importData('settings', data.settings);
    }

    return results;
  },

  // 获取统计信息
  async getStats() {
    const projectCount = await dbManager.count('projects');
    const taskCount = await dbManager.count('tasks');
    const categoryCount = await dbManager.count('categories');
    const tagCount = await dbManager.count('tags');
    const settingCount = await dbManager.count('settings');

    return {
      projects: projectCount,
      tasks: taskCount,
      categories: categoryCount,
      tags: tagCount,
      settings: settingCount,
      total: projectCount + taskCount + categoryCount + tagCount + settingCount
    };
  }
};

// 默认导出
export default {
  dbManager,
  projectDB,
  taskDB,
  categoryDB,
  tagDB,
  settingsDB,
  dbUtils
}; 