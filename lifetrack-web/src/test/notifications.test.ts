import { describe, it, expect, beforeEach } from 'vitest';
import {
  isNotificationsEnabled,
  setNotificationsEnabled,
  shouldNotifyTask,
  shouldNotifyLesson,
  formatTimeRemaining,
} from '../utils/notifications';

describe('Notifications', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('isNotificationsEnabled / setNotificationsEnabled', () => {
    it('should default to false', () => {
      expect(isNotificationsEnabled()).toBe(false);
    });

    it('should return true after enabling', () => {
      setNotificationsEnabled(true);
      expect(isNotificationsEnabled()).toBe(true);
    });

    it('should return false after disabling', () => {
      setNotificationsEnabled(true);
      setNotificationsEnabled(false);
      expect(isNotificationsEnabled()).toBe(false);
    });
  });

  describe('shouldNotifyTask', () => {
    it('should notify task due within 24h', () => {
      const now = new Date('2026-05-10T10:00:00');
      const task = { status: 'todo', dueDate: '2026-05-11T09:00:00', title: 'A' };
      expect(shouldNotifyTask(task, now)).toBe(true);
    });

    it('should not notify done tasks', () => {
      const now = new Date('2026-05-10T10:00:00');
      const task = { status: 'done', dueDate: '2026-05-11T09:00:00', title: 'A' };
      expect(shouldNotifyTask(task, now)).toBe(false);
    });

    it('should not notify tasks without dueDate', () => {
      const now = new Date('2026-05-10T10:00:00');
      const task = { status: 'todo', title: 'A' };
      expect(shouldNotifyTask(task, now)).toBe(false);
    });

    it('should not notify overdue tasks', () => {
      const now = new Date('2026-05-10T10:00:00');
      const task = { status: 'todo', dueDate: '2026-05-09T09:00:00', title: 'A' };
      expect(shouldNotifyTask(task, now)).toBe(false);
    });

    it('should not notify tasks due far in future', () => {
      const now = new Date('2026-05-10T10:00:00');
      const task = { status: 'todo', dueDate: '2026-05-15T09:00:00', title: 'A' };
      expect(shouldNotifyTask(task, now)).toBe(false);
    });
  });

  describe('shouldNotifyLesson', () => {
    it('should notify lesson starting within 15 minutes', () => {
      const now = new Date('2026-05-10T14:50:00'); // Sunday=0, but let's use a fixed day
      const lesson = { dayOfWeek: now.getDay(), startHour: 15, startMinute: 0, title: 'Math' };
      expect(shouldNotifyLesson(lesson, now)).toBe(true);
    });

    it('should not notify lesson on different day', () => {
      const now = new Date('2026-05-10T14:50:00');
      const lesson = { dayOfWeek: (now.getDay() + 1) % 7, startHour: 15, startMinute: 0, title: 'Math' };
      expect(shouldNotifyLesson(lesson, now)).toBe(false);
    });

    it('should not notify completed lesson', () => {
      const todayStr = '2026-05-10';
      const now = new Date(`${todayStr}T14:50:00`);
      const lesson = { dayOfWeek: now.getDay(), startHour: 15, startMinute: 0, title: 'Math', completedDates: [todayStr] };
      expect(shouldNotifyLesson(lesson, now)).toBe(false);
    });

    it('should not notify past lessons', () => {
      const now = new Date('2026-05-10T16:00:00');
      const lesson = { dayOfWeek: now.getDay(), startHour: 15, startMinute: 0, title: 'Math' };
      expect(shouldNotifyLesson(lesson, now)).toBe(false);
    });

    it('should not notify lessons starting too far in future', () => {
      const now = new Date('2026-05-10T14:00:00');
      const lesson = { dayOfWeek: now.getDay(), startHour: 15, startMinute: 30, title: 'Math' };
      expect(shouldNotifyLesson(lesson, now)).toBe(false);
    });
  });

  describe('formatTimeRemaining', () => {
    it('should format minutes', () => {
      expect(formatTimeRemaining(0.5)).toBe('30 分钟后');
    });

    it('should format hours', () => {
      expect(formatTimeRemaining(2)).toBe('2 小时后');
    });

    it('should format days', () => {
      expect(formatTimeRemaining(48)).toBe('2 天后');
    });
  });
});
