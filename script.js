(function () {
    'use strict';

    // 配置常量
    const CONFIG = {
        DEFAULT_INTERVAL: 3,
        DEFAULT_START: 1,
        DEFAULT_RANDOM_RATIO: 30,
        MAX_RANDOM_RATIO: 100,
        MIN_RANDOM_RATIO: 1
    };

    // 获取DOM元素
    const DOM = {
        // 核心输入输出
        inputText: document.getElementById('input-text'),
        outputText: document.getElementById('output-text'),

        // 工具栏控件
        intervalInput: document.getElementById('interval'),
        intervalSlider: document.getElementById('interval-slider'),
        startInput: document.getElementById('start'),
        startSlider: document.getElementById('start-slider'),
        randomRatioInput: document.getElementById('random-ratio'),
        randomRatioSlider: document.getElementById('random-ratio-slider'),
        regularModeCheckbox: document.getElementById('regular-mode'),
        randomModeCheckbox: document.getElementById('random-mode'),
        firstCharModeCheckbox: document.getElementById('first-char-mode'),

        // 视图切换按钮
        btnEditView: document.getElementById('btn-edit-view'),
        btnReciteView: document.getElementById('btn-recite-view'),
        editLayer: document.getElementById('edit-layer'),
        reciteLayer: document.getElementById('recite-layer'),
        processBtn: document.getElementById('process-btn'), // 移动端浮动按钮

        // 侧边栏相关
        textsListUl: document.getElementById('texts-list-ul'),
        paragraphsContainer: document.getElementById('paragraphs-container'),
        textsListView: document.getElementById('texts-list-view'),
        paragraphsListView: document.getElementById('paragraphs-list-view'),
        backToTextsBtn: document.getElementById('back-to-texts'),
        currentTextTitle: document.getElementById('current-text-title'),

        // 模式切换
        modeToggle: document.getElementById('mode-toggle'),
        recitationMode: document.getElementById('recitation-mode'),
        reviewMode: document.getElementById('review-mode'),

        // 复习模式相关
        generateReviewBtn: document.getElementById('generate-review'),
        reviewContent: document.getElementById('review-content'),
        reviewSentences: document.getElementById('review-sentences'),

        // 新的组合控件
        hideInfoControl: document.getElementById('hide-info-control'),
        hideInfoToggleBtn: document.getElementById('hide-info-toggle-btn'),
        hideDropdownTrigger: document.getElementById('hide-dropdown-trigger'),
        hideDropdownMenu: document.getElementById('hide-dropdown-menu'),
        hideTitleCheck: document.getElementById('hide-title-check'),
        hideDynastyCheck: document.getElementById('hide-dynasty-check'),
        hideAuthorCheck: document.getElementById('hide-author-check'),

        // 生疏本模态窗口
        viewUnknownCardsBtn: document.getElementById('view-unknown-cards-btn'),
        unknownCardsModal: document.getElementById('unknown-cards-modal'),
        closeModalBtn: document.getElementById('close-modal-btn'),
        unknownSourceList: document.getElementById('unknown-source-list'),
        unknownCardsContainer: document.getElementById('unknown-cards-container')
    };

    let reviewQuestionsGenerated = false;
    const semesterSelector = document.createElement('select');
    semesterSelector.id = 'semester-selector';

    // 生疏本与熟悉度数据（内存存储，刷新即丢失）
    const unknownCards = new Map();  // key: unique id (source+text), value: card data
    const familiarCards = new Set(); // set of unique ids
    let currentReviewQuestions = [];  // 当前显示的题目
    const selectedTextsForReview = new Set(); // 复习模式下选中的篇目ID

    // ==========================================================================
    // 核心逻辑：文本处理
    // ==========================================================================
    function processText() {
        // 获取用户输入的文本
        const text = DOM.inputText.value.trim();

        // 检查文本是否为空
        if (!text) {
            DOM.outputText.value = '请输入文言文内容后再进行处理';
            return;
        }

        // 获取设置的参数
        let interval = parseInt(DOM.intervalInput.value);
        let start = parseInt(DOM.startInput.value);
        let randomRatio = parseInt(DOM.randomRatioInput.value);
        const isRegularModeEnabled = DOM.regularModeCheckbox.checked;
        const isRandomModeEnabled = DOM.randomModeCheckbox.checked;
        const isFirstCharModeEnabled = DOM.firstCharModeCheckbox.checked;

        // 验证输入的数值是否有效
        if (isNaN(interval) || interval < 1) {
            interval = CONFIG.DEFAULT_INTERVAL;
            DOM.intervalInput.value = interval;
        }

        if (isNaN(start) || start < 0) {
            start = CONFIG.DEFAULT_START;
            DOM.startInput.value = start;
        }

        if (isNaN(randomRatio) || randomRatio < CONFIG.MIN_RANDOM_RATIO || randomRatio > CONFIG.MAX_RANDOM_RATIO) {
            randomRatio = CONFIG.DEFAULT_RANDOM_RATIO;
            DOM.randomRatioInput.value = randomRatio;
        }

        // 判断是否为中文字符
        function isChineseChar(char) {
            return /[\u4e00-\u9fa5]/.test(char);
        }

        // 判断是否为句子结束符
        function isSentenceEnd(char) {
            return /[。！？；，]/.test(char);
        }

        // 仅显示句首字模式
        if (isFirstCharModeEnabled) {
            let result = '';
            let isNewSentence = true;

            for (let i = 0; i < text.length; i++) {
                const char = text[i];

                if (isChineseChar(char)) {
                    if (isNewSentence) {
                        result += char;
                        isNewSentence = false;
                    } else {
                        result += '__ ';
                    }
                } else {
                    result += char;
                    if (isSentenceEnd(char)) {
                        isNewSentence = true;
                    }
                }
            }

            DOM.outputText.value = result;
            return;
        }

        // 常规/随机挖空逻辑
        let result = '';
        let chineseCharCount = 0;

        // 收集所有中文字符的位置
        const chineseCharPositions = [];
        for (let i = 0; i < text.length; i++) {
            if (isChineseChar(text[i])) {
                chineseCharPositions.push(i);
            }
        }

        // 如果需要随机挖空，先生成随机挖空的位置集合
        const randomReplacePositions = new Set();
        if (isRandomModeEnabled && chineseCharPositions.length > 0) {
            const randomCount = Math.floor(chineseCharPositions.length * (randomRatio / 100));
            const shuffledPositions = [...chineseCharPositions].sort(() => Math.random() - 0.5);
            for (let i = 0; i < randomCount; i++) {
                randomReplacePositions.add(shuffledPositions[i]);
            }
        }

        // 处理文本
        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (isChineseChar(char)) {
                chineseCharCount++;
                let shouldReplace = false;

                if (isRegularModeEnabled && chineseCharCount >= start && (chineseCharCount - start) % interval === 0) {
                    shouldReplace = true;
                }

                if (!shouldReplace && isRandomModeEnabled && randomReplacePositions.has(i)) {
                    shouldReplace = true;
                }

                if (shouldReplace) {
                    result += '__ ';
                } else {
                    result += char;
                }
            } else {
                result += char;
            }
        }

        DOM.outputText.value = result;
    }

    // ==========================================================================
    // 视图切换逻辑 (Edit vs Recite)
    // ==========================================================================
    function switchToEditView() {
        DOM.editLayer.classList.add('active');
        DOM.reciteLayer.classList.remove('active');
        DOM.btnEditView.classList.add('active');
        DOM.btnReciteView.classList.remove('active');
    }

    function switchToReciteView() {
        // 切换前先处理文本
        processText();

        DOM.reciteLayer.classList.add('active');
        DOM.editLayer.classList.remove('active');
        DOM.btnReciteView.classList.add('active');
        DOM.btnEditView.classList.remove('active');
    }

    DOM.btnEditView.addEventListener('click', switchToEditView);
    DOM.btnReciteView.addEventListener('click', switchToReciteView);

    // 移动端浮动按钮逻辑
    if (DOM.processBtn) {
        DOM.processBtn.addEventListener('click', function () {
            switchToReciteView();
        });
    }

    // 键盘快捷键 (Ctrl+Enter)
    DOM.inputText.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            switchToReciteView();
        }
    });

    // ==========================================================================
    // 控件状态管理
    // ==========================================================================
    function toggleControlElements() {
        const isFirstCharModeEnabled = DOM.firstCharModeCheckbox.checked;
        const isRegularModeEnabled = DOM.regularModeCheckbox.checked;
        const isRandomModeEnabled = DOM.randomModeCheckbox.checked;

        // 找到控件对应的父级.tool-item
        const regularModeItem = DOM.regularModeCheckbox.closest('.tool-item');
        const randomModeItem = DOM.randomModeCheckbox.closest('.tool-item');
        const intervalItem = DOM.intervalInput.closest('.tool-item');
        const startItem = DOM.startInput.closest('.tool-item');
        const randomRatioItem = DOM.randomRatioInput.closest('.tool-item');

        if (isFirstCharModeEnabled) {
            // 禁用其他模式
            DOM.regularModeCheckbox.disabled = true;
            DOM.randomModeCheckbox.disabled = true;
            DOM.intervalInput.disabled = true;
            DOM.startInput.disabled = true;
            DOM.randomRatioInput.disabled = true;

            // 视觉反馈
            if (regularModeItem) regularModeItem.classList.add('disabled');
            if (randomModeItem) randomModeItem.classList.add('disabled');
            if (intervalItem) intervalItem.classList.add('disabled');
            if (startItem) startItem.classList.add('disabled');
            if (randomRatioItem) randomRatioItem.classList.add('disabled');
        } else {
            // 启用其他模式
            DOM.regularModeCheckbox.disabled = false;
            DOM.randomModeCheckbox.disabled = false;

            if (regularModeItem) regularModeItem.classList.remove('disabled');
            if (randomModeItem) randomModeItem.classList.remove('disabled');

            // 根据各自开关状态控制输入框
            DOM.intervalInput.disabled = !isRegularModeEnabled;
            DOM.startInput.disabled = !isRegularModeEnabled;
            DOM.randomRatioInput.disabled = !isRandomModeEnabled;

            if (intervalItem) intervalItem.classList.toggle('disabled', !isRegularModeEnabled);
            if (startItem) startItem.classList.toggle('disabled', !isRegularModeEnabled);
            if (randomRatioItem) randomRatioItem.classList.toggle('disabled', !isRandomModeEnabled);
        }
    }

    // 监听设置变化
    DOM.regularModeCheckbox.addEventListener('change', function () {
        if (this.checked && DOM.firstCharModeCheckbox.checked) DOM.firstCharModeCheckbox.checked = false;
        toggleControlElements();
        // 如果在背诵视图，实时更新
        if (DOM.reciteLayer.classList.contains('active')) processText();
    });

    DOM.randomModeCheckbox.addEventListener('change', function () {
        if (this.checked && DOM.firstCharModeCheckbox.checked) DOM.firstCharModeCheckbox.checked = false;
        toggleControlElements();
        if (DOM.reciteLayer.classList.contains('active')) processText();
    });

    DOM.firstCharModeCheckbox.addEventListener('change', function () {
        if (this.checked) {
            DOM.regularModeCheckbox.checked = false;
            DOM.randomModeCheckbox.checked = false;
        }
        toggleControlElements();
        if (DOM.reciteLayer.classList.contains('active')) processText();
    });

    // ==========================================================================
    // 滑动条与输入框双向联动逻辑
    // ==========================================================================

    // 初始化：将输入框值同步到滑动条
    function initSliders() {
        DOM.intervalSlider.value = DOM.intervalInput.value;
        DOM.startSlider.value = DOM.startInput.value;
        DOM.randomRatioSlider.value = DOM.randomRatioInput.value;
    }

    // 滑动条 → 输入框联动
    function setupSliderListeners() {
        // 间隔滑动条
        DOM.intervalSlider.addEventListener('input', function () {
            DOM.intervalInput.value = this.value;
            if (DOM.reciteLayer.classList.contains('active')) processText();
        });

        // 起始滑动条
        DOM.startSlider.addEventListener('input', function () {
            DOM.startInput.value = this.value;
            if (DOM.reciteLayer.classList.contains('active')) processText();
        });

        // 随机频率滑动条
        DOM.randomRatioSlider.addEventListener('input', function () {
            DOM.randomRatioInput.value = this.value;
            if (DOM.reciteLayer.classList.contains('active')) processText();
        });
    }

    // 输入框 → 滑动条联动
    function setupInputListeners() {
        // 间隔输入框
        DOM.intervalInput.addEventListener('change', function () {
            // 验证范围
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) {
                value = CONFIG.DEFAULT_INTERVAL;
                this.value = value;
            }
            DOM.intervalSlider.value = value;
        });

        // 起始输入框
        DOM.startInput.addEventListener('change', function () {
            // 验证范围
            let value = parseInt(this.value);
            if (isNaN(value) || value < 0) {
                value = CONFIG.DEFAULT_START;
                this.value = value;
            }
            DOM.startSlider.value = value;
        });

        // 随机频率输入框
        DOM.randomRatioInput.addEventListener('change', function () {
            // 验证范围
            let value = parseInt(this.value);
            if (isNaN(value) || value < CONFIG.MIN_RANDOM_RATIO || value > CONFIG.MAX_RANDOM_RATIO) {
                value = CONFIG.DEFAULT_RANDOM_RATIO;
                this.value = value;
            }
            DOM.randomRatioSlider.value = value;
        });

        // 实时更新处理
        [DOM.intervalInput, DOM.startInput, DOM.randomRatioInput].forEach(input => {
            input.addEventListener('change', () => {
                if (DOM.reciteLayer.classList.contains('active')) processText();
            });
        });
    }

    // 设置所有联动监听器
    function setupSliderInputSync() {
        initSliders();
        setupSliderListeners();
        setupInputListeners();
    }

    // ==========================================================================
    // 侧边栏与篇目列表逻辑
    // ==========================================================================
    function loadSampleText() {
        const sample = `臣密言：臣以险衅，夙遭闵凶。生孩六月，慈父见背；行年四岁，舅夺母志。祖母刘愍臣孤弱，躬亲抚养。臣少多疾病，九岁不行，零丁孤苦，至于成立。既无伯叔，终鲜兄弟，门衰祚薄，晚有儿息。外无期功强近之亲，内无应门五尺之僮，茕茕孑立，形影相吊。而刘夙婴疾病，常在床蓐，臣侍汤药，未曾废离。`;
        DOM.inputText.value = sample;
    }

    function initSemesterSelector() {
        // 如果已经添加了选择器，就跳过
        if (document.getElementById('semester-selector')) return;

        // 直接使用DOM.textsListView作为容器
        const container = DOM.textsListView;

        semesterSelector.innerHTML = '<option value="all">全部册次</option>';

        const semesters = new Set();
        const classicTexts = window.RecitationData && window.RecitationData.texts ? window.RecitationData.texts : [];

        if (classicTexts.length > 0) {
            classicTexts.forEach(text => {
                if (text.category === '学期') {
                    semesters.add(text.title);
                }
            });
        }

        semesters.forEach(semester => {
            const option = document.createElement('option');
            option.value = semester;
            option.textContent = semester;
            semesterSelector.appendChild(option);
        });

        semesterSelector.addEventListener('change', function () {
            initTextsList(this.value);
        });

        // 插入到列表之前
        container.insertBefore(semesterSelector, DOM.textsListUl);
    }

    function initTextsList(selectedSemester = 'all') {
        DOM.textsListUl.innerHTML = '';
        const classicTexts = window.RecitationData && window.RecitationData.texts ? window.RecitationData.texts : [];

        if (classicTexts.length > 0) {
            const filteredTexts = classicTexts.filter(text => {
                if (text.category === '学期') return false;
                return selectedSemester === 'all' || text.category.startsWith(selectedSemester);
            });

            if (filteredTexts.length > 0) {
                filteredTexts.forEach(text => {
                    const li = document.createElement('li');

                    const titleDiv = document.createElement('div');
                    titleDiv.className = 'text-title';
                    titleDiv.textContent = text.title;

                    const authorDiv = document.createElement('div');
                    authorDiv.className = 'text-author';
                    const hasDynasty = !!text.dynasty;
                    const hasAuthor = !!text.author;
                    if (hasDynasty && hasAuthor) {
                        authorDiv.textContent = `${text.dynasty} · ${text.author}`;
                    } else if (hasDynasty) {
                        authorDiv.textContent = text.dynasty;
                    } else {
                        authorDiv.textContent = text.author || '未知';
                    }

                    li.appendChild(titleDiv);
                    li.appendChild(authorDiv);
                    li.dataset.textId = text.id;

                    li.addEventListener('click', function () {
                        const isReviewMode = !DOM.modeToggle.checked;

                        if (isReviewMode) {
                            // 复习模式：切换选中状态（多选）
                            this.classList.toggle('selected');
                            if (this.classList.contains('selected')) {
                                selectedTextsForReview.add(text.id);
                            } else {
                                selectedTextsForReview.delete(text.id);
                            }
                        } else {
                            // 背诵模式：单选并跳转段落页
                            document.querySelectorAll('#texts-list-ul li').forEach(item => item.classList.remove('selected'));
                            this.classList.add('selected');
                            showParagraphs(text);
                        }
                    });

                    DOM.textsListUl.appendChild(li);
                });
            } else {
                DOM.textsListUl.innerHTML = '<li style="color:var(--color-text-muted);text-align:center;">暂无篇目</li>';
            }
        }
    }

    function switchSidebarView(viewName) {
        if (viewName === 'texts') {
            DOM.textsListView.classList.add('active');
            DOM.paragraphsListView.classList.remove('active');
        } else {
            DOM.textsListView.classList.remove('active');
            DOM.paragraphsListView.classList.add('active');
        }
    }

    function showParagraphs(text) {
        DOM.currentTextTitle.textContent = text.title;
        switchSidebarView('paragraphs');
        DOM.paragraphsContainer.innerHTML = '';

        // 全文按钮
        const selectAllBtn = document.createElement('button');
        selectAllBtn.className = 'select-all-btn';
        selectAllBtn.textContent = '选择全文';
        selectAllBtn.addEventListener('click', function () {
            const fullText = text.paragraphs.map(p => p.content).join('\n\n');
            DOM.inputText.value = fullText;
            switchToEditView(); // 自动切回编辑模式让用户看到内容
        });
        DOM.paragraphsContainer.appendChild(selectAllBtn);

        // 段落按钮
        text.paragraphs.forEach((paragraph, index) => {
            const card = document.createElement('div');
            card.className = 'paragraph-card';

            const title = document.createElement('h5');
            // 简单处理标题
            title.textContent = paragraph.id.includes('-') ? '合并段落' : `段落 ${index + 1}`;

            const preview = document.createElement('p');
            preview.className = 'paragraph-preview';
            preview.textContent = paragraph.content;

            const btn = document.createElement('button');
            btn.className = 'select-paragraph-btn';
            btn.textContent = '选择此段落';
            btn.addEventListener('click', function () {
                DOM.inputText.value = paragraph.content;
                switchToEditView();
            });

            card.appendChild(title);
            card.appendChild(preview);
            card.appendChild(btn);
            DOM.paragraphsContainer.appendChild(card);
        });
    }

    DOM.backToTextsBtn.addEventListener('click', () => {
        switchSidebarView('texts');
    });

    // ==========================================================================
    // 模式切换 (背诵 vs 复习)
    // ==========================================================================
    function switchAppMode(isChecked) {
        // Toggle Checked: Right side = Recitation Mode
        // Toggle Unchecked: Left side = Review Mode (Default)

        const isRecitationMode = isChecked;

        if (isRecitationMode) {
            // Switch to Recitation Mode
            DOM.reviewMode.classList.remove('active');
            DOM.recitationMode.classList.add('active');
            document.body.classList.remove('review-mode-active');
        } else {
            // Switch to Review Mode
            DOM.recitationMode.classList.remove('active');
            DOM.reviewMode.classList.add('active');
            document.body.classList.add('review-mode-active');

            if (!reviewQuestionsGenerated) {
                generateReviewQuestions();
                reviewQuestionsGenerated = true;
            }
        }
    }

    DOM.modeToggle.addEventListener('change', function () {
        switchAppMode(this.checked);
    });

    // ==========================================================================
    // 复习模式逻辑 (保持原有逻辑，仅适配新DOM)
    // ==========================================================================
    function getRandomTexts(count = 5) {
        const classicTexts = window.RecitationData && window.RecitationData.texts ? window.RecitationData.texts : [];
        let validTexts = classicTexts.filter(text =>
            text.category !== '学期' &&
            text.paragraphs &&
            text.paragraphs.length > 0 &&
            text.paragraphs.some(p => p.content && p.content.trim().length > 0)
        );

        // 如果有选中的篇目，只使用选中的篇目
        if (selectedTextsForReview.size > 0) {
            validTexts = validTexts.filter(text => selectedTextsForReview.has(text.id));
        }

        const shuffled = [...validTexts].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    function extractSentencesFromText(text) {
        const sentences = [];
        text.paragraphs.forEach(paragraph => {
            if (paragraph.content) {
                // 使用正则分割，保留分隔符
                const parts = paragraph.content.split(/([。！？])/).filter(s => s.length > 0);
                const paragraphSentences = [];

                // 重组句子（内容 + 标点）
                for (let i = 0; i < parts.length; i += 2) {
                    const content = parts[i].trim();
                    const punctuation = parts[i + 1] || '。';
                    if (content.length > 0) {
                        paragraphSentences.push(content + punctuation);
                    }
                }

                // 为每个句子添加索引和段落句子引用
                paragraphSentences.forEach((sentence, index) => {
                    sentences.push({
                        text: sentence,
                        source: text.title,
                        author: text.author,
                        dynasty: text.dynasty,
                        paragraphSentences: paragraphSentences,  // 段落内所有句子
                        sentenceIndex: index  // 当前句子在段落中的索引
                    });
                });
            }
        });
        return sentences;
    }

    function createBlankSentence(sentence) {
        // 使用正则表达式分割，同时保留分隔符
        const splitRegex = /([，；])/;
        const parts = sentence.text.split(splitRegex).filter(p => p.length > 0);

        // 提取分句和分隔符
        const clauses = [];
        const separators = [];

        for (let i = 0; i < parts.length; i++) {
            if (/^[，；]$/.test(parts[i])) {
                separators.push(parts[i]);
            } else if (parts[i].trim().length > 0) {
                clauses.push(parts[i].trim());
            }
        }

        // 如果只有一个分句，尝试与相邻句子合并
        if (clauses.length <= 1) {
            const paragraphSentences = sentence.paragraphSentences;
            const currentIndex = sentence.sentenceIndex;

            // 如果没有段落信息或只有一句话，无法合并
            if (!paragraphSentences || paragraphSentences.length <= 1) {
                return { original: sentence.text, blanked: sentence.text, blankIndex: -1 };
            }

            let combinedText = '';
            let blankSentenceText = sentence.text;

            // 检查可以合并的方向
            const canMergeWithNext = currentIndex < paragraphSentences.length - 1;
            const canMergeWithPrev = currentIndex > 0;

            // 随机选择合并方向，除非只有一个方向可选
            let mergeWithNext;
            if (canMergeWithNext && canMergeWithPrev) {
                mergeWithNext = Math.random() < 0.5;  // 随机选择
            } else if (canMergeWithNext) {
                mergeWithNext = true;
            } else if (canMergeWithPrev) {
                mergeWithNext = false;
            } else {
                return { original: sentence.text, blanked: sentence.text, blankIndex: -1 };
            }

            if (mergeWithNext) {
                // 与后一句合并：当前句挖空
                combinedText = sentence.text + paragraphSentences[currentIndex + 1];
            } else {
                // 与前一句合并：当前句挖空
                combinedText = paragraphSentences[currentIndex - 1] + sentence.text;
            }

            // 挖空当前句子（去掉句末标点后挖空）
            const blankTextWithoutPunctuation = blankSentenceText.replace(/[。！？]$/, '');
            const blankedCombined = combinedText.replace(blankTextWithoutPunctuation, '__________');

            return {
                original: combinedText,
                blanked: blankedCombined,
                blankIndex: 0,  // 标记为有效挖空
                blankText: blankTextWithoutPunctuation,
                source: sentence.source,
                author: sentence.author,
                dynasty: sentence.dynasty
            };
        }

        // 随机选择一个分句进行挖空（排除最后一个,因为它通常包含句末标点）
        const randomIndex = Math.floor(Math.random() * (clauses.length - 1));
        const selectedClause = clauses[randomIndex].trim();
        const blankedClause = '__________';
        let blankedSentence = '';

        for (let i = 0; i < clauses.length; i++) {
            if (i === randomIndex) {
                blankedSentence += blankedClause;
            } else {
                blankedSentence += clauses[i];
            }
            // 使用原始的分隔符，如果没有则跳过
            if (i < separators.length) {
                blankedSentence += separators[i];
            }
        }

        return {
            original: sentence.text,
            blanked: blankedSentence,
            blankIndex: randomIndex,
            blankText: selectedClause,
            source: sentence.source,
            author: sentence.author,
            dynasty: sentence.dynasty
        };
    }

    function generateReviewQuestions() {
        DOM.reviewSentences.innerHTML = '';
        const randomTexts = getRandomTexts(5);

        if (randomTexts.length === 0) {
            DOM.reviewSentences.innerHTML = '<p class="error-message">无法获取数据</p>';
            return;
        }

        const reviewQuestions = [];
        const targetCount = 5; // 目标题目数量

        // 从每个篇目收集所有可用句子
        const allAvailableSentences = [];
        randomTexts.forEach(text => {
            const sentences = extractSentencesFromText(text);
            sentences.forEach(sentence => {
                allAvailableSentences.push(sentence);
            });
        });

        // 随机打乱所有句子
        const shuffledSentences = [...allAvailableSentences].sort(() => Math.random() - 0.5);

        // 尝试生成目标数量的题目
        for (const sentence of shuffledSentences) {
            if (reviewQuestions.length >= targetCount) break;

            const blankedSentence = createBlankSentence(sentence);
            if (blankedSentence.blankIndex >= 0) {
                // 生成唯一ID
                blankedSentence.uid = `${blankedSentence.source || 'unknown'}_${blankedSentence.original.substring(0, 20)}`;
                // 避免重复的句子
                if (!reviewQuestions.some(q => q.uid === blankedSentence.uid)) {
                    reviewQuestions.push(blankedSentence);
                }
            }
        }

        // 保存当前题目供熟悉度判定使用
        currentReviewQuestions = reviewQuestions;

        // 渲染题目
        reviewQuestions.forEach((question, index) => {
            const el = document.createElement('div');
            el.className = 'review-sentence';
            el.dataset.uid = question.uid;

            const num = document.createElement('span');
            num.className = 'sentence-number';
            num.textContent = index + 1;

            const content = document.createElement('span');
            content.className = 'sentence-content';
            content.innerHTML = processSentenceForDisplay(question.blanked, question.blankText);

            const source = document.createElement('div');
            source.className = 'sentence-source';
            source.style.marginTop = '10px';
            source.style.color = '#666';
            source.style.fontSize = '0.9rem';

            // 构建来源文本，支持联动隐藏作者和朝代
            let sourceText = '';

            // 获取隐藏设置
            const isHideEnabled = DOM.hideInfoControl.classList.contains('active');
            const hideTitle = DOM.hideTitleCheck.checked;
            const hideDynasty = DOM.hideDynastyCheck.checked;
            const hideAuthor = DOM.hideAuthorCheck.checked;

            // 显示标题
            if (question.source) {
                if (isHideEnabled && hideTitle) {
                    sourceText += `<span class="blank" data-blank="true" data-text="${question.source}">__________</span>`;
                } else {
                    sourceText += question.source;
                }
            }

            // 显示朝代和作者
            const hasDynasty = !!question.dynasty;
            const hasAuthor = !!question.author;

            if (hasDynasty || hasAuthor) {
                if (sourceText) sourceText += ' · '; // 如果前面有标题，加分隔符

                // 显示朝代（在作者左侧）
                if (hasDynasty) {
                    if (isHideEnabled && hideDynasty) {
                        sourceText += `<span class="blank" data-blank="true" data-text="${question.dynasty}">__________</span>`;
                    } else {
                        sourceText += question.dynasty;
                    }

                    if (hasAuthor) {
                        sourceText += ' · ';
                    }
                }

                // 显示作者
                if (hasAuthor) {
                    if (isHideEnabled && hideAuthor) {
                        sourceText += `<span class="blank" data-blank="true" data-text="${question.author}">__________</span>`;
                    } else {
                        sourceText += question.author;
                    }
                }
            }

            source.innerHTML = `—— ${sourceText}`;

            // 标记按钮（生疏本）
            const actions = document.createElement('div');
            actions.className = 'sentence-actions';

            const markBtn = document.createElement('button');
            markBtn.className = 'mark-btn';
            if (unknownCards.has(question.uid)) {
                markBtn.classList.add('active');
            }
            markBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
            markBtn.title = '标记为生疏';
            markBtn.dataset.uid = question.uid;
            markBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                toggleUnknownCard(question, this);
            });

            actions.appendChild(markBtn);

            el.appendChild(num);
            el.appendChild(content);
            el.appendChild(source);
            el.appendChild(actions);

            // 存储数据用于交互
            el.dataset.blankText = question.blankText;

            DOM.reviewSentences.appendChild(el);
        });

        DOM.reviewContent.classList.remove('hidden');
        addBlankClickListenersWithFamiliarity();
    }


    function processSentenceForDisplay(sentence, hiddenText) {
        return sentence.replace(/__________/g, `<span class="blank" data-blank="true" data-text="${hiddenText}">__________</span>`);
    }

    function addBlankClickListeners() {
        const blanks = document.querySelectorAll('.blank[data-blank="true"]');
        blanks.forEach(blank => {
            blank.addEventListener('click', function () {
                let blankText = this.dataset.text;
                if (!blankText) {
                    const parent = this.closest('.review-sentence');
                    if (parent) blankText = parent.dataset.blankText;
                }

                if (this.classList.contains('revealed')) {
                    this.textContent = '__________';
                    this.classList.remove('revealed');
                } else {
                    this.textContent = blankText;
                    this.classList.add('revealed');
                }
            });
        });
    }

    DOM.generateReviewBtn.addEventListener('click', generateReviewQuestions);

    // ==========================================================================
    // 组合控件交互逻辑
    // ==========================================================================

    // 1. 主开关点击
    DOM.hideInfoToggleBtn.addEventListener('click', function () {
        DOM.hideInfoControl.classList.toggle('active');
        // 重新生成或更新当前显示（为了简单，重新生成，或者只更新DOM如果只是显示问题）
        // 但这里如果用户已经生成了题目，点击开关应该立即生效吗？
        // 为了更好的体验，最好是立即生效。上面的渲染逻辑是生成时决定的 HTML。
        // 所以我们必须重新生成或者更新 HTML。这里简单起见，调用 generateReviewQuestions
        // 但是如果没有题目，就不生成
        if (DOM.reviewSentences.children.length > 0) {
            generateReviewQuestions();
        }
    });

    // 2. 下拉菜单触发
    DOM.hideDropdownTrigger.addEventListener('click', function (e) {
        e.stopPropagation(); // 防止冒泡到 document 立即关闭
        DOM.hideDropdownMenu.classList.toggle('show');
    });

    // 3. 点击外部关闭下拉菜单
    document.addEventListener('click', function (e) {
        if (!DOM.hideDropdownMenu.contains(e.target) && !DOM.hideDropdownTrigger.contains(e.target)) {
            DOM.hideDropdownMenu.classList.remove('show');
        }
    });

    // 4. 下拉选项变化
    [DOM.hideTitleCheck, DOM.hideDynastyCheck, DOM.hideAuthorCheck].forEach(check => {
        check.addEventListener('change', () => {
            // 如果主开关是开着的，选项变化也应立即生效
            if (DOM.hideInfoControl.classList.contains('active') && DOM.reviewSentences.children.length > 0) {
                generateReviewQuestions();
            }
        });

        // 点击 checkbox 不需要阻止下拉框关闭，因为它是 dropdown 内部点击，上面的 document listener 没有排除 dropdown 内部。
        // Wait, document listener checks !DOM.hideDropdownMenu.contains(e.target). So clicking inside menu IS safe.
    });

    // ==========================================================================
    // 生疏本与熟悉度功能
    // ==========================================================================

    // 切换生疏标记
    function toggleUnknownCard(question, btnElement) {
        const uid = question.uid;
        if (unknownCards.has(uid)) {
            // 移除生疏标记
            unknownCards.delete(uid);
            btnElement.classList.remove('active');
            // 检查是否达到熟悉条件（所有填空都已显示）
            checkAndSetFamiliar(uid);
        } else {
            // 添加生疏标记
            unknownCards.set(uid, {
                uid: uid,
                text: question.original,
                blanked: question.blanked,
                source: question.source,
                author: question.author,
                dynasty: question.dynasty
            });
            btnElement.classList.add('active');
            // 从熟悉中移除
            familiarCards.delete(uid);
        }
    }

    // 检查并设置熟悉状态
    function checkAndSetFamiliar(uid) {
        // 如果已被标记为生疏，则不标记为熟悉
        if (unknownCards.has(uid)) return;

        // 查找对应的句子元素
        const sentenceEl = document.querySelector(`.review-sentence[data-uid="${uid}"]`);
        if (!sentenceEl) return;

        // 检查该句子的所有填空是否都已显示
        const blanks = sentenceEl.querySelectorAll('.sentence-content .blank[data-blank="true"]');
        const allRevealed = Array.from(blanks).every(b => b.classList.contains('revealed'));

        if (allRevealed && blanks.length > 0) {
            familiarCards.add(uid);
        }
    }

    // 修改填空点击监听器以支持熟悉度检测
    function addBlankClickListenersWithFamiliarity() {
        const blanks = document.querySelectorAll('.blank[data-blank="true"]');
        blanks.forEach(blank => {
            // 移除旧的监听器（通过克隆节点）
            const newBlank = blank.cloneNode(true);
            blank.parentNode.replaceChild(newBlank, blank);

            newBlank.addEventListener('click', function () {
                let blankText = this.dataset.text;
                if (!blankText) {
                    const parent = this.closest('.review-sentence');
                    if (parent) blankText = parent.dataset.blankText;
                }

                if (this.classList.contains('revealed')) {
                    this.textContent = '__________';
                    this.classList.remove('revealed');
                } else {
                    this.textContent = blankText;
                    this.classList.add('revealed');
                }

                // 检查熟悉度
                const sentenceEl = this.closest('.review-sentence');
                if (sentenceEl && sentenceEl.dataset.uid) {
                    checkAndSetFamiliar(sentenceEl.dataset.uid);
                }
            });
        });
    }

    // 打开生疏本模态窗口
    function openUnknownCardsModal() {
        renderUnknownCardsModal();
        DOM.unknownCardsModal.classList.remove('hidden');
    }

    // 关闭生疏本模态窗口
    function closeUnknownCardsModal() {
        DOM.unknownCardsModal.classList.add('hidden');
    }

    // 渲染生疏本模态窗口内容
    function renderUnknownCardsModal(filterSource = null) {
        // 按篇目分组
        const grouped = {};
        unknownCards.forEach((card, uid) => {
            const source = card.source || '未知来源';
            if (!grouped[source]) {
                grouped[source] = { unknown: [], familiar: 0, total: 0 };
            }
            grouped[source].unknown.push(card);
            grouped[source].total++;
        });

        // 统计熟悉卡片
        familiarCards.forEach(uid => {
            // 根据uid解析source
            const parts = uid.split('_');
            const source = parts[0] || '未知来源';
            if (!grouped[source]) {
                grouped[source] = { unknown: [], familiar: 0, total: 0 };
            }
            grouped[source].familiar++;
            grouped[source].total++;
        });

        // 渲染侧边栏
        DOM.unknownSourceList.innerHTML = '';
        const sources = Object.keys(grouped);

        if (sources.length === 0) {
            // 没有数据，显示空状态
            DOM.unknownCardsContainer.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1" fill="none">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p>还没有标记任何生疏句子</p>
                    <p class="sub-text">在复习模式中点击 ❤️ 即可添加</p>
                </div>
            `;
            return;
        }

        sources.forEach((source, idx) => {
            const data = grouped[source];
            const li = document.createElement('li');
            if (filterSource === source || (filterSource === null && idx === 0)) {
                li.classList.add('active');
            }
            li.dataset.source = source;

            // 标题行
            const titleRow = document.createElement('div');
            titleRow.className = 'source-title-row';

            const titleSpan = document.createElement('span');
            titleSpan.textContent = source;

            const countSpan = document.createElement('span');
            countSpan.className = 'count';
            countSpan.textContent = data.unknown.length;

            titleRow.appendChild(titleSpan);
            titleRow.appendChild(countSpan);
            li.appendChild(titleRow);

            // 熟悉度条
            const total = data.unknown.length + data.familiar;
            if (total > 0) {
                const bar = document.createElement('div');
                bar.className = 'familiarity-bar';

                const familiarPercent = (data.familiar / total) * 100;
                const unknownPercent = (data.unknown.length / total) * 100;

                if (data.familiar > 0) {
                    const familiarSeg = document.createElement('div');
                    familiarSeg.className = 'familiar-segment';
                    familiarSeg.style.width = `${familiarPercent}%`;
                    bar.appendChild(familiarSeg);
                }

                if (data.unknown.length > 0) {
                    const unknownSeg = document.createElement('div');
                    unknownSeg.className = 'unknown-segment';
                    unknownSeg.style.width = `${unknownPercent}%`;
                    bar.appendChild(unknownSeg);
                }

                li.appendChild(bar);
            }

            li.addEventListener('click', function () {
                DOM.unknownSourceList.querySelectorAll('li').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                renderUnknownCardsList(this.dataset.source);
            });

            DOM.unknownSourceList.appendChild(li);
        });

        // 渲染第一个篇目的卡片
        const activeSource = filterSource || sources[0];
        renderUnknownCardsList(activeSource);
    }

    // 渲染指定篇目的卡片列表
    function renderUnknownCardsList(source) {
        const cards = [];
        unknownCards.forEach(card => {
            if ((card.source || '未知来源') === source) {
                cards.push(card);
            }
        });

        if (cards.length === 0) {
            DOM.unknownCardsContainer.innerHTML = `
                <div class="empty-state">
                    <p>该篇目暂无生疏句子</p>
                </div>
            `;
            return;
        }

        DOM.unknownCardsContainer.innerHTML = '';
        cards.forEach(card => {
            const item = document.createElement('div');
            item.className = 'unknown-card-item';
            item.dataset.uid = card.uid;

            const content = document.createElement('div');
            content.className = 'item-content';
            content.textContent = card.text;

            const sourceInfo = document.createElement('div');
            sourceInfo.className = 'item-source';
            let sourceText = card.source || '';
            if (card.dynasty) sourceText += ` · ${card.dynasty}`;
            if (card.author) sourceText += ` · ${card.author}`;
            sourceInfo.textContent = sourceText ? `—— ${sourceText}` : '';

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
            removeBtn.title = '移除';
            removeBtn.addEventListener('click', function () {
                unknownCards.delete(card.uid);
                // 更新复习模式中的按钮状态
                const reviewBtn = document.querySelector(`.mark-btn[data-uid="${card.uid}"]`);
                if (reviewBtn) {
                    reviewBtn.classList.remove('active');
                }
                // 重新渲染模态窗口
                renderUnknownCardsModal(source);
            });

            item.appendChild(content);
            item.appendChild(sourceInfo);
            item.appendChild(removeBtn);
            DOM.unknownCardsContainer.appendChild(item);
        });
    }

    // 生疏本模态窗口事件绑定
    if (DOM.viewUnknownCardsBtn) {
        DOM.viewUnknownCardsBtn.addEventListener('click', openUnknownCardsModal);
    }
    if (DOM.closeModalBtn) {
        DOM.closeModalBtn.addEventListener('click', closeUnknownCardsModal);
    }
    if (DOM.unknownCardsModal) {
        DOM.unknownCardsModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeUnknownCardsModal();
            }
        });
    }


    // ==========================================================================
    // 初始化
    // ==========================================================================
    window.addEventListener('DOMContentLoaded', function () {
        loadSampleText();
        toggleControlElements();
        initSemesterSelector();
        initTextsList();

        // 设置滑动条与输入框的双向联动
        setupSliderInputSync();

        // 默认进入编辑模式
        switchToEditView();

        // Ensure the correct mode is active based on the default toggle state (Unchecked = Review Mode)
        switchAppMode(DOM.modeToggle.checked);
    });

})();