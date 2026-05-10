import { describe, it, expect } from 'vitest';

const PRIORITY_BAR_COLORS: Record<string, string> = {
  P3: '#EF4444',
  P2: '#F59E0B',
  P1: '#9CA3AF',
};

function getPriorityBarColor(priority: string): string {
  return PRIORITY_BAR_COLORS[priority] || '#9CA3AF';
}

describe('Priority Color Bar', () => {
  it('should map P3 to red', () => {
    expect(getPriorityBarColor('P3')).toBe('#EF4444');
  });

  it('should map P2 to amber', () => {
    expect(getPriorityBarColor('P2')).toBe('#F59E0B');
  });

  it('should map P1 to gray', () => {
    expect(getPriorityBarColor('P1')).toBe('#9CA3AF');
  });

  it('should fallback to gray for unknown priority', () => {
    expect(getPriorityBarColor('P0')).toBe('#9CA3AF');
    expect(getPriorityBarColor('')).toBe('#9CA3AF');
    expect(getPriorityBarColor('unknown')).toBe('#9CA3AF');
  });

  it('should return valid hex colors', () => {
    const colors = Object.values(PRIORITY_BAR_COLORS);
    for (const color of colors) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('should have distinct colors for each priority', () => {
    expect(PRIORITY_BAR_COLORS.P3).not.toBe(PRIORITY_BAR_COLORS.P2);
    expect(PRIORITY_BAR_COLORS.P2).not.toBe(PRIORITY_BAR_COLORS.P1);
    expect(PRIORITY_BAR_COLORS.P3).not.toBe(PRIORITY_BAR_COLORS.P1);
  });
});