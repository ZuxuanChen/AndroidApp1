import { describe, it, expect } from 'vitest';

// Import the overlap detection logic inline for testing
// (In production this would be exported from the component or a utils file)

function lessonsOverlap(
  a: { dayOfWeek: number; startHour: number; startMinute: number; durationMinutes: number },
  b: { dayOfWeek: number; startHour: number; startMinute: number; durationMinutes: number }
): boolean {
  if (a.dayOfWeek !== b.dayOfWeek) return false;
  const aStart = a.startHour * 60 + a.startMinute;
  const aEnd = aStart + a.durationMinutes;
  const bStart = b.startHour * 60 + b.startMinute;
  const bEnd = bStart + b.durationMinutes;
  return aStart < bEnd && bStart < aEnd;
}

function validateLesson(data: { title: string; startHour: number; startMinute: number; durationMinutes: number }): string | null {
  if (!data.title.trim()) return '课程名称不能为空';
  if (data.title.trim().length > 50) return '课程名称不能超过50字';
  if (data.startHour < 0 || data.startHour > 23) return '开始时间无效';
  if (data.startMinute !== 0 && data.startMinute !== 15 && data.startMinute !== 30 && data.startMinute !== 45) {
    return '开始分钟只能为0、15、30、45';
  }
  if (data.durationMinutes <= 0 || data.durationMinutes > 480) return '时长必须在1分钟到8小时之间';
  return null;
}

describe('ScheduleView validation', () => {
  describe('lessonsOverlap', () => {
    it('should detect overlapping lessons on the same day', () => {
      const a = { dayOfWeek: 1, startHour: 9, startMinute: 0, durationMinutes: 60 };
      const b = { dayOfWeek: 1, startHour: 9, startMinute: 30, durationMinutes: 60 };
      expect(lessonsOverlap(a, b)).toBe(true);
    });

    it('should detect adjacent but non-overlapping lessons', () => {
      const a = { dayOfWeek: 1, startHour: 9, startMinute: 0, durationMinutes: 60 };
      const b = { dayOfWeek: 1, startHour: 10, startMinute: 0, durationMinutes: 60 };
      expect(lessonsOverlap(a, b)).toBe(false);
    });

    it('should not detect overlap on different days', () => {
      const a = { dayOfWeek: 1, startHour: 9, startMinute: 0, durationMinutes: 60 };
      const b = { dayOfWeek: 2, startHour: 9, startMinute: 0, durationMinutes: 60 };
      expect(lessonsOverlap(a, b)).toBe(false);
    });

    it('should detect exact same time slot as overlapping', () => {
      const a = { dayOfWeek: 1, startHour: 14, startMinute: 0, durationMinutes: 45 };
      const b = { dayOfWeek: 1, startHour: 14, startMinute: 0, durationMinutes: 45 };
      expect(lessonsOverlap(a, b)).toBe(true);
    });

    it('should handle edge case: one lesson fully contains another', () => {
      const a = { dayOfWeek: 1, startHour: 9, startMinute: 0, durationMinutes: 120 };
      const b = { dayOfWeek: 1, startHour: 10, startMinute: 0, durationMinutes: 30 };
      expect(lessonsOverlap(a, b)).toBe(true);
    });

    it('should handle edge case: barely touching start/end', () => {
      const a = { dayOfWeek: 1, startHour: 9, startMinute: 0, durationMinutes: 60 };
      const b = { dayOfWeek: 1, startHour: 8, startMinute: 0, durationMinutes: 60 };
      // a: 9:00-10:00, b: 8:00-9:00 -> not overlapping (touching at endpoint)
      expect(lessonsOverlap(a, b)).toBe(false);
    });
  });

  describe('validateLesson', () => {
    it('should reject empty title', () => {
      const result = validateLesson({ title: '   ', startHour: 9, startMinute: 0, durationMinutes: 60 });
      expect(result).toBe('课程名称不能为空');
    });

    it('should reject title exceeding 50 characters', () => {
      const result = validateLesson({ title: 'a'.repeat(51), startHour: 9, startMinute: 0, durationMinutes: 60 });
      expect(result).toBe('课程名称不能超过50字');
    });

    it('should accept title with exactly 50 characters', () => {
      const result = validateLesson({ title: 'a'.repeat(50), startHour: 9, startMinute: 0, durationMinutes: 60 });
      expect(result).toBeNull();
    });

    it('should reject invalid start hour', () => {
      expect(validateLesson({ title: 'Test', startHour: -1, startMinute: 0, durationMinutes: 60 })).toBe('开始时间无效');
      expect(validateLesson({ title: 'Test', startHour: 24, startMinute: 0, durationMinutes: 60 })).toBe('开始时间无效');
    });

    it('should reject invalid start minute', () => {
      expect(validateLesson({ title: 'Test', startHour: 9, startMinute: 5, durationMinutes: 60 })).toBe('开始分钟只能为0、15、30、45');
      expect(validateLesson({ title: 'Test', startHour: 9, startMinute: 60, durationMinutes: 60 })).toBe('开始分钟只能为0、15、30、45');
    });

    it('should accept valid start minutes', () => {
      expect(validateLesson({ title: 'Test', startHour: 9, startMinute: 0, durationMinutes: 60 })).toBeNull();
      expect(validateLesson({ title: 'Test', startHour: 9, startMinute: 15, durationMinutes: 60 })).toBeNull();
      expect(validateLesson({ title: 'Test', startHour: 9, startMinute: 30, durationMinutes: 60 })).toBeNull();
      expect(validateLesson({ title: 'Test', startHour: 9, startMinute: 45, durationMinutes: 60 })).toBeNull();
    });

    it('should reject zero or negative duration', () => {
      expect(validateLesson({ title: 'Test', startHour: 9, startMinute: 0, durationMinutes: 0 })).toBe('时长必须在1分钟到8小时之间');
      expect(validateLesson({ title: 'Test', startHour: 9, startMinute: 0, durationMinutes: -10 })).toBe('时长必须在1分钟到8小时之间');
    });

    it('should reject duration over 8 hours', () => {
      expect(validateLesson({ title: 'Test', startHour: 9, startMinute: 0, durationMinutes: 481 })).toBe('时长必须在1分钟到8小时之间');
    });

    it('should accept duration at exactly 8 hours', () => {
      expect(validateLesson({ title: 'Test', startHour: 9, startMinute: 0, durationMinutes: 480 })).toBeNull();
    });

    it('should accept valid lesson data', () => {
      const result = validateLesson({ title: '数学课', startHour: 14, startMinute: 30, durationMinutes: 90 });
      expect(result).toBeNull();
    });
  });
});
