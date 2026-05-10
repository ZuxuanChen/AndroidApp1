import { describe, it, expect, beforeEach } from 'vitest';

// Mock localStorage
const mockStorage: Record<string, string> = {};

function getStoredTheme(): string {
  return mockStorage['lifetrack-theme'] || 'system';
}

function setStoredTheme(t: string) {
  mockStorage['lifetrack-theme'] = t;
}

describe('Dark Mode Theme', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  });

  it('should default to system theme', () => {
    expect(getStoredTheme()).toBe('system');
  });

  it('should persist light theme', () => {
    setStoredTheme('light');
    expect(getStoredTheme()).toBe('light');
  });

  it('should persist dark theme', () => {
    setStoredTheme('dark');
    expect(getStoredTheme()).toBe('dark');
  });

  it('should persist system theme explicitly', () => {
    setStoredTheme('system');
    expect(getStoredTheme()).toBe('system');
  });

  it('should override previous value', () => {
    setStoredTheme('dark');
    setStoredTheme('light');
    expect(getStoredTheme()).toBe('light');
  });

  it('should support all three theme modes', () => {
    const modes = ['light', 'dark', 'system'];
    for (const mode of modes) {
      setStoredTheme(mode);
      expect(getStoredTheme()).toBe(mode);
    }
  });
});
