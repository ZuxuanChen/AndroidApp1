import { describe, it, expect } from 'vitest';

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Simulate the PomodoroTimer handleMarkLessonDone logic
function markLessonCompleted(
  currentDates: string[],
  today: string
): { status: string; completedDates: string[] } {
  const newDates = currentDates.includes(today)
    ? currentDates
    : [...currentDates, today].sort();
  return {
    status: 'done',
    completedDates: newDates,
  };
}

describe('PomodoroTimer completion logic', () => {
  it('should add today to completedDates when not already present', () => {
    const result = markLessonCompleted(['2026-05-01', '2026-05-02'], '2026-05-03');
    expect(result.status).toBe('done');
    expect(result.completedDates).toEqual(['2026-05-01', '2026-05-02', '2026-05-03']);
  });

  it('should not duplicate today if already in completedDates', () => {
    const result = markLessonCompleted(['2026-05-01', '2026-05-03'], '2026-05-03');
    expect(result.completedDates).toEqual(['2026-05-01', '2026-05-03']);
  });

  it('should handle empty completedDates array', () => {
    const result = markLessonCompleted([], '2026-05-03');
    expect(result.completedDates).toEqual(['2026-05-03']);
  });

  it('should maintain sorted order after adding new date', () => {
    const result = markLessonCompleted(['2026-05-10'], '2026-05-03');
    expect(result.completedDates).toEqual(['2026-05-03', '2026-05-10']);
  });

  it('should handle year boundary correctly', () => {
    const result = markLessonCompleted(['2025-12-31'], '2026-01-01');
    expect(result.completedDates).toEqual(['2025-12-31', '2026-01-01']);
  });
});

// Simulate HabitView streak calculation
function calcStreak(today: string, dates: string[]): number {
  if (dates.length === 0) return 0;

  const dateSet = new Set(dates);
  let streak = 0;
  let checkDate = today;

  if (!dateSet.has(checkDate)) {
    const yesterday = new Date(checkDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yestStr = formatLocalDate(yesterday);
    if (!dateSet.has(yestStr)) return 0;
    checkDate = yestStr;
  }

  while (dateSet.has(checkDate)) {
    streak++;
    const d = new Date(checkDate);
    d.setDate(d.getDate() - 1);
    checkDate = formatLocalDate(d);
  }
  return streak;
}

describe('HabitView streak calculation', () => {
  it('should calculate streak when logged today', () => {
    const dates = ['2026-05-01', '2026-05-02', '2026-05-03'];
    expect(calcStreak('2026-05-03', dates)).toBe(3);
  });

  it('should calculate streak when not logged today but logged yesterday', () => {
    const dates = ['2026-05-01', '2026-05-02'];
    // Today is 05-03, yesterday 05-02 was logged
    expect(calcStreak('2026-05-03', dates)).toBe(2);
  });

  it('should return 0 when streak is broken', () => {
    const dates = ['2026-05-01'];
    // Today is 05-03, yesterday 05-02 was NOT logged
    expect(calcStreak('2026-05-03', dates)).toBe(0);
  });

  it('should return 0 for empty logs', () => {
    expect(calcStreak('2026-05-03', [])).toBe(0);
  });

  it('should handle month boundary in streak', () => {
    const dates = ['2026-04-30', '2026-05-01', '2026-05-02'];
    expect(calcStreak('2026-05-02', dates)).toBe(3);
  });

  it('should handle year boundary in streak', () => {
    const dates = ['2025-12-30', '2025-12-31', '2026-01-01'];
    expect(calcStreak('2026-01-01', dates)).toBe(3);
  });

  it('should handle single day streak (today only)', () => {
    const dates = ['2026-05-03'];
    expect(calcStreak('2026-05-03', dates)).toBe(1);
  });

  it('should handle gaps in history but recent streak', () => {
    const dates = ['2026-04-01', '2026-04-02', '2026-05-01', '2026-05-02', '2026-05-03'];
    expect(calcStreak('2026-05-03', dates)).toBe(3); // Only May 1-3 count
  });
});
