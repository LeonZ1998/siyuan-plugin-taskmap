import { memoryStore } from './storage'

export const dbManager = undefined as any

export const projectDB = {
  async create(project: any) { await memoryStore.load(); return memoryStore.createProject(project) },
  async get(id: string) { await memoryStore.load(); return memoryStore.getProject(id) },
  async getAll() { await memoryStore.load(); return memoryStore.listProjects() },
  async update(id: string, data: any) { await memoryStore.load(); return memoryStore.updateProject(id, data) },
  async delete(id: string) { await memoryStore.load(); const ok = await memoryStore.deleteProject(id); await memoryStore.deleteTasksByProject(id); return ok },
}

export const taskDB = {
  async create(task: any) { await memoryStore.load(); return memoryStore.createTask(task) },
  async get(id: string) { await memoryStore.load(); return memoryStore.getTask(id) },
  async getAll() { await memoryStore.load(); return memoryStore.listTasks() },
  async getByProject(projectId: string) { await memoryStore.load(); return memoryStore.listTasks().filter(t => t.projectId === projectId) },
  async update(id: string, data: any) { await memoryStore.load(); return memoryStore.updateTask(id, data) },
  async delete(id: string) { await memoryStore.load(); return memoryStore.deleteTask(id) },
}

export const categoryDB = {
  async create(c: any) { await memoryStore.load(); return memoryStore.createCategory(c) },
  async getAll() { await memoryStore.load(); return memoryStore.listCategories() },
  async update(id: string, data: any) { await memoryStore.load(); return memoryStore.updateCategory(id, data) },
  async delete(id: string) { await memoryStore.load(); return memoryStore.deleteCategory(id) },
}

export const tagDB = {
  async create(t: any) { await memoryStore.load(); return memoryStore.createTag(t) },
  async getAll() { await memoryStore.load(); return memoryStore.listTags() },
  async update(id: string, data: any) { await memoryStore.load(); return memoryStore.updateTag(id, data) },
  async delete(id: string) { await memoryStore.load(); return memoryStore.deleteTag(id) },
}

export const settingsDB = {
  async set(key: string, value: any) { await memoryStore.load(); return memoryStore.setSetting(key, value) },
  async get(key: string) { await memoryStore.load(); return memoryStore.getSetting(key) },
  async update(key: string, value: any) { await memoryStore.load(); return memoryStore.setSetting(key, value) },
  async delete(key: string) { await memoryStore.load(); return memoryStore.deleteSetting(key) },
  async getAll() { await memoryStore.load(); const s = (await memoryStore as any); return Object.entries((s as any).data?.settings || {}) },
}

export const timerRecordDB = {
  async create(r: any) { await memoryStore.load(); return memoryStore.createTimerRecord(r) },
  async get(id: string) { await memoryStore.load(); return memoryStore.listTimerRecords().find(r => r.id === id) || null },
  async getAll() { await memoryStore.load(); return memoryStore.listTimerRecords() },
  async update(id: string, data: any) { await memoryStore.load(); return memoryStore.updateTimerRecord(id, data) },
  async delete(id: string) { await memoryStore.load(); return memoryStore.deleteTimerRecord(id) },
  async clear() { await memoryStore.load(); return memoryStore.clearTimerRecords() },
}

export const habitDB = {
  async create(h: any) { await memoryStore.load(); return memoryStore.createHabit(h) },
  async get(id: string) { await memoryStore.load(); return memoryStore.listHabits().find(h => h.id === id) || null },
  async getAll() { await memoryStore.load(); return memoryStore.listHabits() },
  async update(id: string, data: any) { await memoryStore.load(); return memoryStore.updateHabit(id, data) },
  async delete(id: string) { await memoryStore.load(); return memoryStore.deleteHabit(id) },
}

export const dbUtils = {
  async getStatus() { await memoryStore.load(); return { initialized: true, storage: 'json' } },
  async save() { await memoryStore.load(); await memoryStore.save(); return true },
  close() { /* no-op for memory */ },
}

export default {
  dbManager,
  projectDB,
  taskDB,
  categoryDB,
  tagDB,
  settingsDB,
  dbUtils,
} 