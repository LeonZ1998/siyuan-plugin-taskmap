// 通用 IndexedDB 操作脚本
// 参考 siyuan-plugin-keepass 项目设计

import { generateSiyuanId } from './idGenerator';

// 数据库配置接口
export interface DBConfig {
  name: string;
  version: number;
  stores: StoreConfig[];
}

// 存储配置接口
export interface StoreConfig {
  name: string;
  keyPath: string;
  indexes?: IndexConfig[];
}

// 索引配置接口
export interface IndexConfig {
  name: string;
  keyPath: string;
  options?: IDBIndexParameters;
}

// 查询参数接口
export interface QueryParams<T = any> {
  filter?: (item: T) => boolean;
  sort?: {
    key: keyof T;
    order: 'asc' | 'desc';
  };
  page?: number;
  pageSize?: number;
}

// 查询结果接口
export interface QueryResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 通用 IndexedDB 管理类
export class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private config: DBConfig;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(config: DBConfig) {
    this.config = config;
    this.initDatabase();
  }

  // 初始化数据库
  private async initDatabase(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version);

      request.onerror = () => {
        console.error(`IndexedDB ${this.config.name} 打开失败:`, request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log(`IndexedDB ${this.config.name} 初始化成功`);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建存储和索引
        this.config.stores.forEach(storeConfig => {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, { 
              keyPath: storeConfig.keyPath 
            });
            
            // 创建索引
            if (storeConfig.indexes) {
              storeConfig.indexes.forEach(indexConfig => {
                store.createIndex(
                  indexConfig.name, 
                  indexConfig.keyPath, 
                  indexConfig.options || { unique: false }
                );
              });
            }
            
            console.log(`创建存储: ${storeConfig.name}`);
          }
        });
      };
    });

    return this.initPromise;
  }

  // 等待数据库初始化完成
  async waitForDB(): Promise<IDBDatabase> {
    if (!this.isInitialized) {
      await this.initDatabase();
    }
    
    if (!this.db) {
      throw new Error('数据库未初始化');
    }
    
    return this.db;
  }

  // 生成唯一ID - 使用思源笔记格式：YYYYMMDDHHMMSS-随机字符串
  private generateId(): string {
    return generateSiyuanId();
  }

  // 通用创建方法
  async create<T extends { id?: string }>(
    storeName: string, 
    data: Omit<T, 'id'> & { id?: string }
  ): Promise<T> {
    const db = await this.waitForDB();
    
    // 如果没有ID，自动生成
    if (!data.id) {
      (data as any).id = this.generateId();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => {
        console.log(`创建 ${storeName} 成功:`, (data as any).id);
        resolve(data as T);
      };

      request.onerror = () => {
        console.error(`创建 ${storeName} 失败:`, request.error);
        reject(request.error);
      };
    });
  }

  // 通用获取单个方法
  async get<T>(storeName: string, id: string): Promise<T | null> {
    const db = await this.waitForDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error(`获取 ${storeName} 失败:`, request.error);
        reject(request.error);
      };
    });
  }

  // 通用获取所有方法
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.waitForDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error(`获取所有 ${storeName} 失败:`, request.error);
        reject(request.error);
      };
    });
  }

  // 通用查询方法
  async query<T>(
    storeName: string, 
    params: QueryParams<T> = {}
  ): Promise<QueryResult<T>> {
    const allData = await this.getAll<T>(storeName);
    let filteredData = [...allData];

    // 应用过滤条件
    if (params.filter) {
      filteredData = filteredData.filter(params.filter);
    }

    // 应用排序
    if (params.sort) {
      filteredData.sort((a, b) => {
        const aValue = a[params.sort!.key];
        const bValue = b[params.sort!.key];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return params.sort!.order === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return params.sort!.order === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
    }

    // 应用分页
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filteredData.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredData.length / pageSize)
    };
  }

  // 通用更新方法
  async update<T extends { id: string }>(
    storeName: string, 
    id: string, 
    data: Partial<T>
  ): Promise<boolean> {
    const db = await this.waitForDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingData = getRequest.result;
        if (!existingData) {
          resolve(false);
          return;
        }

        const updatedData = { ...existingData, ...data };
        const putRequest = store.put(updatedData);

        putRequest.onsuccess = () => {
          console.log(`更新 ${storeName} 成功:`, id);
          resolve(true);
        };

        putRequest.onerror = () => {
          console.error(`更新 ${storeName} 失败:`, putRequest.error);
          reject(putRequest.error);
        };
      };

      getRequest.onerror = () => {
        console.error(`获取 ${storeName} 失败:`, getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  // 通用删除方法
  async delete(storeName: string, id: string): Promise<boolean> {
    const db = await this.waitForDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`删除 ${storeName} 成功:`, id);
        resolve(true);
      };

      request.onerror = () => {
        console.error(`删除 ${storeName} 失败:`, request.error);
        reject(request.error);
      };
    });
  }

  // 通用批量删除方法
  async deleteMany(storeName: string, ids: string[]): Promise<boolean> {
    const db = await this.waitForDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      let completed = 0;
      let success = true;

      ids.forEach(id => {
        const request = store.delete(id);
        
        request.onsuccess = () => {
          completed++;
          if (completed === ids.length) {
            console.log(`批量删除 ${storeName} 成功:`, ids.length);
            resolve(success);
          }
        };

        request.onerror = () => {
          success = false;
          completed++;
          console.error(`删除 ${storeName} 失败:`, request.error);
          if (completed === ids.length) {
            resolve(success);
          }
        };
      });
    });
  }

  // 通用清空存储方法
  async clear(storeName: string): Promise<void> {
    const db = await this.waitForDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log(`清空 ${storeName} 成功`);
        resolve();
      };

      request.onerror = () => {
        console.error(`清空 ${storeName} 失败:`, request.error);
        reject(request.error);
      };
    });
  }

  // 通用计数方法
  async count(storeName: string): Promise<number> {
    const db = await this.waitForDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`获取 ${storeName} 数量失败:`, request.error);
        reject(request.error);
      };
    });
  }

  // 使用索引查询
  async queryByIndex<T>(
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T[]> {
    const db = await this.waitForDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error(`索引查询 ${storeName}.${indexName} 失败:`, request.error);
        reject(request.error);
      };
    });
  }

  // 使用索引范围查询
  async queryByIndexRange<T>(
    storeName: string,
    indexName: string,
    range: IDBKeyRange
  ): Promise<T[]> {
    const db = await this.waitForDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(range);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error(`索引范围查询 ${storeName}.${indexName} 失败:`, request.error);
        reject(request.error);
      };
    });
  }

  // 导出数据
  async exportData(storeName: string): Promise<string> {
    const data = await this.getAll(storeName);
    return JSON.stringify(data, null, 2);
  }

  // 导入数据
  async importData(storeName: string, data: string): Promise<boolean> {
    try {
      const importedData = JSON.parse(data);
      if (!Array.isArray(importedData)) {
        return false;
      }

      const db = await this.waitForDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // 先清空现有数据
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          let completed = 0;
          let success = true;

          importedData.forEach(item => {
            const addRequest = store.add(item);
            
            addRequest.onsuccess = () => {
              completed++;
              if (completed === importedData.length) {
                console.log(`成功导入 ${importedData.length} 条数据到 ${storeName}`);
                resolve(success);
              }
            };

            addRequest.onerror = () => {
              success = false;
              completed++;
              console.error('导入数据失败:', addRequest.error);
              if (completed === importedData.length) {
                resolve(success);
              }
            };
          });
        };

        clearRequest.onerror = () => {
          console.error('清空数据失败:', clearRequest.error);
          reject(clearRequest.error);
        };
      });
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }

  // 关闭数据库连接
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
      console.log(`IndexedDB ${this.config.name} 连接已关闭`);
    }
  }

  // 获取数据库状态
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      dbName: this.config.name,
      dbVersion: this.config.version,
      stores: this.config.stores.map(s => s.name)
    };
  }
} 