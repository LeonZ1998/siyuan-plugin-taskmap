// IndexedDB 管理器使用示例
// 展示如何使用通用的 IndexedDB 管理器进行各种操作

import { 
  dbManager, 
  projectDB, 
  taskDB, 
  categoryDB, 
  tagDB, 
  settingsDB, 
  dbUtils 
} from './dbManager';
import type { Project } from '../types/project';
import { ProjectType, ProjectStatus } from '../types/project.d';
import { 
  generateSiyuanId, 
  generateProjectId, 
  generateTaskId,
  isValidSiyuanId,
  extractTimestampFromId,
  generateBatchSiyuanIds
} from './idGenerator';

// 示例：项目操作
export async function projectExamples() {
  console.log('=== 项目操作示例 ===');

  // 1. 创建项目
  const newProject = await projectDB.create({
    name: '新项目',
    description: '这是一个新项目',
    type: ProjectType.LEARNING_GROWTH,
    status: ProjectStatus.ACTIVE,
    color: '#1976d2',
    startDate: Date.now(),
    dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isArchived: false,
    order: 1,
    taskCount: 0,
    completedTaskCount: 0,
    completionRate: 0
  });
  console.log('创建项目成功:', newProject);
  console.log('项目ID格式:', newProject.id); // 例如：prj-20241201123456-abc1234

  // 2. 获取所有项目
  const allProjects = await projectDB.getAll();
  console.log('所有项目:', allProjects);

  // 3. 根据状态查询项目
  const activeProjects = await projectDB.getByStatus(ProjectStatus.ACTIVE.toString());
  console.log('活跃项目:', activeProjects);

  // 4. 更新项目
  const updated = await projectDB.update(newProject.id, {
    name: '更新后的项目名称',
    updatedAt: Date.now()
  });
  console.log('更新项目:', updated);

  // 5. 获取即将到期的项目
  const upcomingProjects = await projectDB.getUpcoming();
  console.log('即将到期的项目:', upcomingProjects);
}

