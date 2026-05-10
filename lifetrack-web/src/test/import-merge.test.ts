import { describe, it, expect } from 'vitest';

interface MockGoal { id?: number; title: string; color: string }
interface MockTask { id?: number; title: string; status: string }
interface MockLesson { id?: number; dayOfWeek: number; startHour: number; startMinute: number; title: string }

function stripId(arr: any[]) {
  return arr.map((item: any) => { const { id, ...rest } = item; return rest; });
}

function mergeGoals(existing: MockGoal[], incoming: MockGoal[]) {
  const stripped = stripId(incoming);
  return stripped.filter((g: any) => !existing.some(eg => eg.title === g.title));
}

function mergeTasks(existing: MockTask[], incoming: MockTask[]) {
  const stripped = stripId(incoming);
  return stripped.filter((t: any) => !existing.some(et => et.title === t.title));
}

function mergeLessons(existing: MockLesson[], incoming: MockLesson[]) {
  const stripped = stripId(incoming);
  return stripped.filter((l: any) => !existing.some(el => el.dayOfWeek === l.dayOfWeek && el.startHour === l.startHour && el.startMinute === l.startMinute));
}

describe('Import Merge Logic', () => {
  describe('mergeGoals', () => {
    it('should add new goals when no conflict', () => {
      const existing: MockGoal[] = [{ id: 1, title: 'Old', color: '#000' }];
      const incoming: MockGoal[] = [{ id: 2, title: 'New', color: '#fff' }];
      const result = mergeGoals(existing, incoming);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('New');
    });

    it('should skip goals with duplicate title', () => {
      const existing: MockGoal[] = [{ id: 1, title: 'Dup', color: '#000' }];
      const incoming: MockGoal[] = [{ id: 2, title: 'Dup', color: '#fff' }];
      const result = mergeGoals(existing, incoming);
      expect(result).toHaveLength(0);
    });

    it('should strip IDs from incoming', () => {
      const existing: MockGoal[] = [];
      const incoming: MockGoal[] = [{ id: 99, title: 'New', color: '#fff' }];
      const result = mergeGoals(existing, incoming);
      expect(result[0]).not.toHaveProperty('id');
    });

    it('should handle empty existing', () => {
      const existing: MockGoal[] = [];
      const incoming: MockGoal[] = [{ title: 'A' }, { title: 'B' }];
      const result = mergeGoals(existing, incoming);
      expect(result).toHaveLength(2);
    });

    it('should handle empty incoming', () => {
      const existing: MockGoal[] = [{ title: 'A' }];
      const incoming: MockGoal[] = [];
      const result = mergeGoals(existing, incoming);
      expect(result).toHaveLength(0);
    });
  });

  describe('mergeTasks', () => {
    it('should add new tasks when no conflict', () => {
      const existing: MockTask[] = [{ id: 1, title: 'Old', status: 'todo' }];
      const incoming: MockTask[] = [{ id: 2, title: 'New', status: 'done' }];
      const result = mergeTasks(existing, incoming);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('New');
    });

    it('should skip duplicate titles', () => {
      const existing: MockTask[] = [{ id: 1, title: 'Dup', status: 'todo' }];
      const incoming: MockTask[] = [{ id: 2, title: 'Dup', status: 'done' }];
      const result = mergeTasks(existing, incoming);
      expect(result).toHaveLength(0);
    });
  });

  describe('mergeLessons', () => {
    it('should add new lessons when no conflict', () => {
      const existing: MockLesson[] = [{ id: 1, dayOfWeek: 1, startHour: 8, startMinute: 0, title: 'Math' }];
      const incoming: MockLesson[] = [{ id: 2, dayOfWeek: 2, startHour: 9, startMinute: 0, title: 'English' }];
      const result = mergeLessons(existing, incoming);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('English');
    });

    it('should skip lessons with same day and time', () => {
      const existing: MockLesson[] = [{ id: 1, dayOfWeek: 1, startHour: 8, startMinute: 0, title: 'Math' }];
      const incoming: MockLesson[] = [{ id: 2, dayOfWeek: 1, startHour: 8, startMinute: 0, title: 'Physics' }];
      const result = mergeLessons(existing, incoming);
      expect(result).toHaveLength(0);
    });

    it('should allow same day different time', () => {
      const existing: MockLesson[] = [{ id: 1, dayOfWeek: 1, startHour: 8, startMinute: 0, title: 'Math' }];
      const incoming: MockLesson[] = [{ id: 2, dayOfWeek: 1, startHour: 10, startMinute: 0, title: 'Physics' }];
      const result = mergeLessons(existing, incoming);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Physics');
    });

    it('should allow same time different day', () => {
      const existing: MockLesson[] = [{ id: 1, dayOfWeek: 1, startHour: 8, startMinute: 0, title: 'Math' }];
      const incoming: MockLesson[] = [{ id: 2, dayOfWeek: 2, startHour: 8, startMinute: 0, title: 'Physics' }];
      const result = mergeLessons(existing, incoming);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Physics');
    });
  });
});
