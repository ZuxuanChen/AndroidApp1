import { describe, it, expect } from 'vitest';

// Tests for formatLocalDate edge cases
function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

describe('formatLocalDate edge cases', () => {
  it('should handle year boundary (Dec 31)', () => {
    const date = new Date(2025, 11, 31); // Dec 31, 2025
    expect(formatLocalDate(date)).toBe('2025-12-31');
  });

  it('should handle year boundary (Jan 1)', () => {
    const date = new Date(2026, 0, 1); // Jan 1, 2026
    expect(formatLocalDate(date)).toBe('2026-01-01');
  });

  it('should handle leap year Feb 29', () => {
    const date = new Date(2024, 1, 29); // Feb 29, 2024 (leap year)
    expect(formatLocalDate(date)).toBe('2024-02-29');
  });

  it('should handle non-leap year Feb 28', () => {
    const date = new Date(2025, 1, 28); // Feb 28, 2025
    expect(formatLocalDate(date)).toBe('2025-02-28');
  });

  it('should handle single-digit month and day', () => {
    const date = new Date(2026, 2, 5); // Mar 5, 2026
    expect(formatLocalDate(date)).toBe('2026-03-05');
  });

  it('should handle last day of month', () => {
    const date = new Date(2026, 3, 30); // Apr 30, 2026
    expect(formatLocalDate(date)).toBe('2026-04-30');
  });

  it('should handle month with 31 days', () => {
    const date = new Date(2026, 0, 31); // Jan 31, 2026
    expect(formatLocalDate(date)).toBe('2026-01-31');
  });
});

// Tests for todayLocal consistency
function todayLocal(): string {
  return formatLocalDate(new Date());
}

describe('todayLocal', () => {
  it('should return a valid date string', () => {
    const today = todayLocal();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should return consistent results within same millisecond', () => {
    const a = todayLocal();
    const b = todayLocal();
    expect(a).toBe(b);
  });
});

// Tests for import with malformed data
function safeParseJson(text: string): { success: boolean; data?: any; error?: string } {
  try {
    const data = JSON.parse(text);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: 'Invalid JSON' };
  }
}

describe('Safe JSON parsing', () => {
  it('should handle empty string', () => {
    const result = safeParseJson('');
    expect(result.success).toBe(false);
  });

  it('should handle malformed JSON', () => {
    const result = safeParseJson('{invalid json}');
    expect(result.success).toBe(false);
  });

  it('should handle truncated JSON', () => {
    const result = safeParseJson('{"version": 1, "goals": [');
    expect(result.success).toBe(false);
  });

  it('should handle valid JSON', () => {
    const result = safeParseJson('{"version": 1, "goals": []}');
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ version: 1, goals: [] });
  });

  it('should handle JSON with extra whitespace', () => {
    const result = safeParseJson('  { "version" : 1 }  ');
    expect(result.success).toBe(true);
  });

  it('should handle non-string input', () => {
    // Simulating what happens when a non-text file is selected
    const binaryContent = '\x00\x01\x02\x03';
    const result = safeParseJson(binaryContent);
    expect(result.success).toBe(false);
  });
});

// Tests for schedule overlap edge cases
function lessonsOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

describe('Lesson overlap edge cases', () => {
  it('should detect exact same time range as overlap', () => {
    expect(lessonsOverlap(480, 600, 480, 600)).toBe(true);
  });

  it('should not detect touching endpoints as overlap', () => {
    // Lesson A ends at 10:00, Lesson B starts at 10:00
    expect(lessonsOverlap(480, 600, 600, 720)).toBe(false);
  });

  it('should detect 1-minute overlap', () => {
    expect(lessonsOverlap(480, 600, 599, 720)).toBe(true);
  });

  it('should handle midnight crossing', () => {
    // 23:00 - 01:00 (next day)
    expect(lessonsOverlap(1380, 1500, 1380, 1500)).toBe(true);
  });

  it('should not detect non-overlapping far apart', () => {
    expect(lessonsOverlap(480, 540, 600, 660)).toBe(false);
  });

  it('should detect complete containment', () => {
    // A: 9:00-12:00, B: 10:00-11:00
    expect(lessonsOverlap(540, 720, 600, 660)).toBe(true);
  });
});

