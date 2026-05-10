import { describe, it, expect } from 'vitest';

interface Entity {
  id?: number;
  title?: string;
  name?: string;
  description?: string;
  note?: string;
  date?: string;
  location?: string;
}

function searchEntities(query: string, entities: Record<string, Entity[]>): { type: string; title: string }[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results: { type: string; title: string }[] = [];
  for (const [type, items] of Object.entries(entities)) {
    for (const item of items) {
      const text = [
        item.title, item.name, item.description, item.note, item.date, item.location,
      ].filter(Boolean).join(' ').toLowerCase();
      if (text.includes(q)) {
        results.push({ type, title: item.title || item.name || item.note || 'Untitled' });
      }
    }
  }
  return results;
}

describe('Global search', () => {
  const sampleData = {
    tasks: [
      { id: 1, title: '背单词 50 个', status: 'todo' },
      { id: 2, title: '跑步 5 公里', status: 'done' },
    ],
    goals: [
      { id: 1, title: '雅思 7.0', description: '英语考试目标' },
    ],
    lessons: [
      { id: 1, title: '高等数学', location: '教学楼 A301' },
    ],
    habits: [
      { id: 1, name: '早起', color: '#F59E0B' },
    ],
    moods: [
      { id: 1, note: '今天心情不错', date: '2026-05-10' },
    ],
  };

  it('should find tasks by title', () => {
    const results = searchEntities('单词', sampleData);
    expect(results.some(r => r.type === 'tasks' && r.title === '背单词 50 个')).toBe(true);
  });

  it('should find goals by description', () => {
    const results = searchEntities('英语', sampleData);
    expect(results.some(r => r.type === 'goals')).toBe(true);
  });

  it('should find lessons by location', () => {
    const results = searchEntities('A301', sampleData);
    expect(results.some(r => r.type === 'lessons')).toBe(true);
  });

  it('should find habits by name', () => {
    const results = searchEntities('早起', sampleData);
    expect(results.some(r => r.type === 'habits')).toBe(true);
  });

  it('should find mood notes', () => {
    const results = searchEntities('心情', sampleData);
    expect(results.some(r => r.type === 'moods')).toBe(true);
  });

  it('should be case-insensitive', () => {
    const results = searchEntities('BACKGROUND', { tasks: [{ title: '背单词 50 个' }] });
    expect(results).toHaveLength(0);
    const results2 = searchEntities('单词', { tasks: [{ title: '背单词 50 个' }] });
    expect(results2).toHaveLength(1);
  });

  it('should handle empty query', () => {
    expect(searchEntities('', sampleData)).toEqual([]);
    expect(searchEntities('   ', sampleData)).toEqual([]);
  });

  it('should handle no matches', () => {
    const results = searchEntities('不存在的关键词', sampleData);
    expect(results).toHaveLength(0);
  });

  it('should handle special characters in query', () => {
    const results = searchEntities('!', sampleData);
    expect(results).toHaveLength(0);
  });

  it('should handle emoji in content', () => {
    const data = { tasks: [{ title: '完成项目 🚀' }] };
    const results = searchEntities('项目', data);
    expect(results).toHaveLength(1);
  });

  it('should handle multiple matches in same category', () => {
    const data = {
      tasks: [
        { title: '数学作业' },
        { title: '数学复习' },
      ],
    };
    const results = searchEntities('数学', data);
    expect(results).toHaveLength(2);
  });

  it('should handle items without title/name', () => {
    const data = { moods: [{ note: '感觉很好' }] };
    const results = searchEntities('感觉', data);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('感觉很好');
  });
});
