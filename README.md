<p align="center">
  <img src="https://img.shields.io/badge/📚-文言文背诵助手-8B5CF6?style=flat" alt="文言文背诵助手" />
</p>

<h3 align="center">基于认知科学理论的文言文辅助记忆工具</h3>

<p align="center">
  用测试效应和生成效应，让古文背诵不再痛苦
</p>

<p align="center">
  <a href="https://recitation-tool.pages.dev/">
    <img src="https://img.shields.io/badge/🌐_在线体验-recitation--tool.pages.dev-4F46E5?style=flat" alt="在线体验" />
  </a>
  &nbsp;
  <a href="https://github.com/Icather/recitation-tool">
    <img src="https://img.shields.io/github/stars/Icather/recitation-tool?style=flat&color=f59e0b" alt="GitHub Stars" />
  </a>
  &nbsp;
  <a href="LICENSE.txt">
    <img src="https://img.shields.io/badge/license-AGPL--3.0-22c55e?style=flat" alt="License" />
  </a>
  &nbsp;
  <img src="https://img.shields.io/badge/依赖-零依赖_纯前端-06b6d4?style=flat" alt="零依赖" />
</p>

<p align="center">
  <a href="https://recitation-tool.pages.dev/">🌐 在线体验</a> ·
  <a href="#-功能亮点">✨ 功能亮点</a> ·
  <a href="#-科学原理">🔬 科学原理</a> ·
  <a href="#-快速开始">🚀 快速开始</a> ·
  <a href="#-使用指南">📖 使用指南</a>
</p>

---

文言文背诵助手是一个面向中学生和文言文爱好者的**在线背诵练习工具**。不需要下载、不需要注册，打开浏览器即用。通过科学设计的**挖空练习 + 智能复习**双模式，运用认知心理学中的测试效应与生成效应，帮你把古文从"看过"变成"记住"。

