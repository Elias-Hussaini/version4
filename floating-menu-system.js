/**
 * ======================================================================
 * FLOATING MENU SYSTEM - ELIAS DICTIONARY
 * ======================================================================
 * 
 * نسخه نهایی - فقط منوی شناور، بدون سایدبار
 * با پشتیبانی کامل از localStorage و حافظه
 * 
 * @version 2.0.0
 * ======================================================================
 */

(function() {
    'use strict';
    
    // ======================================================================
    // VARIABLES & STATE
    // ======================================================================
    
    const FMS = {
        isOpen: false,
        isAnimating: false,
        
        elements: {
            bookBtn: null,
            menuContainer: null,
            mainContent: null
        },
        
        config: {
            animationDuration: 400,
            shrinkPercentage: 78,
            rotationDuration: 20,
            menuWidth: 320,
            mobileBreakpoint: 992
        },
        
    menuItems: [
    { section: 'search', icon: 'fa-search', label: window.LanguageSystem ? window.LanguageSystem.t('menu.search') : 'جستجو' },
    { section: 'add-word', icon: 'fa-plus-circle', label: window.LanguageSystem ? window.LanguageSystem.t('menu.addWord') : 'اضافه کردن لغت' },
    { section: 'translate', icon: 'fa-language', label: window.LanguageSystem ? window.LanguageSystem.t('menu.translate') : 'ترجمه' },
    { section: 'ai-chat', icon: 'fa-robot', label: window.LanguageSystem ? window.LanguageSystem.t('menu.aiChat') : 'هوش مصنوعی' },
    { section: 'favorites', icon: 'fa-star', label: window.LanguageSystem ? window.LanguageSystem.t('menu.favorites') : 'علاقه‌مندی‌ها' },
    { section: 'practice', icon: 'fa-pen', label: window.LanguageSystem ? window.LanguageSystem.t('menu.practice') : 'تمرین' },
    { section: 'flashcards', icon: 'fa-layer-group', label: window.LanguageSystem ? window.LanguageSystem.t('menu.flashcards') : 'فلش کارت‌ها' },
    { section: 'quiz', icon: 'fa-question-circle', label: window.LanguageSystem ? window.LanguageSystem.t('menu.quiz') : 'آزمون واژگان' },
    { section: 'word-list', icon: 'fa-list', label: window.LanguageSystem ? window.LanguageSystem.t('menu.wordList') : 'لیست لغات' },
    { section: 'progress', icon: 'fa-chart-line', label: window.LanguageSystem ? window.LanguageSystem.t('menu.progress') : 'پیشرفت' },
    { section: 'settings', icon: 'fa-cog', label: window.LanguageSystem ? window.LanguageSystem.t('menu.settings') : 'تنظیمات' }
]
    };
    
    // ======================================================================
    // CREATE FLOATING MENU
    // ======================================================================
    
    function createFloatingMenu() {
        if (document.getElementById('floating-book-btn')) {
            return;
        }
        
        // ========== ساخت دکمه کتاب ==========
        const bookBtn = document.createElement('button');
        bookBtn.id = 'floating-book-btn';
        bookBtn.className = 'floating-book-btn';
        bookBtn.setAttribute('aria-label', 'منوی اصلی');
        bookBtn.setAttribute('title', 'باز کردن منو');
        
        const bookIcon = document.createElement('i');
        bookIcon.className = 'fas fa-book-open book-icon';
        bookBtn.appendChild(bookIcon);
        
        // ========== ساخت منوی شناور ==========
        const menuContainer = document.createElement('div');
        menuContainer.id = 'floating-menu-container';
        menuContainer.className = 'floating-menu-container';
        
        // هدر منو
        const menuHeader = document.createElement('div');
        menuHeader.className = 'floating-menu-header';
        menuHeader.innerHTML = `
            <div class="menu-header-content">
                <i class="fas fa-graduation-cap"></i>
                <span>Elias.Dictionary</span>
            </div>
            <button class="menu-close-btn" id="floating-menu-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        menuContainer.appendChild(menuHeader);
        
        // زیر عنوان منو
        const menuSubheader = document.createElement('div');
        menuSubheader.className = 'floating-menu-subheader';
        menuSubheader.innerHTML = `
            <i class="fas fa-search"></i>
            <span>جستجوی سریع...</span>
        `;
        menuContainer.appendChild(menuSubheader);
        
        // لیست آیتم‌های منو
        const menuList = document.createElement('div');
        menuList.className = 'floating-menu-list';
        
        FMS.menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'floating-menu-item';
            menuItem.setAttribute('data-section', item.section);
            
            menuItem.innerHTML = `
                <i class="fas ${item.icon} menu-item-icon"></i>
                <span class="menu-item-label">${item.label}</span>
                <i class="fas fa-chevron-left menu-item-arrow"></i>
            `;
            
            menuList.appendChild(menuItem);
        });
        
        menuContainer.appendChild(menuList);
        
        // فوتر منو
        const menuFooter = document.createElement('div');
        menuFooter.className = 'floating-menu-footer';
        
        const now = new Date();
        const hour = now.getHours();
        let greeting = 'عصر';
        if (hour < 12) greeting = 'صبح';
        else if (hour < 17) greeting = 'بعد از ظهر';
        else greeting = 'عصر';
        
        menuFooter.innerHTML = `
            <div class="menu-footer-greeting">
                <i class="far fa-smile"></i>
                <span>${greeting} بخیر</span>
            </div>
            <div class="menu-footer-version">
                <span>v2.0</span>
            </div>
        `;
        
        menuContainer.appendChild(menuFooter);
        
        document.body.appendChild(bookBtn);
        document.body.appendChild(menuContainer);
    }
    
    // ======================================================================
    // CORE FUNCTIONS
    // ======================================================================
    
    function cacheElements() {
        FMS.elements = {
            bookBtn: document.getElementById('floating-book-btn'),
            menuContainer: document.getElementById('floating-menu-container'),
            mainContent: document.querySelector('.main-content')
        };
    }
    
    function openMenu() {
        if (FMS.isOpen || FMS.isAnimating) return;
        
        FMS.isAnimating = true;
        
        const { bookBtn, menuContainer, mainContent } = FMS.elements;
        
        bookBtn.classList.add('pulse-animation');
        bookBtn.classList.remove('rotating');
        
        menuContainer.classList.add('open');
        
        if (window.innerWidth > FMS.config.mobileBreakpoint && mainContent) {
            mainContent.style.transition = `all ${FMS.config.animationDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
            mainContent.style.width = `${FMS.config.shrinkPercentage}%`;
            mainContent.style.marginRight = 'auto';
            mainContent.style.marginLeft = 'auto';
        }
        
        const menuItems = document.querySelectorAll('.floating-menu-item');
        menuItems.forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.05}s`;
            item.classList.add('show');
        });
        
        setTimeout(() => {
            FMS.isOpen = true;
            FMS.isAnimating = false;
            bookBtn.setAttribute('title', 'بستن منو');
        }, FMS.config.animationDuration);
    }
    
    function closeMenu() {
        if (!FMS.isOpen || FMS.isAnimating) return;
        
        FMS.isAnimating = true;
        
        const { bookBtn, menuContainer, mainContent } = FMS.elements;
        
        bookBtn.classList.remove('pulse-animation');
        bookBtn.classList.add('rotating');
        
        menuContainer.classList.remove('open');
        
        const menuItems = document.querySelectorAll('.floating-menu-item');
        menuItems.forEach(item => {
            item.style.transitionDelay = '0s';
            item.classList.remove('show');
        });
        
        if (mainContent) {
            mainContent.style.width = '100%';
            mainContent.style.marginRight = '0';
            mainContent.style.marginLeft = '0';
        }
        
        setTimeout(() => {
            FMS.isOpen = false;
            FMS.isAnimating = false;
            bookBtn.setAttribute('title', 'باز کردن منو');
        }, FMS.config.animationDuration);
    }
    
    function toggleMenu() {
        if (FMS.isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    // ======================================================================
    // NAVIGATION - با پشتیبانی کامل از dictionaryApp
    // ======================================================================
    
    function navigateToSection(sectionId) {
        console.log(`🧭 منوی شناور: رفتن به بخش ${sectionId}`);
        
        const targetSection = document.getElementById(`${sectionId}-section`);
        
        if (targetSection) {
            // مخفی کردن همه بخش‌ها
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // نمایش بخش انتخاب شده
            targetSection.classList.add('active');
            
            // ذخیره در localStorage
            localStorage.setItem('lastActiveSection', sectionId);
            
            // ========== ارتباط با dictionaryApp ==========
            if (window.dictionaryApp) {
                console.log(`🤖 ارسال به dictionaryApp: ${sectionId}`);
                
                // بارگذاری محتوای بخش‌های خاص
                switch(sectionId) {
                    case 'ai-chat':
                        window.dictionaryApp.renderAIChat();
                        break;
                    case 'settings':
                        window.dictionaryApp.renderSettings();
                        break;
                    case 'practice':
                        window.dictionaryApp.renderPracticeOptions();
                        break;
                    case 'favorites':
                        window.dictionaryApp.renderFavorites();
                        break;
                    case 'word-list':
                        window.dictionaryApp.renderWordList();
                        break;
                    case 'progress':
                        window.dictionaryApp.updateStats();
                        break;
                    case 'translate':
                        window.dictionaryApp.renderTranslate();
                        break;
                    case 'quiz':
                        window.dictionaryApp.startQuiz();
                        break;
                    case 'flashcards':
                        window.dictionaryApp.startPracticeSession();
                        break;
                    case 'search':
                        // اگر بخش جستجو خالی بود، رندر کن
                        if (!document.querySelector('#search-section .word-card')) {
                            window.dictionaryApp.renderSearchSection();
                        }
                        break;
                    case 'add-word':
                        // اگر بخش افزودن لغت خالی بود، رندر کن
                        if (!document.querySelector('#add-word-section .word-card')) {
                            window.dictionaryApp.renderAddWordSection();
                        }
                        break;
                }
            }
            
            // ارسال رویداد سفارشی
            window.dispatchEvent(new CustomEvent('floatingMenuNavigate', {
                detail: { section: sectionId }
            }));
        }
        
        // بستن منو با تاخیر
        setTimeout(() => {
            closeMenu();
        }, 150);
    }
    
    // ======================================================================
    // EVENT HANDLERS
    // ======================================================================
    
    function attachEvents() {
        const { bookBtn, menuContainer } = FMS.elements;
        
        if (!bookBtn || !menuContainer) return;
        
        // کلیک روی دکمه کتاب
        bookBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });
        
        // دکمه بستن در هدر
        const closeBtn = document.getElementById('floating-menu-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeMenu();
            });
        }
        
        // کلیک روی آیتم‌های منو
        document.querySelectorAll('.floating-menu-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                const section = this.getAttribute('data-section');
                if (section) {
                    navigateToSection(section);
                }
            });
        });
        
        // کلیک خارج از منو برای بستن
        document.addEventListener('click', function(e) {
            if (FMS.isOpen && 
                menuContainer && 
                bookBtn && 
                !menuContainer.contains(e.target) && 
                !bookBtn.contains(e.target)) {
                closeMenu();
            }
        });
        
        // جلوگیری از بسته شدن با کلیک روی منو
        if (menuContainer) {
            menuContainer.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
        
        // کلید Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && FMS.isOpen) {
                closeMenu();
            }
        });
        
        // تغییر اندازه صفحه
        window.addEventListener('resize', debounce(function() {
            handleResize();
        }, 250));
    }
    
    function handleResize() {
        const { mainContent } = FMS.elements;
        
        if (window.innerWidth <= FMS.config.mobileBreakpoint) {
            if (FMS.isOpen && FMS.elements.menuContainer) {
                FMS.elements.menuContainer.style.left = '16px';
                FMS.elements.menuContainer.style.right = '16px';
                FMS.elements.menuContainer.style.width = 'calc(100% - 32px)';
            }
            
            if (mainContent) {
                mainContent.style.width = '100%';
                mainContent.style.marginRight = '0';
                mainContent.style.marginLeft = '0';
            }
        } else {
            if (FMS.elements.menuContainer) {
                FMS.elements.menuContainer.style.left = '28px';
                FMS.elements.menuContainer.style.right = 'auto';
                FMS.elements.menuContainer.style.width = `${FMS.config.menuWidth}px`;
            }
            
            if (FMS.isOpen && mainContent) {
                mainContent.style.width = `${FMS.config.shrinkPercentage}%`;
            }
        }
    }
    
    function checkInitialState() {
        if (FMS.elements.bookBtn) {
            FMS.elements.bookBtn.classList.add('rotating');
        }
        
        // بارگذاری آخرین بخش فعال
        const lastSection = localStorage.getItem('lastActiveSection');
        if (lastSection) {
            setTimeout(() => {
                navigateToSection(lastSection);
            }, 300);
        }
    }
    
    // ======================================================================
    // STYLE INJECTION
    // ======================================================================
    
    function injectStyles() {
        if (document.getElementById('floating-menu-final-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'floating-menu-final-styles';
        style.textContent = `
            /* ====================================================
               FLOATING MENU SYSTEM - FINAL VERSION
               بدون سایدبار - طراحی تمام صفحه
               ==================================================== */
            
            /* حذف سایدبار قدیمی */
            .sidebar {
                display: none !important;
            }
            
            /* تنظیم کانتینر اصلی */
            .container {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            
            /* محتوای اصلی - تمام عرض */
            .main-content {
                margin-right: 0 !important;
                width: 100% !important;
                max-width: 1400px !important;
                margin-left: auto !important;
                margin-right: auto !important;
                padding: 24px !important;
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                min-height: 100vh !important;
                box-sizing: border-box !important;
            }
            
            /* ===== دکمه کتاب ===== */
            .floating-book-btn {
                position: fixed !important;
                bottom: 28px !important;
                left: 28px !important;
                width: 68px !important;
                height: 68px !important;
                border-radius: 50% !important;
                background: linear-gradient(145deg, #667eea, #5a67d8) !important;
                border: none !important;
                box-shadow: 0 10px 25px rgba(102, 126, 234, 0.5),
                            0 0 0 2px rgba(255, 255, 255, 0.1) !important;
                cursor: pointer !important;
                z-index: 99999 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                animation: float 4s ease-in-out infinite !important;
            }
            
            .floating-book-btn:hover {
                transform: scale(1.08) !important;
                box-shadow: 0 15px 35px rgba(102, 126, 234, 0.7),
                            0 0 0 4px rgba(255, 255, 255, 0.2) !important;
            }
            
            .floating-book-btn .book-icon {
                font-size: 32px !important;
                color: white !important;
                filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2)) !important;
            }
            
            .floating-book-btn.rotating .book-icon {
                animation: slowRotate 20s linear infinite !important;
            }
            
            .floating-book-btn.pulse-animation .book-icon {
                animation: pulse 1.5s ease-in-out infinite !important;
            }
            
            @keyframes slowRotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-6px); }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.15); opacity: 0.9; }
            }
            
            /* ===== کانتینر منو ===== */
            .floating-menu-container {
                position: fixed !important;
                bottom: 110px !important;
                left: 28px !important;
                width: 320px !important;
                max-width: calc(100vw - 56px) !important;
                max-height: 70vh !important;
                background: rgba(255, 255, 255, 0.98) !important;
                backdrop-filter: blur(20px) !important;
                -webkit-backdrop-filter: blur(20px) !important;
                border-radius: 28px !important;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                z-index: 99998 !important;
                display: flex !important;
                flex-direction: column !important;
                opacity: 0 !important;
                visibility: hidden !important;
                transform: translateY(30px) scale(0.95) !important;
                transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                pointer-events: none !important;
                overflow: hidden !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
            }
            
            .floating-menu-container.open {
                opacity: 1 !important;
                visibility: visible !important;
                transform: translateY(0) scale(1) !important;
                pointer-events: all !important;
            }
            
            /* ===== هدر منو ===== */
            .floating-menu-header {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding: 20px 24px !important;
                background: linear-gradient(135deg, #667eea, #764ba2) !important;
                color: white !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            }
            
            .menu-header-content {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                font-size: 18px !important;
                font-weight: 700 !important;
            }
            
            .menu-header-content i {
                font-size: 24px !important;
            }
            
            .menu-close-btn {
                width: 36px !important;
                height: 36px !important;
                border-radius: 50% !important;
                background: rgba(255, 255, 255, 0.2) !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                color: white !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
                font-size: 16px !important;
            }
            
            .menu-close-btn:hover {
                background: rgba(255, 255, 255, 0.3) !important;
                transform: rotate(90deg) scale(1.1) !important;
            }
            
            /* ===== زیر عنوان ===== */
            .floating-menu-subheader {
                padding: 16px 24px !important;
                background: #f8fafc !important;
                border-bottom: 1px solid #e2e8f0 !important;
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                color: #64748b !important;
                font-size: 14px !important;
            }
            
            .floating-menu-subheader i {
                color: #667eea !important;
            }
            
            /* ===== لیست آیتم‌ها ===== */
            .floating-menu-list {
                flex: 1 !important;
                overflow-y: auto !important;
                padding: 16px !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 4px !important;
                background: white !important;
            }
            
            .floating-menu-item {
                display: flex !important;
                align-items: center !important;
                padding: 14px 18px !important;
                border-radius: 16px !important;
                cursor: pointer !important;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                color: #1e293b !important;
                font-weight: 500 !important;
                opacity: 0 !important;
                transform: translateX(-20px) !important;
                position: relative !important;
            }
            
            .floating-menu-item.show {
                opacity: 1 !important;
                transform: translateX(0) !important;
            }
            
            .floating-menu-item:hover {
                background: linear-gradient(90deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.02)) !important;
                transform: translateX(5px) !important;
            }
            
            .floating-menu-item .menu-item-icon {
                width: 24px !important;
                font-size: 18px !important;
                margin-left: 16px !important;
                color: #667eea !important;
                transition: all 0.3s ease !important;
            }
            
            .floating-menu-item:hover .menu-item-icon {
                transform: scale(1.15) !important;
                color: #764ba2 !important;
            }
            
            .floating-menu-item .menu-item-label {
                flex: 1 !important;
                font-size: 15px !important;
            }
            
            .floating-menu-item .menu-item-arrow {
                font-size: 12px !important;
                color: #94a3b8 !important;
                opacity: 0 !important;
                transition: all 0.3s ease !important;
            }
            
            .floating-menu-item:hover .menu-item-arrow {
                opacity: 1 !important;
                transform: translateX(-3px) !important;
                color: #667eea !important;
            }
            
            /* ===== فوتر منو ===== */
            .floating-menu-footer {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding: 16px 24px !important;
                background: #f8fafc !important;
                border-top: 1px solid #e2e8f0 !important;
                color: #64748b !important;
                font-size: 13px !important;
            }
            
            .menu-footer-greeting {
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
            }
            
            .menu-footer-greeting i {
                color: #fbbf24 !important;
            }
            
            .menu-footer-version {
                background: #e2e8f0 !important;
                padding: 4px 12px !important;
                border-radius: 20px !important;
                color: #475569 !important;
                font-weight: 600 !important;
            }
            
            /* ===== اسکرول بار ===== */
            .floating-menu-list::-webkit-scrollbar {
                width: 5px !important;
            }
            
            .floating-menu-list::-webkit-scrollbar-track {
                background: #f1f5f9 !important;
                border-radius: 10px !important;
            }
            
            .floating-menu-list::-webkit-scrollbar-thumb {
                background: #cbd5e1 !important;
                border-radius: 10px !important;
            }
            
            .floating-menu-list::-webkit-scrollbar-thumb:hover {
                background: #94a3b8 !important;
            }
            
            /* ===== حالت تاریک ===== */
            .dark-mode .floating-menu-container {
                background: rgba(30, 41, 59, 0.98) !important;
            }
            
            .dark-mode .floating-menu-subheader {
                background: #1e293b !important;
                border-bottom-color: #334155 !important;
                color: #94a3b8 !important;
            }
            
            .dark-mode .floating-menu-list {
                background: #1e293b !important;
            }
            
            .dark-mode .floating-menu-item {
                color: #e2e8f0 !important;
            }
            
            .dark-mode .floating-menu-item:hover {
                background: linear-gradient(90deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.05)) !important;
            }
            
            .dark-mode .floating-menu-footer {
                background: #0f172a !important;
                border-top-color: #334155 !important;
                color: #94a3b8 !important;
            }
            
            .dark-mode .menu-footer-version {
                background: #334155 !important;
                color: #cbd5e1 !important;
            }
            
            /* ===== ریسپانسیو ===== */
            @media (max-width: 768px) {
                .floating-book-btn {
                    width: 60px !important;
                    height: 60px !important;
                    bottom: 20px !important;
                    left: 20px !important;
                }
                
                .floating-book-btn .book-icon {
                    font-size: 28px !important;
                }
                
                .floating-menu-container {
                    left: 16px !important;
                    right: 16px !important;
                    width: auto !important;
                    bottom: 90px !important;
                    max-height: 65vh !important;
                }
                
                .main-content {
                    padding: 16px !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // ======================================================================
    // UTILITY FUNCTIONS
    // ======================================================================
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // ======================================================================
    // PUBLIC API
    // ======================================================================
    
    window.EliasMenu = {
        open: openMenu,
        close: closeMenu,
        toggle: toggleMenu,
        navigate: navigateToSection,
        isOpen: () => FMS.isOpen
    };
    
    // ======================================================================
    // INITIALIZATION
    // ======================================================================
    
    function init() {
        console.log('📚 Floating Menu System - راه‌اندازی...');
        
        // 1. حذف سایدبار قدیمی از DOM
        const oldSidebar = document.querySelector('.sidebar');
        if (oldSidebar) {
            oldSidebar.remove();
            console.log('✅ سایدبار قدیمی حذف شد');
        }
        
        // 2. حذف منوی موبایل قدیمی
        const oldMobileBtn = document.getElementById('mobileMenuBtn');
        if (oldMobileBtn) oldMobileBtn.remove();
        
        const oldMobileContainer = document.getElementById('mobileMenuContainer');
        if (oldMobileContainer) oldMobileContainer.remove();
        
        // 3. تنظیم main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.marginRight = '0';
            mainContent.style.width = '100%';
            mainContent.classList.add('full-width');
        }
        
        // 4. تزریق استایل‌ها
        injectStyles();
        
        // 5. ایجاد منوی شناور
        createFloatingMenu();
        
        // 6. کش کردن المنت‌ها
        cacheElements();
        
        // 7. تنظیم رویدادها
        attachEvents();
        
        // 8. بررسی وضعیت اولیه
        checkInitialState();
        
        console.log('✅ Floating Menu System - راه‌اندازی کامل شد');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();