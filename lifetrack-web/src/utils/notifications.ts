const NOTIFICATION_KEY = 'lifetrack-notifications-enabled';

export function isNotificationsEnabled(): boolean {
  return localStorage.getItem(NOTIFICATION_KEY) === 'true';
}

export function setNotificationsEnabled(enabled: boolean) {
  localStorage.setItem(NOTIFICATION_KEY, String(enabled));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  const result = await Notification.requestPermission();
  const granted = result === 'granted';
  if (granted) setNotificationsEnabled(true);
  return granted;
}

export function sendNotification(title: string, body: string) {
  if (!isNotificationsEnabled()) return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/favicon.ico' });
  } catch {
    // Ignore notification errors
  }
}

export interface TaskLike {
  status: string;
  dueDate?: string;
  title: string;
}

export interface LessonLike {
  dayOfWeek: number;
  startHour: number;
  startMinute: number;
  title: string;
  completedDates?: string[];
}

/**
 * Check if a task should be notified (due within 24h and not done)
 */
export function shouldNotifyTask(task: TaskLike, now: Date = new Date()): boolean {
  if (task.status === 'done') return false;
  if (!task.dueDate) return false;
  const due = new Date(task.dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= 24;
}

/**
 * Check if a lesson should be notified (starting within 15 minutes today)
 */
export function shouldNotifyLesson(lesson: LessonLike, now: Date = new Date()): boolean {
  const todayStr = now.toISOString().split('T')[0];
  if (lesson.completedDates?.includes(todayStr)) return false;
  if (lesson.dayOfWeek !== now.getDay()) return false;
  const lessonMin = lesson.startHour * 60 + lesson.startMinute;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const diffMin = lessonMin - nowMin;
  return diffMin > 0 && diffMin <= 15;
}

export function formatTimeRemaining(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} 分钟后`;
  if (hours < 24) return `${Math.round(hours)} 小时后`;
  return `${Math.round(hours / 24)} 天后`;
}
