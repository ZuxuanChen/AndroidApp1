# LifeTrack Changelog

## v0.4.2 — StatsView 除零保护
- **Bugfix**: 修复 `StatsView` 中计算平均专注分钟时的除零隐患
  - 条件从 `thisWeekFocus.length > 0` 改为 `focusSessions.length > 0`
  - 防止 `focusSessions` 为空时显示 `NaN`

## v0.4.1 — 目标进度可视化
- **Enhancement**: `GoalView` 每个目标卡片显示关联任务的进度条
  - 自动计算总任务数与已完成数
  - 显示百分比（0-100%），100% 时进度条变为绿色
  - 显示「进度 X/Y」文字

## v0.4.0 — 全局稳定性 + 快捷键
- **Stability**: 新增全局 `ErrorBoundary` 组件
  - 崩溃时显示友好错误界面（含错误信息、刷新按钮、清除数据并刷新按钮）
  - 整个 App 被包裹在 ErrorBoundary 内，防止局部错误导致白屏
- **UX**: 新增键盘快捷键 `Ctrl+1~8` 切换 8 个标签页
  - 1=仪表盘, 2=课程表, 3=任务, 4=目标, 5=睡眠, 6=习惯, 7=统计, 8=设置

## v0.3.0 — 任务截止日期系统
- **Feature**: Task 模型新增 `dueDate`（截止日期）字段
- **UX**: `TaskView` 表单增加截止日期选择器
  - 过期未完成的任务自动飘红警告
  - 任务卡片显示日期徽章（🔴过期 / 🟠今天 / 🔵未来）
- **UX**: 新增「已过期」筛选器，仅显示逾期未完成任务
- **UX**: 新增「截止日期 ↑」排序，按即将到来的截止日期排序
- **UX**: `DashboardView` 顶部新增过期任务数量告警横幅，一键跳转处理

## v0.2.0 — 数据备份 + 稳定性基石
- **Feature**: `SettingsView` 新增数据导出/导入功能
  - 导出：JSON 备份文件，文件名带日期 `lifetrack-backup-YYYY-MM-DD.json`
  - 导入：文件选择 → 数量预览 → 二次确认 → 清除旧数据 → 批量写入
  - 自动去除 `id` 字段防止主键冲突
- **Bugfix**: 修复 `PomodoroTimer.tsx:139` 使用旧字段 `completedAt` 的问题
  - 改为使用 `completedDates` 数组，支持按日期追踪完成状态
  - 添加日期去重逻辑，避免同一天多次完成重复记录
- **Feature**: `ScheduleView` 新增课程时间重叠检测
  - 自动检测新课程与现有课程的时间冲突
  - 显示冲突详情，用户确认后允许覆盖
- **Feature**: `ScheduleView` 新增表单输入校验
  - 空标题拦截
  - 开始时间 ≥ 结束时间拦截
  - 单次课程时长超过 12 小时警告
- **Feature**: `HabitView` 新增连续打卡天数统计
  - 今日完成显示 🔥 N 天连续
  - 从今日倒推计算 streak，支持昨天断开后归零
- **Feature**: `SleepView` 新增 7 天睡眠趋势折线图
  - SVG 绘制，自动处理跨午夜睡眠
- **UX**: `TaskView` 新增任务标题校验
  - 空标题拦截
  - 60 字长度上限
- **Infrastructure**: 搭建 vitest + @testing-library 测试框架
  - 43 个测试全部通过

---

**总计: 67 tests passing | TypeScript zero errors**
