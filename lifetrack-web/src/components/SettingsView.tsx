import { useState } from 'react';
import { db } from '../db';
import { ArrowLeft, Trash2, AlertTriangle, Settings, LayoutTemplate } from 'lucide-react';

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
    </div>
  );
}
