import { describe, it, expect } from 'vitest';

interface MockTask {
  id: number;
  title: string;
  goalId?: number;
}

function batchAssignGoal(tasks: MockTask[], selectedIds: number[], goalId: number): MockTask[] {
  return tasks.map(t => selectedIds.includes(t.id) ? { ...t, goalId } : t);
}

describe('Batch Assign Goal', () => {
  it('should assign goal to selected tasks', () => {
    const tasks: MockTask[] = [
      { id: 1, title: 'A' },
      { id: 2, title: 'B' },
      { id: 3, title: 'C' },
    ];
    const result = batchAssignGoal(tasks, [1, 3], 5);
    expect(result[0].goalId).toBe(5);
    expect(result[1].goalId).toBeUndefined();
    expect(result[2].goalId).toBe(5);
  });

  it('should overwrite existing goalId', () => {
    const tasks: MockTask[] = [
      { id: 1, title: 'A', goalId: 2 },
      { id: 2, title: 'B', goalId: 3 },
    ];
    const result = batchAssignGoal(tasks, [1], 5);
    expect(result[0].goalId).toBe(5);
    expect(result[1].goalId).toBe(3);
  });

  it('should handle empty selection', () => {
    const tasks: MockTask[] = [{ id: 1, title: 'A' }];
    const result = batchAssignGoal(tasks, [], 5);
    expect(result[0].goalId).toBeUndefined();
  });

  it('should handle single selection', () => {
    const tasks: MockTask[] = [
      { id: 1, title: 'A' },
      { id: 2, title: 'B' },
    ];
    const result = batchAssignGoal(tasks, [2], 7);
    expect(result[0].goalId).toBeUndefined();
    expect(result[1].goalId).toBe(7);
  });

  it('should not modify unselected tasks', () => {
    const tasks: MockTask[] = [
      { id: 1, title: 'A', goalId: 1 },
      { id: 2, title: 'B', goalId: 2 },
      { id: 3, title: 'C', goalId: 3 },
    ];
    const result = batchAssignGoal(tasks, [2], 99);
    expect(result[0].goalId).toBe(1);
    expect(result[1].goalId).toBe(99);
    expect(result[2].goalId).toBe(3);
  });

  it('should handle all tasks selected', () => {
    const tasks: MockTask[] = [
      { id: 1, title: 'A' },
      { id: 2, title: 'B' },
      { id: 3, title: 'C' },
    ];
    const result = batchAssignGoal(tasks, [1, 2, 3], 10);
    expect(result.every(t => t.goalId === 10)).toBe(true);
  });
});
