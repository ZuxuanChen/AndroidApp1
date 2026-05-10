import { describe, it, expect } from 'vitest';

function groupIntoWeeks(days: { date: string }[]): { date: string }[][] {
  const weeks: { date: string }[][] = [];
  let currentWeek: { date: string }[] = [];
  for (const day of days) {
    const dow = new Date(day.date + 'T00:00:00').getDay();
    const mondayBased = dow === 0 ? 6 : dow - 1;
    if (mondayBased === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);
  return weeks;
}

function getIntensity(logs: string[], date: string): string {
  const idx = logs.indexOf(date);
  if (idx === -1) return '00';
  let consecutive = 1;
  for (let i = idx - 1; i >= 0; i--) {
    const prev = new Date(logs[i] + 'T00:00:00');
    const curr = new Date(logs[i + 1] + 'T00:00:00');
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) consecutive++;
    else break;
  }
  if (consecutive >= 7) return 'FF';
  if (consecutive >= 5) return 'CC';
  if (consecutive >= 3) return '99';
  if (consecutive >= 2) return '66';
  return '44';
}

describe('Habit Heatmap Logic', () => {
  describe('week grouping', () => {
    it('should group consecutive days by week starting Monday', () => {
      const days = [
        { date: '2026-05-04' }, // Mon
        { date: '2026-05-05' }, // Tue
        { date: '2026-05-06' }, // Wed
        { date: '2026-05-07' }, // Thu
        { date: '2026-05-08' }, // Fri
        { date: '2026-05-09' }, // Sat
        { date: '2026-05-10' }, // Sun
        { date: '2026-05-11' }, // Mon (new week)
      ];
      const weeks = groupIntoWeeks(days);
      expect(weeks.length).toBe(2);
      expect(weeks[0].length).toBe(7);
      expect(weeks[1].length).toBe(1);
      expect(weeks[1][0].date).toBe('2026-05-11');
    });

    it('should handle a single day', () => {
      const weeks = groupIntoWeeks([{ date: '2026-05-10' }]);
      expect(weeks.length).toBe(1);
      expect(weeks[0].length).toBe(1);
    });

    it('should handle empty input', () => {
      const weeks = groupIntoWeeks([]);
      expect(weeks.length).toBe(0);
    });

    it('should split on Monday boundary correctly', () => {
      const days = [
        { date: '2026-05-10' }, // Sunday
        { date: '2026-05-11' }, // Monday
      ];
      const weeks = groupIntoWeeks(days);
      expect(weeks.length).toBe(2);
      expect(weeks[0][0].date).toBe('2026-05-10');
      expect(weeks[1][0].date).toBe('2026-05-11');
    });
  });

  describe('intensity calculation', () => {
    it('should return 00 for non-logged date', () => {
      expect(getIntensity(['2026-05-01', '2026-05-02'], '2026-05-03')).toBe('00');
    });

    it('should return 44 for single day', () => {
      expect(getIntensity(['2026-05-01'], '2026-05-01')).toBe('44');
    });

    it('should return 66 for 2-day streak', () => {
      expect(getIntensity(['2026-05-01', '2026-05-02'], '2026-05-02')).toBe('66');
    });

    it('should return 99 for 3-day streak', () => {
      expect(getIntensity(['2026-05-01', '2026-05-02', '2026-05-03'], '2026-05-03')).toBe('99');
    });

    it('should return CC for 5-day streak', () => {
      const logs = Array.from({ length: 5 }, (_, i) => `2026-05-0${i + 1}`);
      expect(getIntensity(logs, '2026-05-05')).toBe('CC');
    });

    it('should return FF for 7-day streak', () => {
      const logs = Array.from({ length: 7 }, (_, i) => `2026-05-0${i + 1}`);
      expect(getIntensity(logs, '2026-05-07')).toBe('FF');
    });

    it('should break streak on gap', () => {
      expect(getIntensity(['2026-05-01', '2026-05-03'], '2026-05-03')).toBe('44');
    });

    it('should calculate intensity for middle of streak', () => {
      const logs = Array.from({ length: 5 }, (_, i) => `2026-05-0${i + 1}`);
      expect(getIntensity(logs, '2026-05-03')).toBe('99');
    });
  });
});
