import PluginInfoString from '@/../plugin.json'
import { getFile, putFile, readDir } from '@/api'
import { generatePrefixedSiyuanId, generateProjectId, generateTaskId, generateCategoryId, generateTagId } from './idGenerator'

export interface PersistShape {
  version: number
  projects: any[]
  tasks: any[]
  categories: any[]
  tags: any[]
  settings: Record<string, any>
  timerRecords: any[]
  habits: any[]
}

const DEFAULT_DATA: PersistShape = {
  version: 1,
  projects: [],
  tasks: [],
  categories: [],
  tags: [],
  settings: {},
  timerRecords: [],
  habits: [],
}

function getPluginName() {
  return (PluginInfoString as any)?.name || 'siyuan-plugin-taskmap'
}

function getDir() {
  return `/data/plugins/${getPluginName()}`
}

function getJsonPath() {
  return `${getDir()}/taskmap.json`
}

function toUint8Array(input: any): Uint8Array | null {
  try {
    if (!input) return null
    if (input instanceof Uint8Array) return input
    if (input instanceof ArrayBuffer) return new Uint8Array(input)
    if (typeof input === 'string') return new TextEncoder().encode(input)
    if (input.content && typeof input.content === 'string') return new TextEncoder().encode(input.content)
    if (input.data) return toUint8Array(input.data)
    return null
  } catch { return null }
}

async function ensureDir() {
  try { await readDir(getDir() as any) }
  catch {
    await putFile(getDir(), true, new File([], 'placeholder'))
  }
}

export class MemoryStore {
  private data: PersistShape = structuredClone(DEFAULT_DATA)
  private loaded = false

  async load() {
    if (this.loaded) return
    console.log('[MemoryStore] Loading from:', getJsonPath())
    await ensureDir()
    try {
      const file = await getFile(getJsonPath())
      console.log('[MemoryStore] getFile result:', file)
      let parsed: any = null
      if (file && typeof file === 'object' && (file.version || file.projects || file.tasks)) {
        parsed = file
      } else {
        const bytes = toUint8Array(file)
        console.log('[MemoryStore] decoded bytes length:', bytes?.length || 0)
        if (bytes && bytes.length) {
          const text = new TextDecoder().decode(bytes)
          console.log('[MemoryStore] decoded text length:', text.length)
          parsed = JSON.parse(text)
        }
      }
      if (parsed) {
        console.log('[MemoryStore] parsed data:', parsed)
        this.data = { ...DEFAULT_DATA, ...parsed }
        console.log('[MemoryStore] loaded projects:', this.data.projects.length, 'tasks:', this.data.tasks.length)
      } else {
        console.log('[MemoryStore] No data found, using defaults')
      }
    } catch (e) {
      console.error('[MemoryStore] Load error:', e)
    }
    this.loaded = true
  }

  async save() {
    console.log('[MemoryStore] Saving to:', getJsonPath())
    await ensureDir()
    const text = JSON.stringify(this.data)
    const blob = new Blob([text], { type: 'application/json' })
    await putFile(getJsonPath(), false, new File([blob], 'taskmap.json'))
    console.log('[MemoryStore] Saved projects:', this.data.projects.length, 'tasks:', this.data.tasks.length)
  }

  // Projects
  listProjects() { return this.data.projects }
  getProject(id: string) { return this.data.projects.find(p => p.id === id) || null }
  async createProject(p: any) { const item = { ...p, id: generateProjectId() }; this.data.projects.push(item); await this.save(); return item }
  async updateProject(id: string, patch: any) { const it = this.getProject(id); if (!it) return false; Object.assign(it, patch); await this.save(); return true }
  async deleteProject(id: string) { this.data.projects = this.data.projects.filter(p => p.id !== id); await this.save(); return true }

  // Tasks
  listTasks() { return this.data.tasks }
  getTask(id: string) { return this.data.tasks.find(t => t.id === id) || null }
  async createTask(t: any) { const item = { ...t, id: generateTaskId() }; this.data.tasks.push(item); await this.save(); return item }
  async updateTask(id: string, patch: any) { const it = this.getTask(id); if (!it) return false; Object.assign(it, patch); await this.save(); return true }
  async deleteTask(id: string) { this.data.tasks = this.data.tasks.filter(t => t.id !== id); await this.save(); return true }
  async deleteTasksByProject(projectId: string) { this.data.tasks = this.data.tasks.filter(t => t.projectId !== projectId); await this.save(); return true }

  // Categories
  listCategories() { return this.data.categories }
  async createCategory(c: any) { const item = { ...c, id: generateCategoryId() }; this.data.categories.push(item); await this.save(); return item }
  async updateCategory(id: string, patch: any) { const it = this.data.categories.find(c => c.id === id); if (!it) return false; Object.assign(it, patch); await this.save(); return true }
  async deleteCategory(id: string) { this.data.categories = this.data.categories.filter(c => c.id !== id); await this.save(); return true }

  // Tags
  listTags() { return this.data.tags }
  async createTag(t: any) { const item = { ...t, id: generateTagId() }; this.data.tags.push(item); await this.save(); return item }
  async updateTag(id: string, patch: any) { const it = this.data.tags.find(t => t.id === id); if (!it) return false; Object.assign(it, patch); await this.save(); return true }
  async deleteTag(id: string) { this.data.tags = this.data.tags.filter(t => t.id !== id); await this.save(); return true }

  // Settings
  getSetting(key: string) { return this.data.settings[key] }
  async setSetting(key: string, value: any) { this.data.settings[key] = value; await this.save(); return { key, value } }
  async deleteSetting(key: string) { delete this.data.settings[key]; await this.save(); return true }

  // Timer Records
  listTimerRecords() { return this.data.timerRecords }
  async createTimerRecord(r: any) { const item = { ...r, id: r.id || generatePrefixedSiyuanId('ttm') }; this.data.timerRecords.push(item); await this.save(); return item }
  async updateTimerRecord(id: string, patch: any) { const it = this.data.timerRecords.find(r => r.id === id); if (!it) return false; Object.assign(it, patch); await this.save(); return true }
  async deleteTimerRecord(id: string) { this.data.timerRecords = this.data.timerRecords.filter(r => r.id !== id); await this.save(); return true }
  async clearTimerRecords() { this.data.timerRecords = []; await this.save() }

  // Habits
  listHabits() { return this.data.habits }
  async createHabit(h: any) { const item = { ...h, id: generatePrefixedSiyuanId('habit') }; this.data.habits.push(item); await this.save(); return item }
  async updateHabit(id: string, patch: any) { const it = this.data.habits.find(h => h.id === id); if (!it) return false; Object.assign(it, patch); await this.save(); return true }
  async deleteHabit(id: string) { this.data.habits = this.data.habits.filter(h => h.id !== id); await this.save(); return true }
}

export const memoryStore = new MemoryStore()
