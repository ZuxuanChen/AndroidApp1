import { describe, it, expect } from 'vitest';

interface MockMoodEntry {
  date: string;
  emoji: string;
}

function getRecentMoodEntries(entries: MockMoodEntry[], limit: number = 7) {
  return entries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

function getMoodDistribution(entries: MockMoodEntry[]) {
  const map = new Map<string, number>();
  entries.forEach(e => { map.set(e.emoji, (map.get(e.emoji) || 0) + 1); });
  return map;
}

function getMoodTrend(entries: MockMoodEntry[]): 'up' | 'down' | 'same' | null {
  if (entries.length < 2) return null;
  const score: Record<string, number> = { '😊': 5, '🙂': 4, '😐': 3, '😟': 2, '😫': 1 };
  const diff = (score[entries[0].emoji] || 3) - (score[entries[1].emoji] || 3);
  if (diff > 0) return 'up';
  if (diff < 0) return 'down';
  return 'same';
}

describe('Mood Trend', () => {
  describe('getRecentMoodEntries', () => {
    it('should return entries sorted by date desc', () => {
      const entries: MockMoodEntry[] = [
        { date: '2026-05-08', emoji: '😊' },
        { date: '2026-05-10', emoji: '😐' },
        { date: '2026-05-09', emoji: '🙂' },
      ];
      const result = getRecentMoodEntries(entries);
      expect(result[0].date).toBe('2026-05-10');
      expect(result[1].date).toBe('2026-05-09');
      expect(result[2].date).toBe('2026-05-08');
    });

    it('should limit to 7 entries', () => {
      const entries: MockMoodEntry[] = Array.from({ length: 10 }, (_, i) => ({
        date: `2026-05-${String(i + 1).padStart(2, '0')}`,
        emoji: '😊',
      }));
      const result = getRecentMoodEntries(entries);
      expect(result).toHaveLength(7);
    });

    it('should handle empty array', () => {
      const result = getRecentMoodEntries([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getMoodDistribution', () => {
    it('should count emoji frequencies', () => {
      const entries: MockMoodEntry[] = [
        { date: '2026-05-10', emoji: '😊' },
        { date: '2026-05-09', emoji: '😊' },
        { date: '2026-05-08', emoji: '😐' },
      ];
      const dist = getMoodDistribution(entries);
      expect(dist.get('😊')).toBe(2);
      expect(dist.get('😐')).toBe(1);
    });

    it('should return empty map for empty array', () => {
      const dist = getMoodDistribution([]);
      expect(dist.size).toBe(0);
    });
  });

  describe('getMoodTrend', () => {
    it('should detect upward trend', () => {
      const entries: MockMoodEntry[] = [
        { date: '2026-05-10', emoji: '😊' },
        { date: '2026-05-09', emoji: '😐' },
      ];
      expect(getMoodTrend(entries)).toBe('up');
    });

    it('should detect downward trend', () => {
      const entries: MockMoodEntry[] = [
        { date: '2026-05-10', emoji: '😟' },
        { date: '2026-05-09', emoji: '😊' },
      ];
      expect(getMoodTrend(entries)).toBe('down');
    });

    it('should detect same trend', () => {
      const entries: MockMoodEntry[] = [
        { date: '2026-05-10', emoji: '😊' },
        { date: '2026-05-09', emoji: '😊' },
      ];
      expect(getMoodTrend(entries)).toBe('same');
    });

    it('should return null for single entry', () => {
      const entries: MockMoodEntry[] = [{ date: '2026-05-10', emoji: '😊' }];
      expect(getMoodTrend(entries)).toBeNull();
    });

    it('should return null for empty array', () => {
      expect(getMoodTrend([])).toBeNull();
    });

    it('should handle unknown emojis with default score', () => {
      const entries: MockMoodEntry[] = [
        { date: '2026-05-10', emoji: '🎉' },
        { date: '2026-05-09', emoji: '😫' },
      ];
      // unknown emoji defaults to 3, 😫 is 1, diff = +2
      expect(getMoodTrend(entries)).toBe('up');
    });
  });
});
