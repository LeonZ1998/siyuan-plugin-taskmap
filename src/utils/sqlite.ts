import initSqlJs from 'sql.js'
import PluginInfoString from '@/../plugin.json'
import { putFile } from '@/api'

export interface DBConfig {
  name: string;
  version: number;
  stores: StoreConfig[];
}

export interface StoreConfig {
  name: string;
  keyPath: string;
  indexes?: IndexConfig[];
}

export interface IndexConfig {
  name: string;
  keyPath: string;
  options?: any;
}

export interface QueryParams<T = any> {
  filter?: (item: T) => boolean;
  sort?: {
    key: keyof T;
    order: 'asc' | 'desc';
  };
  page?: number;
  pageSize?: number;
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode.apply(null, Array.from(chunk))
  }
  return btoa(binary)
}

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

// SQLite (sql.js) 管理类
export class SQLiteManager {
  private config: DBConfig
  private SQL: any | null = null
  private db: any | null = null
  private isInitialized = false
  private initPromise: Promise<void> | null = null
  private storageKey: string
  private saveTimer: number | null = null

  constructor(config: DBConfig) {
    this.config = config
    this.storageKey = `sqlite_${config.name}_v${config.version}`
    this.initDatabase()
  }

  private async initDatabase(): Promise<void> {
    if (this.initPromise) return this.initPromise

    this.initPromise = (async () => {
      this.SQL = await initSqlJs({
        locateFile: (file: string) => 'sql-wasm.wasm',
      })

      const persisted = typeof localStorage !== 'undefined' ? localStorage.getItem(this.storageKey) : null
      if (persisted) {
        this.db = new this.SQL.Database(decodeBase64(persisted))
      } else {
        this.db = new this.SQL.Database()
      }

      // 初始化表结构
      this.ensureSchema()
      this.isInitialized = true
    })()

    return this.initPromise
  }

  private ensureSchema() {
    for (const store of this.config.stores) {
      const columns = new Set<string>()
      // 主键列
      columns.add(store.keyPath)
      // 由索引声明的列
      for (const idx of store.indexes || []) {
        columns.add(idx.keyPath)
      }
      // 通用 data 列保存完整对象
      columns.add('data')

      const colsDef = Array.from(columns).map(col => col === 'data' ? 'data TEXT NOT NULL' : `${col} TEXT`).join(', ')
      const createTableSql = `CREATE TABLE IF NOT EXISTS ${store.name} (${store.keyPath} TEXT PRIMARY KEY, ${colsDef})`
      this.db.run(createTableSql)

      // 创建索引
      for (const idx of store.indexes || []) {
        const idxName = `${store.name}_${idx.name}_idx`
        this.db.run(`CREATE INDEX IF NOT EXISTS ${idxName} ON ${store.name}(${idx.keyPath})`)
      }
    }
  }