// 示例：任务操作
export async function taskExamples() {
  console.log('=== 任务操作示例 ===');

  // 1. 创建任务
  const newTask = await taskDB.create({
    name: '新任务',
    description: '这是一个新任务',
    projectId: 'project-1',
    status: 'pending',
    priority: 'medium',
    dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    referenceNote: ['20241201123456-abc1234', '20241201123456-def5678'], // 思源笔记块ID数组
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  console.log('创建任务成功:', newTask);

  // 2. 根据项目ID获取任务
  const projectTasks = await taskDB.getByProject('project-1');
  console.log('项目任务:', projectTasks);

  // 3. 根据状态获取任务
  const pendingTasks = await taskDB.getByStatus('pending');
  console.log('待处理任务:', pendingTasks);
}

// 示例：分类操作
export async function categoryExamples() {
  console.log('=== 分类操作示例 ===');

  // 1. 创建分类
  const newCategory = await categoryDB.create({
    name: '工作',
    type: 'project',
    color: '#1976d2',
    createdAt: Date.now()
  });
  console.log('创建分类成功:', newCategory);

  // 2. 根据类型获取分类
  const projectCategories = await categoryDB.getByType('project');
  console.log('项目分类:', projectCategories);
}

// 示例：标签操作
export async function tagExamples() {
  console.log('=== 标签操作示例 ===');

  // 1. 创建标签
  const newTag = await tagDB.create({
    name: '重要',
    color: '#f44336',
    createdAt: Date.now()
  });
  console.log('创建标签成功:', newTag);

  // 2. 根据颜色获取标签
  const redTags = await tagDB.getByColor('#f44336');
  console.log('红色标签:', redTags);
}

// 示例：设置操作
export async function settingsExamples() {
  console.log('=== 设置操作示例 ===');

  // 1. 设置配置
  await settingsDB.set('theme', 'dark');
  await settingsDB.set('language', 'zh-CN');
  await settingsDB.set('autoSave', true);

  // 2. 获取配置
  const theme = await settingsDB.get('theme');
  const language = await settingsDB.get('language');
  const autoSave = await settingsDB.get('autoSave');
  console.log('配置:', { theme, language, autoSave });

  // 3. 更新配置
  await settingsDB.update('theme', 'light');
  const updatedTheme = await settingsDB.get('theme');
  console.log('更新后的主题:', updatedTheme);
}

// 示例：高级查询
export async function advancedQueryExamples() {
  console.log('=== 高级查询示例 ===');

  // 1. 分页查询
  const paginatedProjects = await projectDB.query({
    page: 1,
    pageSize: 10,
    sort: { key: 'createdAt', order: 'desc' },
    filter: (project: Project) => project.status === ProjectStatus.ACTIVE // 只查询活跃项目
  });
  console.log('分页查询结果:', paginatedProjects);

  // 2. 复杂过滤
  const filteredProjects = await projectDB.query({
    filter: (project: Project) => 
      project.status === ProjectStatus.ACTIVE && 
      project.completionRate < 50 &&
      project.dueDate > Date.now()
  });
  console.log('复杂过滤结果:', filteredProjects);
}

// 示例：数据导入导出
export async function importExportExamples() {
  console.log('=== 数据导入导出示例 ===');

  // 1. 导出项目数据
  const exportedData = await projectDB.export();
  console.log('导出的项目数据:', exportedData);

  // 2. 导出所有数据
  const allData = await dbUtils.exportAll();
  console.log('导出的所有数据:', allData);

  // 3. 获取统计信息
  const stats = await dbUtils.getStats();
  console.log('数据库统计:', stats);
}

// 示例：数据库管理
export async function databaseManagementExamples() {
  console.log('=== 数据库管理示例 ===');

  // 1. 获取数据库状态
  const status = dbUtils.getStatus();
  console.log('数据库状态:', status);

  // 2. 清空所有数据
  // await dbUtils.clearAll(); // 谨慎使用！

  // 3. 关闭数据库连接
  // dbUtils.close(); // 在应用退出时调用
}

// 示例：错误处理
export async function errorHandlingExamples() {
  console.log('=== 错误处理示例 ===');

  try {
    // 尝试获取不存在的项目
    const project = await projectDB.get('non-existent-id');
    console.log('不存在的项目:', project); // 应该返回 null

    // 尝试删除不存在的项目
    const deleted = await projectDB.delete('non-existent-id');
    console.log('删除不存在的项目:', deleted); // 应该返回 false

  } catch (error) {
    console.error('操作失败:', error);
  }
}

// 运行所有示例
export async function runAllExamples() {
  try {
    // ID生成器示例（同步）
    idGeneratorExamples();
    
    // 数据库操作示例（异步）
    await projectExamples();
    await taskExamples();
    await categoryExamples();
    await tagExamples();
    await settingsExamples();
    await advancedQueryExamples();
    await importExportExamples();
    await databaseManagementExamples();
    await errorHandlingExamples();
    
    console.log('=== 所有示例运行完成 ===');
  } catch (error) {
    console.error('示例运行失败:', error);
  }
}

// ID生成器示例
export function idGeneratorExamples() {
  console.log('=== ID生成器示例 ===');

  // 1. 生成基础思源笔记格式ID
  const basicId = generateSiyuanId();
  console.log('基础ID:', basicId); // 例如：20241201123456-abc1234

  // 2. 生成带前缀的ID
  const projectId = generateProjectId();
  const taskId = generateTaskId();
  console.log('项目ID:', projectId); // 例如：prj-20241201123456-abc1234
  console.log('任务ID:', taskId); // 例如：tsk-20241201123456-def5678

  // 3. 验证ID格式
  console.log('基础ID是否有效:', isValidSiyuanId(basicId)); // true
  console.log('项目ID是否有效:', isValidSiyuanId(projectId)); // false（因为带前缀）

  // 4. 从ID提取时间戳
  const timestamp = extractTimestampFromId(basicId);
  console.log('ID创建时间:', timestamp);

  // 5. 批量生成ID
  const batchIds = generateBatchSiyuanIds(5);
  console.log('批量生成的ID:', batchIds);
}

// 性能测试示例
export async function performanceTest() {
  console.log('=== 性能测试 ===');

  const startTime = Date.now();

  // 批量创建项目
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(projectDB.create({
      name: `性能测试项目 ${i}`,
      description: `这是第 ${i} 个性能测试项目`,
      type: ProjectType.LEARNING_GROWTH,
      status: ProjectStatus.ACTIVE,
      color: '#1976d2',
      startDate: Date.now(),
      dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isArchived: false,
      order: i,
      taskCount: 0,
      completedTaskCount: 0,
      completionRate: 0
    }));
  }

  await Promise.all(promises);
  const endTime = Date.now();
  console.log(`批量创建 100 个项目耗时: ${endTime - startTime}ms`);

  // 查询性能测试
  const queryStartTime = Date.now();
  const allProjects = await projectDB.getAll();
  const queryEndTime = Date.now();
  console.log(`查询 ${allProjects.length} 个项目耗时: ${queryEndTime - queryStartTime}ms`);
}

// 导出示例函数
export default {
  projectExamples,
  taskExamples,
  categoryExamples,
  tagExamples,
  settingsExamples,
  advancedQueryExamples,
  importExportExamples,
  databaseManagementExamples,
  errorHandlingExamples,
  idGeneratorExamples,
  runAllExamples,
  performanceTest
}; 

export function buildTaskTree(flatTasks: any[]) {
  const idMap: Record<string, any> = {}
  flatTasks.forEach(t => { idMap[t.id] = { ...t, subTasks: [] } })
  const tree: any[] = []
  flatTasks.forEach(t => {
    if (t.parentId && idMap[t.parentId]) {
      idMap[t.parentId].subTasks.push(idMap[t.id])
    } else {
      tree.push(idMap[t.id])
    }
  })
  return tree
} 