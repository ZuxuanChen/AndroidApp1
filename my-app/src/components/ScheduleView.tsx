import { useState, useEffect, useMemo } from 'react';
import { db, type Lesson } from '../db';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const START_HOUR = 7;
const END_HOUR = 23;
const SLOT_HEIGHT = 48; // pixels per 30min slot

const COLORS = [
  '#4A6FA5', '#FF6B6B', '#34C759', '#FF9500', '#AF52DE',
  '#5856D6', '#FF2D55', '#5AC8FA', '#FFCC00', '#8E8E93'
];

export default function ScheduleView() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const [title, setTitle] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [duration, setDuration] = useState(60);
  const [color, setColor] = useState(COLORS[0]);
  const [location, setLocation] = useState('');

  useEffect(() => {
    loadLessons();
  }, []);

  async function loadLessons() {
    const all = await db.lessons.toArray();
    setLessons(all);
  }

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      slots.push(`${h}:00`);
      slots.push(`${h}:30`);
    }
    return slots;
  }, []);

  const weekDates = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay + weekOffset * 7);
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [weekOffset]);

  function openForm(lesson?: Lesson) {
    if (lesson) {
      setEditing(lesson);
      setTitle(lesson.title);
      setDayOfWeek(lesson.dayOfWeek);
      setStartHour(lesson.startHour);
      setStartMinute(lesson.startMinute);
      setDuration(lesson.durationMinutes);
      setColor(lesson.color);
      setLocation(lesson.location || '');
    } else {
      setEditing(null);
      setTitle('');
      setDayOfWeek(1);
      setStartHour(9);
      setStartMinute(0);
      setDuration(60);
      setColor(COLORS[0]);
      setLocation('');
    }
    setShowForm(true);
  }

  async function saveLesson() {
    const data: Lesson = {
      id: editing?.id,
      title: title.trim() || '未命名',
      dayOfWeek,
      startHour,
      startMinute,
      durationMinutes: duration,
      color,
      location: location.trim() || undefined,
    };
    if (editing?.id) {
      await db.lessons.update(editing.id, data);
    } else {
      await db.lessons.add(data);
    }
    setShowForm(false);
    loadLessons();
  }

  async function deleteLesson() {
    if (editing?.id && confirm('确定删除这门课吗？')) {
      await db.lessons.delete(editing.id);
      setShowForm(false);
      loadLessons();
    }
  }

  function getLessonStyle(lesson: Lesson) {
    const slotIndex = (lesson.startHour - START_HOUR) * 2 + (lesson.startMinute >= 30 ? 1 : 0);
    const top = slotIndex * SLOT_HEIGHT;
    const height = (lesson.durationMinutes / 30) * SLOT_HEIGHT;
    return { top, height };
  }

  const isToday = (date: Date) => {
    const t = new Date();
    return date.getFullYear() === t.getFullYear() &&
           date.getMonth() === t.getMonth() &&
           date.getDate() === t.getDate();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 pt-3 pb-2 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold">课程表</h1>
          <button onClick={() => openForm()} className="bg-blue-600 text-white p-2 rounded-full shadow-sm">
            <Plus size={18} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <button onClick={() => setWeekOffset(w => w - 1)} className="p-1 text-gray-500">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600">
            {weekDates[0].getMonth() + 1}月{weekDates[0].getDate()}日 -
            {weekDates[6].getMonth() + 1}月{weekDates[6].getDate()}日
          </span>
          <button onClick={() => setWeekOffset(w => w + 1)} className="p-1 text-gray-500">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="flex bg-white border-b border-gray-200">
        <div className="w-12 shrink-0" />
        {DAYS.map((day, i) => (
          <div key={day} className={`flex-1 text-center py-2 text-xs ${isToday(weekDates[i]) ? 'bg-blue-50' : ''}`}>
            <div className="text-gray-500">{day}</div>
            <div className={`font-semibold ${isToday(weekDates[i]) ? 'text-blue-600' : 'text-gray-800'}`}>
              {weekDates[i].getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative bg-white">
        <div className="flex min-h-max">
          {/* Time labels */}
          <div className="w-12 shrink-0 border-r border-gray-100 bg-gray-50">
            {timeSlots.map((slot, i) => (
              <div key={i} className="text-[10px] text-gray-400 text-right pr-1 flex items-start justify-end"
                   style={{ height: SLOT_HEIGHT }}>
                {slot.endsWith(':00') ? slot : ''}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS.map((_, dayIdx) => (
            <div key={dayIdx} className="flex-1 relative border-r border-gray-100 last:border-r-0"
                 style={{ height: timeSlots.length * SLOT_HEIGHT }}>
              {/* Grid lines */}
              {timeSlots.map((_, i) => (
                <div key={i} className="border-b border-gray-50"
                     style={{ height: SLOT_HEIGHT }} />
              ))}
              {/* Lessons */}
              {lessons.filter(l => l.dayOfWeek === dayIdx).map(lesson => {
                const style = getLessonStyle(lesson);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => openForm(lesson)}
                    className="absolute left-0.5 right-0.5 rounded-lg px-1.5 py-1 text-left text-xs text-white overflow-hidden shadow-sm"
                    style={{
                      top: style.top,
                      height: style.height - 2,
                      backgroundColor: lesson.color,
                    }}
                  >
                    <div className="font-semibold truncate">{lesson.title}</div>
                    {style.height > 30 && lesson.location && (
                      <div className="truncate opacity-80">{lesson.location}</div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
             onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-xl"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editing ? '编辑课程' : '添加课程'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-sm text-gray-500">课程名称</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                       className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="text-sm text-gray-500">星期</label>
                <select value={dayOfWeek} onChange={e => setDayOfWeek(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm text-gray-500">开始时间</label>
                  <div className="flex gap-2 mt-1">
                    <select value={startHour} onChange={e => setStartHour(Number(e.target.value))}
                            className="flex-1 px-2 py-2 border border-gray-300 rounded-lg">
                      {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i}:00</option>)}
                    </select>
                    <select value={startMinute} onChange={e => setStartMinute(Number(e.target.value))}
                            className="flex-1 px-2 py-2 border border-gray-300 rounded-lg">
                      <option value={0}>00</option>
                      <option value={30}>30</option>
                    </select>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-500">时长(分钟)</label>
                  <select value={duration} onChange={e => setDuration(Number(e.target.value))}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg">
                    {[30, 45, 60, 90, 120, 150, 180].map(m =>
                      <option key={m} value={m}>{m}分钟</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">地点</label>
                <input value={location} onChange={e => setLocation(e.target.value)}
                       placeholder="可选"
                       className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="text-sm text-gray-500">颜色</label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              {editing && (
                <button onClick={deleteLesson}
                        className="px-4 py-2.5 rounded-xl text-red-600 bg-red-50 font-medium">
                  删除
                </button>
              )}
              <button onClick={saveLesson}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