  private schedulePersist() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }
    this.saveTimer = setTimeout(() => {
      try {
        const binary = this.db.export()
        const base64 = encodeBase64(binary)
        if (typeof localStorage !== 'undefined') localStorage.setItem(this.storageKey, base64)

        // 同步保存到思源插件目录
        try {
          const pluginName = (PluginInfoString as any)?.name || 'siyuan-plugin-taskmap'
          const dbPath = `/data/plugins/${pluginName}/taskmap.sqlite`
          const blob = new Blob([binary], { type: 'application/octet-stream' })
          // 内核会自动创建父目录
          void putFile(dbPath, false, new File([blob], 'taskmap.sqlite'))
        } catch (e) {
          // 忽略思源文件系统不可用的情况（如纯浏览器环境）
        }
      } catch (e) {
        console.error('SQLite persist failed:', e)
      }
    }, 300) as unknown as number
  }

  async waitForDB(): Promise<any> {
    if (!this.isInitialized) {
      await this.initDatabase()
    }
    return this.db
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      name: this.config.name,
      version: this.config.version,
      engine: 'sql.js',
    }
  }

  close() {
    if (this.db) {
      this.schedulePersist()
    }
  }

  async create<T>(store: string, value: T & Record<string, any>): Promise<T> {
    await this.waitForDB()
    const table = store
    const json = JSON.stringify(value)
    const keys = Object.keys(value)
    const columns = ['data']
    const params = [json]

    // 映射声明的列
    const storeCfg = this.config.stores.find(s => s.name === store)
    const declaredCols = new Set<string>([storeCfg?.keyPath || '', ...(storeCfg?.indexes?.map(i => i.keyPath) || [])])
    for (const key of keys) {
      if (declaredCols.has(key)) {
        columns.push(key)
        params.push(String((value as any)[key]))
      }
    }

    const placeholders = columns.map(() => '?').join(', ')
    const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
    this.db.run(sql, params)
    this.schedulePersist()
    return value
  }

  async get<T>(store: string, id: string): Promise<T | null> {
    await this.waitForDB()
    const table = store
    const storeCfg = this.config.stores.find(s => s.name === store)
    const keyPath = storeCfg?.keyPath || 'id'
    const stmt = this.db.prepare(`SELECT data FROM ${table} WHERE ${keyPath} = ? LIMIT 1`)
    const row = stmt.getAsObject([id])
    stmt.free()
    if (!row || !row.data) return null
    return JSON.parse(row.data)
  }

  async getAll<T>(store: string): Promise<T[]> {
    await this.waitForDB()
    const table = store
    const stmt = this.db.prepare(`SELECT data FROM ${table}`)
    const result: T[] = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      result.push(JSON.parse((row as any).data))
    }
    stmt.free()
    return result
  }

  async query<T>(store: string, params?: QueryParams<T>): Promise<QueryResult<T>> {
    const all = await this.getAll<T>(store)
    let data = all
    if (params?.filter) data = data.filter(params.filter)
    if (params?.sort) {
      const { key, order } = params.sort
      data = data.sort((a: any, b: any) => {
        const av = a[key]
        const bv = b[key]
        if (av === bv) return 0
        return (av > bv ? 1 : -1) * (order === 'asc' ? 1 : -1)
      })
    }
    const page = params?.page || 1
    const pageSize = params?.pageSize || data.length || 1
    const start = (page - 1) * pageSize
    const paged = data.slice(start, start + pageSize)
    const total = data.length
    return { data: paged, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }

  async queryByIndex<T>(store: string, indexName: string, value: any): Promise<T[]> {
    await this.waitForDB()
    const table = store
    const stmt = this.db.prepare(`SELECT data FROM ${table} WHERE ${indexName} = ?`)
    const result: T[] = []
    stmt.bind([String(value)])
    while (stmt.step()) {
      const row = stmt.getAsObject()
      result.push(JSON.parse((row as any).data))
    }
    stmt.free()
    return result
  }

  async queryByIndexRange<T>(store: string, indexName: string, range: { lower?: string; upper?: string; lowerOpen?: boolean; upperOpen?: boolean } | any): Promise<T[]> {
    await this.waitForDB()
    const table = store

    // 兼容 IDBKeyRange
    const lower = range?.lower !== undefined ? range.lower : (typeof range.bound === 'function' ? range.lower : undefined)
    const upper = range?.upper !== undefined ? range.upper : (typeof range.bound === 'function' ? range.upper : undefined)
    const conditions: string[] = []
    const params: any[] = []
    if (lower !== undefined) { conditions.push(`${indexName} >= ?`); params.push(String(lower)) }
    if (upper !== undefined) { conditions.push(`${indexName} <= ?`); params.push(String(upper)) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const stmt = this.db.prepare(`SELECT data FROM ${table} ${where}`)
    const result: T[] = []
    stmt.bind(params)
    while (stmt.step()) {
      const row = stmt.getAsObject()
      result.push(JSON.parse((row as any).data))
    }
    stmt.free()
    return result
  }

  async update<T>(store: string, id: string, data: Partial<T>): Promise<boolean> {
    const current = await this.get<any>(store, id)
    if (!current) return false
    const next = { ...current, ...data }
    await this.create(store, next)
    return true
  }

  async delete(store: string, id: string): Promise<boolean> {
    await this.waitForDB()
    const table = store
    const storeCfg = this.config.stores.find(s => s.name === store)
    const keyPath = storeCfg?.keyPath || 'id'
    this.db.run(`DELETE FROM ${table} WHERE ${keyPath} = ?`, [id])
    this.schedulePersist()
    return true
  }

  async deleteMany(store: string, ids: string[]): Promise<boolean> {
    await this.waitForDB()
    if (!ids.length) return true
    const table = store
    const storeCfg = this.config.stores.find(s => s.name === store)
    const keyPath = storeCfg?.keyPath || 'id'
    const placeholders = ids.map(() => '?').join(',')
    this.db.run(`DELETE FROM ${table} WHERE ${keyPath} IN (${placeholders})`, ids)
    this.schedulePersist()
    return true
  }

  async clear(store: string): Promise<void> {
    await this.waitForDB()
    this.db.run(`DELETE FROM ${store}`)
    this.schedulePersist()
  }

  async exportData(store: string): Promise<string> {
    const all = await this.getAll<any>(store)
    return JSON.stringify(all)
  }

  async importData(store: string, data: string): Promise<boolean> {
    try {
      const list = JSON.parse(data)
      for (const item of list) {
        await this.create(store, item)
      }
      return true
    } catch (e) {
      console.error('SQLite importData failed:', e)
      return false
    }
  }

  async count(store: string): Promise<number> {
    await this.waitForDB()
    const stmt = this.db.prepare(`SELECT COUNT(1) as c FROM ${store}`)
    const row = stmt.getAsObject()
    stmt.free()
    return Number((row as any).c || 0)
  }
} 