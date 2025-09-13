// 获取DOM元素
const inputText = document.getElementById('input-text');
const processBtn = document.getElementById('process-btn');
const intervalInput = document.getElementById('interval');
const startInput = document.getElementById('start');
const randomRatioInput = document.getElementById('random-ratio');
const regularModeCheckbox = document.getElementById('regular-mode');
const randomModeCheckbox = document.getElementById('random-mode');
const firstCharModeCheckbox = document.getElementById('first-char-mode');
const outputText = document.getElementById('output-text');

// 处理文本的函数
function processText() {
    // 获取用户输入的文本
    const text = inputText.value.trim();
    
    // 检查文本是否为空
    if (!text) {
        outputText.value = '请输入文言文内容后再进行处理';
        return;
    }
    
    // 获取设置的参数
    let interval = parseInt(intervalInput.value);
    let start = parseInt(startInput.value);
    let randomRatio = parseInt(randomRatioInput.value);
    const isRegularModeEnabled = regularModeCheckbox.checked;
    const isRandomModeEnabled = randomModeCheckbox.checked;
    const isFirstCharModeEnabled = firstCharModeCheckbox.checked;
    
    // 验证输入的数值是否有效
    if (isNaN(interval) || interval < 1) {
        interval = 3; // 默认值
        intervalInput.value = interval;
    }
    
    if (isNaN(start) || start < 0) {
        start = 1; // 默认值
        startInput.value = start;
    }
    
    if (isNaN(randomRatio) || randomRatio < 1 || randomRatio > 100) {
        randomRatio = 30; // 默认值
        randomRatioInput.value = randomRatio;
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
        
        outputText.value = result;
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
    
    outputText.value = result;
}

// 添加事件监听器
processBtn.addEventListener('click', processText);

// 添加键盘快捷键支持
inputText.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter 处理文本
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        processText();
    }
});

// 移除实时输入验证，改为在点击生成按钮时进行验证

// 控制功能区控件的启用/禁用状态
function toggleControlElements() {
    const isFirstCharModeEnabled = firstCharModeCheckbox.checked;
    
    // 如果启用了仅显示句首字模式，则禁用其他所有挖空模式和相关设置
    if (isFirstCharModeEnabled) {
        regularModeCheckbox.disabled = true;
        randomModeCheckbox.disabled = true;
        intervalInput.disabled = true;
        startInput.disabled = true;
        randomRatioInput.disabled = true;
        
        // 添加禁用样式
        regularModeCheckbox.classList.add('disabled');
        randomModeCheckbox.classList.add('disabled');
        intervalInput.classList.add('disabled');
        startInput.classList.add('disabled');
        randomRatioInput.classList.add('disabled');
    } else {
        // 启用其他模式开关
        regularModeCheckbox.disabled = false;
        randomModeCheckbox.disabled = false;
        regularModeCheckbox.classList.remove('disabled');
        randomModeCheckbox.classList.remove('disabled');
        
        const isRegularModeEnabled = regularModeCheckbox.checked;
        const isRandomModeEnabled = randomModeCheckbox.checked;
        
        // 根据常规挖空模式开关控制间隔和起始字数输入框
        intervalInput.disabled = !isRegularModeEnabled;
        startInput.disabled = !isRegularModeEnabled;
        
        // 根据随机挖空模式开关控制随机挖空频率输入框
        randomRatioInput.disabled = !isRandomModeEnabled;
        
        // 添加/移除禁用样式
        intervalInput.classList.toggle('disabled', !isRegularModeEnabled);
        startInput.classList.toggle('disabled', !isRegularModeEnabled);
        randomRatioInput.classList.toggle('disabled', !isRandomModeEnabled);
    }
}

// 监听常规挖空功能开关的状态变化
regularModeCheckbox.addEventListener('change', function() {
    // 如果启用了常规挖空，自动禁用仅显示句首字模式
    if (this.checked && firstCharModeCheckbox.checked) {
        firstCharModeCheckbox.checked = false;
    }
    toggleControlElements();
});

// 监听随机挖空功能开关的状态变化
randomModeCheckbox.addEventListener('change', function() {
    // 如果启用了随机挖空，自动禁用仅显示句首字模式
    if (this.checked && firstCharModeCheckbox.checked) {
        firstCharModeCheckbox.checked = false;
    }
    toggleControlElements();
});

// 监听仅显示句首字功能开关的状态变化
firstCharModeCheckbox.addEventListener('change', function() {
    // 如果启用了仅显示句首字，自动禁用其他挖空模式
    if (this.checked) {
        regularModeCheckbox.checked = false;
        randomModeCheckbox.checked = false;
    }
    toggleControlElements();
});

// 页面加载时初始化控件状态
toggleControlElements();

// 添加示例文本（可选）
function loadSampleText() {
    const sample = `臣密言：臣以险衅，夙遭闵凶。生孩六月，慈父见背；行年四岁，舅夺母志。祖母刘愍臣孤弱，躬亲抚养。臣少多疾病，九岁不行，零丁孤苦，至于成立。既无伯叔，终鲜兄弟，门衰祚薄，晚有儿息。外无期功强近之亲，内无应门五尺之僮，茕茕孑立，形影相吊。而刘夙婴疾病，常在床蓐，臣侍汤药，未曾废离。`;
    
    inputText.value = sample;
}