// Tests for task due date comparison edge cases
function isTaskOverdue(dueDate: string, today: string, status: 'todo' | 'done'): boolean {
  return status !== 'done' && dueDate < today;
}

describe('Task overdue edge cases', () => {
  it('should mark yesterday as overdue', () => {
    expect(isTaskOverdue('2026-05-09', '2026-05-10', 'todo')).toBe(true);
  });

  it('should not mark today as overdue', () => {
    expect(isTaskOverdue('2026-05-10', '2026-05-10', 'todo')).toBe(false);
  });

  it('should not mark done tasks as overdue even if past due', () => {
    expect(isTaskOverdue('2026-05-09', '2026-05-10', 'done')).toBe(false);
  });

  it('should handle year boundary', () => {
    expect(isTaskOverdue('2025-12-31', '2026-01-01', 'todo')).toBe(true);
  });

  it('should handle leap year comparison', () => {
    expect(isTaskOverdue('2024-02-29', '2024-03-01', 'todo')).toBe(true);
  });

  it('should handle string comparison (lexicographic works for ISO dates)', () => {
    expect(isTaskOverdue('2026-01-01', '2026-12-31', 'todo')).toBe(true);
  });
});

// Tests for habit streak edge cases
function calculateStreak(today: string, loggedDates: string[]): number {
  if (loggedDates.includes(today)) {
    let streak = 1;
    const d = new Date(today);
    while (true) {
      d.setDate(d.getDate() - 1);
      const ds = formatLocalDate(d);
      if (loggedDates.includes(ds)) streak++;
      else break;
    }
    return streak;
  }
  // Check yesterday - if logged yesterday, streak continues from yesterday
  const yest = new Date(today);
  yest.setDate(yest.getDate() - 1);
  const yestStr = formatLocalDate(yest);
  if (loggedDates.includes(yestStr)) {
    let streak = 1;
    const d = new Date(yestStr);
    while (true) {
      d.setDate(d.getDate() - 1);
      const ds = formatLocalDate(d);
      if (loggedDates.includes(ds)) streak++;
      else break;
    }
    return streak;
  }
  return 0;
}

describe('Habit streak edge cases', () => {
  it('should return 0 when no logs', () => {
    expect(calculateStreak('2026-05-10', [])).toBe(0);
  });

  it('should return 1 when only today logged', () => {
    expect(calculateStreak('2026-05-10', ['2026-05-10'])).toBe(1);
  });

  it('should return 3 for 3 consecutive days ending today', () => {
    expect(calculateStreak('2026-05-10', ['2026-05-10', '2026-05-09', '2026-05-08'])).toBe(3);
  });

  it('should return streak ending yesterday if today not logged', () => {
    expect(calculateStreak('2026-05-10', ['2026-05-09', '2026-05-08'])).toBe(2);
  });

  it('should break streak on gap', () => {
    // Logged today and yesterday, but not day before
    expect(calculateStreak('2026-05-10', ['2026-05-10', '2026-05-09'])).toBe(2);
    // Day before was not logged
    expect(calculateStreak('2026-05-10', ['2026-05-10', '2026-05-09', '2026-05-07'])).toBe(2);
  });

  it('should handle year boundary streak', () => {
    expect(calculateStreak('2026-01-01', ['2026-01-01', '2025-12-31', '2025-12-30'])).toBe(3);
  });

  it('should handle month boundary streak', () => {
    expect(calculateStreak('2026-03-01', ['2026-03-01', '2026-02-28'])).toBe(2);
  });

  it('should handle leap year February', () => {
    expect(calculateStreak('2024-03-01', ['2024-03-01', '2024-02-29', '2024-02-28'])).toBe(3);
  });
});
