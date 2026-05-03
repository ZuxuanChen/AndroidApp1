# LifeTrack — 个人时间管理与追踪

一个纯本地存储的个人效率管理应用，包含 Web App 和 Android App 两个版本。无需登录、无需服务器，数据完全保存在设备本地。

> 本项目由「家教排课软件」转型而来，从面向机构的多端同步工具，简化为专注个人使用的本地化应用。

---

## 项目结构

```
.
├── lifetrack-web/           ← Web App（推荐主力使用）
│   ├── src/
│   │   ├── db.ts            # Dexie.js 本地数据库
│   │   ├── App.tsx          # 主应用
│   │   └── components/      # 页面组件
│   └── README.md
│
├── tutor-schedule/          ← Android App（原生体验备选）
│   ├── app/                 # 应用入口
│   ├── core/                # 业务逻辑层
│   ├── feature/schedule/    # 排课功能
│   └── ...
│
└── 家教排课软件_架构设计书.md
```

---

## 功能一览

| 功能 | Web App | Android |
|------|---------|---------|
| 📊 总览 Dashboard（今日工作量 / 日程 / 任务 / 目标 / 睡眠） | ✅ | ❌ |
| 📅 课程表（周视图 + 拖拽排课） | ✅ | ✅ |
| ✅ 任务追踪（单次/多次 + 优先级 + 完成状态） | ✅ | ❌ |
| 🎯 目标管理（进度统计） | ✅ | ❌ |
| 🌙 睡眠记录（时长 + 质量评分） | ✅ | ❌ |
| 📱 PWA（离线使用 / 添加到主屏幕） | ✅ | — |

> **推荐**：日常使用以 Web App 为主，功能最全、跨平台、无需安装。Android 版保留作为原生体验备选。

---

## 快速开始

### 启动 Web App（推荐）

```bash
cd lifetrack-web
npm install
npm run dev
```

浏览器访问 http://localhost:5173/

手机同 WiFi 下可访问局域网地址（控制台会显示）。

### 启动 Android App

```bash
# 用 Android Studio 打开 tutor-schedule/ 目录
# Sync Gradle → 运行 :app 模块
```

---

## 核心交互

| 操作 | 方式 |
|------|------|
| 把任务排进课程表 | 课程表页 → 展开「任务」面板 → **拖拽**任务到日程格子 |
| 调整课程时间 | **拖拽**课程卡片到新的日期/时间段（30分钟对齐） |
| 标记任务完成 | 课程表上点击「✓」按钮，或任务页点击状态圆环 |
| 单次 vs 多次任务 | 单次任务安排后从面板隐藏；多次任务可反复安排 |
| 离线使用 | PWA 添加到主屏幕后，无网络也能正常使用 |

---

## 技术栈

| | Web App | Android |
|--|---------|---------|
| 框架 | React 19 + TypeScript + Vite | Kotlin + Jetpack Compose |
| 样式 | Tailwind CSS | Material Design 3 |
| 本地存储 | Dexie.js (IndexedDB) | Room (SQLite) |
| 图标 | Lucide React | Material Icons |

---

## 部署 Web App 到线上

```bash
cd lifetrack-web
npm run build
```

将 `dist/` 目录上传到任意静态托管服务：
- [Vercel](https://vercel.com)（推荐）
- [Netlify](https://netlify.com)
- [GitHub Pages](https://pages.github.com)

手机访问后，浏览器菜单选择「添加到主屏幕」，即可像原生 App 一样使用。

---

## 数据说明

- **不上传任何数据到服务器**
- **无需注册/登录**
- 数据保存在浏览器 IndexedDB（Web）或 SQLite（Android）中
- 换设备或清除浏览器数据会丢失（后续可添加 JSON 导出/导入功能）
