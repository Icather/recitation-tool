// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 元素淡入动画
    const fadeElements = document.querySelectorAll('.section-header, .feature-card, .science-item, .step-item, .testimonial-card');
    
    // 设置初始状态
    fadeElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // 监听滚动事件，实现元素滚动时的淡入效果
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    fadeElements.forEach(element => {
        observer.observe(element);
    });
    
    // 统计数字增长动画
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });
    
    statNumbers.forEach(number => {
        statObserver.observe(number);
    });
    
    function animateNumber(element) {
        const target = parseInt(element.innerText);
        const duration = 2000; // 动画持续时间（毫秒）
        const steps = 60; // 动画步数
        const increment = target / (duration / 16.7); // 每16.7ms增加的值（约60fps）
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                clearInterval(timer);
                current = target;
                // 添加额外的符号（如%）
                element.innerText = element.innerText.includes('%') ? current + '%' : element.innerText.includes('+') ? current + '+' : current;
            } else {
                element.innerText = element.innerText.includes('%') ? Math.floor(current) + '%' : element.innerText.includes('+') ? Math.floor(current) + '+' : Math.floor(current);
            }
        }, 16.7);
    }
    
    // 平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // 减去导航栏高度
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 添加导航栏滚动效果
    const navLinks = document.querySelectorAll('.footer-links a');
    let currentSection = '';
    
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = '#' + section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === currentSection ? '#667eea' : 'white';
        });
    });
    
    // 按钮悬停效果增强
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // 为功能卡片添加额外的动画效果
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
        
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.feature-icon');
            icon.style.transform = 'scale(1.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.feature-icon');
            icon.style.transform = 'scale(1)';
        });
    });
    
    // 随机粒子背景效果（简单版）
    createParticles();
    
    function createParticles() {
        const sections = document.querySelectorAll('.hero-section, .cta-section');
        
        sections.forEach(section => {
            const canvas = document.createElement('canvas');
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '1';
            section.appendChild(canvas);
            
            const ctx = canvas.getContext('2d');
            let particlesArray = [];
            let resizeObserver;
            
            // 设置canvas尺寸
            function setCanvasSize() {
                const rect = section.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
                init();
            }
            
            // 初始化粒子
            function init() {
                particlesArray = [];
                const particleCount = Math.floor(canvas.width * canvas.height / 10000);
                
                for (let i = 0; i < particleCount; i++) {
                    const size = Math.random() * 2 + 1;
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    const speedX = (Math.random() - 0.5) * 0.3;
                    const speedY = (Math.random() - 0.5) * 0.3;
                    
                    particlesArray.push({
                        x, y, size, speedX, speedY
                    });
                }
            }
            
            // 绘制粒子
            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                particlesArray.forEach(particle => {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                });
                
                connectParticles();
            }
            
            // 连接邻近的粒子
            function connectParticles() {
                const opacityValue = 0.3;
                
                for (let a = 0; a < particlesArray.length; a++) {
                    for (let b = a; b < particlesArray.length; b++) {
                        const dx = particlesArray[a].x - particlesArray[b].x;
                        const dy = particlesArray[a].y - particlesArray[b].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < 100) {
                            ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue - (distance / 100) * opacityValue})`;
                            ctx.lineWidth = 0.5;
                            ctx.beginPath();
                            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                            ctx.stroke();
                        }
                    }
                }
            }
            
            // 更新粒子位置
            function update() {
                particlesArray.forEach(particle => {
                    particle.x += particle.speedX;
                    particle.y += particle.speedY;
                    
                    if (particle.x < 0 || particle.x > canvas.width) {
                        particle.speedX = -particle.speedX;
                    }
                    
                    if (particle.y < 0 || particle.y > canvas.height) {
                        particle.speedY = -particle.speedY;
                    }
                });
            }
            
            // 动画循环
            function animate() {
                draw();
                update();
                requestAnimationFrame(animate);
            }
            
            // 设置响应式
            resizeObserver = new ResizeObserver(() => {
                setCanvasSize();
            });
            
            resizeObserver.observe(section);
            setCanvasSize();
            animate();
            
            // 清理函数
            section.dataset.particlesCleanup = () => {
                resizeObserver.disconnect();
            };
        });
    }
    
    // 页面卸载时清理资源
    window.addEventListener('beforeunload', function() {
        const sections = document.querySelectorAll('.hero-section, .cta-section');
        sections.forEach(section => {
            if (section.dataset.particlesCleanup) {
                section.dataset.particlesCleanup();
            }
        });
    });
});