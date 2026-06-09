import type { Space, Folder, Document, Block, DocumentVersion } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const mockSpaces: Space[] = [
  {
    id: 'space1',
    name: '产品方案',
    description: '产品需求文档、产品规划、竞品分析',
    ownerId: '1',
    color: '#FF6B35',
    isFavorite: true,
    createdAt: new Date('2024-03-01'),
  },
  {
    id: 'space2',
    name: '项目管理',
    description: '项目计划、进度追踪、风险管理',
    ownerId: '1',
    color: '#2EC4B6',
    isFavorite: true,
    createdAt: new Date('2024-03-05'),
  },
  {
    id: 'space3',
    name: '团队知识库',
    description: '团队规范、技术文档、培训资料',
    ownerId: '1',
    color: '#1E3A5F',
    isFavorite: false,
    createdAt: new Date('2024-03-10'),
  },
];

export const mockFolders: Folder[] = [
  {
    id: 'folder1',
    name: '需求文档',
    spaceId: 'space1',
    parentId: null,
    order: 1,
    permissions: { '1': 'manager', '2': 'editor', '3': 'editor', '4': 'viewer' },
  },
  {
    id: 'folder2',
    name: '产品规划',
    spaceId: 'space1',
    parentId: null,
    order: 2,
    permissions: { '1': 'manager', '2': 'editor', '3': 'viewer' },
  },
  {
    id: 'folder3',
    name: '竞品分析',
    spaceId: 'space1',
    parentId: 'folder1',
    order: 1,
    permissions: { '1': 'manager', '2': 'editor' },
  },
  {
    id: 'folder4',
    name: '项目进度',
    spaceId: 'space2',
    parentId: null,
    order: 1,
    permissions: { '1': 'manager', '2': 'editor', '3': 'editor', '4': 'editor' },
  },
];

const sampleBlocks: Block[] = [
  {
    id: generateId(),
    type: 'heading1',
    content: '2024年Q2产品规划',
  },
  {
    id: generateId(),
    type: 'paragraph',
    content: '本季度我们将聚焦于用户体验优化和核心功能增强，通过市场调研和用户反馈确定以下优先级：',
  },
  {
    id: generateId(),
    type: 'heading2',
    content: '一、核心目标',
  },
  {
    id: generateId(),
    type: 'bulletList',
    content: '提升用户留存率至65%',
    children: [
      { id: generateId(), type: 'paragraph', content: '通过个性化推荐引擎' },
      { id: generateId(), type: 'paragraph', content: '优化新手引导流程' },
    ],
  },
  {
    id: generateId(),
    type: 'bulletList',
    content: '完成3个主要功能模块开发',
  },
  {
    id: generateId(),
    type: 'bulletList',
    content: '降低系统响应时间30%',
  },
  {
    id: generateId(),
    type: 'heading2',
    content: '二、功能规划',
  },
  {
    id: generateId(),
    type: 'table',
    content: '功能|负责人|预计完成时间|优先级\n协作编辑器|张三|2024-05-15|高\n任务看板|李四|2024-05-30|高\n数据分析|王五|2024-06-15|中',
  },
  {
    id: generateId(),
    type: 'heading2',
    content: '三、风险评估',
  },
  {
    id: generateId(),
    type: 'quote',
    content: '技术债务可能影响开发进度，建议提前安排重构时间。',
  },
  {
    id: generateId(),
    type: 'todo',
    content: '完成技术方案评审',
    checked: true,
  },
  {
    id: generateId(),
    type: 'todo',
    content: '确认设计稿',
    checked: false,
  },
  {
    id: generateId(),
    type: 'todo',
    content: '开发环境搭建',
    checked: true,
  },
];

