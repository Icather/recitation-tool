// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function () {

    // ==========================================================================
    // 元素淡入动画
    // ==========================================================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 需要淡入动画的元素
    const fadeElements = document.querySelectorAll(
        '.section-header, .science-card, .feature-item, .scenario-card, .reference-item, .cta-content'
    );

    fadeElements.forEach((element, index) => {
        element.classList.add('fade-in');
        element.style.transitionDelay = `${index % 4 * 0.1}s`;
        fadeInObserver.observe(element);
    });

    // 添加淡入样式
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    // ==========================================================================
    // 平滑滚动
    // ==========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================================================
    // Hero 插图交互
    // ==========================================================================
    const illustrationCard = document.querySelector('.illustration-card');
    if (illustrationCard) {
        illustrationCard.addEventListener('mouseenter', function () {
            this.style.animationPlayState = 'paused';
        });

        illustrationCard.addEventListener('mouseleave', function () {
            this.style.animationPlayState = 'running';
        });
    }

    // ==========================================================================
    // 科学卡片悬停效果
    // ==========================================================================
    const scienceCards = document.querySelectorAll('.science-card');
    scienceCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            const icon = this.querySelector('.science-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });

        card.addEventListener('mouseleave', function () {
            const icon = this.querySelector('.science-icon');
            if (icon) {
                icon.style.transform = 'scale(1)';
            }
        });
    });

    // ==========================================================================
    // Demo 卡片打字机效果
    // ==========================================================================
    const demoCards = document.querySelectorAll('.demo-card');

    const demoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const blanks = entry.target.querySelectorAll('.blank, .blank-inline, .text-blank');
                blanks.forEach((blank, index) => {
                    setTimeout(() => {
                        blank.classList.add('pulse');
                    }, index * 200);
                });
                demoObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    demoCards.forEach(card => {
        demoObserver.observe(card);
    });

    // 添加脉冲动画样式
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        .pulse {
            animation: pulse 2s ease-in-out infinite;
        }
    `;
    document.head.appendChild(pulseStyle);

    // ==========================================================================
    // 场景卡片序列动画
    // ==========================================================================
    const scenarioCards = document.querySelectorAll('.scenario-card');
    scenarioCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.15}s`;
    });

    // ==========================================================================
    // 按钮点击波纹效果
    // ==========================================================================
    const buttons = document.querySelectorAll('.btn-primary');
    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // 添加波纹动画样式
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to { transform: scale(4); opacity: 0; }
        }
    `;
    document.head.appendChild(rippleStyle);

    // ==========================================================================
    // 滚动进度指示器（可选）
    // ==========================================================================
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        z-index: 9999;
        transition: width 0.1s ease;
        width: 0%;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });

    // ==========================================================================
    // 键盘导航支持
    // ==========================================================================
    document.addEventListener('keydown', function (e) {
        // 按 Home 键回到顶部
        if (e.key === 'Home') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // 按 End 键到底部
        if (e.key === 'End') {
            e.preventDefault();
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
        }
    });

});