🌐 立即使用：**[recitation-tool.pages.dev](https://recitation-tool.pages.dev/)**

## ✨ 功能亮点

### 🎯 双模式学习系统

从"看懂"到"默写"，两种模式覆盖完整的记忆链路：

| 模式 | 适用场景 | 核心能力 |
|:---:|:---|:---|
| **背诵模式** | 新篇目学习、逐步加深记忆 | 自定义挖空策略，编辑/背诵视图一键切换 |
| **复习模式** | 考前突击、查漏补缺 | 随机抽题、模拟默写、生疏句标记追踪 |

### 📝 三种挖空策略 — 难度自由调节

- **常规间隔** — 按固定间隔挖空，可调节间隔字数和起始位置，循序渐进
- **随机挖空** — Fisher-Yates 洗牌算法随机选位，确保分布均匀，防止"位置记忆"
- **句首字模式** — 仅保留每句第一个字，适合熟练阶段的终极自测

### 📚 内置篇目库 — 开箱即用

- 上海高考语文全部必背文言文篇目
- 《劝学》《师说》《赤壁赋》《岳阳楼记》《出师表》《陈情表》等经典全覆盖
- 按册次分类，快速定位目标篇目
- 支持**自定义输入**任意文本，不限于预设内容

### 📖 生疏本 — 你的薄弱环节追踪器

在复习过程中遇到不熟的句子？一键标记到生疏本：

- 🔖 标记生疏句子，按篇目分类管理
- 📊 熟悉度追踪条，直观显示掌握进度
- 💾 `localStorage` 持久化存储，关掉浏览器也不丢数据

### 🎨 体验细节

- ✅ **响应式设计** — 桌面端、平板、手机完美适配
- ✅ **键盘快捷键** — `Ctrl/Cmd + Enter` 快速处理文本
- ✅ **可隐藏信息** — 篇目名 / 作者 / 朝代可独立隐藏，增加挑战性
- ✅ **现代 UI** — 简洁优雅的界面设计，专注学习体验

---

## 🔬 科学原理

本工具的每一个设计决策都有认知心理学研究支撑：

### 测试效应 (Testing Effect)

主动回忆比被动重读更能强化长期记忆。挖空练习的本质就是让你"主动想起来"。

> *"经过测试练习的学生在一周后的记忆保持率显著高于仅进行重复阅读的学生。"*
> — Roediger & Karpicke (2006), *Psychological Science*

### 生成效应 (Generation Effect)

自己"填"出来的答案，比直接"看"到的记得更牢。

> *"自主生成的信息比被动接收的信息具有更好的记忆效果。"*
> — Slamecka & Graf (1978), *Journal of Experimental Psychology*

### 合意困难 (Desirable Difficulties)

适当增加学习难度，反而能增强长期记忆——这就是为什么我们提供多种难度的挖空策略。

> *"学习条件中的某些困难，虽然会降低即时表现，但却能增强长期保持和迁移。"*
> — Bjork, R. A. (1994)

---

## 🚀 快速开始

### 在线使用（推荐）

无需安装，打开浏览器直接使用：

👉 **[recitation-tool.pages.dev](https://recitation-tool.pages.dev/)**

### 本地运行

这是一个**纯前端项目**，零依赖，克隆即用：

```bash
# 克隆仓库
git clone https://github.com/Icather/recitation-tool.git

# 进入项目目录
cd recitation-tool

# 方式一：使用任意 HTTP 服务器
npx serve .

# 方式二：直接用浏览器打开 index.html
```

---

## 📖 使用指南

### 背诵模式

1. **选择篇目** — 从左侧篇目列表点击选择，或在编辑区直接输入文言文
2. **设置挖空策略** — 工具栏选择常规 / 随机 / 句首字模式，调节参数
3. **切换到背诵视图** — 点击 "背诵" 按钮，或按 `Ctrl/Cmd + Enter`
4. **开始背诵** — 看着挖空后的文本，尝试回忆被隐藏的内容

### 复习模式

1. **勾选篇目** — 在左侧勾选需要复习的一个或多个篇目
2. **生成题目** — 点击 "生成新题目" 按钮
3. **作答** — 系统随机抽取句子进行挖空测试，点击卡片查看答案
4. **标记生疏** — 不熟悉的句子点击 ❤️ 标记到生疏本，下次重点复习

---

## 🛠️ 技术实现

| 技术 | 用途 |
|:---|:---|
| HTML5 | 语义化页面结构 |
| CSS3 | 响应式布局 + 动画效果 |
| JavaScript (ES6+) | 核心逻辑，原生实现，零框架依赖 |
| Cloudflare Pages | 静态站点托管与 CDN 加速 |

### 项目结构

```
recitation-tool/
├── index.html              # 主应用页面
├── intro.html              # 项目介绍页面
├── style.css               # 主应用样式
├── intro.css               # 介绍页面样式
├── script.js               # 主应用逻辑（挖空算法、复习系统）
├── intro.js                # 介绍页面交互脚本
├── classic_texts_final.js  # 文言文预设内容数据库
├── CNAME                   # Cloudflare Pages 自定义域名
├── LICENSE.txt             # AGPL-3.0 许可证
└── README.md               # 项目文档
```

---

## 🌐 浏览器兼容性

| 浏览器 | 状态 |
|:---|:---:|
| Google Chrome | ✅ 推荐 |
| Microsoft Edge | ✅ 支持 |
| Mozilla Firefox | ✅ 支持 |
| Apple Safari | ✅ 支持 |

> 💡 本项目使用纯原生前端技术，无任何框架依赖，理论上兼容所有现代浏览器。

---

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

---

## 📄 许可证

本项目采用 [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE.txt) 开源协议。

---

## 🙏 致谢

- 感谢认知心理学领域的研究者们，为科学高效的学习方法提供了坚实的理论基础
- 参考文献：
  1. Roediger, H. L., & Karpicke, J. D. (2006). *Psychological Science*, 17(3), 249-255.
  2. Slamecka, N. J., & Graf, P. (1978). *Journal of Experimental Psychology*, 4(6), 592-604.
  3. Bjork, R. A. (1994). *Metacognition: Knowing about knowing*, 185-205.

---

<p align="center">
  Made with ❤️ by <strong>一氯氢化物</strong>
</p>

<p align="center">
  <sub>如果这个工具帮到了你，欢迎给个 ⭐ Star 支持一下！</sub>
</p>