const sampleBlocks2: Block[] = [
  {
    id: generateId(),
    type: 'heading1',
    content: '用户需求文档 - 在线协作文档',
  },
  {
    id: generateId(),
    type: 'heading2',
    content: '1. 产品概述',
  },
  {
    id: generateId(),
    type: 'paragraph',
    content: '在线协作文档是一款面向小团队的协作工具，帮助团队成员共同撰写方案、跟进事项。',
  },
  {
    id: generateId(),
    type: 'heading2',
    content: '2. 功能需求',
  },
  {
    id: generateId(),
    type: 'numberedList',
    content: '多人实时编辑',
  },
  {
    id: generateId(),
    type: 'numberedList',
    content: '版本历史管理',
  },
  {
    id: generateId(),
    type: 'numberedList',
    content: '评论与@提醒',
  },
  {
    id: generateId(),
    type: 'code',
    content: '// 示例代码\nfunction collaborate(docId: string) {\n  return realtimeSync(docId);\n}',
  },
  {
    id: generateId(),
    type: 'image',
    content: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
  },
];

const sampleBlocks3: Block[] = [
  {
    id: generateId(),
    type: 'heading1',
    content: '项目周报 - 第12周',
  },
  {
    id: generateId(),
    type: 'paragraph',
    content: '本周项目进展顺利，完成了核心模块的开发工作。',
  },
  {
    id: generateId(),
    type: 'heading2',
    content: '本周完成',
  },
  {
    id: generateId(),
    type: 'bulletList',
    content: '完成用户认证模块',
  },
  {
    id: generateId(),
    type: 'bulletList',
    content: '数据库设计与优化',
  },
  {
    id: generateId(),
    type: 'bulletList',
    content: 'API接口文档编写',
  },
  {
    id: generateId(),
    type: 'heading2',
    content: '下周计划',
  },
  {
    id: generateId(),
    type: 'todo',
    content: '开始前端页面开发',
    checked: false,
  },
  {
    id: generateId(),
    type: 'todo',
    content: '单元测试编写',
    checked: false,
  },
  {
    id: generateId(),
    type: 'todo',
    content: '部署测试环境',
    checked: false,
  },
];

export const mockDocuments: Document[] = [
  {
    id: 'doc1',
    title: '2024年Q2产品规划',
    content: sampleBlocks,
    folderId: 'folder2',
    spaceId: 'space1',
    createdBy: '1',
    updatedBy: '2',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-20'),
  },
  {
    id: 'doc2',
    title: '用户需求文档 - 在线协作文档',
    content: sampleBlocks2,
    folderId: 'folder1',
    spaceId: 'space1',
    createdBy: '2',
    updatedBy: '1',
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date('2024-03-21'),
  },
  {
    id: 'doc3',
    title: '竞品分析报告',
    content: [
      { id: generateId(), type: 'heading1', content: '竞品分析报告' },
      { id: generateId(), type: 'paragraph', content: '本报告对市场上主要竞争对手进行了深入分析...' },
    ],
    folderId: 'folder3',
    spaceId: 'space1',
    createdBy: '3',
    updatedBy: '3',
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-20'),
  },
  {
    id: 'doc4',
    title: '项目周报 - 第12周',
    content: sampleBlocks3,
    folderId: 'folder4',
    spaceId: 'space2',
    createdBy: '1',
    updatedBy: '4',
    createdAt: new Date('2024-03-22'),
    updatedAt: new Date('2024-03-22'),
  },
  {
    id: 'doc5',
    title: '团队开发规范',
    content: [
      { id: generateId(), type: 'heading1', content: '团队开发规范' },
      { id: generateId(), type: 'heading2', content: '代码规范' },
      { id: generateId(), type: 'paragraph', content: '所有代码必须遵循TypeScript严格模式...' },
    ],
    folderId: null,
    spaceId: 'space3',
    createdBy: '1',
    updatedBy: '1',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-15'),
  },
];

export const mockVersions: DocumentVersion[] = [
  {
    id: 'v1',
    documentId: 'doc1',
    content: sampleBlocks.slice(0, 5),
    createdBy: '1',
    remark: '初稿完成',
    createdAt: new Date('2024-03-15'),
  },
  {
    id: 'v2',
    documentId: 'doc1',
    content: sampleBlocks.slice(0, 8),
    createdBy: '2',
    remark: '添加功能规划表格',
    createdAt: new Date('2024-03-18'),
  },
  {
    id: 'v3',
    documentId: 'doc1',
    content: sampleBlocks,
    createdBy: '1',
    remark: '完善风险评估和待办事项',
    createdAt: new Date('2024-03-20'),
  },
];
