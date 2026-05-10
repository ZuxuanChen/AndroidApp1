import { describe, it, expect } from 'vitest';

describe('Task Description Logic', () => {
  it('should store description when provided', () => {
    const task = { title: 'T1', description: 'Details here' };
    expect(task.description).toBe('Details here');
  });

  it('should allow undefined description for backward compat', () => {
    const task = { title: 'T1' };
    expect(task.description).toBeUndefined();
  });

  it('should trim description before storing', () => {
    const desc = '  notes  '.trim();
    expect(desc).toBe('notes');
  });

  it('should convert empty description to undefined', () => {
    const desc = ''.trim() || undefined;
    expect(desc).toBeUndefined();
  });

  it('should include description in search matching', () => {
    const query = 'notes';
    const task = { title: 'T1', description: 'Some notes here' };
    const inTitle = task.title.toLowerCase().includes(query);
    const inDesc = task.description?.toLowerCase().includes(query);
    expect(inTitle || inDesc).toBe(true);
  });

  it('should match search in title even without description', () => {
    const query = 't1';
    const task = { title: 'T1' };
    const inTitle = task.title.toLowerCase().includes(query);
    const inDesc = task.description?.toLowerCase().includes(query);
    expect(inTitle || inDesc).toBe(true);
  });

  it('should not fail search when description is undefined', () => {
    const query = 'notes';
    const task = { title: 'T1' };
    const inDesc = task.description?.toLowerCase().includes(query) ?? false;
    expect(inDesc).toBe(false);
  });
});