// 文言文预设内容选择区相关DOM引用
const textsListUl = document.getElementById('texts-list-ul');
const paragraphsContainer = document.getElementById('paragraphs-container');
const textsListView = document.getElementById('texts-list-view');
const paragraphsListView = document.getElementById('paragraphs-list-view');
const backToTextsBtn = document.getElementById('back-to-texts');
const currentTextTitle = document.getElementById('current-text-title');
const semesterSelector = document.createElement('select');
semesterSelector.id = 'semester-selector';

// 初始化学期选择器
function initSemesterSelector() {
    // 在篇目列表标题下方添加学期选择器
    const textsListHeader = textsListView.querySelector('h4');
    if (textsListHeader && !document.getElementById('semester-selector')) {
        semesterSelector.innerHTML = '<option value="all">全部学期</option>';
        
        // 收集所有学期并去重
        const semesters = new Set();
        if (window.classicTexts && window.classicTexts.length > 0) {
            window.classicTexts.forEach(text => {
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
        semesterSelector.addEventListener('change', function() {
            initTextsList(this.value);
        });
        
        // 添加到DOM
        textsListHeader.parentNode.insertBefore(semesterSelector, textsListHeader.nextSibling);
    }
}

// 初始化文言文篇目列表，支持按学期筛选
function initTextsList(selectedSemester = 'all') {
    // 清空列表
    textsListUl.innerHTML = '';
    
    // 遍历数据库，创建列表项
    if (window.classicTexts && window.classicTexts.length > 0) {
        // 过滤出选中学期的篇目
        const filteredTexts = window.classicTexts.filter(text => {
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
                li.addEventListener('click', function() {
                    // 移除其他项的选中状态
                    document.querySelectorAll('#texts-list-ul li').forEach(item => {
                        item.classList.remove('selected');
                    });
                    
                    // 添加当前项的选中状态
                    this.classList.add('selected');
                    
                    // 显示对应的段落列表
                    showParagraphs(text);
                });
                
                textsListUl.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = '当前学期暂无篇目';
            textsListUl.appendChild(li);
        }
    } else {
        const li = document.createElement('li');
        li.textContent = '加载文言文篇目失败';
        textsListUl.appendChild(li);
    }
}

// 切换视图函数
function switchView(fromView, toView) {
    fromView.classList.remove('active');
    toView.classList.add('active');
}

// 返回篇目列表
function backToTextsList() {
    switchView(paragraphsListView, textsListView);
    backToTextsBtn.classList.add('hidden');
    currentTextTitle.textContent = '请选择一篇文言文';
    
    // 移除所有选中状态
    document.querySelectorAll('#texts-list-ul li').forEach(item => {
        item.classList.remove('selected');
    });
}

// 显示选中篇目对应的段落列表
function showParagraphs(text) {
    // 更新导航标题
    currentTextTitle.textContent = `${text.title} - ${text.author}`;
    
    // 显示返回按钮
    backToTextsBtn.classList.remove('hidden');
    
    // 切换到段落列表视图
    switchView(textsListView, paragraphsListView);
    
    // 清空容器
    paragraphsContainer.innerHTML = '';
    
    // 创建段落选择按钮
    text.paragraphs.forEach((paragraph, index) => {
        const paragraphCard = document.createElement('div');
        paragraphCard.className = 'paragraph-card';
        
        const paragraphTitle = document.createElement('h5');
        paragraphTitle.textContent = `段落 ${index + 1}`;
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
        selectBtn.addEventListener('click', function() {
            // 将选中的段落内容添加到输入框
            inputText.value = paragraph.content;
            
            // 可以选择是否自动处理
            // processText();
            
            // 创建并显示提示信息
            const originalText = selectBtn.textContent;
            const originalBgColor = selectBtn.style.backgroundColor;
            
            // 修改按钮文字和背景色作为提示
            selectBtn.textContent = '已选择此段落';
            selectBtn.style.backgroundColor = '#FF9800';
            
            // 2秒后恢复原状
            setTimeout(function() {
                selectBtn.textContent = originalText;
                selectBtn.style.backgroundColor = originalBgColor;
            }, 2000);
        });
        
        paragraphCard.appendChild(selectBtn);
        paragraphsContainer.appendChild(paragraphCard);
    });
    
    // 添加"选择全文"按钮
    const selectAllBtn = document.createElement('button');
    selectAllBtn.className = 'select-all-btn';
    selectAllBtn.textContent = '选择全文';
    selectAllBtn.dataset.textId = text.id;
    
    // 添加点击事件
    selectAllBtn.addEventListener('click', function() {
        // 合并所有段落内容
        const fullText = text.paragraphs.map(p => p.content).join('\n\n');
        
        // 将全文内容添加到输入框
        inputText.value = fullText;
        
        // 可以选择是否自动处理
        // processText();
        
        // 创建并显示提示信息
        const originalText = selectAllBtn.textContent;
        const originalBgColor = selectAllBtn.style.backgroundColor;
        
        // 修改按钮文字和背景色作为提示
        selectAllBtn.textContent = '已选择全文';
        selectAllBtn.style.backgroundColor = '#FF9800';
        
        // 2秒后恢复原状
        setTimeout(function() {
            selectAllBtn.textContent = originalText;
            selectAllBtn.style.backgroundColor = originalBgColor;
        }, 2000);
    });
    
    paragraphsContainer.prepend(selectAllBtn);
}

// 添加返回按钮的点击事件
backToTextsBtn.addEventListener('click', backToTextsList);

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', function() {
    // 自动加载示例文本，方便用户直接查看效果
    loadSampleText();
    
    // 初始化学期选择器
    initSemesterSelector();
    
    // 初始化文言文篇目列表
    initTextsList();
});