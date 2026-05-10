import { describe, it, expect } from 'vitest';

interface MockHabitLog {
  habitId: number;
  date: string;
}

interface MockTask {
  id: number;
  status: string;
}

interface MockLesson {
  id: number;
  completedDates?: string[];
}

function shouldToggleHabit(logs: MockHabitLog[], habitId: number, date: string): boolean {
  return logs.some(l => l.habitId === habitId && l.date === date);
}

function quickMarkTaskDone(task: MockTask): MockTask {
  return { ...task, status: 'done' };
}

function toggleLessonComplete(lesson: MockLesson, today: string): MockLesson {
  const dates = lesson.completedDates || [];
  const hasToday = dates.includes(today);
  return {
    ...lesson,
    completedDates: hasToday ? dates.filter(d => d !== today) : [...dates, today],
  };
}

describe('Dashboard Quick Actions', () => {
  describe('habit toggle', () => {
    it('should detect existing log', () => {
      const logs = [{ habitId: 1, date: '2026-05-10' }];
      expect(shouldToggleHabit(logs, 1, '2026-05-10')).toBe(true);
    });

    it('should detect missing log', () => {
      const logs: MockHabitLog[] = [];
      expect(shouldToggleHabit(logs, 1, '2026-05-10')).toBe(false);
    });

    it('should distinguish different habits', () => {
      const logs = [{ habitId: 1, date: '2026-05-10' }];
      expect(shouldToggleHabit(logs, 2, '2026-05-10')).toBe(false);
    });
  });

  describe('task mark done', () => {
    it('should change status to done', () => {
      const task = { id: 1, status: 'todo' };
      const updated = quickMarkTaskDone(task);
      expect(updated.status).toBe('done');
    });

    it('should keep id unchanged', () => {
      const task = { id: 5, status: 'in_progress' };
      const updated = quickMarkTaskDone(task);
      expect(updated.id).toBe(5);
    });
  });

  describe('lesson toggle complete', () => {
    it('should add today when not present', () => {
      const lesson = { id: 1, completedDates: ['2026-05-01'] };
      const updated = toggleLessonComplete(lesson, '2026-05-10');
      expect(updated.completedDates).toContain('2026-05-10');
      expect(updated.completedDates).toContain('2026-05-01');
    });

    it('should remove today when present', () => {
      const lesson = { id: 1, completedDates: ['2026-05-10', '2026-05-01'] };
      const updated = toggleLessonComplete(lesson, '2026-05-10');
      expect(updated.completedDates).not.toContain('2026-05-10');
      expect(updated.completedDates).toContain('2026-05-01');
    });

    it('should handle empty completedDates', () => {
      const lesson = { id: 1 };
      const updated = toggleLessonComplete(lesson, '2026-05-10');
      expect(updated.completedDates).toEqual(['2026-05-10']);
    });

    it('should toggle idempotently', () => {
      const lesson = { id: 1, completedDates: ['2026-05-10'] };
      const once = toggleLessonComplete(lesson, '2026-05-10');
      expect(once.completedDates).not.toContain('2026-05-10');
      const twice = toggleLessonComplete(once, '2026-05-10');
      expect(twice.completedDates).toContain('2026-05-10');
    });
  });
});
