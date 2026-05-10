import { describe, it, expect } from 'vitest';

// Test error boundary fallback UI logic
function getFallbackContent(error: Error | null): string {
  if (!error) return '正常';
  return `错误: ${error.message}`;
}

describe('ErrorBoundary', () => {
  it('should return normal when no error', () => {
    expect(getFallbackContent(null)).toBe('正常');
  });

  it('should include error message in fallback', () => {
    const error = new Error('Test error message');
    expect(getFallbackContent(error)).toContain('Test error message');
  });
});

// Test keyboard shortcut mapping
const TAB_ORDER = ['dashboard', 'schedule', 'task', 'goal', 'sleep', 'habit', 'stats', 'settings'];

function getTabFromShortcut(key: string, ctrlKey: boolean): string | null {
  if (!ctrlKey) return null;
  const num = parseInt(key, 10);
  if (num >= 1 && num <= TAB_ORDER.length) {
    return TAB_ORDER[num - 1];
  }
  return null;
}

describe('Keyboard shortcuts', () => {
  it('should map Ctrl+1 to dashboard', () => {
    expect(getTabFromShortcut('1', true)).toBe('dashboard');
  });

  it('should map Ctrl+8 to settings', () => {
    expect(getTabFromShortcut('8', true)).toBe('settings');
  });

  it('should return null without ctrl key', () => {
    expect(getTabFromShortcut('1', false)).toBeNull();
  });

  it('should return null for invalid numbers', () => {
    expect(getTabFromShortcut('9', true)).toBeNull();
    expect(getTabFromShortcut('0', true)).toBeNull();
  });

  it('should return null for non-numeric keys', () => {
    expect(getTabFromShortcut('a', true)).toBeNull();
    expect(getTabFromShortcut('Enter', true)).toBeNull();
  });
});
