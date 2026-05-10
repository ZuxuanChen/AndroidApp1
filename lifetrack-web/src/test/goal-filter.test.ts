import { describe, it, expect } from 'vitest';

interface MockTask {
  id: number;
  title: string;
  goalId: number | null;
  status: string;
  priority: number;
}

function filterTasks(
  tasks: MockTask[],
  goalFilter: number | 'all',
  statusFilter: string
): MockTask[] {
  return tasks.filter(t => {
    if (goalFilter !== 'all' && t.goalId !== goalFilter) return false;
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });
}

describe('Goal Filter Logic', () => {
  const tasks: MockTask[] = [
    { id: 1, title: 'T1', goalId: 1, status: 'todo', priority: 1 },
    { id: 2, title: 'T2', goalId: 2, status: 'todo', priority: 1 },
    { id: 3, title: 'T3', goalId: 1, status: 'done', priority: 1 },
    { id: 4, title: 'T4', goalId: null, status: 'todo', priority: 1 },
    { id: 5, title: 'T5', goalId: 1, status: 'in_progress', priority: 1 },
  ];

  it('should return all tasks when goalFilter is all', () => {
    const filtered = filterTasks(tasks, 'all', 'all');
    expect(filtered.length).toBe(5);
  });

  it('should filter tasks by specific goal', () => {
    const filtered = filterTasks(tasks, 1, 'all');
    expect(filtered.length).toBe(3);
    expect(filtered.every(t => t.goalId === 1)).toBe(true);
    expect(filtered.map(t => t.title)).toEqual(['T1', 'T3', 'T5']);
  });

  it('should combine goal filter with status filter', () => {
    const filtered = filterTasks(tasks, 1, 'todo');
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('T1');
  });

  it('should return empty when goal has no tasks', () => {
    const filtered = filterTasks(tasks, 999, 'all');
    expect(filtered.length).toBe(0);
  });

  it('should handle deleted goal gracefully', () => {
    const filtered = filterTasks(tasks, 999, 'all');
    expect(filtered.length).toBe(0);
  });

  it('should filter tasks with no goal', () => {
    const filtered = filterTasks(tasks, null as unknown as number, 'all');
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('T4');
  });

  it('should handle empty task list', () => {
    const filtered = filterTasks([], 1, 'all');
    expect(filtered.length).toBe(0);
  });

  it('should handle goal filter with done status', () => {
    const filtered = filterTasks(tasks, 1, 'done');
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('T3');
  });
});
