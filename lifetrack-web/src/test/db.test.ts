import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Dexie since IndexedDB doesn't work in jsdom
vi.mock('../db', async () => {
  const actual = await vi.importActual<typeof import('../db')>('../db');
  return {
    ...actual,
    db: {
      goals: { toArray: vi.fn(), clear: vi.fn(), bulkAdd: vi.fn() },
      tasks: { toArray: vi.fn(), clear: vi.fn(), bulkAdd: vi.fn() },
      lessons: { toArray: vi.fn(), clear: vi.fn(), bulkAdd: vi.fn() },
      sleepRecords: { toArray: vi.fn(), clear: vi.fn(), bulkAdd: vi.fn() },
      habits: { toArray: vi.fn(), clear: vi.fn(), bulkAdd: vi.fn() },
      habitLogs: { toArray: vi.fn(), clear: vi.fn(), bulkAdd: vi.fn() },
      moodEntries: { toArray: vi.fn(), clear: vi.fn(), bulkAdd: vi.fn() },
      focusSessions: { toArray: vi.fn(), clear: vi.fn(), bulkAdd: vi.fn() },
      badgeUnlocks: { toArray: vi.fn(), clear: vi.fn(), bulkAdd: vi.fn() },
    },
  };
});

import { db, formatLocalDate, todayLocal } from '../db';

describe('db utilities', () => {
  describe('formatLocalDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2026-01-15T12:00:00');
      expect(formatLocalDate(date)).toBe('2026-01-15');
    });

    it('should handle single digit months and days', () => {
      const date = new Date('2026-05-03T00:00:00');
      expect(formatLocalDate(date)).toBe('2026-05-03');
    });

    it('should handle timezone edge cases around midnight', () => {
      // 23:59:59 should still be today
      const date = new Date('2026-05-03T23:59:59');
      expect(formatLocalDate(date)).toBe('2026-05-03');
    });
  });

  describe('todayLocal', () => {
    it('should return todays date in YYYY-MM-DD format', () => {
      const result = todayLocal();
      const expected = formatLocalDate(new Date());
      expect(result).toBe(expected);
    });
  });
});
