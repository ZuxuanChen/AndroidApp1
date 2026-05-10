import { describe, it, expect } from 'vitest';

interface BackupData {
  version: number;
  exportAt: string;
  goals: any[];
  tasks: any[];
  lessons: any[];
  sleepRecords: any[];
  habits: any[];
  habitLogs: any[];
  moodEntries: any[];
  focusSessions: any[];
  badgeUnlocks: any[];
}

function validateBackupFile(data: unknown): { valid: boolean; error?: string; stats?: Record<string, number> } {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: '文件格式不正确，不是有效的 JSON 对象' };
  }

  const d = data as Partial<BackupData>;

  if (!d.version || typeof d.version !== 'number') {
    return { valid: false, error: '文件格式不正确，缺少版本号' };
  }

  if (!Array.isArray(d.goals)) {
    return { valid: false, error: '文件格式不正确，缺少 goals 数组' };
  }

  // Basic stats
  const stats = {
    goals: d.goals.length,
    tasks: Array.isArray(d.tasks) ? d.tasks.length : 0,
    lessons: Array.isArray(d.lessons) ? d.lessons.length : 0,
    sleep: Array.isArray(d.sleepRecords) ? d.sleepRecords.length : 0,
    habits: Array.isArray(d.habits) ? d.habits.length : 0,
    logs: Array.isArray(d.habitLogs) ? d.habitLogs.length : 0,
    moods: Array.isArray(d.moodEntries) ? d.moodEntries.length : 0,
    focus: Array.isArray(d.focusSessions) ? d.focusSessions.length : 0,
    badges: Array.isArray(d.badgeUnlocks) ? d.badgeUnlocks.length : 0,
  };

  return { valid: true, stats };
}

function stripId(arr: any[]): any[] {
  return arr.map((item: any) => {
    const { id, ...rest } = item;
    return rest;
  });
}

describe('SettingsView export/import', () => {
  describe('validateBackupFile', () => {
    it('should reject non-object data', () => {
      expect(validateBackupFile(null).valid).toBe(false);
      expect(validateBackupFile('string').valid).toBe(false);
      expect(validateBackupFile(123).valid).toBe(false);
    });

    it('should reject missing version', () => {
      const data = { goals: [] };
      const result = validateBackupFile(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('版本号');
    });

    it('should reject missing goals array', () => {
      const data = { version: 1 };
      const result = validateBackupFile(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('goals');
    });

    it('should accept valid backup structure', () => {
      const data: BackupData = {
        version: 1,
        exportAt: new Date().toISOString(),
        goals: [{ title: 'Test', color: '#000' }],
        tasks: [],
        lessons: [],
        sleepRecords: [],
        habits: [],
        habitLogs: [],
        moodEntries: [],
        focusSessions: [],
        badgeUnlocks: [],
      };
      const result = validateBackupFile(data);
      expect(result.valid).toBe(true);
      expect(result.stats).toEqual({
        goals: 1, tasks: 0, lessons: 0, sleep: 0,
        habits: 0, logs: 0, moods: 0, focus: 0, badges: 0,
      });
    });

    it('should handle partial arrays (missing optional fields)', () => {
      const data = {
        version: 1,
        exportAt: new Date().toISOString(),
        goals: [],
      };
      const result = validateBackupFile(data);
      expect(result.valid).toBe(true);
      expect(result.stats).toEqual({
        goals: 0, tasks: 0, lessons: 0, sleep: 0,
        habits: 0, logs: 0, moods: 0, focus: 0, badges: 0,
      });
    });

    it('should calculate correct stats for mixed data', () => {
      const data: BackupData = {
        version: 1,
        exportAt: new Date().toISOString(),
        goals: [{}, {}],
        tasks: [{}, {}, {}],
        lessons: [{}, {}],
        sleepRecords: [{}],
        habits: [{}, {}, {}, {}],
        habitLogs: [{}, {}],
        moodEntries: [{}],
        focusSessions: [{}, {}],
        badgeUnlocks: [{}],
      };
      const result = validateBackupFile(data);
      expect(result.valid).toBe(true);
      expect(result.stats).toEqual({
        goals: 2, tasks: 3, lessons: 2, sleep: 1,
        habits: 4, logs: 2, moods: 1, focus: 2, badges: 1,
      });
    });
  });

  describe('stripId', () => {
    it('should remove id field from objects', () => {
      const input = [
        { id: 1, title: 'A', color: '#000' },
        { id: 2, title: 'B', color: '#fff' },
      ];
      const result = stripId(input);
      expect(result).toEqual([
        { title: 'A', color: '#000' },
        { title: 'B', color: '#fff' },
      ]);
    });

    it('should handle objects without id field', () => {
      const input = [{ title: 'A' }];
      const result = stripId(input);
      expect(result).toEqual([{ title: 'A' }]);
    });

    it('should handle empty array', () => {
      expect(stripId([])).toEqual([]);
    });

    it('should preserve nested objects', () => {
      const input = [{ id: 1, nested: { foo: 'bar' } }];
      const result = stripId(input);
      expect(result[0].nested).toEqual({ foo: 'bar' });
    });
  });
});
