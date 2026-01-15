# 📚 文言文背诵助手

<p align="center">
  <strong>基于认知科学理论的文言文辅助记忆工具</strong>
</p>

<p align="center">
  <a href="https://recitation-tool.pages.dev/">🌐 在线体验</a> ·
  <a href="#功能特点">✨ 功能特点</a> ·
  <a href="#科学原理">🔬 科学原理</a> ·
  <a href="#使用方法">📖 使用方法</a>
</p>

---

## 📖 项目简介

一个帮助用户学习和背诵文言文的网页工具，通过科学设计的挖空练习帮助你更高效地记忆文言文。本工具运用**测试效应**与**生成效应**等认知心理学原理，特别适用于上海高考语文文言文背诵练习。

> 🔗 **在线访问**：[https://recitation-tool.pages.dev/](https://recitation-tool.pages.dev/)

---

## ✨ 功能特点

### 🎯 双重学习模式

| 模式 | 说明 |
|------|------|
| **背诵模式** | 自定义挖空练习，支持多种挖空策略 |
| **复习模式** | 智能生成填空测试题，模拟真实默写场景 |

### 📝 三种挖空策略

- **常规间隔模式**：按固定间隔挖空，可调节间隔字数和起始位置
- **随机挖空模式**：使用 Fisher-Yates 洗牌算法随机选择挖空位置，确保分布均匀
- **句首字模式**：仅保留句子的第一个汉字，适合熟练阶段自测

### 📚 预设篇目库

- 内置上海高考语文必背文言文篇目
- 包括《陈情表》《出师表》《岳阳楼记》《劝学》《师说》《赤壁赋》等经典篇目
- 按册次分类管理，快速定位
- 支持自定义输入任意文本

### 📖 生疏本功能

- 标记复习中遇到的生疏句子
- 使用 localStorage 持久化存储
- 按篇目分类查看
- 显示熟悉度追踪条

### 🎨 其他特性

- ✅ 响应式设计，完美适配桌面端和移动端
- ✅ 支持键盘快捷键 `Ctrl/Cmd + Enter` 快速处理文本
- ✅ 可隐藏篇目名/作者/朝代信息，增加挑战性
- ✅ 美观现代的用户界面

---

## 🔬 科学原理

本工具的设计基于认知心理学领域的经典研究：

### 测试效应 (Testing Effect)

主动回忆信息比被动重复阅读更能有效强化长期记忆。

> *"经过测试练习的学生在一周后的记忆保持率显著高于仅进行重复阅读的学生。"*  
> — Roediger & Karpicke (2006), *Psychological Science*

### 生成效应 (Generation Effect)

自己主动生成答案比直接阅读现成答案能产生更深刻、更持久的记忆。

> *"自主生成的信息比被动接收的信息具有更好的记忆效果。"*  
> — Slamecka & Graf (1978), *Journal of Experimental Psychology*

### 合意困难 (Desirable Difficulties)

适当增加学习难度反而能够增强长期记忆效果。

> *"学习条件中的某些困难，虽然会降低即时表现，但却能增强长期保持和迁移。"*  
> — Bjork, R. A. (1994)

---

## 📖 使用方法

### 背诵模式

1. **输入文本**：在编辑区输入或从左侧篇目列表选择文言文
2. **选择挖空模式**：
   - 常规模式：设置间隔字数和起始字数
   - 随机模式：设置随机挖空频率
   - 句首字模式：仅显示每句首字
3. **切换到背诵视图**：点击"背诵"按钮或按 `Ctrl/Cmd + Enter`
4. **开始背诵**：尝试回忆被挖空的内容

### 复习模式

1. 从左侧勾选需要复习的篇目
2. 点击"生成新题目"按钮
3. 系统将随机抽取句子进行挖空测试
4. 点击卡片查看答案
5. 可将生疏句子标记到"生疏本"

---

## 🛠️ 技术栈

- **HTML5** - 页面结构
- **CSS3** - 响应式样式设计
- **JavaScript (ES6+)** - 原生 JS，无框架依赖

---

## 📁 项目结构

```
recitation-tool/
├── index.html              # 主应用页面
├── intro.html              # 项目介绍页面
├── style.css               # 主应用样式
├── intro.css               # 介绍页面样式
├── script.js               # 主应用逻辑
├── intro.js                # 介绍页面脚本
├── classic_texts_final.js  # 文言文预设内容数据
├── CNAME                   # 自定义域名配置
├── LICENSE.txt             # AGPL-3.0 许可证
└── README.md               # 项目说明文档
```

---

## 🚀 本地运行

这是一个纯前端项目，无需安装任何依赖：

```bash
# 克隆仓库
git clone https://github.com/Icather/recitation-tool.git

# 进入项目目录
cd recitation-tool

# 使用任意 HTTP 服务器运行，例如：
npx serve .
# 或者直接用浏览器打开 index.html
```

---

## 🌐 浏览器兼容性

| 浏览器 | 支持情况 |
|--------|----------|
| Google Chrome | ✅ 推荐 |
| Mozilla Firefox | ✅ 支持 |
| Apple Safari | ✅ 支持 |
| Microsoft Edge | ✅ 支持 |

---

## 📄 许可证

本项目采用 [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE.txt) 许可证。

---

## 🙏 致谢

- 感谢认知心理学领域的研究者们为高效学习方法提供的科学依据
- 本项目参考的学术文献：
  1. Roediger, H. L., & Karpicke, J. D. (2006). *Psychological Science*, 17(3), 249-255.
  2. Slamecka, N. J., & Graf, P. (1978). *Journal of Experimental Psychology*, 4(6), 592-604.
  3. Bjork, R. A. (1994). *Metacognition: Knowing about knowing*, 185-205.

---

<p align="center">
  Made with ❤️ by <strong>一氯氢化物</strong>
</p>