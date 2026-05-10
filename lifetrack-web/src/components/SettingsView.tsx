import { useState, useRef } from 'react';
import { db } from '../db';
import { ArrowLeft, Trash2, AlertTriangle, Settings, LayoutTemplate, Download, Upload, FileJson } from 'lucide-react';

const NAV_OPTIONS = [
  { value: 'task', label: '任务' },
  { value: 'habit', label: '习惯' },
  { value: 'goal', label: '目标' },
  { value: 'sleep', label: '睡眠' },
  { value: 'stats', label: '数据' },
  { value: 'schedule', label: '课程表' },
  { value: 'dashboard', label: '总览' },
  { value: 'settings', label: '设置' },
];

function getStoredNav(key: string, defaultValue: string): string {
  const val = localStorage.getItem(key);
  return NAV_OPTIONS.some(o => o.value === val) ? val! : defaultValue;
}

export default function SettingsView() {
  const [showConfirm1, setShowConfirm1] = useState(false);
  const [showConfirm2, setShowConfirm2] = useState(false);
  const [slot1, setSlot1] = useState(() => getStoredNav('lifetrack-nav-slot-1', 'task'));
  const [slot2, setSlot2] = useState(() => getStoredNav('lifetrack-nav-slot-2', 'schedule'));
  const [slot3, setSlot3] = useState(() => getStoredNav('lifetrack-nav-slot-3', 'dashboard'));
  const [slot4, setSlot4] = useState(() => getStoredNav('lifetrack-nav-slot-4', 'habit'));

  function handleNavChange(key: string, value: string) {
    localStorage.setItem(key, value);
    window.dispatchEvent(new CustomEvent('nav-config-changed'));
  }

  async function handleClear() {
    await db.delete();
    window.location.reload();
  }

  // ===== 数据导出/导入 =====
  const [showExportImport, setShowExportImport] = useState(false);

  async function exportData() {
    const data = {
      goals: await db.goals.toArray(),
      tasks: await db.tasks.toArray(),
      lessons: await db.lessons.toArray(),
      sleepRecords: await db.sleepRecords.toArray(),
      habits: await db.habits.toArray(),
      habitLogs: await db.habitLogs.toArray(),
      moodEntries: await db.moodEntries.toArray(),
      focusSessions: await db.focusSessions.toArray(),
      badgeUnlocks: await db.badgeUnlocks.toArray(),
      exportAt: new Date().toISOString(),
      version: 1,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifetrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<{
    goals: number; tasks: number; lessons: number; sleep: number;
    habits: number; logs: number; moods: number; focus: number; badges: number;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportError(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.version || !Array.isArray(data.goals)) {
        throw new Error('文件格式不正确，缺少必要字段');
      }
      setImportPreview({
        goals: data.goals.length,
        tasks: data.tasks?.length || 0,
        lessons: data.lessons?.length || 0,
        sleep: data.sleepRecords?.length || 0,
        habits: data.habits?.length || 0,
        logs: data.habitLogs?.length || 0,
        moods: data.moodEntries?.length || 0,
        focus: data.focusSessions?.length || 0,
        badges: data.badgeUnlocks?.length || 0,
      });
    } catch (err: any) {
      setImportError(err.message || '文件解析失败');
      setImportPreview(null);
    }
  }

  async function confirmImport() {
    if (!importFile) return;
    try {
      const text = await importFile.text();
      const data = JSON.parse(text);

      // Clear existing data
      await db.goals.clear();
      await db.tasks.clear();
      await db.lessons.clear();
      await db.sleepRecords.clear();
      await db.habits.clear();
      await db.habitLogs.clear();
      await db.moodEntries.clear();
      await db.focusSessions.clear();
      await db.badgeUnlocks.clear();

      // Import new data (strip auto-increment IDs to let Dexie reassign)
      const stripId = (arr: any[]) => arr.map((item: any) => {
        const { id, ...rest } = item;
        return rest;
      });

      if (data.goals?.length) await db.goals.bulkAdd(stripId(data.goals));
      if (data.tasks?.length) await db.tasks.bulkAdd(stripId(data.tasks));
      if (data.lessons?.length) await db.lessons.bulkAdd(stripId(data.lessons));
      if (data.sleepRecords?.length) await db.sleepRecords.bulkAdd(stripId(data.sleepRecords));
      if (data.habits?.length) await db.habits.bulkAdd(stripId(data.habits));
      if (data.habitLogs?.length) await db.habitLogs.bulkAdd(stripId(data.habitLogs));
      if (data.moodEntries?.length) await db.moodEntries.bulkAdd(stripId(data.moodEntries));
      if (data.focusSessions?.length) await db.focusSessions.bulkAdd(stripId(data.focusSessions));
      if (data.badgeUnlocks?.length) await db.badgeUnlocks.bulkAdd(stripId(data.badgeUnlocks));

      window.location.reload();
    } catch (err: any) {
      setImportError(err.message || '导入失败');
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 pt-3 pb-2 border-b border-gray-200 flex items-center gap-2">
        <button onClick={() => window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'dashboard' }))}
                className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold">设置</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Bottom Navigation Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <LayoutTemplate size={18} className="text-gray-500" />
            <h2 className="font-semibold text-gray-900">底部导航</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">位置 1（最左）</label>
              <select
                value={slot1}
                onChange={e => { setSlot1(e.target.value); handleNavChange('lifetrack-nav-slot-1', e.target.value); }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {NAV_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">位置 2（左中）</label>
              <select
                value={slot2}
                onChange={e => { setSlot2(e.target.value); handleNavChange('lifetrack-nav-slot-2', e.target.value); }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {NAV_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">位置 3（中间·大按钮）</label>
              <select
                value={slot3}
                onChange={e => { setSlot3(e.target.value); handleNavChange('lifetrack-nav-slot-3', e.target.value); }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {NAV_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">位置 4（右中）</label>
              <select
                value={slot4}
                onChange={e => { setSlot4(e.target.value); handleNavChange('lifetrack-nav-slot-4', e.target.value); }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {NAV_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Export/Import Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <FileJson size={18} className="text-blue-500" />
            <h2 className="font-semibold text-gray-900">数据备份</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={exportData}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium flex items-center justify-center gap-2"
            >
              <Download size={16} />
              导出所有数据（JSON）
            </button>

            <button
              onClick={() => setShowExportImport(!showExportImport)}
              className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              导入数据
            </button>

            {showExportImport && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 flex items-center justify-center gap-2"
                >
                  {importFile ? importFile.name : '选择 JSON 备份文件'}
                </button>

                {importError && (
                  <p className="text-xs text-red-600">{importError}</p>
                )}

                {importPreview && (
                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="font-medium text-gray-800">检测到以下数据：</p>
                    <div className="grid grid-cols-3 gap-2">
                      <span>目标: {importPreview.goals}</span>
                      <span>任务: {importPreview.tasks}</span>
                      <span>课程: {importPreview.lessons}</span>
                      <span>睡眠: {importPreview.sleep}</span>
                      <span>习惯: {importPreview.habits}</span>
                      <span>打卡: {importPreview.logs}</span>
                      <span>心情: {importPreview.moods}</span>
                      <span>专注: {importPreview.focus}</span>
                      <span>徽章: {importPreview.badges}</span>
                    </div>
                    <p className="text-red-600 mt-2">⚠️ 导入将覆盖现有全部数据，不可恢复！</p>
                    <button
                      onClick={() => setShowImportConfirm(true)}
                      className="w-full py-2 rounded-lg bg-orange-600 text-white text-sm font-medium mt-2"
                    >
                      确认导入
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Clear Data Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Settings size={18} className="text-gray-500" />
            <h2 className="font-semibold text-gray-900">开发调试</h2>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-red-500" />
              <span className="font-semibold text-red-700">清除所有数据</span>
            </div>
            <p className="text-sm text-red-600 mb-3">
              这将删除所有本地存储的课程、任务、目标、睡眠记录、习惯打卡、心情记录等数据。操作不可恢复！
            </p>
            <button
              onClick={() => setShowConfirm1(true)}
              className="w-full py-2.5 rounded-xl bg-red-600 text-white font-medium flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              清除所有数据
            </button>
          </div>
        </div>
      </div>

      {/* Step 1 Confirm */}
      {showConfirm1 && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
             onClick={() => setShowConfirm1(false)}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={24} className="text-red-500" />
              <h2 className="text-lg font-bold">确定清除？</h2>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              确定要清除所有数据吗？课程、任务、目标、睡眠记录、习惯打卡、心情记录等将全部删除，<strong className="text-red-600">此操作不可恢复！</strong>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm1(false)}
                      className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium">
                取消
              </button>
              <button onClick={() => { setShowConfirm1(false); setShowConfirm2(true); }}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium">
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 Confirm */}
      {showConfirm2 && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
             onClick={() => setShowConfirm2(false)}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={24} className="text-red-500" />
              <h2 className="text-lg font-bold">再次确认</h2>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              所有本地数据将被<strong className="text-red-600">永久删除</strong>，无法恢复！确定要继续吗？
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm2(false)}
                      className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium">
                取消
              </button>
              <button onClick={handleClear}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Confirm */}
      {showImportConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
             onClick={() => setShowImportConfirm(false)}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={24} className="text-orange-500" />
              <h2 className="text-lg font-bold">确认导入？</h2>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              导入将<strong className="text-orange-600">覆盖所有现有数据</strong>。当前数据将被替换为备份文件中的内容，此操作不可恢复。
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowImportConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium">
                取消
              </button>
              <button onClick={confirmImport}
                      className="flex-1 py-2.5 rounded-xl bg-orange-600 text-white font-medium">
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
