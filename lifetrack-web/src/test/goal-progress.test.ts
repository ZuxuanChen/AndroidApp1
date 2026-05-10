import { describe, it, expect } from 'vitest';

interface Task { status: 'todo' | 'in_progress' | 'done'; goalId?: number; }

function getGoalProgress(goalId: number, tasks: Task[]): { total: number; done: number; pct: number } {
  const related = tasks.filter(t => t.goalId === goalId);
  const total = related.length;
  const done = related.filter(t => t.status === 'done').length;
  return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

describe('Goal progress', () => {
  it('should calculate 0% for no tasks', () => {
    expect(getGoalProgress(1, [])).toEqual({ total: 0, done: 0, pct: 0 });
  });

  it('should calculate 0% when none done', () => {
    const tasks: Task[] = [
      { status: 'todo', goalId: 1 },
      { status: 'in_progress', goalId: 1 },
    ];
    expect(getGoalProgress(1, tasks)).toEqual({ total: 2, done: 0, pct: 0 });
  });

  it('should calculate 50% when half done', () => {
    const tasks: Task[] = [
      { status: 'done', goalId: 1 },
      { status: 'todo', goalId: 1 },
    ];
    expect(getGoalProgress(1, tasks)).toEqual({ total: 2, done: 1, pct: 50 });
  });

  it('should calculate 100% when all done', () => {
    const tasks: Task[] = [
      { status: 'done', goalId: 1 },
      { status: 'done', goalId: 1 },
    ];
    expect(getGoalProgress(1, tasks)).toEqual({ total: 2, done: 2, pct: 100 });
  });

  it('should ignore tasks from other goals', () => {
    const tasks: Task[] = [
      { status: 'done', goalId: 1 },
      { status: 'todo', goalId: 2 },
    ];
    expect(getGoalProgress(1, tasks)).toEqual({ total: 1, done: 1, pct: 100 });
  });

  it('should handle 1/3 correctly rounding to 33%', () => {
    const tasks: Task[] = [
      { status: 'done', goalId: 1 },
      { status: 'todo', goalId: 1 },
      { status: 'todo', goalId: 1 },
    ];
    expect(getGoalProgress(1, tasks)).toEqual({ total: 3, done: 1, pct: 33 });
  });
});
