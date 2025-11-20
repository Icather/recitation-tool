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
        inputText: document.getElementById('input-text'),
        processBtn: document.getElementById('process-btn'),
        intervalInput: document.getElementById('interval'),
        startInput: document.getElementById('start'),
        randomRatioInput: document.getElementById('random-ratio'),
        regularModeCheckbox: document.getElementById('regular-mode'),
        randomModeCheckbox: document.getElementById('random-mode'),
        firstCharModeCheckbox: document.getElementById('first-char-mode'),
        outputText: document.getElementById('output-text'),
        textsListUl: document.getElementById('texts-list-ul'),
        paragraphsContainer: document.getElementById('paragraphs-container'),
        textsListView: document.getElementById('texts-list-view'),
        paragraphsListView: document.getElementById('paragraphs-list-view'),
        backToTextsBtn: document.getElementById('back-to-texts'),
        currentTextTitle: document.getElementById('current-text-title'),
        modeToggle: document.getElementById('mode-toggle'),
        recitationMode: document.getElementById('recitation-mode'),
        reviewMode: document.getElementById('review-mode'),
        generateReviewBtn: document.getElementById('generate-review'),
        reviewContent: document.getElementById('review-content'),
        reviewSentences: document.getElementById('review-sentences')
    };

    let reviewQuestionsGenerated = false;
    const semesterSelector = document.createElement('select');
    semesterSelector.id = 'semester-selector';

    // 处理文本的函数
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

        // 判断是否为句子结束符（句号、问号、感叹号、逗号等）
        function isSentenceEnd(char) {
            return /[。！？；，]/.test(char);
        }

        // 仅显示句首字模式
        if (isFirstCharModeEnabled) {
            let result = '';
            let isNewSentence = true; // 标记是否为新句子的开始

            for (let i = 0; i < text.length; i++) {
                const char = text[i];

                if (isChineseChar(char)) {
                    if (isNewSentence) {
                        // 显示句首字
                        result += char;
                        isNewSentence = false;
                    } else {
                        // 替换非句首字
                        result += '__ ';
                    }
                } else {
                    result += char;
                    // 如果是句子结束符，则下一个中文字符为句首字
                    if (isSentenceEnd(char)) {
                        isNewSentence = true;
                    }
                }
            }

            DOM.outputText.value = result;
            return;
        }

        // 改进的随机挖空算法，确保分布均匀
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
            // 计算需要挖空的中文字符数量
            const randomCount = Math.floor(chineseCharPositions.length * (randomRatio / 100));

            // 使用 Fisher-Yates 洗牌算法随机选择位置，确保分布均匀
            const shuffledPositions = [...chineseCharPositions].sort(() => Math.random() - 0.5);

            // 选择前 randomCount 个位置作为随机挖空位置
            for (let i = 0; i < randomCount; i++) {
                randomReplacePositions.add(shuffledPositions[i]);
            }
        }

        // 处理文本
        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (isChineseChar(char)) {
                chineseCharCount++;

                // 标记是否需要被替换
                let shouldReplace = false;

                // 检查常规挖空条件
                if (isRegularModeEnabled && chineseCharCount >= start && (chineseCharCount - start) % interval === 0) {
                    shouldReplace = true;
                }

                // 检查随机挖空条件，使用预先生成的随机位置集合
                if (!shouldReplace && isRandomModeEnabled && randomReplacePositions.has(i)) {
                    shouldReplace = true;
                }

                // 根据是否需要替换决定输出内容
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

    // 添加事件监听器
    DOM.processBtn.addEventListener('click', processText);

    // 添加键盘快捷键支持
    DOM.inputText.addEventListener('keydown', function (e) {
        // Ctrl/Cmd + Enter 处理文本
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            processText();
        }
    });

    // 控制功能区控件的启用/禁用状态
    function toggleControlElements() {
        const isFirstCharModeEnabled = DOM.firstCharModeCheckbox.checked;

        // 找到控件对应的父级.setting-item，便于在移动端隐藏
        const regularModeItem = DOM.regularModeCheckbox.closest('.setting-item');
        const randomModeItem = DOM.randomModeCheckbox.closest('.setting-item');
        const intervalItem = DOM.intervalInput.closest('.setting-item');
        const startItem = DOM.startInput.closest('.setting-item');
        const randomRatioItem = DOM.randomRatioInput.closest('.setting-item');

        // 如果启用了仅显示句首字模式，则禁用其他所有挖空模式和相关设置
        if (isFirstCharModeEnabled) {
            DOM.regularModeCheckbox.disabled = true;
            DOM.randomModeCheckbox.disabled = true;
            DOM.intervalInput.disabled = true;
            DOM.startInput.disabled = true;
            DOM.randomRatioInput.disabled = true;

            // 添加禁用样式到输入控件
            DOM.regularModeCheckbox.classList.add('disabled');
            DOM.randomModeCheckbox.classList.add('disabled');
            DOM.intervalInput.classList.add('disabled');
            DOM.startInput.classList.add('disabled');
            DOM.randomRatioInput.classList.add('disabled');

            // 添加禁用样式到父级.setting-item，便于在移动端隐藏
            if (regularModeItem) regularModeItem.classList.add('disabled');
            if (randomModeItem) randomModeItem.classList.add('disabled');
            if (intervalItem) intervalItem.classList.add('disabled');
            if (startItem) startItem.classList.add('disabled');
            if (randomRatioItem) randomRatioItem.classList.add('disabled');
        } else {
            // 启用其他模式开关
            DOM.regularModeCheckbox.disabled = false;
            DOM.randomModeCheckbox.disabled = false;
            DOM.regularModeCheckbox.classList.remove('disabled');
            DOM.randomModeCheckbox.classList.remove('disabled');

            // 恢复父级.setting-item的禁用样式
            if (regularModeItem) regularModeItem.classList.remove('disabled');
            if (randomModeItem) randomModeItem.classList.remove('disabled');

            const isRegularModeEnabled = DOM.regularModeCheckbox.checked;
            const isRandomModeEnabled = DOM.randomModeCheckbox.checked;

            // 根据常规挖空模式开关控制间隔和起始字数输入框
            DOM.intervalInput.disabled = !isRegularModeEnabled;
            DOM.startInput.disabled = !isRegularModeEnabled;

            // 根据随机挖空模式开关控制随机挖空频率输入框
            DOM.randomRatioInput.disabled = !isRandomModeEnabled;

            // 添加/移除禁用样式（输入控件）
            DOM.intervalInput.classList.toggle('disabled', !isRegularModeEnabled);
            DOM.startInput.classList.toggle('disabled', !isRegularModeEnabled);
            DOM.randomRatioInput.classList.toggle('disabled', !isRandomModeEnabled);

            // 添加/移除禁用样式（父级.setting-item）
            if (intervalItem) intervalItem.classList.toggle('disabled', !isRegularModeEnabled);
            if (startItem) startItem.classList.toggle('disabled', !isRegularModeEnabled);
            if (randomRatioItem) randomRatioItem.classList.toggle('disabled', !isRandomModeEnabled);
        }
    }

    // 监听常规挖空功能开关的状态变化
    DOM.regularModeCheckbox.addEventListener('change', function () {
        // 如果启用了常规挖空，自动禁用仅显示句首字模式
        if (this.checked && DOM.firstCharModeCheckbox.checked) {
            DOM.firstCharModeCheckbox.checked = false;
        }
        toggleControlElements();
    });

    // 监听随机挖空功能开关的状态变化
    DOM.randomModeCheckbox.addEventListener('change', function () {
        // 如果启用了随机挖空，自动禁用仅显示句首字模式
        if (this.checked && DOM.firstCharModeCheckbox.checked) {
            DOM.firstCharModeCheckbox.checked = false;
        }
        toggleControlElements();
    });

    // 监听仅显示句首字功能开关的状态变化
    DOM.firstCharModeCheckbox.addEventListener('change', function () {
        // 如果启用了仅显示句首字，自动禁用其他挖空模式
        if (this.checked) {
            DOM.regularModeCheckbox.checked = false;
            DOM.randomModeCheckbox.checked = false;
        }
        toggleControlElements();
    });

    // 页面加载时初始化控件状态
    toggleControlElements();

    // 添加示例文本（可选）
    function loadSampleText() {
        const sample = `臣密言：臣以险衅，夙遭闵凶。生孩六月，慈父见背；行年四岁，舅夺母志。祖母刘愍臣孤弱，躬亲抚养。臣少多疾病，九岁不行，零丁孤苦，至于成立。既无伯叔，终鲜兄弟，门衰祚薄，晚有儿息。外无期功强近之亲，内无应门五尺之僮，茕茕孑立，形影相吊。而刘夙婴疾病，常在床蓐，臣侍汤药，未曾废离。`;

        DOM.inputText.value = sample;
    }

    // 初始化学期选择器
    function initSemesterSelector() {
        // 在篇目列表标题下方添加学期选择器
        const textsListHeader = DOM.textsListView.querySelector('h4');
        if (textsListHeader && !document.getElementById('semester-selector')) {
            semesterSelector.innerHTML = '<option value="all">全部学期</option>';

            // 收集所有学期并去重
            const semesters = new Set();
            const classicTexts = window.RecitationData && window.RecitationData.texts ? window.RecitationData.texts : [];

            if (classicTexts.length > 0) {
                classicTexts.forEach(text => {
                    // 只收集真正的学期分类项
                    if (text.category === '学期') {
                        semesters.add(text.title);
                    }
                });
            }

            // 添加学期选项
            semesters.forEach(semester => {
                const option = document.createElement('option');
                option.value = semester;
                option.textContent = semester;
                semesterSelector.appendChild(option);
            });

            // 添加选择事件
            semesterSelector.addEventListener('change', function () {
                initTextsList(this.value);
            });

            // 添加到DOM
            textsListHeader.parentNode.insertBefore(semesterSelector, textsListHeader.nextSibling);
        }
    }

    // 初始化文言文篇目列表，支持按学期筛选
    function initTextsList(selectedSemester = 'all') {
        // 清空列表
        DOM.textsListUl.innerHTML = '';

        const classicTexts = window.RecitationData && window.RecitationData.texts ? window.RecitationData.texts : [];

        // 遍历数据库，创建列表项
        if (classicTexts.length > 0) {
            // 过滤出选中学期的篇目
            const filteredTexts = classicTexts.filter(text => {
                // 跳过学期分类项
                if (text.category === '学期') return false;

                // 全部学期或匹配的学期
                return selectedSemester === 'all' || text.category.startsWith(selectedSemester);
            });

            if (filteredTexts.length > 0) {
                filteredTexts.forEach(text => {
                    const li = document.createElement('li');

                    // 创建更丰富的条目内容
                    const textInfo = document.createElement('div');
                    textInfo.className = 'text-info';

                    const titleElement = document.createElement('div');
                    titleElement.className = 'text-title';
                    titleElement.textContent = text.title;

                    const authorElement = document.createElement('div');
                    authorElement.className = 'text-author';
                    authorElement.textContent = text.author || '未知作者';

                    const categoryElement = document.createElement('div');
                    categoryElement.className = 'text-category';
                    categoryElement.textContent = text.category || '';

                    // 添加描述（如果有）
                    if (text.description) {
                        const descriptionElement = document.createElement('div');
                        descriptionElement.className = 'text-description';
                        descriptionElement.textContent = text.description;
                        textInfo.appendChild(descriptionElement);
                    }

                    textInfo.appendChild(titleElement);
                    textInfo.appendChild(authorElement);
                    textInfo.appendChild(categoryElement);
                    li.appendChild(textInfo);

                    li.dataset.textId = text.id;

                    // 添加点击事件
                    li.addEventListener('click', function () {
                        // 移除其他项的选中状态
                        document.querySelectorAll('#texts-list-ul li').forEach(item => {
                            item.classList.remove('selected');
                        });

                        // 添加当前项的选中状态
                        this.classList.add('selected');

                        // 显示对应的段落列表
                        showParagraphs(text);
                    });

                    DOM.textsListUl.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = '当前学期暂无篇目';
                DOM.textsListUl.appendChild(li);
            }
        } else {
            const li = document.createElement('li');
            li.textContent = '加载文言文篇目失败';
            DOM.textsListUl.appendChild(li);
        }
    }

    // 切换视图函数
    function switchView(fromView, toView) {
        fromView.classList.remove('active');
        toView.classList.add('active');
    }

    // 返回篇目列表
    function backToTextsList() {
        switchView(DOM.paragraphsListView, DOM.textsListView);
        DOM.backToTextsBtn.classList.add('hidden');
        DOM.currentTextTitle.textContent = '请选择一篇文言文';

        // 移除所有选中状态
        document.querySelectorAll('#texts-list-ul li').forEach(item => {
            item.classList.remove('selected');
        });
    }

    // 显示选中篇目对应的段落列表
    function showParagraphs(text) {
        // 更新导航标题
        DOM.currentTextTitle.textContent = `${text.title} - ${text.author}`;

        // 显示返回按钮
        DOM.backToTextsBtn.classList.remove('hidden');

        // 切换到段落列表视图
        switchView(DOM.textsListView, DOM.paragraphsListView);

        // 清空容器
        DOM.paragraphsContainer.innerHTML = '';

        // 创建段落选择按钮
        text.paragraphs.forEach((paragraph, index) => {
            const paragraphCard = document.createElement('div');
            paragraphCard.className = 'paragraph-card';

            const paragraphTitle = document.createElement('h5');
            // 为合并段落设置特殊标题
            if (paragraph.id === 'para1-2') {
                paragraphTitle.textContent = `段落 1-2`;
            } else {
                // 对于普通段落，根据id确定正确的段落编号
                if (paragraph.id === 'para1' || paragraph.id === 'para2' || paragraph.id === 'para3' || paragraph.id === 'para4') {
                    paragraphTitle.textContent = `段落 ${paragraph.id.replace('para', '')}`;
                } else {
                    paragraphTitle.textContent = `段落 ${index + 1}`;
                }
            }
            paragraphCard.appendChild(paragraphTitle);

            const paragraphContent = document.createElement('p');
            paragraphContent.textContent = paragraph.content;
            paragraphContent.className = 'paragraph-preview';
            paragraphCard.appendChild(paragraphContent);

            const selectBtn = document.createElement('button');
            selectBtn.className = 'select-paragraph-btn';
            selectBtn.textContent = '选择此段落';
            selectBtn.dataset.paragraphId = paragraph.id;
            selectBtn.dataset.textId = text.id;

            // 添加点击事件
            selectBtn.addEventListener('click', function () {
                // 将选中的段落内容添加到输入框
                DOM.inputText.value = paragraph.content;

                // 创建并显示提示信息
                const originalText = selectBtn.textContent;
                const originalBgColor = selectBtn.style.backgroundColor;

                // 修改按钮文字和背景色作为提示
                selectBtn.textContent = '已选择此段落';
                selectBtn.style.backgroundColor = '#FF9800';

                // 2秒后恢复原状
                setTimeout(function () {
                    selectBtn.textContent = originalText;
                    selectBtn.style.backgroundColor = originalBgColor;
                }, 2000);
            });

            paragraphCard.appendChild(selectBtn);
            DOM.paragraphsContainer.appendChild(paragraphCard);
        });

        // 添加"选择全文"按钮
        const selectAllBtn = document.createElement('button');
        selectAllBtn.className = 'select-all-btn';
        selectAllBtn.textContent = '选择全文';
        selectAllBtn.dataset.textId = text.id;

        // 添加点击事件
        selectAllBtn.addEventListener('click', function () {
            // 合并所有段落内容
            const fullText = text.paragraphs.map(p => p.content).join('\n\n');

            // 将全文内容添加到输入框
            DOM.inputText.value = fullText;

            // 创建并显示提示信息
            const originalText = selectAllBtn.textContent;
            const originalBgColor = selectAllBtn.style.backgroundColor;

            // 修改按钮文字和背景色作为提示
            selectAllBtn.textContent = '已选择全文';
            selectAllBtn.style.backgroundColor = '#FF9800';

            // 2秒后恢复原状
            setTimeout(function () {
                selectAllBtn.textContent = originalText;
                selectAllBtn.style.backgroundColor = originalBgColor;
            }, 2000);
        });

        DOM.paragraphsContainer.prepend(selectAllBtn);
    }

    // 添加返回按钮的点击事件
    DOM.backToTextsBtn.addEventListener('click', backToTextsList);

    // 模式切换功能
    function switchMode(isReviewMode) {
        if (isReviewMode) {
            DOM.recitationMode.classList.remove('active');
            DOM.reviewMode.classList.add('active');
            document.body.classList.add('review-mode-active');
            // 首次切换到复习模式时自动生成复习题目
            if (!reviewQuestionsGenerated) {
                generateReviewQuestions();
                reviewQuestionsGenerated = true;
            }
        } else {
            DOM.reviewMode.classList.remove('active');
            DOM.recitationMode.classList.add('active');
            document.body.classList.remove('review-mode-active');
        }
    }

    // 监听模式切换开关（input事件确保滑动/点击立即触发）
    DOM.modeToggle.addEventListener('input', function () {
        switchMode(this.checked);
    });
    DOM.modeToggle.addEventListener('change', function () {
        switchMode(this.checked);
    });

    // 从经典文言文数据库中随机选取五篇文章
    function getRandomTexts(count = 5) {
        const classicTexts = window.RecitationData && window.RecitationData.texts ? window.RecitationData.texts : [];

        // 过滤掉学期分类项和空段落项
        const validTexts = classicTexts.filter(text =>
            text.category !== '学期' &&
            text.paragraphs &&
            text.paragraphs.length > 0 &&
            text.paragraphs.some(p => p.content && p.content.trim().length > 0)
        );

        // 随机打乱数组并选取前count个
        const shuffled = [...validTexts].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    // 从文章中提取以句号结束的完整句子
    function extractSentencesFromText(text) {
        const sentences = [];

        // 遍历所有段落
        text.paragraphs.forEach(paragraph => {
            if (paragraph.content) {
                // 使用句号分割句子
                const paragraphSentences = paragraph.content.split(/[。！？]/).filter(s => s.trim().length > 0);

                paragraphSentences.forEach(sentence => {
                    // 清理句子，去除多余空格
                    const cleanSentence = sentence.trim();
                    if (cleanSentence.length > 0) {
                        sentences.push({
                            text: cleanSentence + '。',
                            source: text.title,
                            author: text.author
                        });
                    }
                });
            }
        });

        return sentences;
    }

    // 从句子中随机选择一个以逗号结束的分句进行挖空
    function createBlankSentence(sentence) {
        // 使用逗号分割分句
        const clauses = sentence.text.split(/[，；]/).filter(c => c.trim().length > 0);

        if (clauses.length <= 1) {
            // 如果只有一个分句，不进行挖空
            return {
                original: sentence.text,
                blanked: sentence.text,
                blankIndex: -1
            };
        }

        // 随机选择一个分句进行挖空（排除最后一个分句，因为后面是句号）
        const randomIndex = Math.floor(Math.random() * (clauses.length - 1));
        const selectedClause = clauses[randomIndex].trim();

        // 创建挖空后的句子
        const blankedClause = '__________';
        let blankedSentence = '';

        // 重建句子，替换选中的分句
        for (let i = 0; i < clauses.length; i++) {
            if (i === randomIndex) {
                blankedSentence += blankedClause;
            } else {
                blankedSentence += clauses[i].trim();
            }

            // 添加分隔符
            if (i < clauses.length - 1) {
                blankedSentence += i === clauses.length - 2 ? '。' : '，';
            }
        }

        return {
            original: sentence.text,
            blanked: blankedSentence,
            blankIndex: randomIndex,
            blankText: selectedClause,
            source: sentence.source,
            author: sentence.author
        };
    }

    // 生成复习题目
    function generateReviewQuestions() {
        // 清空之前的题目
        DOM.reviewSentences.innerHTML = '';

        // 随机选取五篇文章
        const randomTexts = getRandomTexts(5);

        if (randomTexts.length === 0) {
            DOM.reviewSentences.innerHTML = '<p class="error-message">无法获取文言文数据，请检查数据库文件。</p>';
            return;
        }

        const reviewQuestions = [];

        // 从每篇文章中提取句子并创建挖空题目
        randomTexts.forEach(text => {
            const sentences = extractSentencesFromText(text);

            if (sentences.length > 0) {
                // 随机选择一个句子
                const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
                const blankedSentence = createBlankSentence(randomSentence);

                if (blankedSentence.blankIndex >= 0) {
                    reviewQuestions.push(blankedSentence);
                }
            }
        });

        // 如果题目数量不足，尝试从其他文章中补充
        if (reviewQuestions.length < 5) {
            const classicTexts = window.RecitationData && window.RecitationData.texts ? window.RecitationData.texts : [];
            const allTexts = classicTexts.filter(text =>
                text.category !== '学期' &&
                text.paragraphs &&
                text.paragraphs.length > 0
            );

            for (let i = reviewQuestions.length; i < 5 && allTexts.length > 0; i++) {
                const randomText = allTexts[Math.floor(Math.random() * allTexts.length)];
                const sentences = extractSentencesFromText(randomText);

                if (sentences.length > 0) {
                    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
                    const blankedSentence = createBlankSentence(randomSentence);

                    if (blankedSentence.blankIndex >= 0 && !reviewQuestions.some(q => q.original === blankedSentence.original)) {
                        reviewQuestions.push(blankedSentence);
                    }
                }
            }
        }

        // 显示复习题目
        if (reviewQuestions.length > 0) {
            reviewQuestions.forEach((question, index) => {
                const sentenceElement = document.createElement('div');
                sentenceElement.className = 'review-sentence';

                // 创建序号
                const numberElement = document.createElement('span');
                numberElement.className = 'sentence-number';
                numberElement.textContent = (index + 1).toString();

                // 创建句子内容
                const contentElement = document.createElement('span');
                contentElement.className = 'sentence-content';

                // 处理句子文本，将下划线转换为可点击的挖空元素
                const processedContent = processSentenceForDisplay(question.blanked);
                contentElement.innerHTML = processedContent;

                // 添加来源信息
                const sourceElement = document.createElement('div');
                sourceElement.className = 'sentence-source';
                sourceElement.textContent = `—— ${question.source} ${question.author ? `· ${question.author}` : ''}`;
                sourceElement.style.fontSize = '14px';
                sourceElement.style.color = '#666';
                sourceElement.style.marginTop = '10px';
                sourceElement.style.fontStyle = 'italic';

                sentenceElement.appendChild(numberElement);
                sentenceElement.appendChild(contentElement);
                sentenceElement.appendChild(sourceElement);

                // 存储原始数据
                sentenceElement.dataset.original = question.original;
                sentenceElement.dataset.blankText = question.blankText;

                DOM.reviewSentences.appendChild(sentenceElement);
            });

            // 显示复习内容区域
            DOM.reviewContent.classList.remove('hidden');

            // 添加点击事件监听器
            addBlankClickListeners();
        } else {
            DOM.reviewSentences.innerHTML = '<p class="error-message">无法生成足够的复习题目，请重试。</p>';
        }
    }

    // 处理句子文本，将下划线转换为可点击的挖空元素
    function processSentenceForDisplay(sentence) {
        return sentence.replace(/__________/g, '<span class="blank" data-blank="true">__________</span>');
    }

    // 添加挖空点击事件监听器
    function addBlankClickListeners() {
        const blanks = document.querySelectorAll('.blank[data-blank="true"]');

        blanks.forEach(blank => {
            blank.addEventListener('click', function () {
                const sentenceElement = this.closest('.review-sentence');
                const blankText = sentenceElement.dataset.blankText;

                if (this.classList.contains('revealed')) {
                    // 恢复为挖空状态
                    this.textContent = '__________';
                    this.classList.remove('revealed');
                } else {
                    // 显示原句内容
                    this.textContent = blankText;
                    this.classList.add('revealed');
                }
            });
        });
    }

    // 设备类型检测（按屏幕尺寸）
    function detectDeviceByScreenSize() {
        const width = window.screen.width;
        const height = window.screen.height;
        if (width <= 767 || height <= 767) {
            return 'Mobile';
        } else if (width > 767 && width <= 1024) {
            return 'Tablet';
        } else {
            return 'Desktop';
        }
    }

    DOM.generateReviewBtn.addEventListener('click', generateReviewQuestions);

    // 页面加载完成后执行
    window.addEventListener('DOMContentLoaded', function () {
        const deviceType = detectDeviceByScreenSize();
        // 保持对外部脚本的兼容性
        window.deviceType = deviceType;
        document.body.dataset.device = deviceType;
        document.body.classList.add('device-' + deviceType.toLowerCase());

        // 自动加载示例文本，方便用户直接查看效果
        loadSampleText();

        // 初始化学期选择器
        initSemesterSelector();

        // 初始化文言文篇目列表
        initTextsList();
    });
})();