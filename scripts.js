/* ================================================
   ELIAS.DICTIONARY - اسکریپت کامل و نهایی
   نسخه 3.0.0 - تمام بخش‌ها فعال - فقط منوی شناور
   ================================================ */

// ================================================
// کلاس اصلی دیکشنری - GermanDictionary
// ================================================

class GermanDictionary {
    constructor() {
        // ========== متغیرهای اصلی ==========
        this.dbName = 'GermanPersianDictionary';
        this.dbVersion = 5;
        this.db = null;
        this.currentWord = null;
        this.favorites = new Set();
        this.chatMemory = []; // حافظه کامل مکالمه
this.isGeneratingImage = false;
        this.translateDirection = 'de-fa';
       this.isVoiceActive = false;
        this.voiceRecognition = null;
        this.voiceTimerInterval = null;
        this.voiceStartTime = null;
        this.currentChatId = 'current_chat_' + Date.now();
        this.voiceSynthesis = window.speechSynthesis;
     this.currentVoiceSettings = {
    speed: 1,
    pitch: 1,
    volume: 1,
    voice: null
};
        
        // ========== جلسات تمرین ==========
        this.practiceSession = null;
        this.quizSession = null;
        this.listeningSession = null;
        this.writingSession = null;
        this.speakingSession = null;
        
        // ========== پلیر موسیقی ==========
        this.audioPlayer = null;
        this.currentMusic = null;
        
        // ========== مدیریت اسکرول ==========
        this.scrollState = {
            isAtBottom: true,
            isUserScrolling: false,
            lastScrollTop: 0,
            scrollTimeout: null
        };
        
        // ========== وضعیت AI ==========
        this.isAITyping = false;
        this.aiModel = 'elias-mini';
        
        // ========== رنگ سفارشی ==========
        this.customColor = { r: 67, g: 97, b: 238 };
        this.renderInitialSections();
        // ========== مقداردهی اولیه ==========
        this.init();
    }

    // ================================================
    // مقداردهی اولیه و دیتابیس
    // ================================================
async init() {
    console.log('🚀 راه‌اندازی Elias.Dictionary...');
    
    try {
        await this.initDB();
        await this.loadFavorites();
        
        // اول event listenerها رو تنظیم کن
        this.setupEventListeners();
        this.loadCustomization();
        this.updateOnlineStatus();
        this.setupOnlineStatusListener();
        
        // بعد از لود کامل، آمار رو آپدیت کن
        setTimeout(() => {
            if (this.db) {
                this.updateStats();
            }
        }, 1000);
        
        // چت رو لود کن
        setTimeout(() => {
            this.autoLoadChatOnStart();
        }, 500);
        
        console.log('✅ راه‌اندازی کامل شد');
    } catch (error) {
        console.error('❌ خطا در راه‌اندازی:', error);
    }
    this.hideLoadingScreen();
}
hideLoadingScreen() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 2000); // ۲ ثانیه نمایش بده
}
renderInitialSections() {
    console.log('🎨 رندر اولیه بخش‌ها...');
    
    // رندر بخش جستجو
    this.renderSearchSection();
    
    // رندر بخش افزودن لغت
    this.renderAddWordSection();
    
    // رندر بخش مترجم
    this.renderTranslate();
    
    // رندر بخش تمرین
    this.renderPracticeOptions();
    
    // رندر بخش تنظیمات
    this.renderSettings();
    
    // رندر لیست لغات
    this.renderWordList();
    
    // رندر علاقه‌مندی‌ها
    this.renderFavorites();
    
    // رندر آمار
    this.updateStats();
    
    // رندر AI چت
    this.renderAIChat();
    
    console.log('✅ رندر اولیه کامل شد');
}

renderSearchSection() {
    const container = document.getElementById('search-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-search" style="color: var(--primary);"></i> جستجوی پیشرفته لغات</h2>
            </div>
            
            <div class="search-box">
                <input type="text" id="search-input" class="form-control" 
                       placeholder="لغت آلمانی یا فارسی را جستجو کنید..." autofocus>
                <button id="search-btn" class="btn btn-primary">
                    <i class="fas fa-search"></i> جستجو
                </button>
            </div>
            
            <div id="search-results-container">
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <h3>به Elias.Dictionary خوش آمدید!</h3>
                    <p>برای شروع، یک لغت را جستجو کنید یا از منوی شناور استفاده کنید.</p>
                    <div class="empty-state-hint">
                        <i class="fas fa-arrow-circle-left"></i>
                        <span>دکمه کتاب در گوشه سمت چپ پایین</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = `
    <div class="word-card">
        <div class="section-header">
            <h2><i class="fas fa-search" style="color: var(--primary);"></i> ${LanguageSystem.t('search.title')}</h2>
        </div>
        
        <div class="search-box">
            <input type="text" id="search-input" class="form-control" 
                   placeholder="${LanguageSystem.t('search.placeholder')}" autofocus>
            <button id="search-btn" class="btn btn-primary">
                <i class="fas fa-search"></i> ${LanguageSystem.t('menu.search')}
            </button>
        </div>
        
        <div id="search-results-container">
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <h3>${LanguageSystem.t('search.welcome')}</h3>
                <p>برای شروع، یک لغت را جستجو کنید یا از منوی شناور استفاده کنید.</p>
                <div class="empty-state-hint">
                    <i class="fas fa-arrow-circle-left"></i>
                    <span>دکمه کتاب در گوشه سمت چپ پایین</span>
                </div>
            </div>
        </div>
    </div>
`;
    // ستاپ event listenerها
    this.setupSearchEventListeners();
}

// ========== متد جدید برای رندر بخش افزودن لغت ==========

renderAddWordSection() {
    const container = document.getElementById('add-word-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-plus-circle" style="color: #10b981;"></i> افزودن لغت جدید</h2>
            </div>
            
            <div class="form-group">
                <label for="german-word">
                    <i class="fas fa-language"></i> لغت آلمانی:
                </label>
                <input type="text" id="german-word" class="form-control" 
                       placeholder="مثال: Haus, lernen, schön" autocomplete="off">
            </div>
            
            <div class="form-group">
                <label for="persian-meaning">
                    <i class="fas fa-pencil-alt"></i> معنی فارسی:
                </label>
                <input type="text" id="persian-meaning" class="form-control" 
                       placeholder="مثال: خانه، یاد گرفتن، زیبا" autocomplete="off">
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-venus-mars"></i> جنسیت:</label>
                <div class="gender-options">
                    <button type="button" class="gender-btn masculine" data-gender="masculine">
                        <i class="fas fa-mars"></i> مذکر (der)
                    </button>
                    <button type="button" class="gender-btn feminine" data-gender="feminine">
                        <i class="fas fa-venus"></i> مونث (die)
                    </button>
                    <button type="button" class="gender-btn neuter" data-gender="neuter">
                        <i class="fas fa-genderless"></i> خنثی (das)
                    </button>
                    <button type="button" class="gender-btn none active" data-gender="none">
                        <i class="fas fa-ban"></i> بدون جنسیت
                    </button>
                </div>
            </div>
            
            <div class="form-group">
                <label for="word-type"><i class="fas fa-tag"></i> نوع کلمه:</label>
                <select id="word-type" class="form-control">
                    <option value="noun">📘 اسم</option>
                    <option value="verb">⚡ فعل</option>
                    <option value="adjective">✨ صفت</option>
                    <option value="adverb">📌 قید</option>
                    <option value="other">🔹 سایر</option>
                </select>
            </div>
            
            <div class="verb-forms" style="display: none;">
                <div class="form-group">
                    <label><i class="fas fa-table"></i> صرف فعل:</label>
                    <div class="verb-form-row">
                        <div class="verb-form-item">
                            <span class="verb-form-label">حال ساده</span>
                            <input type="text" id="verb-present" class="form-control" placeholder="lerne">
                        </div>
                        <div class="verb-form-item">
                            <span class="verb-form-label">گذشته ساده</span>
                            <input type="text" id="verb-past" class="form-control" placeholder="lernte">
                        </div>
                        <div class="verb-form-item">
                            <span class="verb-form-label">گذشته کامل</span>
                            <input type="text" id="verb-perfect" class="form-control" placeholder="gelernt">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="example"><i class="fas fa-quote-right"></i> مثال:</label>
                <textarea id="example" class="form-control" rows="2" placeholder="مثال آلمانی..."></textarea>
            </div>
            
            <div class="form-group">
                <label for="example-translation"><i class="fas fa-quote-left"></i> ترجمه مثال:</label>
                <textarea id="example-translation" class="form-control" rows="2" placeholder="ترجمه فارسی..."></textarea>
            </div>
            
            <div class="action-buttons">
                <button id="save-word-btn" class="btn btn-primary btn-lg">
                    <i class="fas fa-save"></i> ذخیره لغت
                </button>
                <button id="clear-form-btn" class="btn btn-outline">
                    <i class="fas fa-eraser"></i> پاک کردن فرم
                </button>
            </div>
        </div>
    `;
    container.innerHTML = `
    <div class="word-card">
        <div class="section-header">
            <h2><i class="fas fa-plus-circle" style="color: #10b981;"></i> ${LanguageSystem.t('addWord.title')}</h2>
        </div>
        
        <div class="form-group">
            <label for="german-word">
                <i class="fas fa-language"></i> ${LanguageSystem.t('addWord.wordLabel')}
            </label>
            <input type="text" id="german-word" class="form-control" 
                   placeholder="${LanguageSystem.isGerman() ? 'مثال: Haus, lernen, schön' : 'Example: house, learn, beautiful'}" autocomplete="off">
        </div>
        
        <div class="form-group">
            <label for="persian-meaning">
                <i class="fas fa-pencil-alt"></i> ${LanguageSystem.t('addWord.meaningLabel')}
            </label>
            <input type="text" id="persian-meaning" class="form-control" 
                   placeholder="مثال: خانه، یاد گرفتن، زیبا" autocomplete="off">
        </div>
        
        ${LanguageSystem.showGender() ? `
        <div class="form-group">
            <label><i class="fas fa-venus-mars"></i> ${LanguageSystem.t('addWord.genderLabel')}</label>
            <div class="gender-options">
                <button type="button" class="gender-btn masculine" data-gender="masculine">
                    <i class="fas fa-mars"></i> ${LanguageSystem.t('addWord.masculine')}
                </button>
                <button type="button" class="gender-btn feminine" data-gender="feminine">
                    <i class="fas fa-venus"></i> ${LanguageSystem.t('addWord.feminine')}
                </button>
                <button type="button" class="gender-btn neuter" data-gender="neuter">
                    <i class="fas fa-genderless"></i> ${LanguageSystem.t('addWord.neuter')}
                </button>
                <button type="button" class="gender-btn none active" data-gender="none">
                    <i class="fas fa-ban"></i> ${LanguageSystem.t('addWord.noGender')}
                </button>
            </div>
        </div>
        ` : ''}
        
        <div class="form-group">
            <label for="word-type"><i class="fas fa-tag"></i> ${LanguageSystem.t('addWord.typeLabel')}</label>
            <select id="word-type" class="form-control">
                <option value="noun">📘 ${LanguageSystem.t('addWord.noun')}</option>
                <option value="verb">⚡ ${LanguageSystem.t('addWord.verb')}</option>
                <option value="adjective">✨ ${LanguageSystem.t('addWord.adjective')}</option>
                <option value="adverb">📌 ${LanguageSystem.t('addWord.adverb')}</option>
                <option value="other">🔹 ${LanguageSystem.t('addWord.other')}</option>
            </select>
        </div>
        
        <div class="verb-forms" style="display: none;">
            <div class="form-group">
                <label><i class="fas fa-table"></i> ${LanguageSystem.t('addWord.conjugation')}</label>
                <div class="verb-form-row">
                    <div class="verb-form-item">
                        <span class="verb-form-label">${LanguageSystem.t('addWord.present')}</span>
                        <input type="text" id="verb-present" class="form-control" placeholder="${LanguageSystem.isGerman() ? 'lerne' : 'learn'}">
                    </div>
                    <div class="verb-form-item">
                        <span class="verb-form-label">${LanguageSystem.t('addWord.past')}</span>
                        <input type="text" id="verb-past" class="form-control" placeholder="${LanguageSystem.isGerman() ? 'lernte' : 'learned'}">
                    </div>
                    <div class="verb-form-item">
                        <span class="verb-form-label">${LanguageSystem.t('addWord.perfect')}</span>
                        <input type="text" id="verb-perfect" class="form-control" placeholder="${LanguageSystem.isGerman() ? 'gelernt' : 'learned'}">
                    </div>
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <label for="example"><i class="fas fa-quote-right"></i> ${LanguageSystem.t('addWord.example')}</label>
            <textarea id="example" class="form-control" rows="2" placeholder="${LanguageSystem.isGerman() ? 'مثال آلمانی...' : 'English example...'}"></textarea>
        </div>
        
        <div class="form-group">
            <label for="example-translation"><i class="fas fa-quote-left"></i> ${LanguageSystem.t('addWord.exampleTrans')}</label>
            <textarea id="example-translation" class="form-control" rows="2" placeholder="ترجمه فارسی..."></textarea>
        </div>
        
        <div class="action-buttons">
            <button id="save-word-btn" class="btn btn-primary btn-lg">
                <i class="fas fa-save"></i> ${LanguageSystem.t('addWord.save')}
            </button>
            <button id="clear-form-btn" class="btn btn-outline">
                <i class="fas fa-eraser"></i> ${LanguageSystem.t('addWord.clear')}
            </button>
        </div>
    </div>
`;
}

renderTranslate() {
    const container = document.getElementById('translate-section');
    if (!container) return;
    
    const isGerman = LanguageSystem.isGerman();
    
    // مقدار پیش‌فرض برای direction
    const defaultDirection = isGerman ? 'de-fa' : 'en-fa';
    const secondDirection = isGerman ? 'fa-de' : 'fa-en';
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-language" style="color: var(--primary);"></i> ${LanguageSystem.t('translate.title')}</h2>
            </div>
            
            <div id="online-status" class="online-status online">
                <i class="fas fa-wifi"></i> آنلاین - سرویس‌های ترجمه فعال
            </div>
            
            <div class="direction-selector">
                <div class="direction-option active" data-direction="${defaultDirection}">
                    <div class="direction-icon">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                    <div class="direction-text">
                        <span class="direction-title">${LanguageSystem.t('translate.deToFa')}</span>
                        <span class="direction-subtitle">${isGerman ? 'Deutsch → فارسی' : 'English → Persian'}</span>
                    </div>
                    <div class="direction-check">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
                <div class="direction-option" data-direction="${secondDirection}">
                    <div class="direction-icon">
                        <i class="fas fa-arrow-left"></i>
                    </div>
                    <div class="direction-text">
                        <span class="direction-title">${LanguageSystem.t('translate.faToDe')}</span>
                        <span class="direction-subtitle">${isGerman ? 'فارسی → Deutsch' : 'Persian → English'}</span>
                    </div>
                    <div class="direction-check">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label id="input-label">
                    <i class="fas fa-keyboard"></i>
                    <span id="input-title">${LanguageSystem.t('translate.sourceText')}</span>
                </label>
                <div class="input-with-clear">
                    <textarea id="translate-input" class="form-control" rows="3" 
                              placeholder="${isGerman ? 'متن آلمانی خود را وارد کنید...' : 'Enter English text...'}" 
                              dir="ltr"></textarea>
                    <button class="clear-input" id="clear-input-btn" title="پاک کردن متن">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="form-group">
                <label id="output-label">
                    <i class="fas fa-language"></i>
                    <span id="output-title">${LanguageSystem.t('translate.targetText')}</span>
                </label>
                <div id="translate-result" class="translate-result">
                    <div class="empty-result">
                        <div class="empty-icon">
                            <i class="fas fa-exchange-alt"></i>
                        </div>
                        <p>نتیجه ترجمه اینجا نمایش داده می‌شود</p>
                        <small>متن را وارد کنید</small>
                    </div>
                </div>
            </div>
            
            <div class="translate-actions">
                <div class="action-group">
                    <button class="action-btn voice-btn" id="speak-input">
                        <i class="fas fa-volume-up"></i> <span>${LanguageSystem.t('translate.speak')}</span>
                    </button>
                    <button class="action-btn voice-btn" id="speak-output">
                        <i class="fas fa-volume-up"></i> <span>${LanguageSystem.t('translate.speak')}</span>
                    </button>
                </div>
                <div class="action-group">
                    <button class="action-btn copy-btn" id="copy-result">
                        <i class="fas fa-copy"></i> <span>${LanguageSystem.t('translate.copy')}</span>
                    </button>
                    <button class="action-btn save-btn" id="save-translation">
                        <i class="fas fa-magic"></i> <span>${LanguageSystem.t('translate.smartSave')}</span>
                    </button>
                </div>
            </div>
            
            <div id="translate-suggestions" class="translate-suggestions" style="display: none;">
                <div class="suggestions-header">
                    <i class="fas fa-lightbulb"></i>
                    <span>پیشنهادات مشابه</span>
                </div>
                <div class="suggestions-list" id="suggestions-list"></div>
            </div>
        </div>
    `;
    
    this.setupTranslateEventListeners();
    this.updateTranslateUI();
}
// ========== اصلاح متد showNextFlashcard - اضافه کردن شماره ==========
showNextFlashcard() {
    if (this.practiceSession.currentIndex >= this.practiceSession.words.length) {
        this.showPracticeResults();
        return;
    }

    const word = this.practiceSession.words[this.practiceSession.currentIndex];
    const showGermanFirst = Math.random() > 0.5;
    const isGerman = LanguageSystem.isGerman();
    
    const container = document.getElementById('flashcards-section');
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-layer-group"></i> ${LanguageSystem.t('practice.flashcards')}</h2>
                <span class="badge" style="font-size: 18px; padding: 10px 20px; background: linear-gradient(135deg, #667eea, #764ba2);">
                    ${this.practiceSession.currentIndex + 1} / ${this.practiceSession.words.length}
                </span>
            </div>
            
            <div class="flashcard" id="flashcard">
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <div class="flashcard-word" style="font-size: 36px; margin-bottom: 20px;">
                            ${showGermanFirst ? word.german : word.persian}
                        </div>
                        ${word.gender ? `<span class="word-gender ${word.gender}" style="font-size: 18px; padding: 8px 16px;">${this.getGenderSymbol(word.gender)}</span>` : ''}
                        ${word.type ? `<span class="word-type" style="font-size: 16px; padding: 6px 12px;">${this.getTypeLabel(word.type)}</span>` : ''}
                        <button class="btn btn-outline mt-4" id="flip-card-btn" style="padding: 12px 30px; font-size: 16px;">
                            <i class="fas fa-redo-alt"></i> ${isGerman ? 'نمایش پاسخ' : 'Show Answer'}
                        </button>
                    </div>
                    <div class="flashcard-back">
                        <div class="flashcard-word" style="font-size: 36px; margin-bottom: 20px;">
                            ${showGermanFirst ? word.persian : word.german}
                        </div>
                        ${word.gender ? `<span class="word-gender ${word.gender}" style="font-size: 18px; padding: 8px 16px;">${this.getGenderSymbol(word.gender)}</span>` : ''}
                        ${word.type ? `<span class="word-type" style="font-size: 16px; padding: 6px 12px;">${this.getTypeLabel(word.type)}</span>` : ''}
                        
                        ${word.verbForms ? `
                            <div class="verb-forms mt-4" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; width: 100%;">
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                                    <div>
                                        <div style="font-size: 12px; opacity: 0.8;">${isGerman ? 'حال' : 'Present'}</div>
                                        <div style="font-size: 16px; font-weight: bold;">${word.verbForms.present || ''}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 12px; opacity: 0.8;">${isGerman ? 'گذشته' : 'Past'}</div>
                                        <div style="font-size: 16px; font-weight: bold;">${word.verbForms.past || ''}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 12px; opacity: 0.8;">${isGerman ? 'کامل' : 'Perfect'}</div>
                                        <div style="font-size: 16px; font-weight: bold;">${word.verbForms.perfect || ''}</div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="flashcard-actions mt-4" style="display: flex; gap: 15px; margin-top: 30px;">
                            <button class="btn btn-success" id="correct-btn" style="padding: 12px 30px; font-size: 16px;">
                                <i class="fas fa-check"></i> ${isGerman ? 'بلدم' : 'Know'}
                            </button>
                            <button class="btn btn-danger" id="incorrect-btn" style="padding: 12px 30px; font-size: 16px;">
                                <i class="fas fa-times"></i> ${isGerman ? 'نبلدم' : 'Don\'t Know'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="progress-bar mt-4" style="height: 10px; border-radius: 5px;">
                <div class="progress-fill" style="width: ${(this.practiceSession.currentIndex / this.practiceSession.words.length) * 100}%; height: 10px; border-radius: 5px;"></div>
            </div>
            
            <div style="text-align: center; margin-top: 15px; color: var(--gray-600);">
                <i class="fas fa-lightbulb"></i> ${isGerman ? 'روی کارت کلیک کن یا دکمه نمایش پاسخ رو بزن' : 'Click on the card or press Show Answer'}
            </div>
        </div>
    `;
    
    this.setupFlashcardEventListeners();
}

// ========== اصلاح متد showWritingExercise - اضافه کردن شماره ==========

showWritingExercise() {
    if (this.writingSession.currentIndex >= this.writingSession.words.length) {
        this.showWritingResults();
        return;
    }

    const word = this.writingSession.words[this.writingSession.currentIndex];
    
    document.getElementById('practice-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-keyboard"></i> تمرین نوشتاری</h2>
                <span class="badge" style="font-size: 18px; padding: 10px 20px; background: linear-gradient(135deg, #10b981, #059669);">
                    ${this.writingSession.currentIndex + 1} / ${this.writingSession.words.length}
                </span>
            </div>
            
            <div class="writing-exercise">
                <div class="word-to-translate" style="text-align: center; margin: 30px 0;">
                    <h3 style="font-size: 36px; color: var(--primary); margin-bottom: 10px;">${word.persian}</h3>
                    ${word.gender ? `<span class="word-gender ${word.gender}" style="font-size: 18px; padding: 8px 16px;">${this.getGenderSymbol(word.gender)}</span>` : ''}
                    ${word.type ? `<span class="word-type" style="font-size: 16px; padding: 6px 12px;">${this.getTypeLabel(word.type)}</span>` : ''}
                </div>
                
                <div style="max-width: 500px; margin: 0 auto;">
                    <input type="text" 
                           class="answer-input" 
                           id="writing-answer" 
                           placeholder="ترجمه آلمانی را تایپ کنید..."
                           style="width: 100%; padding: 15px 20px; font-size: 18px; border: 2px solid var(--gray-200); border-radius: 12px; text-align: center; margin-bottom: 20px;">
                    
                    <div class="action-buttons" style="display: flex; gap: 15px; justify-content: center;">
                        <button class="btn btn-success" id="check-writing-answer-btn" style="padding: 12px 30px; font-size: 16px;">
                            <i class="fas fa-check"></i> بررسی پاسخ
                        </button>
                        <button class="btn btn-outline" id="show-hint-btn" style="padding: 12px 30px; font-size: 16px;">
                            <i class="fas fa-lightbulb"></i> راهنمایی
                        </button>
                    </div>
                </div>
                
                <div class="progress-dots" style="display: flex; justify-content: center; gap: 8px; margin-top: 30px;">
                    ${this.writingSession.words.map((_, index) => `
                        <div class="progress-dot" style="
                            width: 12px; 
                            height: 12px; 
                            border-radius: 50%; 
                            background: ${index === this.writingSession.currentIndex ? 'var(--primary)' : index < this.writingSession.currentIndex ? 'var(--success)' : 'var(--gray-200)'};
                            transform: ${index === this.writingSession.currentIndex ? 'scale(1.2)' : 'scale(1)'};
                            transition: all 0.3s ease;
                        "></div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    this.setupWritingExerciseEventListeners(word);
}

normalizeAnswer(text) {
    if (!text) return '';
    
    return text
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')           // چند فاصله رو یکی کن
        .replace(/[،,.;:!?؟]/g, '')     // علائم نگارشی رو حذف کن
        .replace(/[\u200c]/g, ' ')      // نیم‌فاصله رو به فاصله تبدیل کن
        .trim();
}

async checkWritingAnswer() {
    const userAnswer = document.getElementById('writing-answer').value.trim();
    const currentWord = this.writingSession.words[this.writingSession.currentIndex];
    
    if (!userAnswer) {
        this.showToast('✏️ لطفاً پاسخ را وارد کنید', 'warning');
        return;
    }
    
    // نرمالایز کردن هر دو پاسخ
    const normalizedUser = this.normalizeAnswer(userAnswer);
    const normalizedCorrect = this.normalizeAnswer(currentWord.german);
    
    console.log('📝 مقایسه:', {
        کاربر: userAnswer,
        'کاربر (نرمال)': normalizedUser,
        صحیح: currentWord.german,
        'صحیح (نرمال)': normalizedCorrect
    });
    
    const isCorrect = normalizedUser === normalizedCorrect;
    
    await this.recordPractice(currentWord.id, isCorrect);
    
    const answerInput = document.getElementById('writing-answer');
    
    if (isCorrect) {
        this.writingSession.score++;
        this.showToast('✅ آفرین! ترجمه صحیح است', 'success');
        
        // سبز کردن اینپوت
        answerInput.style.borderColor = 'var(--success)';
        answerInput.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        
        // حذف راهنمای قبلی
        const oldHint = document.querySelector('.correct-answer-hint');
        if (oldHint) oldHint.remove();
        
    } else {
        this.showToast(`❌ پاسخ صحیح: ${currentWord.german}`, 'error');
        
        // قرمز کردن اینپوت
        answerInput.style.borderColor = 'var(--danger)';
        answerInput.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        
        // نمایش پاسخ صحیح
        const hint = document.createElement('div');
        hint.className = 'correct-answer-hint';
        hint.style.marginTop = '10px';
        hint.style.padding = '10px';
        hint.style.background = 'rgba(239, 68, 68, 0.1)';
        hint.style.borderRadius = '8px';
        hint.style.color = 'var(--danger)';
        hint.style.textAlign = 'center';
        hint.innerHTML = `✅ پاسخ صحیح: <strong>${currentWord.german}</strong>`;
        
        const oldHint = document.querySelector('.correct-answer-hint');
        if (oldHint) oldHint.remove();
        
        answerInput.parentNode.appendChild(hint);
    }
    
    // رفتن به سوال بعدی با تاخیر
    setTimeout(() => {
        this.writingSession.currentIndex++;
        this.showWritingExercise();
    }, 2000);
}
    // ========== دیتابیس IndexedDB ==========
    initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 5);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const oldVersion = event.oldVersion;
                
                console.log(`🔄 ارتقاء دیتابیس از نسخه ${oldVersion} به 5`);
                
                // ========== Object Store کلمات ==========
                if (!db.objectStoreNames.contains('words')) {
                    const wordStore = db.createObjectStore('words', { keyPath: 'id', autoIncrement: true });
                    wordStore.createIndex('german', 'german', { unique: true });
                    wordStore.createIndex('persian', 'persian', { unique: false });
                    wordStore.createIndex('type', 'type', { unique: false });
                    wordStore.createIndex('gender', 'gender', { unique: false });
                    wordStore.createIndex('createdAt', 'createdAt', { unique: false });
                    console.log('✅ ObjectStore کلمات ایجاد شد');
                }
                
                // ========== ObjectStore علاقه‌مندی‌ها ==========
                if (!db.objectStoreNames.contains('favorites')) {
                    db.createObjectStore('favorites', { keyPath: 'wordId' });
                    console.log('✅ ObjectStore علاقه‌مندی‌ها ایجاد شد');
                }
                
                // ========== ObjectStore مثال‌ها ==========
                if (!db.objectStoreNames.contains('examples')) {
                    const exStore = db.createObjectStore('examples', { keyPath: 'id', autoIncrement: true });
                    exStore.createIndex('wordId', 'wordId', { unique: false });
                    console.log('✅ ObjectStore مثال‌ها ایجاد شد');
                }
                
                // ========== ObjectStore تاریخچه تمرین ==========
                if (!db.objectStoreNames.contains('practiceHistory')) {
                    const phStore = db.createObjectStore('practiceHistory', { keyPath: 'id', autoIncrement: true });
                    phStore.createIndex('wordId', 'wordId', { unique: false });
                    phStore.createIndex('date', 'date', { unique: false });
                    phStore.createIndex('correct', 'correct', { unique: false });
                    console.log('✅ ObjectStore تاریخچه تمرین ایجاد شد');
                }
                
                // ========== ObjectStore تاریخچه چت ==========
                if (!db.objectStoreNames.contains('chatHistory')) {
                    const chatStore = db.createObjectStore('chatHistory', { keyPath: 'id' });
                    chatStore.createIndex('savedAt', 'savedAt', { unique: false });
                    chatStore.createIndex('chatId', 'chatId', { unique: false });
                    console.log('✅ ObjectStore تاریخچه چت ایجاد شد');
                }
                
                // ========== ObjectStore موسیقی ==========
                if (!db.objectStoreNames.contains('music')) {
                    const musicStore = db.createObjectStore('music', { keyPath: 'id', autoIncrement: true });
                    musicStore.createIndex('name', 'name', { unique: false });
                    musicStore.createIndex('uploadDate', 'uploadDate', { unique: false });
                    console.log('✅ ObjectStore موسیقی ایجاد شد');
                }
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ دیتابیس متصل شد');
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('❌ خطای دیتابیس:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // ================================================
    // مدیریت کلمات
    // ================================================

    // ========== دریافت همه کلمات ==========
    async getAllWords() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve([]);
                return;
            }

            try {
                const transaction = this.db.transaction(['words'], 'readonly');
                const store = transaction.objectStore('words');
                const request = store.getAll();
                
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = (event) => {
                    console.error('خطا در getAllWords:', event.target.error);
                    resolve([]);
                };
            } catch (error) {
                console.error('خطا در getAllWords:', error);
                resolve([]);
            }
        });
    }

    // ========== دریافت کلمه با ID ==========
    async getWord(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['words'], 'readonly');
            const store = transaction.objectStore('words');
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    // ========== دریافت کلمات در بازه ==========
    async getWordsByRange(start, end) {
        const allWords = await this.getAllWords();
        const sortedWords = allWords.sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        const startIndex = Math.max(0, start - 1);
        const endIndex = Math.min(sortedWords.length, end);
        
        return sortedWords.slice(startIndex, endIndex);
    }
// ========== اصلاح تابع searchWords ==========

async searchWords(query) {
    return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['words'], 'readonly');
        const store = transaction.objectStore('words');
        const request = store.getAll();
        
        request.onsuccess = () => {
            const searchTerm = query.toLowerCase().trim();
            
            const words = request.result.filter(word => {
                const german = word.german.toLowerCase();
                const persian = word.persian.toLowerCase();
                
                // جستجو در ابتدای کلمه آلمانی
                const germanStarts = german.startsWith(searchTerm);
                // جستجو در هر جای کلمه آلمانی
                const germanIncludes = german.includes(searchTerm);
                // جستجو در معنی فارسی
                const persianIncludes = persian.includes(searchTerm);
                
                return germanStarts || germanIncludes || persianIncludes;
            });
            
            console.log(`🔍 جستجو برای "${query}" - ${words.length} نتیجه پیدا شد`);
            resolve(words);
        };
        
        request.onerror = (event) => reject(event.target.error);
    });
}

// ================================================
// جستجوی عادی - همه نتایج رو لیست میکنه
// ================================================

async normalSearch(query) {
    if (!query) return;
    
    const results = await this.searchWords(query);
    
    if (results.length === 0) {
        this.showToast('❌ هیچ نتیجه‌ای یافت نشد', 'info');
        return;
    }
    
    // ========== نمایش همه نتایج به صورت لیست ==========
    this.renderSearchResultsList(query, results);
}


renderSearchResultsList(query, results) {
    const container = document.getElementById('search-results-container');
    if (!container) return;
    
    // مرتب‌سازی بر اساس حروف الفبا
    const sortedResults = results.sort((a, b) => a.german.localeCompare(b.german, 'de'));
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-search"></i> نتایج جستجو برای "${query}" (${results.length})</h2>
            </div>
            
            <div class="search-box">
                <input type="text" id="search-input" class="form-control" 
                       value="${query}" placeholder="لغت آلمانی یا فارسی را جستجو کنید...">
                <button id="search-btn" class="btn btn-primary">
                    <i class="fas fa-search"></i> جستجو
                </button>
            </div>
            
            <div class="word-list">
                ${sortedResults.map((word, index) => `
                    <div class="word-list-item" data-id="${word.id}">
                        <div class="word-list-item-header">
                            <div class="word-list-item-title-section">
                                <span class="word-number">${index + 1}</span>
                                <i class="fas fa-star favorite-icon ${this.favorites.has(word.id) ? 'active' : ''}" 
                                   data-id="${word.id}"></i>
                                <span class="word-list-item-title">${word.german}</span>
                                ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                                ${word.type ? `<span class="word-type">${this.getTypeLabel(word.type)}</span>` : ''}
                            </div>
                        </div>
                        
                        <div class="word-list-item-meaning">
                            ${word.persian}
                        </div>
                        
                        <div class="word-list-item-actions">
                            <button class="btn btn-sm btn-outline view-word" data-id="${word.id}">
                                <i class="fas fa-eye"></i> مشاهده
                            </button>
                            <button class="btn btn-sm btn-outline practice-word" data-id="${word.id}">
                                <i class="fas fa-brain"></i> تمرین
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    this.setupSearchEventListeners();
    this.setupWordListEventListeners();
}


// ================================================
// جستجوی سریع - همونطور که تایپ میکنی
// ================================================

setupQuickSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    let searchTimeout;
    
    // حذف event listener قبلی
    searchInput.removeEventListener('input', this.quickSearchHandler);
    
    this.quickSearchHandler = (e) => {
        const query = e.target.value.trim();
        
        clearTimeout(searchTimeout);
        
        if (query.length < 2) return;
        
        searchTimeout = setTimeout(() => {
            this.performQuickSearch(query);
        }, 800); // 800 میلی‌ثانیه تأخیر
    };
    
    searchInput.addEventListener('input', this.quickSearchHandler);
}


async performQuickSearch(query) {
    console.log('⚡ جستجوی سریع:', query);
    
    const results = await this.searchWords(query);
    
    if (results.length === 0) {
        // اگه نتیجه‌ای نبود، پیام بده
        const container = document.getElementById('search-results-container');
        if (container) {
            container.innerHTML = `
                <div class="word-card">
                    <div class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <h3>نتیجه‌ای یافت نشد</h3>
                        <p>برای "${query}" هیچ لغتی پیدا نشد</p>
                    </div>
                </div>
            `;
        }
        return;
    }
    
    // ========== فقط اولین نتیجه رو نشون بده ==========
    this.renderWordDetails(results[0]);
}

setupSearchEventListeners() {
    // دکمه جستجو - جستجوی عادی (لیست)
    document.getElementById('search-btn')?.addEventListener('click', () => {
        const query = document.getElementById('search-input').value.trim();
        if (query) {
            this.normalSearch(query);
        }
    });

    // اینتر - جستجوی عادی (لیست)
    document.getElementById('search-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = e.target.value.trim();
            if (query) {
                this.normalSearch(query);
            }
        }
    });
    
    // جستجوی سریع - همونطور که تایپ میکنی
    this.setupQuickSearch();
}

// ========== اصلاح تابع addWord ==========

async addWord(wordData) {
    return new Promise((resolve, reject) => {
        if (!wordData.german || !wordData.persian) {
            reject(new Error('لغت و معنی الزامی هستند'));
            return;
        }

        const transaction = this.db.transaction(['words'], 'readwrite');
        const store = transaction.objectStore('words');
        
        const index = store.index('german');
        const checkRequest = index.get(wordData.german.toLowerCase());
        
        checkRequest.onsuccess = async () => {
            if (checkRequest.result) {
                this.showToast('این لغت قبلاً در دیکشنری وجود دارد', 'error');
                reject(new Error('کلمه تکراری'));
                return;
            }
            
            wordData.createdAt = new Date().toISOString();
            wordData.german = wordData.german.trim();
            wordData.persian = wordData.persian.trim();
            
            const addRequest = store.add(wordData);
            
            addRequest.onsuccess = async () => {
                const wordId = addRequest.result;
                
                // ذخیره مثال - با چک کردن وجود المنت‌ها
                const exampleGerman = document.getElementById('example')?.value.trim();
                const examplePersian = document.getElementById('example-translation')?.value.trim();
                
                if (exampleGerman && examplePersian) {
                    try {
                        await this.addExample(wordId, {
                            german: exampleGerman,
                            persian: examplePersian
                        });
                    } catch (error) {
                        console.error('خطا در ذخیره مثال:', error);
                    }
                }
                
                this.showToast('✅ لغت با موفقیت اضافه شد', 'success');
                
                // با تأخیر رندر کن تا دیتابیس کامل بشه
                setTimeout(() => {
                    this.renderWordList();
                    this.updateStats();
                }, 100);
                
                // پاک کردن فرم - با چک کردن وجود المنت‌ها
                this.clearAddWordForm();
                
                resolve(wordId);
            };
            
            addRequest.onerror = (event) => {
                console.error('خطا در افزودن کلمه:', event.target.error);
                this.showToast('❌ خطا در ذخیره لغت', 'error');
                reject(event.target.error);
            };
        };
        
        checkRequest.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

    // ========== ویرایش کلمه ==========
    async updateWord(wordData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['words'], 'readwrite');
            const store = transaction.objectStore('words');
            const request = store.put(wordData);
            
            request.onsuccess = () => {
                this.showToast('✅ لغت با موفقیت ویرایش شد', 'success');
                this.renderWordList();
                this.updateStats();
                resolve();
            };
            
            request.onerror = (event) => {
                this.showToast('❌ خطا در ویرایش لغت', 'error');
                reject(event.target.error);
            };
        });
    }

    // ========== حذف کلمه ==========
    async deleteWord(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['words', 'favorites', 'examples', 'practiceHistory'], 'readwrite');
            
            // حذف کلمه
            const wordStore = transaction.objectStore('words');
            wordStore.delete(id);
            
            // حذف از علاقه‌مندی‌ها
            const favStore = transaction.objectStore('favorites');
            favStore.delete(id);
            
            // حذف مثال‌ها
            const exStore = transaction.objectStore('examples');
            const exIndex = exStore.index('wordId');
            const exRequest = exIndex.getAll(id);
            
            exRequest.onsuccess = () => {
                exRequest.result.forEach(ex => {
                    exStore.delete(ex.id);
                });
            };
            
            // حذف تاریخچه تمرین
            const phStore = transaction.objectStore('practiceHistory');
            const phIndex = phStore.index('wordId');
            const phRequest = phIndex.getAll(id);
            
            phRequest.onsuccess = () => {
                phRequest.result.forEach(ph => {
                    phStore.delete(ph.id);
                });
            };
            
            transaction.oncomplete = () => {
                this.favorites.delete(id);
                this.showToast('✅ لغت با موفقیت حذف شد', 'success');
                this.renderWordList();
                this.updateStats();
                resolve();
            };
            
            transaction.onerror = (event) => {
                this.showToast('❌ خطا در حذف لغت', 'error');
                reject(event.target.error);
            };
        });
    }
clearAddWordForm() {
    // بررسی کن المنت وجود داره یا نه
    const germanWord = document.getElementById('german-word');
    const persianMeaning = document.getElementById('persian-meaning');
    const example = document.getElementById('example');
    const exampleTranslation = document.getElementById('example-translation');
    const verbPresent = document.getElementById('verb-present');
    const verbPast = document.getElementById('verb-past');
    const verbPerfect = document.getElementById('verb-perfect');
    const verbForms = document.querySelector('.verb-forms');
    
    if (germanWord) germanWord.value = '';
    if (persianMeaning) persianMeaning.value = '';
    if (example) example.value = '';
    if (exampleTranslation) exampleTranslation.value = '';
    if (verbPresent) verbPresent.value = '';
    if (verbPast) verbPast.value = '';
    if (verbPerfect) verbPerfect.value = '';
    
    // ریست دکمه‌های جنسیت
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn?.classList.remove('active');
    });
    const noneBtn = document.querySelector('.gender-btn.none');
    if (noneBtn) noneBtn.classList.add('active');
    
    // مخفی کردن فرم افعال
    if (verbForms) verbForms.style.display = 'none';
}

   async renderWordList(filter = 'all') {
    const words = await this.getAllWords();
    const container = document.getElementById('word-list-container');
    
    if (!container) return;
    
    let filteredWords = words;
    let filterTitle = 'همه لغات';
    
    switch(filter) {
        case 'favorites':
            filteredWords = words.filter(word => this.favorites.has(word.id));
            filterTitle = 'علاقه‌مندی‌ها';
            break;
        case 'nouns':
            filteredWords = words.filter(word => word.type === 'noun');
            filterTitle = 'اسم‌ها';
            break;
        case 'verbs':
            filteredWords = words.filter(word => word.type === 'verb');
            filterTitle = 'فعل‌ها';
            break;
        case 'adjectives':
            filteredWords = words.filter(word => word.type === 'adjective');
            filterTitle = 'صفت‌ها';
            break;
        case 'adverbs':
            filteredWords = words.filter(word => word.type === 'adverb');
            filterTitle = 'قیدها';
            break;
        default:
            filteredWords = words;
            filterTitle = 'همه لغات';
    }
    
    // مرتب‌سازی بر اساس تاریخ
    filteredWords = filteredWords.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // آپدیت عنوان
    document.getElementById('total-words-count').textContent = filteredWords.length;
    
    // رندر لیست
    if (filteredWords.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-${filter === 'favorites' ? 'star' : 'book'}"></i>
                </div>
                <h3>هیچ لغتی یافت نشد</h3>
                <p>${filter === 'favorites' ? 'هنوز لغتی به علاقه‌مندی‌ها اضافه نکرده‌اید' : 'اولین لغت را به دیکشنری اضافه کنید'}</p>
                ${filter !== 'favorites' ? `
                    <button class="btn btn-primary" onclick="dictionaryApp.showSection('add-word-section')">
                        <i class="fas fa-plus-circle"></i> افزودن لغت
                    </button>
                ` : ''}
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredWords.map((word, index) => `
        <div class="word-list-item" data-id="${word.id}">
            <div class="word-list-item-header">
                <div class="word-list-item-title-section">
                    <span class="word-number">${index + 1}</span>
                    <i class="fas fa-star favorite-icon ${this.favorites.has(word.id) ? 'active' : ''}" 
                       data-id="${word.id}"></i>
                    <span class="word-list-item-title">${word.german}</span>
                    ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                    ${word.type ? `<span class="word-type">${this.getTypeLabel(word.type)}</span>` : ''}
                </div>
            </div>
            
            <div class="word-list-item-meaning">
                ${word.persian}
            </div>
            
            <div class="word-list-item-actions">
                <button class="btn btn-sm btn-outline view-word" data-id="${word.id}">
                    <i class="fas fa-eye"></i> مشاهده
                </button>
                <button class="btn btn-sm btn-outline practice-word" data-id="${word.id}">
                    <i class="fas fa-brain"></i> تمرین
                </button>
            </div>
        </div>
    `).join('');
    
    // ستاپ event listenerها
    this.setupWordListEventListeners();
}
async renderWordList(filter = 'all') {
    const words = await this.getAllWords();
    const container = document.getElementById('word-list-container');
    const isGerman = LanguageSystem.isGerman();
    
    if (!container) return;
    
    let filteredWords = words;
    let filterTitle = 'همه لغات';
    
    switch(filter) {
        case 'favorites':
            filteredWords = words.filter(word => this.favorites.has(word.id));
            filterTitle = isGerman ? 'علاقه‌مندی‌ها' : 'Favorites';
            break;
        case 'nouns':
            filteredWords = words.filter(word => word.type === 'noun');
            filterTitle = isGerman ? 'اسم‌ها' : 'Nouns';
            break;
        case 'verbs':
            filteredWords = words.filter(word => word.type === 'verb');
            filterTitle = isGerman ? 'فعل‌ها' : 'Verbs';
            break;
        case 'adjectives':
            filteredWords = words.filter(word => word.type === 'adjective');
            filterTitle = isGerman ? 'صفت‌ها' : 'Adjectives';
            break;
        case 'adverbs':
            filteredWords = words.filter(word => word.type === 'adverb');
            filterTitle = isGerman ? 'قیدها' : 'Adverbs';
            break;
        default:
            filteredWords = words;
            filterTitle = isGerman ? 'همه لغات' : 'All Words';
    }
    
    // مرتب‌سازی بر اساس تاریخ
    filteredWords = filteredWords.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // آپدیت عنوان
    document.getElementById('total-words-count').textContent = filteredWords.length;
    
    // رندر لیست
    if (filteredWords.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-${filter === 'favorites' ? 'star' : 'book'}"></i>
                </div>
                <h3>${isGerman ? 'هیچ لغتی یافت نشد' : 'No words found'}</h3>
                <p>${filter === 'favorites' 
                    ? (isGerman ? 'هنوز لغتی به علاقه‌مندی‌ها اضافه نکرده‌اید' : 'No favorites yet') 
                    : (isGerman ? 'اولین لغت را به دیکشنری اضافه کنید' : 'Add your first word')}</p>
                ${filter !== 'favorites' ? `
                    <button class="btn btn-primary" onclick="dictionaryApp.showSection('add-word-section')">
                        <i class="fas fa-plus-circle"></i> ${isGerman ? 'افزودن لغت' : 'Add Word'}
                    </button>
                ` : ''}
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredWords.map((word, index) => `
        <div class="word-list-item" data-id="${word.id}">
            <div class="word-list-item-header">
                <div class="word-list-item-title-section">
                    <span class="word-number">${index + 1}</span>
                    <i class="fas fa-star favorite-icon ${this.favorites.has(word.id) ? 'active' : ''}" 
                       data-id="${word.id}"></i>
                    <span class="word-list-item-title">${word.german}</span>
                    ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                    ${word.type ? `<span class="word-type">${this.getTypeLabel(word.type)}</span>` : ''}
                </div>
            </div>
            
            <div class="word-list-item-meaning">
                ${word.persian}
            </div>
            
            <div class="word-list-item-actions">
                <button class="btn btn-sm btn-outline view-word" data-id="${word.id}">
                    <i class="fas fa-eye"></i> ${isGerman ? 'مشاهده' : 'View'}
                </button>
                <button class="btn btn-sm btn-outline practice-word" data-id="${word.id}">
                    <i class="fas fa-brain"></i> ${LanguageSystem.t('practice.start')}
                </button>
            </div>
        </div>
    `).join('');
    
    // ========== این دو خط مهم ==========
    this.setupWordListEventListeners();
    this.setupFilterButtons();
}
    // ================================================
    // مدیریت مثال‌ها
    // ================================================

    async addExample(wordId, exampleData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('دیتابیس در دسترس نیست'));
                return;
            }

            const transaction = this.db.transaction(['examples'], 'readwrite');
            const store = transaction.objectStore('examples');
            
            const example = {
                wordId: wordId,
                german: exampleData.german,
                persian: exampleData.persian,
                createdAt: new Date().toISOString()
            };
            
            const request = store.add(example);
            
            request.onsuccess = () => {
                this.showToast('✅ مثال با موفقیت اضافه شد', 'success');
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                console.error('❌ خطا در افزودن مثال:', event.target.error);
                this.showToast('❌ خطا در افزودن مثال', 'error');
                reject(event.target.error);
            };
        });
    }

    async getExamplesForWord(wordId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve([]);
                return;
            }

            const transaction = this.db.transaction(['examples'], 'readonly');
            const store = transaction.objectStore('examples');
            const index = store.index('wordId');
            const request = index.getAll(wordId);
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (event) => {
                console.error('خطا در دریافت مثال‌ها:', event.target.error);
                resolve([]);
            };
        });
    }

    // ================================================
    // مدیریت علاقه‌مندی‌ها
    // ================================================

    async loadFavorites() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }

            const transaction = this.db.transaction(['favorites'], 'readonly');
            const store = transaction.objectStore('favorites');
            const request = store.getAll();
            
            request.onsuccess = () => {
                this.favorites = new Set(request.result.map(item => item.wordId));
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('خطا در بارگذاری علاقه‌مندی‌ها:', event.target.error);
                resolve();
            };
        });
    }

    async toggleFavorite(wordId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['favorites'], 'readwrite');
            const store = transaction.objectStore('favorites');
            
            if (this.favorites.has(wordId)) {
                const request = store.delete(wordId);
                request.onsuccess = () => {
                    this.favorites.delete(wordId);
                    this.showToast('⭐ از علاقه‌مندی‌ها حذف شد', 'info');
                    this.updateFavoritesCount();
                    resolve(false);
                };
            } else {
                const request = store.add({ wordId });
                request.onsuccess = () => {
                    this.favorites.add(wordId);
                    this.showToast('✅ به علاقه‌مندی‌ها اضافه شد', 'success');
                    this.updateFavoritesCount();
                    resolve(true);
                };
            }
        });
    }

   async renderFavorites() {
    const words = await this.getAllWords();
    const favoriteWords = words.filter(word => this.favorites.has(word.id));
    const container = document.getElementById('favorites-container');
    const isGerman = LanguageSystem.isGerman();
    
    document.getElementById('favorites-count').textContent = favoriteWords.length;
    
    if (favoriteWords.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-star"></i>
                </div>
                <h3>${isGerman ? 'لیست علاقه‌مندی‌ها خالی است' : 'Favorites list is empty'}</h3>
                <p>${isGerman ? 'با کلیک روی ستاره کنار هر لغت، به این لیست اضافه کنید' : 'Click on the star next to each word to add to this list'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = favoriteWords.map(word => `
        <div class="word-list-item" data-id="${word.id}">
            <div class="word-content">
                <div class="word-list-item-header">
                    <div>
                        <span class="word-list-item-title">${word.german}</span>
                        ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                    </div>
                    <i class="fas fa-star favorite-icon active" data-id="${word.id}"></i>
                </div>
                <div class="word-list-item-meaning">${word.persian}</div>
                <div class="word-list-item-actions">
                    <button class="btn btn-sm btn-outline view-word" data-id="${word.id}">
                        <i class="fas fa-eye"></i> ${isGerman ? 'مشاهده' : 'View'}
                    </button>
                    <button class="btn btn-sm btn-outline practice-word" data-id="${word.id}">
                        <i class="fas fa-brain"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    this.setupWordListEventListeners();
}

updateFavoritesCount() {
    const countElement = document.getElementById('favorites-count');
    if (countElement) {
        countElement.textContent = this.favorites.size;
    }
}

    // ================================================
    // مدیریت تمرین فلش کارت
    // ================================================
renderPracticeOptions() {
    const container = document.getElementById('practice-section');
    const isGerman = LanguageSystem.isGerman();
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-brain" style="color: var(--primary);"></i> ${LanguageSystem.t('practice.title')}</h2>
            </div>
            
            <div class="practice-options-grid">
                <div class="practice-option-card">
                    <div class="practice-icon">
                        <i class="fas fa-layer-group"></i>
                    </div>
                    <h3>${LanguageSystem.t('practice.flashcards')}</h3>
                    <p>${isGerman ? 'مرور لغات با کارت‌های هوشمند' : 'Review words with smart cards'}</p>
                    <button class="btn btn-primary" id="start-flashcard-btn">
                        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                </div>
                
                <div class="practice-option-card">
                    <div class="practice-icon">
                        <i class="fas fa-headphones"></i>
                    </div>
                    <h3>${LanguageSystem.t('practice.listening')}</h3>
                    <p>${isGerman ? 'گوش دادن و تشخیص لغت' : 'Listen and identify words'}</p>
                    <button class="btn btn-primary" id="start-listening-btn">
                        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                </div>
                
                <div class="practice-option-card">
                    <div class="practice-icon">
                        <i class="fas fa-keyboard"></i>
                    </div>
                    <h3>${LanguageSystem.t('practice.writing')}</h3>
                    <p>${isGerman ? 'تایپ کردن لغات آلمانی' : 'Type English words'}</p>
                    <button class="btn btn-primary" id="start-writing-btn">
                        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                </div>
                
                <div class="practice-option-card">
                    <div class="practice-icon">
                        <i class="fas fa-comments"></i>
                    </div>
                    <h3>${LanguageSystem.t('practice.speaking')}</h3>
                    <p>${isGerman ? 'ساخت جمله با لغات' : 'Make sentences with words'}</p>
                    <button class="btn btn-primary" id="start-speaking-btn">
                        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                </div>
            </div>
            
            <div class="practice-settings mt-5">
                <h3><i class="fas fa-sliders-h"></i> ${isGerman ? 'تنظیمات تمرین' : 'Practice Settings'}</h3>
                
                <div class="form-group">
                    <label>${isGerman ? 'محدوده لغات:' : 'Word Range:'}</label>
                    <div class="range-selector">
                        <div class="range-inputs">
                            <input type="number" id="range-start" class="form-control" 
                                   placeholder="${isGerman ? 'شروع' : 'Start'}" min="1">
                            <span>${isGerman ? 'تا' : 'to'}</span>
                            <input type="number" id="range-end" class="form-control" 
                                   placeholder="${isGerman ? 'پایان' : 'End'}" min="1">
                        </div>
                        <small class="form-text">${isGerman ? 'برای تمرین همه لغات، فیلدها را خالی بگذارید' : 'Leave empty to practice all words'}</small>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('start-flashcard-btn').addEventListener('click', () => {
        this.startPracticeSession();
    });
    
    document.getElementById('start-listening-btn').addEventListener('click', () => {
        this.startListeningPractice();
    });
    
    document.getElementById('start-writing-btn').addEventListener('click', () => {
        this.startWritingPractice();
    });
    
    document.getElementById('start-speaking-btn').addEventListener('click', () => {
        this.startSpeakingPractice();
    });
}

    async startPracticeSession(wordIds = null, range = null) {
        let wordsToPractice;
        
        if (range) {
            wordsToPractice = await this.getWordsByRange(range.start, range.end);
        } else if (!wordIds) {
            const allWords = await this.getAllWords();
            wordsToPractice = this.shuffleArray([...allWords]).slice(0, 20);
        } else {
            const words = await Promise.all(wordIds.map(id => this.getWord(id)));
            wordsToPractice = this.shuffleArray(words);
        }

        if (wordsToPractice.length === 0) {
            this.showToast('❌ لغتی برای تمرین وجود ندارد', 'error');
            return;
        }

        this.practiceSession = {
            words: wordsToPractice,
            currentIndex: 0,
            correct: 0,
            incorrect: 0
        };
        
        this.showNextFlashcard();
        this.showSection('flashcards-section');
    }

    showNextFlashcard() {
        if (this.practiceSession.currentIndex >= this.practiceSession.words.length) {
            this.showPracticeResults();
            return;
        }

        const word = this.practiceSession.words[this.practiceSession.currentIndex];
        const showGermanFirst = Math.random() > 0.5;
        
        const container = document.getElementById('flashcards-section');
        
        container.innerHTML = `
            <div class="word-card">
                <div class="section-header">
                    <h2><i class="fas fa-layer-group"></i> فلش کارت</h2>
                    <span class="badge">${this.practiceSession.currentIndex + 1}/${this.practiceSession.words.length}</span>
                </div>
                
                <div class="flashcard" id="flashcard">
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <div class="flashcard-word">${showGermanFirst ? word.german : word.persian}</div>
                            ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                            ${word.type ? `<span class="word-type">${this.getTypeLabel(word.type)}</span>` : ''}
                            <button class="btn btn-outline mt-4" id="flip-card-btn">
                                <i class="fas fa-redo-alt"></i> نمایش پاسخ
                            </button>
                        </div>
                        <div class="flashcard-back">
                            <div class="flashcard-word">${showGermanFirst ? word.persian : word.german}</div>
                            ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                            ${word.type ? `<span class="word-type">${this.getTypeLabel(word.type)}</span>` : ''}
                            
                            ${word.verbForms ? `
                                <div class="verb-forms mt-3">
                                    <div class="verb-form-row">
                                        <div class="verb-form-item">
                                            <span class="verb-form-label">حال</span>
                                            <input type="text" value="${word.verbForms.present || ''}" readonly>
                                        </div>
                                        <div class="verb-form-item">
                                            <span class="verb-form-label">گذشته</span>
                                            <input type="text" value="${word.verbForms.past || ''}" readonly>
                                        </div>
                                        <div class="verb-form-item">
                                            <span class="verb-form-label">کامل</span>
                                            <input type="text" value="${word.verbForms.perfect || ''}" readonly>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="flashcard-actions mt-4">
                                <button class="btn btn-success" id="correct-btn">
                                    <i class="fas fa-check"></i> بلدم
                                </button>
                                <button class="btn btn-danger" id="incorrect-btn">
                                    <i class="fas fa-times"></i> نبلدم
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="progress-bar mt-4">
                    <div class="progress-fill" style="width: ${(this.practiceSession.currentIndex / this.practiceSession.words.length) * 100}%"></div>
                </div>
            </div>
        `;
        
        this.setupFlashcardEventListeners();
    }

    setupFlashcardEventListeners() {
        document.getElementById('flip-card-btn')?.addEventListener('click', () => {
            document.getElementById('flashcard').classList.add('flipped');
        });
        
        document.getElementById('correct-btn')?.addEventListener('click', () => {
            this.handleFlashcardAnswer(true);
        });
        
        document.getElementById('incorrect-btn')?.addEventListener('click', () => {
            this.handleFlashcardAnswer(false);
        });
    }

    async handleFlashcardAnswer(isCorrect) {
        const currentIndex = this.practiceSession.currentIndex;
        const word = this.practiceSession.words[currentIndex];
        
        await this.recordPractice(word.id, isCorrect);
        
        if (isCorrect) {
            this.practiceSession.correct++;
        } else {
            this.practiceSession.incorrect++;
        }
        
        this.practiceSession.currentIndex++;
        this.showNextFlashcard();
    }

    showPracticeResults() {
        const totalWords = this.practiceSession.words.length;
        const correctAnswers = this.practiceSession.correct;
        const accuracy = totalWords > 0 ? Math.round((correctAnswers / totalWords) * 100) : 0;
        
        const container = document.getElementById('flashcards-section');
        
        container.innerHTML = `
            <div class="word-card">
                <div class="section-header">
                    <h2><i class="fas fa-trophy"></i> نتایج تمرین</h2>
                </div>
                
                <div class="results-summary">
                    <div class="result-circle" style="background: conic-gradient(var(--success) 0% ${accuracy}%, var(--gray-200) ${accuracy}% 100%);">
                        <div class="result-circle-inner">
                            <span>${accuracy}%</span>
                        </div>
                    </div>
                    
                    <div class="results-stats">
                        <div class="result-stat">
                            <span>تعداد لغات:</span>
                            <strong>${totalWords}</strong>
                        </div>
                        <div class="result-stat">
                            <span>پاسخ صحیح:</span>
                            <strong>${correctAnswers}</strong>
                        </div>
                        <div class="result-stat">
                            <span>پاسخ نادرست:</span>
                            <strong>${this.practiceSession.incorrect}</strong>
                        </div>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-primary" id="restart-practice-btn">
                        <i class="fas fa-redo-alt"></i> تمرین مجدد
                    </button>
                    <button class="btn btn-outline" id="back-to-practice-menu-btn">
                        <i class="fas fa-arrow-right"></i> بازگشت
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('restart-practice-btn').addEventListener('click', () => {
            this.startPracticeSession();
        });
        
        document.getElementById('back-to-practice-menu-btn').addEventListener('click', () => {
            this.renderPracticeOptions();
            this.showSection('practice-section');
        });
    }

    // ================================================
    // تمرین شنیداری
    // ================================================

    async startListeningPractice(wordIds = null, range = null) {
        let wordsToPractice;
        
        if (range) {
            wordsToPractice = await this.getWordsByRange(range.start, range.end);
        } else if (!wordIds) {
            const allWords = await this.getAllWords();
            wordsToPractice = this.shuffleArray([...allWords]).slice(0, 10);
        } else {
            const words = await Promise.all(wordIds.map(id => this.getWord(id)));
            wordsToPractice = this.shuffleArray(words);
        }

        if (wordsToPractice.length === 0) {
            this.showToast('❌ لغتی برای تمرین وجود ندارد', 'error');
            return;
        }

        this.listeningSession = {
            words: wordsToPractice,
            currentIndex: 0,
            score: 0,
            attempts: 0
        };
        
        this.showListeningExercise();
    }

 showListeningExercise() {
    if (this.listeningSession.currentIndex >= this.listeningSession.words.length) {
        this.showListeningResults();
        return;
    }

    const word = this.listeningSession.words[this.listeningSession.currentIndex];
    const isGerman = LanguageSystem.isGerman();
    
    document.getElementById('practice-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-headphones"></i> ${LanguageSystem.t('practice.listening')}</h2>
                <span class="badge">${this.listeningSession.currentIndex + 1}/${this.listeningSession.words.length}</span>
            </div>
            
            <div class="listening-exercise">
                <div class="voice-controls">
                    <button class="voice-btn" id="play-pronunciation-btn">
                        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                    <button class="voice-btn replay" id="replay-pronunciation-btn">
                        <i class="fas fa-redo-alt"></i> ${isGerman ? 'تکرار' : 'Repeat'}
                    </button>
                </div>
                
                <div class="exercise-content">
                    <input type="text" 
                           class="answer-input" 
                           id="listening-answer" 
                           placeholder="${isGerman ? 'لغت آلمانی را تایپ کنید...' : 'Type the English word...'}"
                           autocomplete="off">
                    
                    <div class="action-buttons">
                        <button class="btn btn-success" id="check-listening-answer-btn">
                            <i class="fas fa-check"></i> ${LanguageSystem.t('practice.check')}
                        </button>
                        <button class="btn btn-outline" id="skip-listening-btn">
                            <i class="fas fa-forward"></i> ${LanguageSystem.t('practice.skip')}
                        </button>
                    </div>
                    
                    <!-- نقطه‌های پیشرفت -->
                    <div class="progress-dots">
                        ${this.listeningSession.words.map((_, index) => {
                            let dotClass = '';
                            if (index === this.listeningSession.currentIndex) {
                                dotClass = 'active';
                            } else if (index < this.listeningSession.currentIndex) {
                                dotClass = this.listeningSession.words[index].userCorrect ? 'completed correct' : 'completed incorrect';
                            }
                            
                            return `<div class="progress-dot ${dotClass}"></div>`;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    this.playPronunciation(word.german);
    this.setupListeningExerciseEventListeners(word);
}

    setupListeningExerciseEventListeners(word) {
        document.getElementById('play-pronunciation-btn').addEventListener('click', () => {
            this.playPronunciation(word.german);
        });
        
        document.getElementById('replay-pronunciation-btn').addEventListener('click', () => {
            this.playPronunciation(word.german);
        });
        
        document.getElementById('check-listening-answer-btn').addEventListener('click', () => {
            this.checkListeningAnswer();
        });
        
        document.getElementById('skip-listening-btn').addEventListener('click', () => {
            this.skipListeningExercise();
        });
        
        document.getElementById('listening-answer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkListeningAnswer();
            }
        });
        
        setTimeout(() => {
            document.getElementById('listening-answer').focus();
        }, 300);
    }
async checkListeningAnswer() {
    const userAnswer = document.getElementById('listening-answer').value.trim();
    const currentWord = this.listeningSession.words[this.listeningSession.currentIndex];
    
    if (!userAnswer) {
        this.showToast('✏️ لطفاً پاسخ را وارد کنید', 'warning');
        return;
    }
    
    // نرمالایز کردن
    const normalizedUser = this.normalizeAnswer(userAnswer);
    const normalizedCorrect = this.normalizeAnswer(currentWord.german);
    
    const isCorrect = normalizedUser === normalizedCorrect;
    
    this.listeningSession.attempts++;
    await this.recordPractice(currentWord.id, isCorrect);
    
    const answerInput = document.getElementById('listening-answer');
    
    if (isCorrect) {
        this.listeningSession.score++;
        this.showToast('✅ آفرین! پاسخ صحیح است', 'success');
        
        answerInput.style.borderColor = 'var(--success)';
        answerInput.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
    } else {
        this.showToast(`❌ پاسخ صحیح: ${currentWord.german}`, 'error');
        
        answerInput.style.borderColor = 'var(--danger)';
        answerInput.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        
        // نمایش پاسخ صحیح
        const hint = document.createElement('div');
        hint.className = 'correct-answer-hint';
        hint.style.marginTop = '10px';
        hint.style.padding = '10px';
        hint.style.background = 'rgba(239, 68, 68, 0.1)';
        hint.style.borderRadius = '8px';
        hint.style.color = 'var(--danger)';
        hint.style.textAlign = 'center';
        hint.innerHTML = `✅ پاسخ صحیح: <strong>${currentWord.german}</strong>`;
        
        const oldHint = document.querySelector('.correct-answer-hint');
        if (oldHint) oldHint.remove();
        
        answerInput.parentNode.appendChild(hint);
    }
    
    setTimeout(() => {
        this.listeningSession.currentIndex++;
        this.showListeningExercise();
    }, 1500);
}


    skipListeningExercise() {
        this.listeningSession.currentIndex++;
        this.showListeningExercise();
    }
showListeningResults() {
    const accuracy = Math.round((this.listeningSession.score / this.listeningSession.words.length) * 100);
    const isGerman = LanguageSystem.isGerman();
    
    document.getElementById('practice-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-chart-line"></i> ${isGerman ? 'نتایج تمرین شنیداری' : 'Listening Practice Results'}</h2>
            </div>
            
            <div class="results-summary">
                <div class="result-circle" style="background: conic-gradient(var(--success) 0% ${accuracy}%, var(--gray-200) ${accuracy}% 100%);">
                    <div class="result-circle-inner">
                        <span>${accuracy}%</span>
                    </div>
                </div>
                
                <div class="results-stats">
                    <div class="result-stat">
                        <span>${isGerman ? 'تعداد لغات:' : 'Total Words:'}</span>
                        <strong>${this.listeningSession.words.length}</strong>
                    </div>
                    <div class="result-stat">
                        <span>${isGerman ? 'پاسخ صحیح:' : 'Correct Answers:'}</span>
                        <strong>${this.listeningSession.score}</strong>
                    </div>
                    <div class="result-stat">
                        <span>${isGerman ? 'تعداد تلاش:' : 'Attempts:'}</span>
                        <strong>${this.listeningSession.attempts}</strong>
                    </div>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary" id="restart-listening-btn">
                    <i class="fas fa-redo-alt"></i> ${isGerman ? 'تمرین مجدد' : 'Practice Again'}
                </button>
                <button class="btn btn-outline" id="back-to-practice-menu-btn">
                    <i class="fas fa-arrow-right"></i> ${isGerman ? 'بازگشت' : 'Back'}
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('restart-listening-btn').addEventListener('click', () => {
        this.startListeningPractice();
    });
    
    document.getElementById('back-to-practice-menu-btn').addEventListener('click', () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    });
}

    // ================================================
    // تمرین نوشتاری
    // ================================================

    async startWritingPractice(wordIds = null, range = null) {
        let wordsToPractice;
        
        if (range) {
            wordsToPractice = await this.getWordsByRange(range.start, range.end);
        } else if (!wordIds) {
            const allWords = await this.getAllWords();
            wordsToPractice = this.shuffleArray([...allWords]).slice(0, 8);
        } else {
            const words = await Promise.all(wordIds.map(id => this.getWord(id)));
            wordsToPractice = this.shuffleArray(words);
        }

        if (wordsToPractice.length === 0) {
            this.showToast('❌ لغتی برای تمرین وجود ندارد', 'error');
            return;
        }

        this.writingSession = {
            words: wordsToPractice,
            currentIndex: 0,
            score: 0
        };
        
        this.showWritingExercise();
    }
showWritingExercise() {
    if (this.writingSession.currentIndex >= this.writingSession.words.length) {
        this.showWritingResults();
        return;
    }

    const word = this.writingSession.words[this.writingSession.currentIndex];
    const isGerman = LanguageSystem.isGerman();
    
    document.getElementById('practice-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-keyboard"></i> ${LanguageSystem.t('practice.writing')}</h2>
                <span class="badge">${this.writingSession.currentIndex + 1}/${this.writingSession.words.length}</span>
            </div>
            
            <div class="writing-exercise">
                <div class="word-to-translate">
                    <h3>${word.persian}</h3>
                    ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                </div>
                
                <input type="text" 
                       class="answer-input" 
                       id="writing-answer" 
                       placeholder="${isGerman ? 'ترجمه آلمانی را تایپ کنید...' : 'Type English translation...'}"
                       autocomplete="off">
                
                <div class="action-buttons">
                    <button class="btn btn-success" id="check-writing-answer-btn">
                        <i class="fas fa-check"></i> ${LanguageSystem.t('practice.check')}
                    </button>
                    <button class="btn btn-outline" id="show-hint-btn">
                        <i class="fas fa-lightbulb"></i> ${LanguageSystem.t('practice.hint')}
                    </button>
                </div>
                
                <!-- نقطه‌های پیشرفت -->
                <div class="progress-dots">
                    ${this.writingSession.words.map((_, index) => {
                        let dotClass = '';
                        if (index === this.writingSession.currentIndex) {
                            dotClass = 'active';
                        } else if (index < this.writingSession.currentIndex) {
                            dotClass = this.writingSession.words[index].userCorrect ? 'completed correct' : 'completed incorrect';
                        }
                        
                        return `<div class="progress-dot ${dotClass}"></div>`;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    
    this.setupWritingExerciseEventListeners(word);
}

    setupWritingExerciseEventListeners(word) {
        document.getElementById('check-writing-answer-btn').addEventListener('click', () => {
            this.checkWritingAnswer();
        });
        
        document.getElementById('show-hint-btn').addEventListener('click', () => {
            this.showToast(`💡 راهنما: ${word.german.substring(0, 2)}...`, 'info');
        });
        
        document.getElementById('writing-answer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkWritingAnswer();
            }
        });
        
        setTimeout(() => {
            document.getElementById('writing-answer').focus();
        }, 300);
    }

    async checkWritingAnswer() {
        const userAnswer = document.getElementById('writing-answer').value.trim().toLowerCase();
        const currentWord = this.writingSession.words[this.writingSession.currentIndex];
        
        if (!userAnswer) {
            this.showToast('✏️ لطفاً پاسخ را وارد کنید', 'warning');
            return;
        }
        
        const isCorrect = userAnswer === currentWord.german.toLowerCase();
        
        await this.recordPractice(currentWord.id, isCorrect);
        
        if (isCorrect) {
            this.writingSession.score++;
            this.showToast('✅ آفرین! ترجمه صحیح است', 'success');
        } else {
            this.showToast(`❌ پاسخ صحیح: ${currentWord.german}`, 'error');
        }
        
        setTimeout(() => {
            this.writingSession.currentIndex++;
            this.showWritingExercise();
        }, 1500);
    }
showWritingResults() {
    const accuracy = Math.round((this.writingSession.score / this.writingSession.words.length) * 100);
    const isGerman = LanguageSystem.isGerman();
    
    document.getElementById('practice-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-chart-line"></i> ${isGerman ? 'نتایج تمرین نوشتاری' : 'Writing Practice Results'}</h2>
            </div>
            
            <div class="results-summary">
                <div class="result-circle" style="background: conic-gradient(var(--success) 0% ${accuracy}%, var(--gray-200) ${accuracy}% 100%);">
                    <div class="result-circle-inner">
                        <span>${accuracy}%</span>
                    </div>
                </div>
                
                <div class="results-stats">
                    <div class="result-stat">
                        <span>${isGerman ? 'تعداد لغات:' : 'Total Words:'}</span>
                        <strong>${this.writingSession.words.length}</strong>
                    </div>
                    <div class="result-stat">
                        <span>${isGerman ? 'پاسخ صحیح:' : 'Correct Answers:'}</span>
                        <strong>${this.writingSession.score}</strong>
                    </div>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary" id="restart-writing-btn">
                    <i class="fas fa-redo-alt"></i> ${isGerman ? 'تمرین مجدد' : 'Practice Again'}
                </button>
                <button class="btn btn-outline" id="back-to-practice-menu-btn">
                    <i class="fas fa-arrow-right"></i> ${isGerman ? 'بازگشت' : 'Back'}
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('restart-writing-btn').addEventListener('click', () => {
        this.startWritingPractice();
    });
    
    document.getElementById('back-to-practice-menu-btn').addEventListener('click', () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    });
}

    // ================================================
    // تمرین جمله‌سازی
    // ================================================

    async startSpeakingPractice(wordIds = null, range = null) {
        let wordsToPractice;
        
        if (range) {
            wordsToPractice = await this.getWordsByRange(range.start, range.end);
        } else if (!wordIds) {
            const allWords = await this.getAllWords();
            wordsToPractice = this.shuffleArray([...allWords]).slice(0, 6);
        } else {
            const words = await Promise.all(wordIds.map(id => this.getWord(id)));
            wordsToPractice = this.shuffleArray(words);
        }

        if (wordsToPractice.length === 0) {
            this.showToast('❌ لغتی برای تمرین وجود ندارد', 'error');
            return;
        }

        this.speakingSession = {
            words: wordsToPractice,
            currentIndex: 0,
            score: 0
        };
        
        this.showSpeakingExercise();
    }

  showSpeakingExercise() {
    if (this.speakingSession.currentIndex >= this.speakingSession.words.length) {
        this.showSpeakingResults();
        return;
    }

    const word = this.speakingSession.words[this.speakingSession.currentIndex];
    const isGerman = LanguageSystem.isGerman();
    
    document.getElementById('practice-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-comments"></i> ${LanguageSystem.t('practice.speaking')}</h2>
                <span class="badge">${this.speakingSession.currentIndex + 1}/${this.speakingSession.words.length}</span>
            </div>
            
            <div class="speaking-exercise">
                <div class="word-to-use">
                    <h3>${isGerman ? 'لغت:' : 'Word:'} <span class="highlight-word">${word.german}</span></h3>
                    <p>${isGerman ? 'معنی:' : 'Meaning:'} ${word.persian}</p>
                </div>
                
                <textarea class="answer-input" 
                          id="sentence-answer" 
                          rows="3"
                          placeholder="${isGerman ? 'جمله خود را به آلمانی بنویسید...' : 'Write your sentence in English...'}"></textarea>
                
                <div class="action-buttons">
                    <button class="btn btn-success" id="check-sentence-btn">
                        <i class="fas fa-check"></i> ${LanguageSystem.t('practice.check')}
                    </button>
                    <button class="btn btn-outline" id="show-example-btn">
                        <i class="fas fa-lightbulb"></i> ${LanguageSystem.t('practice.hint')}
                    </button>
                </div>
                
                <div class="progress-dots">
                    ${this.speakingSession.words.map((_, index) => `
                        <div class="progress-dot ${index === this.speakingSession.currentIndex ? 'active' : ''} 
                             ${index < this.speakingSession.currentIndex ? 'completed' : ''}"></div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    this.setupSpeakingExerciseEventListeners(word);
}

    setupSpeakingExerciseEventListeners(word) {
        document.getElementById('check-sentence-btn').addEventListener('click', () => {
            this.checkSentenceAnswer();
        });
        
        document.getElementById('show-example-btn').addEventListener('click', () => {
            this.showSentenceExample(word);
        });
        
        setTimeout(() => {
            document.getElementById('sentence-answer').focus();
        }, 300);
    }

    async checkSentenceAnswer() {
        const userSentence = document.getElementById('sentence-answer').value.trim();
        const currentWord = this.speakingSession.words[this.speakingSession.currentIndex];
        
        if (!userSentence) {
            this.showToast('✏️ لطفاً جمله را بنویسید', 'warning');
            return;
        }
        
        const containsWord = userSentence.toLowerCase().includes(currentWord.german.toLowerCase());
        
        await this.recordPractice(currentWord.id, containsWord);
        
        if (containsWord) {
            this.speakingSession.score++;
            this.showToast('✅ آفرین! جمله صحیح است', 'success');
        } else {
            this.showToast(`❌ باید از لغت "${currentWord.german}" استفاده کنید`, 'error');
        }
        
        setTimeout(() => {
            this.speakingSession.currentIndex++;
            this.showSpeakingExercise();
        }, 1500);
    }

    showSentenceExample(word) {
        const examples = [
            `Ich lerne das Wort "${word.german}".`,
            `Kannst du mir "${word.german}" erklären?`,
            `"${word.german}" ist ein wichtiges Wort.`,
            `Ich benutze "${word.german}" in einem Satz.`
        ];
        
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        this.showToast(`📝 مثال: ${randomExample}`, 'info');
    }
showSpeakingResults() {
    const accuracy = Math.round((this.speakingSession.score / this.speakingSession.words.length) * 100);
    const isGerman = LanguageSystem.isGerman();
    
    document.getElementById('practice-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-chart-line"></i> ${isGerman ? 'نتایج تمرین جمله‌سازی' : 'Speaking Practice Results'}</h2>
            </div>
            
            <div class="results-summary">
                <div class="result-circle" style="background: conic-gradient(var(--success) 0% ${accuracy}%, var(--gray-200) ${accuracy}% 100%);">
                    <div class="result-circle-inner">
                        <span>${accuracy}%</span>
                    </div>
                </div>
                
                <div class="results-stats">
                    <div class="result-stat">
                        <span>${isGerman ? 'تعداد لغات:' : 'Total Words:'}</span>
                        <strong>${this.speakingSession.words.length}</strong>
                    </div>
                    <div class="result-stat">
                        <span>${isGerman ? 'جملات صحیح:' : 'Correct Sentences:'}</span>
                        <strong>${this.speakingSession.score}</strong>
                    </div>
                </div>
            </div>
            
                <div class="action-buttons">
                    <button class="btn btn-primary" id="restart-speaking-btn">
                        <i class="fas fa-redo-alt"></i> ${isGerman ? 'تمرین مجدد' : 'Practice Again'}
                    </button>
                    <button class="btn btn-outline" id="back-to-practice-menu-btn">
                        <i class="fas fa-arrow-right"></i> ${isGerman ? 'بازگشت' : 'Back'}
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('restart-speaking-btn').addEventListener('click', () => {
            this.startSpeakingPractice();
        });
        
        document.getElementById('back-to-practice-menu-btn').addEventListener('click', () => {
            this.renderPracticeOptions();
            this.showSection('practice-section');
        });
    }

    // ================================================
    // آزمون چندگزینه‌ای
    // ================================================

    async startQuiz(wordIds = null, range = null) {
        let words;
        
        if (range) {
            words = await this.getWordsByRange(range.start, range.end);
        } else if (!wordIds) {
            words = await this.getAllWords();
        } else {
            words = await Promise.all(wordIds.map(id => this.getWord(id)));
        }
        
        if (words.length < 4) {
            this.showToast('❌ حداقل به ۴ لغت برای شروع آزمون نیاز دارید', 'error');
            return;
        }
        
        this.quizSession = {
            words: this.shuffleArray([...words]),
            currentIndex: 0,
            score: 0,
            questions: []
        };
        
        this.prepareNextQuizQuestion();
        this.showSection('quiz-section');
    }

    prepareNextQuizQuestion() {
        if (this.quizSession.currentIndex >= 10 || 
            this.quizSession.currentIndex >= this.quizSession.words.length) {
            this.showQuizResults();
            return;
        }
        
        const correctWord = this.quizSession.words[this.quizSession.currentIndex];
        const questionType = Math.random() > 0.5 ? 'meaning' : 'word';
        
        const wrongAnswers = [];
        const usedIndices = new Set([this.quizSession.currentIndex]);
        
        while (wrongAnswers.length < 3 && usedIndices.size < this.quizSession.words.length) {
            const randomIndex = Math.floor(Math.random() * this.quizSession.words.length);
            if (!usedIndices.has(randomIndex)) {
                wrongAnswers.push(
                    questionType === 'meaning' 
                        ? this.quizSession.words[randomIndex].persian
                        : this.quizSession.words[randomIndex].german
                );
                usedIndices.add(randomIndex);
            }
        }
        
        const correctAnswer = questionType === 'meaning' 
            ? correctWord.persian 
            : correctWord.german;
        
        const options = this.shuffleArray([correctAnswer, ...wrongAnswers]);
        
        const question = {
            word: correctWord,
            questionType,
            options,
            correctAnswer,
            userAnswer: null,
            isCorrect: null
        };
        
        this.quizSession.questions.push(question);
        this.renderQuizQuestion(question);
    }
renderQuizQuestion(question) {
    const isGerman = LanguageSystem.isGerman();
    
    document.getElementById('quiz-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-question-circle"></i> ${isGerman ? 'آزمون چهارگزینه‌ای' : 'Multiple Choice Quiz'}</h2>
                <span class="badge">${this.quizSession.currentIndex + 1}/${Math.min(10, this.quizSession.words.length)}</span>
            </div>
            
            <div class="quiz-question">
                ${question.questionType === 'meaning' 
                    ? `${isGerman ? 'معنی لغت' : 'Meaning of'} <strong>${question.word.german}</strong> ${isGerman ? 'چیست؟' : '?'}`
                    : `${isGerman ? 'کدام گزینه معادل آلمانی' : 'Which is the German equivalent of'} <strong>${question.word.persian}</strong> ${isGerman ? 'است؟' : '?'}`}
            </div>
            
            <div class="quiz-options">
                ${question.options.map((option, index) => `
                    <div class="quiz-option" data-index="${index}">
                        <span class="option-number">${index + 1}</span>
                        <span class="option-text">${option}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="quiz-feedback ${question.isCorrect ? 'correct' : 'incorrect'}" 
                 style="display: ${question.userAnswer !== null ? 'block' : 'none'}">
                ${question.isCorrect 
                    ? (isGerman ? '✅ پاسخ شما صحیح است!' : '✅ Correct!')
                    : (isGerman ? `❌ پاسخ صحیح: ${question.correctAnswer}` : `❌ Correct answer: ${question.correctAnswer}`)}
            </div>
            
            <div class="quiz-nav">
                <button class="btn btn-outline" id="quiz-skip-btn" 
                        ${question.userAnswer !== null ? 'disabled' : ''}>
                    <i class="fas fa-forward"></i> ${isGerman ? 'رد کردن' : 'Skip'}
                </button>
                <button class="btn btn-primary" id="quiz-next-btn" 
                        ${question.userAnswer === null ? 'disabled' : ''}>
                    ${this.quizSession.currentIndex + 1 >= Math.min(10, this.quizSession.words.length) 
                        ? (isGerman ? 'مشاهده نتایج' : 'View Results') 
                        : (isGerman ? 'سوال بعدی' : 'Next Question')}
                    <i class="fas fa-arrow-left"></i>
                </button>
            </div>
        </div>
    `;
    
    this.setupQuizEventListeners(question);
}

    setupQuizEventListeners(question) {
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', () => {
                if (question.userAnswer !== null) return;
                
                const selectedIndex = parseInt(option.dataset.index);
                const selectedAnswer = question.options[selectedIndex];
                
                question.userAnswer = selectedAnswer;
                question.isCorrect = selectedAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
                
                if (question.isCorrect) {
                    this.quizSession.score++;
                }
                
                document.querySelectorAll('.quiz-option').forEach(opt => {
                    opt.classList.remove('selected', 'correct', 'incorrect');
                });
                
                option.classList.add('selected');
                option.classList.add(question.isCorrect ? 'correct' : 'incorrect');
                
                document.querySelector('.quiz-feedback').style.display = 'block';
                document.getElementById('quiz-next-btn').disabled = false;
            });
        });
        
        document.getElementById('quiz-skip-btn').addEventListener('click', () => {
            this.quizSession.currentIndex++;
            this.prepareNextQuizQuestion();
        });
        
        document.getElementById('quiz-next-btn').addEventListener('click', () => {
            this.quizSession.currentIndex++;
            this.prepareNextQuizQuestion();
        });
    }
setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const filter = btn.getAttribute('data-filter');
            if (!filter) return;
            
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            console.log('🔍 فیلتر:', filter);
            await this.renderWordList(filter);
        };
    });
}
   showQuizResults() {
    const scorePercentage = Math.round((this.quizSession.score / this.quizSession.questions.length) * 100);
    const isGerman = LanguageSystem.isGerman();
    
    document.getElementById('quiz-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-trophy"></i> ${isGerman ? 'نتایج آزمون' : 'Quiz Results'}</h2>
            </div>
            
            <div class="results-summary">
                <div class="result-circle" style="background: conic-gradient(var(--success) 0% ${scorePercentage}%, var(--gray-200) ${scorePercentage}% 100%);">
                    <div class="result-circle-inner">
                        <span>${scorePercentage}%</span>
                    </div>
                </div>
                
                <div class="results-stats">
                    <div class="result-stat">
                        <span>${isGerman ? 'تعداد سوالات:' : 'Total Questions:'}</span>
                        <strong>${this.quizSession.questions.length}</strong>
                    </div>
                    <div class="result-stat">
                        <span>${isGerman ? 'پاسخ صحیح:' : 'Correct Answers:'}</span>
                        <strong>${this.quizSession.score}</strong>
                    </div>
                </div>
            </div>
            
            <div class="quiz-results-details mt-4">
                <h3>📋 ${isGerman ? 'جزئیات پاسخ‌ها' : 'Answer Details'}</h3>
                ${this.quizSession.questions.map((q, i) => `
                    <div class="quiz-result-item ${q.isCorrect ? 'correct' : 'incorrect'}">
                        <div class="quiz-result-question">
                            <span class="question-number">${i + 1}.</span>
                            ${q.questionType === 'meaning' 
                                ? (isGerman ? `معنی <strong>${q.word.german}</strong>` : `Meaning of <strong>${q.word.german}</strong>`)
                                : (isGerman ? `معادل آلمانی <strong>${q.word.persian}</strong>` : `German equivalent of <strong>${q.word.persian}</strong>`)}
                        </div>
                        <div class="quiz-result-answer">
                            ${q.isCorrect ? '✅' : '❌'} 
                            ${isGerman ? 'پاسخ شما:' : 'Your answer:'} ${q.userAnswer || '---'}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="action-buttons mt-4">
                <button class="btn btn-primary" id="restart-quiz-btn">
                    <i class="fas fa-redo-alt"></i> ${isGerman ? 'آزمون جدید' : 'New Quiz'}
                </button>
                <button class="btn btn-outline" id="back-to-practice-btn">
                    <i class="fas fa-arrow-right"></i> ${isGerman ? 'بازگشت' : 'Back'}
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('restart-quiz-btn').addEventListener('click', () => {
        this.startQuiz();
    });
    
    document.getElementById('back-to-practice-btn').addEventListener('click', () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    });
}

    // ================================================
    // مترجم آنلاین
    // ================================================

    renderTranslate() {
    const container = document.getElementById('translate-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-language" style="color: var(--primary);"></i> مترجم آنلاین</h2>
            </div>
            
            <div id="online-status" class="online-status online">
                <i class="fas fa-wifi"></i> آنلاین - سرویس‌های ترجمه فعال
            </div>
            
            <div class="direction-selector">
                <div class="direction-option active" data-direction="de-fa">
                    <div class="direction-icon">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                    <div class="direction-text">
                        <span class="direction-title">آلمانی به فارسی</span>
                        <span class="direction-subtitle">Deutsch → فارسی</span>
                    </div>
                    <div class="direction-check">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
                <div class="direction-option" data-direction="fa-de">
                    <div class="direction-icon">
                        <i class="fas fa-arrow-left"></i>
                    </div>
                    <div class="direction-text">
                        <span class="direction-title">فارسی به آلمانی</span>
                        <span class="direction-subtitle">فارسی → Deutsch</span>
                    </div>
                    <div class="direction-check">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label id="input-label">
                    <i class="fas fa-keyboard"></i>
                    <span id="input-title">متن آلمانی:</span>
                </label>
                <div class="input-with-clear">
                    <textarea id="translate-input" class="form-control" rows="3" 
                              placeholder="متن آلمانی خود را وارد کنید..." dir="ltr"></textarea>
                    <button class="clear-input" id="clear-input-btn" title="پاک کردن متن">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="form-group">
                <label id="output-label">
                    <i class="fas fa-language"></i>
                    <span id="output-title">ترجمه فارسی:</span>
                </label>
                <div id="translate-result" class="translate-result">
                    <div class="empty-result">
                        <div class="empty-icon">
                            <i class="fas fa-exchange-alt"></i>
                        </div>
                        <p>نتیجه ترجمه اینجا نمایش داده می‌شود</p>
                        <small>متن را وارد کنید</small>
                    </div>
                </div>
            </div>
            
            <div class="translate-actions">
                <div class="action-group">
                    <button class="action-btn voice-btn" id="speak-input">
                        <i class="fas fa-volume-up"></i> <span>تلفظ متن</span>
                    </button>
                    <button class="action-btn voice-btn" id="speak-output">
                        <i class="fas fa-volume-up"></i> <span>تلفظ ترجمه</span>
                    </button>
                </div>
                <div class="action-group">
                    <button class="action-btn copy-btn" id="copy-result">
                        <i class="fas fa-copy"></i> <span>کپی ترجمه</span>
                    </button>
                    <button class="action-btn save-btn" id="save-translation">
                        <i class="fas fa-magic"></i> <span>ذخیره هوشمند</span>
                    </button>
                </div>
            </div>
            
            <div id="translate-suggestions" class="translate-suggestions" style="display: none;">
                <div class="suggestions-header">
                    <i class="fas fa-lightbulb"></i>
                    <span>پیشنهادات مشابه</span>
                </div>
                <div class="suggestions-list" id="suggestions-list"></div>
            </div>
        </div>
    `;
    
    this.setupTranslateEventListeners();
    this.updateTranslateUI();
}

    setupTranslateEventListeners() {
        // انتخاب جهت ترجمه
        document.querySelectorAll('.direction-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const newDirection = e.currentTarget.dataset.direction;
                
                if (this.translateDirection === newDirection) return;
                
                this.translateDirection = newDirection;
                
                document.querySelectorAll('.direction-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
                
                this.updateTranslateUI();
                
                document.getElementById('translate-input').value = '';
                document.getElementById('translate-result').innerHTML = `
                    <div class="empty-result">
                        <div class="empty-icon">
                            <i class="fas fa-exchange-alt"></i>
                        </div>
                        <p>نتیجه ترجمه اینجا نمایش داده می‌شود</p>
                        <small>متن را وارد کنید</small>
                    </div>
                `;
            });
        });
        
        // ترجمه خودکار
        const translateInput = document.getElementById('translate-input');
        
        if (translateInput) {
            let debounceTimer;
            
            translateInput.addEventListener('input', (e) => {
                const text = e.target.value.trim();
                
                clearTimeout(debounceTimer);
                
                if (text.length > 2) {
                    debounceTimer = setTimeout(() => {
                        this.performAutoTranslation(text);
                    }, 800);
                }
            });
            
            translateInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const text = e.target.value.trim();
                    if (text) {
                        this.performAutoTranslation(text);
                    }
                }
            });
        }
        
        // دکمه پاک کردن
        document.getElementById('clear-input-btn').addEventListener('click', () => {
            document.getElementById('translate-input').value = '';
            document.getElementById('translate-input').focus();
            document.getElementById('translate-result').innerHTML = `
                <div class="empty-result">
                    <div class="empty-icon">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                    <p>نتیجه ترجمه اینجا نمایش داده می‌شود</p>
                    <small>متن را وارد کنید</small>
                </div>
            `;
            document.getElementById('suggestions-list').innerHTML = '';
        });
        
        // تلفظ
        document.getElementById('speak-input').addEventListener('click', () => {
            const text = document.getElementById('translate-input').value.trim();
            if (text) {
                const lang = this.translateDirection === 'de-fa' ? 'de-DE' : 'fa-IR';
                this.speakText(text, lang);
            }
        });
        
        document.getElementById('speak-output').addEventListener('click', () => {
            const resultDiv = document.getElementById('translate-result');
            const text = resultDiv.textContent
                .replace('نتیجه ترجمه اینجا نمایش داده می‌شود', '')
                .replace('متن را وارد کنید', '')
                .replace('در حال ترجمه...', '')
                .trim();
            
            if (text) {
                const lang = this.translateDirection === 'de-fa' ? 'fa-IR' : 'de-DE';
                this.speakText(text, lang);
            }
        });
        
        // کپی
        document.getElementById('copy-result').addEventListener('click', async () => {
            const resultDiv = document.getElementById('translate-result');
            const text = resultDiv.textContent
                .replace('نتیجه ترجمه اینجا نمایش داده می‌شود', '')
                .replace('متن را وارد کنید', '')
                .replace('در حال ترجمه...', '')
                .trim();
            
            if (text) {
                try {
                    await navigator.clipboard.writeText(text);
                    this.showToast('✅ ترجمه کپی شد', 'success');
                } catch (error) {
                    this.showToast('❌ خطا در کپی', 'error');
                }
            }
        });
        
        // ذخیره هوشمند
        document.getElementById('save-translation').addEventListener('click', () => {
            this.saveTranslationWithAutoAnalysis();
        });
    }

   updateTranslateUI() {
    const isGerman = LanguageSystem.isGerman();
    
    document.getElementById('input-title').textContent = LanguageSystem.t('translate.sourceText');
    document.getElementById('output-title').textContent = LanguageSystem.t('translate.targetText');
    
    const inputField = document.getElementById('translate-input');
    inputField.placeholder = isGerman ? 'متن آلمانی خود را وارد کنید...' : 'Enter English text...';
    inputField.dir = 'ltr';
}
    async performAutoTranslation(text) {
        const resultDiv = document.getElementById('translate-result');
        
        resultDiv.innerHTML = `
            <div class="loading-translation">
                <div class="spinner"></div>
                <p>در حال ترجمه...</p>
            </div>
        `;
        
        try {
            let translatedText = null;
            
            // جستجو در دیتابیس محلی
            const sourceLanguage = this.translateDirection === 'de-fa' ? 'german' : 'persian';
            const localResult = await this.searchInDatabase(text, sourceLanguage);
            
            if (localResult) {
                translatedText = localResult;
                resultDiv.innerHTML = `
                    <div class="translated-text">
                        <div class="result-text">
                            <p>${translatedText}</p>
                        </div>
                        <div class="translation-source">
                            <i class="fas fa-database"></i> ترجمه از دیکشنری شما
                        </div>
                    </div>
                `;
            } else {
                // ترجمه آنلاین
                translatedText = await this.translateTextOnline(text, this.translateDirection);
                
                if (translatedText) {
                    resultDiv.innerHTML = `
                        <div class="translated-text">
                            <div class="original-text">
                                <small>متن اصلی:</small>
                                <p>${text}</p>
                            </div>
                            <div class="separator">
                                <i class="fas fa-arrow-down"></i>
                            </div>
                            <div class="result-text">
                                <small>ترجمه:</small>
                                <p>${translatedText}</p>
                            </div>
                            <div class="translation-source">
                                <i class="fas fa-globe"></i> ترجمه آنلاین
                            </div>
                        </div>
                    `;
                } else {
                    resultDiv.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>ترجمه یافت نشد</p>
                            <small>اتصال اینترنت را بررسی کنید</small>
                        </div>
                    `;
                }
            }
            
            // نمایش پیشنهادات
            await this.showSuggestions(text);
            
        } catch (error) {
            console.error('Translation error:', error);
            resultDiv.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>خطا در ترجمه</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }

    async searchInDatabase(text, language) {
        try {
            const words = await this.getAllWords();
            const searchText = text.toLowerCase().trim();
            
            if (language === 'german') {
                const foundWord = words.find(word => 
                    word.german.toLowerCase() === searchText ||
                    word.german.toLowerCase().startsWith(searchText) ||
                    word.german.toLowerCase().includes(searchText)
                );
                return foundWord ? foundWord.persian : null;
            } else {
                const foundWord = words.find(word => 
                    word.persian.toLowerCase() === searchText ||
                    word.persian.toLowerCase().includes(searchText) ||
                    word.persian.toLowerCase().startsWith(searchText)
                );
                return foundWord ? foundWord.german : null;
            }
        } catch (error) {
            console.error('Error in searchInDatabase:', error);
            return null;
        }
    }

    async translateTextOnline(text, direction) {
        let sourceLang, targetLang;
        
        if (direction === 'de-fa') {
            sourceLang = 'de';
            targetLang = 'fa';
        } else {
            sourceLang = 'fa';
            targetLang = 'de';
        }
        
        // Google Translate
        let translatedText = await this.translateWithGoogle(text, sourceLang, targetLang);
        
        if (!translatedText) {
            translatedText = await this.translateWithMyMemory(text, sourceLang, targetLang);
        }
        
        if (!translatedText) {
            translatedText = await this.translateWithLibre(text, sourceLang, targetLang);
        }
        
        return translatedText;
    }

    async translateWithGoogle(text, source, target) {
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
            const response = await fetch(url);
            if (!response.ok) return null;
            const data = await response.json();
            return data[0][0][0] || null;
        } catch (error) {
            console.log('Google Translate failed');
            return null;
        }
    }

    async translateWithMyMemory(text, source, target) {
        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
            const response = await fetch(url);
            if (!response.ok) return null;
            const data = await response.json();
            return data.responseData?.translatedText || null;
        } catch (error) {
            console.log('MyMemory failed');
            return null;
        }
    }

    async translateWithLibre(text, source, target) {
        try {
            const servers = [
                'https://libretranslate.com',
                'https://translate.argosopentech.com',
                'https://libretranslate.de'
            ];
            
            for (const server of servers) {
                try {
                    const response = await fetch(`${server}/translate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            q: text,
                            source: source,
                            target: target,
                            format: 'text'
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        return data.translatedText || null;
                    }
                } catch (e) {
                    continue;
                }
            }
            return null;
        } catch (error) {
            console.log('LibreTranslate failed');
            return null;
        }
    }

    async showSuggestions(text) {
        const suggestionsDiv = document.getElementById('suggestions-list');
        const suggestionsContainer = document.getElementById('translate-suggestions');
        
        if (!text || text.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        try {
            const words = await this.getAllWords();
            const searchText = text.toLowerCase();
            
            const suggestions = words
                .filter(word => 
                    word.german.toLowerCase().startsWith(searchText) ||
                    word.german.toLowerCase().includes(searchText) ||
                    word.persian.toLowerCase().includes(searchText)
                )
                .slice(0, 5);
            
            if (suggestions.length === 0) {
                suggestionsContainer.style.display = 'none';
                return;
            }
            
            suggestionsContainer.style.display = 'block';
            
            suggestionsDiv.innerHTML = suggestions.map(word => `
                <div class="suggestion-item" data-german="${word.german}">
                    <div class="suggestion-content">
                        <div class="suggestion-german">${word.german}</div>
                        <div class="suggestion-persian">${word.persian}</div>
                        ${word.gender ? `<span class="word-gender-badge ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                        ${word.type ? `<span class="word-type-badge">${this.getTypeLabel(word.type)}</span>` : ''}
                    </div>
                    <button class="use-suggestion-btn">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            `).join('');
            
            document.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (!e.target.closest('.use-suggestion-btn')) {
                        const germanWord = item.dataset.german;
                        document.getElementById('translate-input').value = germanWord;
                        this.performAutoTranslation(germanWord);
                    }
                });
            });
            
            document.querySelectorAll('.use-suggestion-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const germanWord = btn.closest('.suggestion-item').dataset.german;
                    document.getElementById('translate-input').value = germanWord;
                    this.performAutoTranslation(germanWord);
                });
            });
            
        } catch (error) {
            console.error('Error showing suggestions:', error);
            suggestionsContainer.style.display = 'none';
        }
    }

    async saveTranslationWithAutoAnalysis() {
        const inputText = document.getElementById('translate-input').value.trim();
        const resultDiv = document.getElementById('translate-result');
        
        if (!inputText) {
            this.showToast('✏️ لطفاً متنی را ترجمه کنید', 'warning');
            return;
        }
        
        let translationText = '';
        const resultElements = resultDiv.querySelectorAll('p');
        
        for (const element of resultElements) {
            const text = element.textContent.trim();
            if (text && 
                !text.includes('نتیجه ترجمه') && 
                !text.includes('متن را وارد کنید') && 
                !text.includes('در حال ترجمه') &&
                text !== inputText) {
                translationText = text;
                break;
            }
        }
        
        if (!translationText) {
            this.showToast('❌ ترجمه‌ای برای ذخیره وجود ندارد', 'error');
            return;
        }
        
        let german, persian;
        if (this.translateDirection === 'de-fa') {
            german = inputText;
            persian = translationText;
        } else {
            german = translationText;
            persian = inputText;
        }
        
        german = german.replace(/["']/g, '').replace(/\s+/g, ' ').trim();
        persian = persian.replace(/["']/g, '').replace(/\s+/g, ' ').trim();
        
        const analysis = await this.autoDetectWordInfo(german);
        this.showSaveFormWithAnalysis(german, persian, analysis);
    }

    async autoDetectWordInfo(germanWord) {
        const word = germanWord.toLowerCase().trim();
        
        let type = 'other';
        let gender = null;
        
        // تشخیص اسم و جنسیت
        const genderPatterns = {
            masculine: [
                /(ling|ich|ig|ner|ismus|or|ant|ent|ist)$/,
                /^(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)$/,
                /^(frühling|sommer|herbst|winter)$/,
                /^(norden|süden|osten|westen)$/
            ],
            feminine: [
                /(ung|heit|keit|schaft|ion|tät|ik|ur|ei|enz|anz|ade|age|isse|itis|ive|sis)$/,
                /^(eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn)$/,
                /maschine$/
            ],
            neuter: [
                /(chen|lein|ment|tum|um|ma|nis|sal|tel|in|icht|sel)$/,
                /^(gold|silber|eisen|kupfer|blei)$/
            ]
        };
        
        const isNoun = /^[A-ZÄÖÜ][a-zäöüß]+$/.test(germanWord) || 
                      germanWord.includes(' ') || 
                      /(ung|heit|keit|schaft|ling|chen|lein|tum|nis|sal|ment)$/.test(word);
        
        if (isNoun) {
            type = 'noun';
            
            for (const [gen, patterns] of Object.entries(genderPatterns)) {
                for (const pattern of patterns) {
                    if (pattern.test(word)) {
                        gender = gen;
                        break;
                    }
                }
                if (gender) break;
            }
        } else if (/(en|ern|eln|ieren|isieren|ifizieren)$/.test(word)) {
            type = 'verb';
        } else if (/(ig|isch|lich|bar|sam|haft|los|voll|mäßig|artig)$/.test(word)) {
            type = 'adjective';
        }
        
        return { type, gender };
    }

  // ========== اصلاح تابع showSaveFormWithAnalysis ==========

showSaveFormWithAnalysis(german, persian, analysis) {
    const { type, gender } = analysis;
    
    document.getElementById('add-word-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-magic" style="color: var(--primary);"></i> ذخیره هوشمند ترجمه</h2>
            </div>
            
            <div class="auto-analysis-banner">
                <i class="fas fa-robot"></i>
                <span>تحلیل خودکار انجام شد: <strong>${this.getTypeLabel(type)}</strong>
                ${gender ? ` - <strong>${this.getGenderLabel(gender)}</strong>` : ''}</span>
            </div>
            
            <div class="form-group">
                <label for="save-german-word">لغت آلمانی:</label>
                <input type="text" id="save-german-word" class="form-control" value="${german}">
            </div>
            
            <div class="form-group">
                <label for="save-persian-meaning">معنی فارسی:</label>
                <input type="text" id="save-persian-meaning" class="form-control" value="${persian}">
            </div>
            
            <div class="form-group">
                <label for="save-word-type">نوع کلمه:</label>
                <select id="save-word-type" class="form-control">
                    <option value="noun" ${type === 'noun' ? 'selected' : ''}>📘 اسم</option>
                    <option value="verb" ${type === 'verb' ? 'selected' : ''}>⚡ فعل</option>
                    <option value="adjective" ${type === 'adjective' ? 'selected' : ''}>✨ صفت</option>
                    <option value="adverb" ${type === 'adverb' ? 'selected' : ''}>📌 قید</option>
                    <option value="other" ${type === 'other' ? 'selected' : ''}>🔹 سایر</option>
                </select>
            </div>
            
            <div class="form-group" id="save-gender-section" style="display: ${type === 'noun' ? 'block' : 'none'}">
                <label>جنسیت:</label>
                <div class="gender-options">
                    <button type="button" class="gender-btn masculine ${gender === 'masculine' ? 'active' : ''}" 
                            data-gender="masculine">مذکر (der)</button>
                    <button type="button" class="gender-btn feminine ${gender === 'feminine' ? 'active' : ''}" 
                            data-gender="feminine">مونث (die)</button>
                    <button type="button" class="gender-btn neuter ${gender === 'neuter' ? 'active' : ''}" 
                            data-gender="neuter">خنثی (das)</button>
                    <button type="button" class="gender-btn none ${!gender ? 'active' : ''}" 
                            data-gender="none">بدون جنسیت</button>
                </div>
            </div>
            
            <div id="save-verb-section" style="display: ${type === 'verb' ? 'block' : 'none'}">
                <div class="form-group">
                    <label><i class="fas fa-table"></i> صرف فعل (پیشنهاد هوشمند):</label>
                    <div class="verb-form-row">
                        <div class="verb-form-item">
                            <span class="verb-form-label">حال ساده</span>
                            <input type="text" id="save-verb-present" class="form-control" 
                                   value="${this.suggestVerbConjugation(german).present}">
                        </div>
                        <div class="verb-form-item">
                            <span class="verb-form-label">گذشته ساده</span>
                            <input type="text" id="save-verb-past" class="form-control" 
                                   value="${this.suggestVerbConjugation(german).past}">
                        </div>
                        <div class="verb-form-item">
                            <span class="verb-form-label">گذشته کامل</span>
                            <input type="text" id="save-verb-perfect" class="form-control" 
                                   value="${this.suggestVerbConjugation(german).perfect}">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="action-buttons mt-4">
                <button class="btn btn-primary btn-lg" id="save-analyzed-word-btn">
                    <i class="fas fa-save"></i> ذخیره نهایی
                </button>
                <button class="btn btn-outline" id="cancel-save-analyzed-btn">
                    <i class="fas fa-times"></i> انصراف
                </button>
            </div>
        </div>
    `;
    
    this.setupSaveAnalyzedFormEvents();
    this.showSection('add-word-section');
}

// ========== اصلاح تابع setupSaveAnalyzedFormEvents ==========

setupSaveAnalyzedFormEvents() {
    document.getElementById('save-word-type').addEventListener('change', (e) => {
        const type = e.target.value;
        const genderSection = document.getElementById('save-gender-section');
        const verbSection = document.getElementById('save-verb-section');
        
        if (genderSection) genderSection.style.display = type === 'noun' ? 'block' : 'none';
        if (verbSection) verbSection.style.display = type === 'verb' ? 'block' : 'none';
    });
    
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    document.getElementById('save-analyzed-word-btn').addEventListener('click', async () => {
        const german = document.getElementById('save-german-word').value.trim();
        const persian = document.getElementById('save-persian-meaning').value.trim();
        const type = document.getElementById('save-word-type').value;
        
        if (!german || !persian) {
            this.showToast('❌ لطفاً هر دو فیلد را پر کنید', 'error');
            return;
        }
        
        const wordData = {
            german,
            persian,
            type,
            createdAt: new Date().toISOString()
        };
        
        if (type === 'noun') {
            const activeGender = document.querySelector('.gender-btn.active');
            if (activeGender && activeGender.dataset.gender !== 'none') {
                wordData.gender = activeGender.dataset.gender;
            }
        }
        
        if (type === 'verb') {
            const present = document.getElementById('save-verb-present')?.value.trim() || german;
            const past = document.getElementById('save-verb-past')?.value.trim() || '';
            const perfect = document.getElementById('save-verb-perfect')?.value.trim() || '';
            
            wordData.verbForms = { present, past, perfect };
        }
        
        try {
            await this.addWord(wordData);
            this.showToast('✅ لغت با تحلیل خودکار ذخیره شد', 'success');
            
            // ========== برگشت فوری به مترجم ==========
            this.returnToTranslateImmediately();
            
        } catch (error) {
            this.showToast('❌ خطا در ذخیره لغت', 'error');
        }
    });
    
    document.getElementById('cancel-save-analyzed-btn').addEventListener('click', () => {
        // ========== برگشت فوری به مترجم ==========
        this.returnToTranslateImmediately();
    });
}
returnToTranslateImmediately() {
    console.log('🔄 برگشت به مترجم...');
    
    // پاک کردن کامل بخش افزودن لغت
    const addWordEl = document.getElementById('add-word-section');
    if (addWordEl) addWordEl.innerHTML = '';
    
    // پاک کردن کامل بخش مترجم
    const translateEl = document.getElementById('translate-section');
    if (translateEl) translateEl.innerHTML = '';
    
    // رندر مجدد مترجم
    this.renderTranslate();
    
    // فعال کردن بخش مترجم
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('translate-section').classList.add('active');
    
    // پاک کردن input
    const input = document.getElementById('translate-input');
    if (input) input.value = '';
    
    console.log('✅ برگشت به مترجم انجام شد');
}
    suggestVerbConjugation(verb) {
        const conjugations = {
            present: verb,
            past: '',
            perfect: ''
        };
        
        if (verb.endsWith('en')) {
            const stem = verb.slice(0, -2);
            conjugations.past = stem + 'te';
            conjugations.perfect = 'ge' + stem + 't';
            
            const irregularVerbs = {
                'sein': { past: 'war', perfect: 'gewesen' },
                'haben': { past: 'hatte', perfect: 'gehabt' },
                'werden': { past: 'wurde', perfect: 'geworden' },
                'können': { past: 'konnte', perfect: 'gekonnt' },
                'müssen': { past: 'musste', perfect: 'gemusst' },
                'dürfen': { past: 'durfte', perfect: 'gedurft' },
                'sollen': { past: 'sollte', perfect: 'gesollt' },
                'wollen': { past: 'wollte', perfect: 'gewollt' },
                'mögen': { past: 'mochte', perfect: 'gemocht' },
                'gehen': { past: 'ging', perfect: 'gegangen' },
                'kommen': { past: 'kam', perfect: 'gekommen' },
                'sehen': { past: 'sah', perfect: 'gesehen' },
                'sprechen': { past: 'sprach', perfect: 'gesprochen' },
                'lesen': { past: 'las', perfect: 'gelesen' },
                'essen': { past: 'aß', perfect: 'gegessen' },
                'trinken': { past: 'trank', perfect: 'getrunken' },
                'schlafen': { past: 'schlief', perfect: 'geschlafen' }
            };
            
            if (irregularVerbs[verb]) {
                conjugations.past = irregularVerbs[verb].past;
                conjugations.perfect = irregularVerbs[verb].perfect;
            }
        }
        
        return conjugations;
    }


    // ================================================
    // مدیریت تاریخچه تمرین
    // ================================================

    async recordPractice(wordId, correct) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['practiceHistory'], 'readwrite');
            const store = transaction.objectStore('practiceHistory');
            
            const record = {
                wordId,
                correct,
                date: new Date().toISOString()
            };
            
            const request = store.add(record);
            
            request.onsuccess = () => {
                this.updateStats();
                resolve();
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getPracticeHistory(wordId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['practiceHistory'], 'readonly');
            const store = transaction.objectStore('practiceHistory');
            const index = store.index('wordId');
            const request = index.getAll(wordId);
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (event) => {
                console.error('خطا در دریافت تاریخچه تمرین:', event.target.error);
                resolve([]);
            };
        });
    }
// ========== اصلاح تابع getAllPracticeHistory ==========

async getAllPracticeHistory() {
    return new Promise((resolve, reject) => {
        // اگر دیتابیس آماده نیست، آرایه خالی برگردون
        if (!this.db) {
            console.log('⚠️ دیتابیس آماده نیست');
            resolve([]);
            return;
        }

        try {
            const transaction = this.db.transaction(['practiceHistory'], 'readonly');
            const store = transaction.objectStore('practiceHistory');
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result || []);
            };
            
            request.onerror = (event) => {
                console.error('خطا در دریافت تاریخچه تمرین:', event.target.error);
                resolve([]);
            };
        } catch (error) {
            console.error('خطا در getAllPracticeHistory:', error);
            resolve([]);
        }
    });
}
   // ================================================
// آمار و پیشرفت - نسخه کامل و زیبا
// ================================================
async updateStats() {
    // اگر دیتابیس آماده نیست، صبر کن
    if (!this.db) {
        console.log('⏳ دیتابیس آماده نیست، صبر می‌کنم...');
        setTimeout(() => this.updateStats(), 500);
        return;
    }
    
    try {
        const words = await this.getAllWords();
        const practiceHistory = await this.getAllPracticeHistory();
        const isGerman = LanguageSystem.isGerman();
        
        const totalWords = words.length;
        const totalFavorites = this.favorites.size;
        const totalPractice = practiceHistory.length;
        const correctPractice = practiceHistory.filter(h => h.correct).length;
        const accuracy = totalPractice > 0 ? Math.round((correctPractice / totalPractice) * 100) : 0;
        
        const today = new Date().toISOString().split('T')[0];
        const todayPractice = practiceHistory.filter(h => h.date.split('T')[0] === today).length;
        
        // آپدیت کارت‌های آمار
        const statsGrid = document.getElementById('stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-title">${isGerman ? 'میزان دقت' : 'Accuracy'}</div>
                    <div class="stat-value">${accuracy}%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-title">${isGerman ? 'کل لغات' : 'Total Words'}</div>
                    <div class="stat-value">${totalWords}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-title">${isGerman ? 'علاقه‌مندی‌ها' : 'Favorites'}</div>
                    <div class="stat-value">${totalFavorites}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-title">${isGerman ? 'تمرین امروز' : 'Today\'s Practice'}</div>
                    <div class="stat-value">${todayPractice}</div>
                </div>
            `;
        }
        
        // رندر پیشرفت هفتگی
        this.renderWeeklyProgress(practiceHistory);
        
        // رندر دستاوردها
        this.renderAchievements(totalWords, totalPractice, accuracy);
        
        // رندر فعالیت اخیر
        await this.renderRecentActivity(practiceHistory);
        
    } catch (error) {
        console.error('❌ خطا در آپدیت آمار:', error);
    }
}

// ================================================
// پیشرفت هفتگی با آیکون و رنگ
// ================================================

renderWeeklyProgress(practiceHistory) {
    const container = document.getElementById('weekly-progress');
    if (!container) return;
    
    const isGerman = LanguageSystem.isGerman();
    
    const days = [
        { name: isGerman ? 'شنبه' : 'Saturday', icon: 'fa-calendar-day' },
        { name: isGerman ? 'یکشنبه' : 'Sunday', icon: 'fa-sun' },
        { name: isGerman ? 'دوشنبه' : 'Monday', icon: 'fa-moon' },
        { name: isGerman ? 'سه‌شنبه' : 'Tuesday', icon: 'fa-star' },
        { name: isGerman ? 'چهارشنبه' : 'Wednesday', icon: 'fa-cloud' },
        { name: isGerman ? 'پنجشنبه' : 'Thursday', icon: 'fa-umbrella' },
        { name: isGerman ? 'جمعه' : 'Friday', icon: 'fa-heart' }
    ];
    
    const today = new Date().getDay(); // 0 = یکشنبه
    const persianToday = today === 0 ? 6 : today - 1; // تبدیل به شمسی
    
    let weeklyData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const count = practiceHistory.filter(h => h.date.split('T')[0] === dateStr).length;
        const hasActivity = count > 0;
        
        weeklyData.push({
            date: dateStr,
            count: count,
            hasActivity: hasActivity
        });
    }
    
    const maxCount = Math.max(...weeklyData.map(d => d.count), 1);
    
    container.innerHTML = weeklyData.map((data, index) => {
        const isToday = index === 6; // آخرین روز = امروز
        const day = days[index];
        const percent = (data.count / maxCount) * 100;
        
        let dayClass = 'day-progress';
        if (isToday) dayClass += ' today';
        if (data.hasActivity) dayClass += ' has-activity';
        if (!data.hasActivity) dayClass += ' no-activity';
        
        return `
            <div class="${dayClass}">
                <div class="day-icon">
                    <i class="fas ${day.icon}"></i>
                </div>
                <div class="day-name">${day.name}</div>
                <div class="day-bar">
                    <div class="day-fill" style="height: ${percent}%"></div>
                </div>
                <div class="day-value">
                    ${data.count}
                    ${data.hasActivity ? '<i class="fas fa-check-circle"></i>' : ''}
                </div>
                ${isToday ? `<span class="today-badge">${isGerman ? 'امروز' : 'Today'}</span>` : ''}
            </div>
        `;
    }).join('');
}

// ================================================
// دستاوردها
// ================================================

renderAchievements(totalWords, totalPractice, accuracy) {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    
    const isGerman = LanguageSystem.isGerman();
    
    const achievements = [
        {
            id: 'first_word',
            title: isGerman ? 'اولین لغت' : 'First Word',
            desc: isGerman ? 'اولین لغت را اضافه کنید' : 'Add your first word',
            icon: 'fa-plus-circle',
            achieved: totalWords >= 1,
            color: '#4361ee',
            target: 1,
            current: totalWords
        },
        {
            id: 'ten_words',
            title: isGerman ? '۱۰ لغت' : '10 Words',
            desc: isGerman ? '۱۰ لغت به دیکشنری اضافه کنید' : 'Add 10 words',
            icon: 'fa-book',
            achieved: totalWords >= 10,
            color: '#3b82f6',
            target: 10,
            current: totalWords
        },
        {
            id: 'fifty_words',
            title: isGerman ? '۵۰ لغت' : '50 Words',
            desc: isGerman ? '۵۰ لغت به دیکشنری اضافه کنید' : 'Add 50 words',
            icon: 'fa-layer-group',
            achieved: totalWords >= 50,
            color: '#8b5cf6',
            target: 50,
            current: totalWords
        },
        {
            id: 'hundred_words',
            title: isGerman ? '۱۰۰ لغت' : '100 Words',
            desc: isGerman ? '۱۰۰ لغت به دیکشنری اضافه کنید' : 'Add 100 words',
            icon: 'fa-crown',
            achieved: totalWords >= 100,
            color: '#f59e0b',
            target: 100,
            current: totalWords
        },
        {
            id: 'first_practice',
            title: isGerman ? 'اولین تمرین' : 'First Practice',
            desc: isGerman ? 'اولین تمرین را انجام دهید' : 'Do your first practice',
            icon: 'fa-brain',
            achieved: totalPractice >= 1,
            color: '#10b981',
            target: 1,
            current: totalPractice
        },
        {
            id: 'perfect_score',
            title: isGerman ? '۱۰۰٪ دقت' : '100% Accuracy',
            desc: isGerman ? '۱۰۰٪ پاسخ صحیح در یک جلسه' : '100% correct in one session',
            icon: 'fa-star',
            achieved: accuracy === 100,
            color: '#fbbf24',
            target: 100,
            current: accuracy
        }
    ];
    
    container.innerHTML = achievements.map(ach => {
        const progress = Math.min(100, Math.round((ach.current / ach.target) * 100));
        
        return `
            <div class="achievement-item ${ach.achieved ? 'unlocked' : 'locked'}">
                <div class="achievement-icon" style="background: ${ach.color}20; color: ${ach.color}">
                    <i class="fas ${ach.icon}"></i>
                </div>
                <div class="achievement-title">${ach.title}</div>
                <div class="achievement-desc">${ach.desc}</div>
                ${!ach.achieved ? `
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%; background: ${ach.color}"></div>
                        </div>
                        <div class="progress-text">${ach.current}/${ach.target}</div>
                    </div>
                ` : `
                    <div class="achievement-badge">
                        <i class="fas fa-check-circle"></i> ${isGerman ? 'تکمیل شده' : 'Completed'}
                    </div>
                `}
            </div>
        `;
    }).join('');
}

// ================================================
// فعالیت اخیر - رفع مشکل [object Promise]
// ================================================

async renderRecentActivity(practiceHistory) {
    const container = document.getElementById('recent-activity');
    if (!container) return;
    
    const isGerman = LanguageSystem.isGerman();
    
    if (practiceHistory.length === 0) {
        container.innerHTML = `<p class="text-center text-muted">${isGerman ? 'هنوز فعالیتی ثبت نشده' : 'No activity yet'}</p>`;
        return;
    }
    
    // گرفتن آخرین ۱۰ فعالیت
    const recent = practiceHistory.slice(-10).reverse();
    
    // تبدیل به HTML به صورت همزمان
    let html = '';
    
    for (const record of recent) {
        try {
            const word = await this.getWord(record.wordId);
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon ${record.correct ? 'success' : 'danger'}">
                        <i class="fas ${record.correct ? 'fa-check' : 'fa-times'}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-text">
                            <span class="activity-word">${word ? word.german : (isGerman ? 'لغت حذف شده' : 'Deleted word')}</span>
                            <span class="activity-result ${record.correct ? 'correct' : 'incorrect'}">
                                ${record.correct ? (isGerman ? '✅ صحیح' : '✅ Correct') : (isGerman ? '❌ نادرست' : '❌ Incorrect')}
                            </span>
                        </div>
                        <div class="activity-time">
                            <i class="far fa-clock"></i>
                            ${this.formatPersianDate(record.date)}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('خطا در دریافت لغت:', error);
        }
    }
    
    if (html === '') {
        html = `<p class="text-center text-muted">${isGerman ? 'خطا در نمایش فعالیت‌ها' : 'Error loading activities'}</p>`;
    }
    
    container.innerHTML = html;
}

// ================================================
// فرمت تاریخ به شمسی
// ================================================

formatPersianDate(isoDate) {
    const date = new Date(isoDate);
    
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('fa-IR', options);
}
    // ================================================
    // مدیریت تنظیمات و شخصی‌سازی
    // ================================================

   // ================================================
// تنظیمات کامل برنامه - با پوسته‌های رنگی
// ================================================
renderSettings() {
    // دریافت مقادیر ذخیره شده
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    const theme = localStorage.getItem('theme') || 'default';
    const iconStyle = localStorage.getItem('iconStyle') || 'default';
    const layout = localStorage.getItem('layout') || 'default';
    const isGerman = LanguageSystem.isGerman();
    
    const container = document.getElementById('settings-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <!-- ========== هدر ========== -->
            <div class="section-header">
                <h2><i class="fas fa-cog"></i> ${LanguageSystem.t('settings.title')}</h2>
            </div>
            
            <!-- ========== ظاهر برنامه ========== -->
            <div class="settings-group">
                <h3><i class="fas fa-palette"></i> ${LanguageSystem.t('settings.appearance')}</h3>
                
                <div class="settings-grid">
                    <!-- حالت تاریک -->
                    <div class="setting-item">
                        <label class="setting-label">
                            <i class="fas fa-moon"></i>
                            <span>${LanguageSystem.t('settings.darkMode')}</span>
                        </label>
                        <div class="toggle-switch">
                            <input type="checkbox" id="dark-mode-toggle" ${isDarkMode ? 'checked' : ''}>
                            <label for="dark-mode-toggle" class="toggle-slider"></label>
                        </div>
                    </div>
                    
                    <!-- اندازه فونت -->
                    <div class="setting-item">
                        <label class="setting-label">
                            <i class="fas fa-text-height"></i>
                            <span>${LanguageSystem.t('settings.fontSize')}</span>
                        </label>
                        <select id="font-size-select" class="form-control">
                            <option value="small" ${fontSize === 'small' ? 'selected' : ''}>${LanguageSystem.t('settings.small')}</option>
                            <option value="medium" ${fontSize === 'medium' ? 'selected' : ''}>${LanguageSystem.t('settings.medium')}</option>
                            <option value="large" ${fontSize === 'large' ? 'selected' : ''}>${LanguageSystem.t('settings.large')}</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- ========== پوسته‌های رنگی ========== -->
            <div class="settings-group">
                <h3><i class="fas fa-swatchbook"></i> ${LanguageSystem.t('settings.themes')}</h3>
                
                <div class="theme-selector">
                    <!-- پیش‌فرض -->
                    <div class="theme-option ${theme === 'default' ? 'active' : ''}" data-theme="default">
                        <div class="theme-preview default-theme"></div>
                        <span>${LanguageSystem.t('settings.default')}</span>
                        <small class="theme-colors">${isGerman ? 'آبی - بنفش' : 'Blue - Purple'}</small>
                    </div>
                    
                    <!-- آبی -->
                    <div class="theme-option ${theme === 'blue' ? 'active' : ''}" data-theme="blue">
                        <div class="theme-preview blue-theme"></div>
                        <span>${LanguageSystem.t('settings.blue')}</span>
                        <small class="theme-colors">${isGerman ? 'آبی آسمانی - آبی نفتی' : 'Sky Blue - Navy'}</small>
                    </div>
                    
                    <!-- سبز -->
                    <div class="theme-option ${theme === 'green' ? 'active' : ''}" data-theme="green">
                        <div class="theme-preview green-theme"></div>
                        <span>${LanguageSystem.t('settings.green')}</span>
                        <small class="theme-colors">${isGerman ? 'سبز زمردی - سبز جنگلی' : 'Emerald - Forest'}</small>
                    </div>
                    
                    <!-- بنفش -->
                    <div class="theme-option ${theme === 'purple' ? 'active' : ''}" data-theme="purple">
                        <div class="theme-preview purple-theme"></div>
                        <span>${LanguageSystem.t('settings.purple')}</span>
                        <small class="theme-colors">${isGerman ? 'بنفش - ارغوانی' : 'Purple - Violet'}</small>
                    </div>
                    
                    <!-- نارنجی -->
                    <div class="theme-option ${theme === 'orange' ? 'active' : ''}" data-theme="orange">
                        <div class="theme-preview orange-theme"></div>
                        <span>${LanguageSystem.t('settings.orange')}</span>
                        <small class="theme-colors">${isGerman ? 'نارنجی - نارنجی تیره' : 'Orange - Dark Orange'}</small>
                    </div>
                    
                    <!-- صورتی -->
                    <div class="theme-option ${theme === 'pink' ? 'active' : ''}" data-theme="pink">
                        <div class="theme-preview pink-theme"></div>
                        <span>${LanguageSystem.t('settings.pink')}</span>
                        <small class="theme-colors">${isGerman ? 'صورتی - رز' : 'Pink - Rose'}</small>
                    </div>
                </div>
            </div>
            
            <!-- ========== تنظیمات زبان آموزشی ========== -->
            <div class="settings-group">
                <h3><i class="fas fa-language"></i> ${LanguageSystem.t('settings.language')}</h3>
                
                <div class="language-buttons">
                    <button class="lang-btn ${LanguageSystem.isGerman() ? 'active' : ''}" 
                            onclick="switchLanguage('de')">
                        <span class="lang-flag">PE</span>
                        <span class="lang-text">${LanguageSystem.t('settings.german')}</span>
                    </button>
                    
                    <button class="lang-btn ${LanguageSystem.isEnglish() ? 'active' : ''}" 
                            onclick="switchLanguage('en')">
                        <span class="lang-flag">🇬🇧</span>
                        <span class="lang-text">${LanguageSystem.t('settings.english')}</span>
                    </button>
                </div>
            </div>
            
            <!-- ========== رنگ سفارشی ========== -->
            <div class="settings-group">
                <h3><i class="fas fa-eyedropper"></i> ${isGerman ? 'رنگ سفارشی' : 'Custom Color'}</h3>
                
                <div class="color-picker-container">
                    <div class="color-preview" id="color-preview" style="background: rgb(${this.customColor.r}, ${this.customColor.g}, ${this.customColor.b});"></div>
                    
                    <div class="rgb-controls">
                        <label>${isGerman ? 'قرمز:' : 'Red:'}</label>
                        <div class="rgb-slider-container">
                            <input type="range" id="color-red" min="0" max="255" value="${this.customColor.r}" class="rgb-slider">
                            <span class="rgb-value" id="red-value">${this.customColor.r}</span>
                        </div>
                    </div>
                    
                    <div class="rgb-controls">
                        <label>${isGerman ? 'سبز:' : 'Green:'}</label>
                        <div class="rgb-slider-container">
                            <input type="range" id="color-green" min="0" max="255" value="${this.customColor.g}" class="rgb-slider">
                            <span class="rgb-value" id="green-value">${this.customColor.g}</span>
                        </div>
                    </div>
                    
                    <div class="rgb-controls">
                        <label>${isGerman ? 'آبی:' : 'Blue:'}</label>
                        <div class="rgb-slider-container">
                            <input type="range" id="color-blue" min="0" max="255" value="${this.customColor.b}" class="rgb-slider">
                            <span class="rgb-value" id="blue-value">${this.customColor.b}</span>
                        </div>
                    </div>
                    
                    <div class="color-presets">
                        <div class="color-preset" style="background: #4361ee;" data-color="#4361ee"></div>
                        <div class="color-preset" style="background: #10b981;" data-color="#10b981"></div>
                        <div class="color-preset" style="background: #8b5cf6;" data-color="#8b5cf6"></div>
                        <div class="color-preset" style="background: #f59e0b;" data-color="#f59e0b"></div>
                        <div class="color-preset" style="background: #ef4444;" data-color="#ef4444"></div>
                        <div class="color-preset" style="background: #ec4899;" data-color="#ec4899"></div>
                    </div>
                    
                    <button class="btn btn-primary mt-3" id="apply-custom-color">
                        <i class="fas fa-check"></i> ${isGerman ? 'اعمال رنگ سفارشی' : 'Apply Custom Color'}
                    </button>
                </div>
            </div>
            
            <!-- ========== سبک آیکون ========== -->
            <div class="settings-group">
                <h3><i class="fas fa-icons"></i> ${isGerman ? 'سبک آیکون‌ها' : 'Icon Style'}</h3>
                
                <div class="icon-style-selector">
                    <div class="icon-style-option ${iconStyle === 'default' ? 'active' : ''}" data-style="default">
                        <i class="fas fa-star default-icon"></i>
                        <span>${isGerman ? 'پیش‌فرض' : 'Default'}</span>
                    </div>
                    <div class="icon-style-option ${iconStyle === 'modern' ? 'active' : ''}" data-style="modern">
                        <i class="fas fa-star modern-icon"></i>
                        <span>${isGerman ? 'مدرن' : 'Modern'}</span>
                    </div>
                    <div class="icon-style-option ${iconStyle === 'minimal' ? 'active' : ''}" data-style="minimal">
                        <i class="fas fa-star minimal-icon"></i>
                        <span>${isGerman ? 'مینیمال' : 'Minimal'}</span>
                    </div>
                </div>
            </div>
            
            <!-- ========== چیدمان ========== -->
            <div class="settings-group">
                <h3><i class="fas fa-layout"></i> ${isGerman ? 'چیدمان صفحات' : 'Page Layout'}</h3>
                
                <select id="layout-style" class="form-control">
                    <option value="default" ${layout === 'default' ? 'selected' : ''}>${isGerman ? 'پیش‌فرض' : 'Default'}</option>
                    <option value="compact" ${layout === 'compact' ? 'selected' : ''}>${isGerman ? 'فشرده' : 'Compact'}</option>
                    <option value="spacious" ${layout === 'spacious' ? 'selected' : ''}>${isGerman ? 'باز' : 'Spacious'}</option>
                </select>
            </div>
            
            <!-- ========== مدیریت موسیقی ========== -->
            <div class="settings-group">
                <h3><i class="fas fa-music"></i> ${isGerman ? 'مدیریت موسیقی' : 'Music Management'}</h3>
                
                <div class="upload-area" id="music-upload-area">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <h4>${isGerman ? 'آپلود موسیقی و کاور' : 'Upload Music & Cover'}</h4>
                    <p>${isGerman ? 'فایل‌های صوتی را اینجا رها کنید یا کلیک کنید' : 'Drop audio files here or click'}</p>
                    <small>${isGerman ? 'پشتیبانی از MP3, WAV, OGG' : 'Supports MP3, WAV, OGG'}</small>
                    <input type="file" id="music-upload" accept="audio/*,image/*" multiple style="display: none;">
                </div>
                
                <div id="uploaded-music-list" class="music-list mt-4"></div>
                
                <div class="form-group mt-4">
                    <label for="background-music">${isGerman ? 'موسیقی زمینه:' : 'Background Music:'}</label>
                    <select id="background-music" class="form-control">
                        <option value="none">${isGerman ? 'بدون موسیقی' : 'No Music'}</option>
                        <option value="uploaded">🎵 ${isGerman ? 'موسیقی آپلود شده' : 'Uploaded Music'}</option>
                        <option value="calm">🌊 ${isGerman ? 'آرامش بخش' : 'Calm'}</option>
                        <option value="focus">🎯 ${isGerman ? 'تمرکز' : 'Focus'}</option>
                        <option value="classical">🎻 ${isGerman ? 'کلاسیک' : 'Classical'}</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="music-volume">${isGerman ? 'بلندی صدا:' : 'Volume:'} <span id="volume-value">۵۰٪</span></label>
                    <input type="range" id="music-volume" min="0" max="100" value="50" class="form-control">
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-primary" id="play-music-btn">
                        <i class="fas fa-play"></i> ${isGerman ? 'پخش' : 'Play'}
                    </button>
                    <button class="btn btn-outline" id="stop-music-btn">
                        <i class="fas fa-stop"></i> ${isGerman ? 'توقف' : 'Stop'}
                    </button>
                </div>
            </div>
            
            <!-- ========== مدیریت داده‌ها ========== -->
            <div class="settings-group">
                <h3><i class="fas fa-database"></i> ${isGerman ? 'مدیریت داده‌ها' : 'Data Management'}</h3>
                
                <div class="action-buttons">
                    <button class="btn btn-outline" id="export-data-btn">
                        <i class="fas fa-download"></i> ${isGerman ? 'صدور داده‌ها' : 'Export Data'}
                    </button>
                    <button class="btn btn-outline" id="import-data-btn">
                        <i class="fas fa-upload"></i> ${isGerman ? 'ورود داده‌ها' : 'Import Data'}
                    </button>
                    <button class="btn btn-outline" id="export-german-words-btn">
                        <i class="fas fa-file-alt"></i> ${isGerman ? 'ذخیره لغات' : 'Save Words'}
                    </button>
                    <button class="btn btn-danger" id="reset-data-btn">
                        <i class="fas fa-trash"></i> ${isGerman ? 'بازنشانی برنامه' : 'Reset App'}
                    </button>
                </div>
            </div>
            
            <!-- ========== درباره برنامه ========== -->
            <div class="settings-group">
                <h3><i class="fas fa-info-circle"></i> ${LanguageSystem.t('settings.about')}</h3>
                
                <div class="about-card">
                    <div class="about-logo">
                        <i class="fas fa-graduation-cap"></i>
                        <h4>Elias.Dictionary</h4>
                    </div>
                    <p>${isGerman ? 'نسخه ۳.۰.۰ | دیکشنری هوشمند آلمانی-فارسی' : 'Version 3.0.0 | Smart German-Persian Dictionary'}</p>
                    <p>${isGerman ? 'طراحی و توسعه توسط Elias Hussaini' : 'Designed and developed by Elias Hussaini'}</p>
                    <div class="social-links">
                        <a href="#" class="social-link"><i class="fab fa-github"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-telegram"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // استایل دکمه‌های زبان
    const style = document.createElement('style');
    style.textContent = `
        .language-buttons {
            display: flex;
            gap: 15px;
            margin-top: 15px;
        }
        
        .lang-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 12px 20px;
            background: white;
            border: 2px solid var(--gray-200);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Vazirmatn', sans-serif;
        }
        
        .lang-btn:hover {
            transform: translateY(-2px);
            border-color: var(--primary);
            box-shadow: 0 5px 15px rgba(67, 97, 238, 0.1);
        }
        
        .lang-btn.active {
            border-color: var(--primary);
            background: var(--primary-light);
        }
        
        .lang-flag {
            font-size: 24px;
        }
        
        .lang-text {
            font-size: 16px;
            font-weight: 600;
            color: var(--gray-800);
        }
        
        .dark-mode .lang-btn {
            background: var(--bg-card);
            border-color: var(--border-primary);
        }
        
        .dark-mode .lang-text {
            color: var(--text-primary);
        }
        
        @media (max-width: 768px) {
            .language-buttons {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(style);
    
    // ========== راه‌اندازی event listenerها ==========
    this.setupSettingsEventListeners();
    this.setupColorPickerEventListeners();
    this.setupMusicUploadEventListeners();
    this.renderUploadedMusicList();
}

// ================================================
// event listenerهای تنظیمات
// ================================================

setupSettingsEventListeners() {
    // ========== حالت تاریک ==========
    document.getElementById('dark-mode-toggle')?.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        localStorage.setItem('darkMode', isChecked);
        document.body.classList.toggle('dark-mode', isChecked);
        this.showToast(isChecked ? '🌙 حالت تاریک فعال شد' : '☀️ حالت روشن فعال شد', 'success');
    });
    
    // ========== اندازه فونت ==========
    document.getElementById('font-size-select')?.addEventListener('change', (e) => {
        const size = e.target.value;
        localStorage.setItem('fontSize', size);
        
        const fontSizeMap = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        
        document.body.style.fontSize = fontSizeMap[size];
        this.showToast('✅ اندازه فونت تغییر کرد', 'success');
    });
    
    // ========== پوسته‌های رنگی ==========
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const theme = e.currentTarget.dataset.theme;
            this.applyTheme(theme);
        });
    });
    
    // ========== سبک آیکون ==========
    document.querySelectorAll('.icon-style-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const style = e.currentTarget.dataset.style;
            this.applyIconStyle(style);
        });
    });
    
    // ========== چیدمان ==========
    document.getElementById('layout-style')?.addEventListener('change', (e) => {
        this.applyLayout(e.target.value);
    });
    
    // ========== مدیریت داده‌ها ==========
    document.getElementById('export-data-btn')?.addEventListener('click', () => {
        this.exportData();
    });
    
    document.getElementById('import-data-btn')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => this.importData(e.target.files[0]);
        input.click();
    });
    
    document.getElementById('export-german-words-btn')?.addEventListener('click', () => {
        this.exportGermanWordsToTxt();
    });
    
    document.getElementById('reset-data-btn')?.addEventListener('click', () => {
        if (confirm('⚠️ آیا مطمئن هستید؟ تمام داده‌های برنامه حذف خواهند شد و قابل بازگشت نیست!')) {
            this.resetData();
        }
    });
}

// ================================================
// اعمال پوسته رنگی
// ================================================

applyTheme(theme) {
    // حذف همه کلاس‌های تم قبلی
    document.body.classList.remove(
        'blue-theme', 'green-theme', 'purple-theme', 
        'orange-theme', 'pink-theme', 'custom-theme'
    );
    
    // حذف استایل‌های inline قبلی
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--primary-dark');
    document.documentElement.style.removeProperty('--primary-light');
    
    // اعمال تم جدید
    switch(theme) {
        case 'blue':
            document.body.classList.add('blue-theme');
            document.documentElement.style.setProperty('--primary', '#3b82f6');
            document.documentElement.style.setProperty('--primary-dark', '#2563eb');
            document.documentElement.style.setProperty('--primary-light', '#dbeafe');
            break;
            
        case 'green':
            document.body.classList.add('green-theme');
            document.documentElement.style.setProperty('--primary', '#10b981');
            document.documentElement.style.setProperty('--primary-dark', '#059669');
            document.documentElement.style.setProperty('--primary-light', '#d1fae5');
            break;
            
        case 'purple':
            document.body.classList.add('purple-theme');
            document.documentElement.style.setProperty('--primary', '#8b5cf6');
            document.documentElement.style.setProperty('--primary-dark', '#6d28d9');
            document.documentElement.style.setProperty('--primary-light', '#ede9fe');
            break;
            
        case 'orange':
            document.body.classList.add('orange-theme');
            document.documentElement.style.setProperty('--primary', '#f59e0b');
            document.documentElement.style.setProperty('--primary-dark', '#d97706');
            document.documentElement.style.setProperty('--primary-light', '#fef3c7');
            break;
            
        case 'pink':
            document.body.classList.add('pink-theme');
            document.documentElement.style.setProperty('--primary', '#ec4899');
            document.documentElement.style.setProperty('--primary-dark', '#db2777');
            document.documentElement.style.setProperty('--primary-light', '#fce7f3');
            break;
            
        default: // default
            document.documentElement.style.setProperty('--primary', '#4361ee');
            document.documentElement.style.setProperty('--primary-dark', '#3a56d4');
            document.documentElement.style.setProperty('--primary-light', '#eef2ff');
    }
    
    // ذخیره در localStorage
    localStorage.setItem('theme', theme);
    
    // آپدیت کلاس active روی دکمه‌ها
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.theme === theme);
    });
    
    this.showToast(`🎨 پوسته ${this.getThemeName(theme)} اعمال شد`, 'success');
}

// ================================================
// دریافت نام فارسی پوسته
// ================================================

getThemeName(theme) {
    const names = {
        'default': 'پیش‌فرض',
        'blue': 'آبی',
        'green': 'سبز',
        'purple': 'بنفش',
        'orange': 'نارنجی',
        'pink': 'صورتی'
    };
    return names[theme] || theme;
}

    setupColorPickerEventListeners() {
        const redSlider = document.getElementById('color-red');
        const greenSlider = document.getElementById('color-green');
        const blueSlider = document.getElementById('color-blue');
        const colorPreview = document.getElementById('color-preview');
        
        if (!redSlider || !greenSlider || !blueSlider || !colorPreview) return;
        
        const updateColorPreview = () => {
            const r = redSlider.value;
            const g = greenSlider.value;
            const b = blueSlider.value;
            colorPreview.style.background = `rgb(${r}, ${g}, ${b})`;
            
            document.getElementById('red-value').textContent = r;
            document.getElementById('green-value').textContent = g;
            document.getElementById('blue-value').textContent = b;
        };
        
        redSlider.addEventListener('input', updateColorPreview);
        greenSlider.addEventListener('input', updateColorPreview);
        blueSlider.addEventListener('input', updateColorPreview);
        
        document.getElementById('apply-custom-color').addEventListener('click', () => {
            const r = parseInt(redSlider.value);
            const g = parseInt(greenSlider.value);
            const b = parseInt(blueSlider.value);
            this.applyCustomColor(r, g, b);
        });
        
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const color = e.currentTarget.dataset.color;
                this.applyHexColor(color);
            });
        });
    }

    applyTheme(theme) {
        document.body.classList.remove(
            'blue-theme', 'green-theme', 'purple-theme', 
            'orange-theme', 'pink-theme', 'custom-theme'
        );
        
        if (theme !== 'default' && theme !== 'custom') {
            document.body.classList.add(theme + '-theme');
        }
        
        if (theme === 'custom') {
            document.body.classList.add('custom-theme');
        }
        
        localStorage.setItem('theme', theme);
        
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.theme === theme);
        });
        
        this.showToast(`🎨 پوسته ${theme} اعمال شد`, 'success');
    }

    applyIconStyle(style) {
        localStorage.setItem('iconStyle', style);
        
        document.querySelectorAll('.icon-style-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.style === style);
        });
        
        document.querySelectorAll('.favorite-icon, .pronunciation-icon').forEach(icon => {
            icon.classList.remove('modern-icon', 'minimal-icon');
            if (style !== 'default') {
                icon.classList.add(style + '-icon');
            }
        });
        
        this.showToast('✨ سبک آیکون تغییر کرد', 'success');
    }

    applyLayout(layout) {
        document.body.classList.remove('compact-layout', 'spacious-layout');
        
        if (layout !== 'default') {
            document.body.classList.add(layout + '-layout');
        }
        
        localStorage.setItem('layout', layout);
        this.showToast('📐 چیدمان تغییر کرد', 'success');
    }

    applyCustomColor(r, g, b) {
        const color = `rgb(${r}, ${g}, ${b})`;
        const hex = this.rgbToHex(r, g, b);
        
        document.documentElement.style.setProperty('--primary', color);
        document.documentElement.style.setProperty('--primary-dark', this.darkenColor(r, g, b, 20));
        
        this.customColor = { r, g, b };
        localStorage.setItem('customColor', JSON.stringify({ r, g, b }));
        localStorage.setItem('theme', 'custom');
        
        this.applyTheme('custom');
        this.showToast('🎨 رنگ سفارشی اعمال شد', 'success');
    }

    applyHexColor(hex) {
        const rgb = this.hexToRgb(hex);
        if (rgb) {
            document.getElementById('color-red').value = rgb.r;
            document.getElementById('color-green').value = rgb.g;
            document.getElementById('color-blue').value = rgb.b;
            this.updateColorPreview();
            this.applyCustomColor(rgb.r, rgb.g, rgb.b);
        }
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    darkenColor(r, g, b, percent) {
        const factor = 1 - (percent / 100);
        return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
    }

    updateColorPreview() {
        const preview = document.getElementById('color-preview');
        if (preview) {
            const r = document.getElementById('color-red').value;
            const g = document.getElementById('color-green').value;
            const b = document.getElementById('color-blue').value;
            preview.style.background = `rgb(${r}, ${g}, ${b})`;
        }
    }

    loadCustomization() {
        // بارگذاری حالت تاریک
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        
        // بارگذاری اندازه فونت
        const fontSize = localStorage.getItem('fontSize') || 'medium';
        const fontSizeMap = { small: '14px', medium: '16px', large: '18px' };
        document.body.style.fontSize = fontSizeMap[fontSize];
        
        // بارگذاری پوسته
        const theme = localStorage.getItem('theme');
        if (theme && theme !== 'default') {
            this.applyTheme(theme);
        }
        
        // بارگذاری رنگ سفارشی
        const savedColor = localStorage.getItem('customColor');
        if (savedColor) {
            try {
                this.customColor = JSON.parse(savedColor);
                const { r, g, b } = this.customColor;
                document.documentElement.style.setProperty('--primary', `rgb(${r}, ${g}, ${b})`);
                document.documentElement.style.setProperty('--primary-dark', this.darkenColor(r, g, b, 20));
            } catch (e) {
                console.error('خطا در بارگذاری رنگ سفارشی:', e);
            }
        }
        
        // بارگذاری سبک آیکون
        const iconStyle = localStorage.getItem('iconStyle');
        if (iconStyle) {
            setTimeout(() => this.applyIconStyle(iconStyle), 100);
        }
        
        // بارگذاری چیدمان
        const layout = localStorage.getItem('layout');
        if (layout) {
            this.applyLayout(layout);
        }
    }

    // ================================================
    // مدیریت موسیقی
    // ================================================

    async getAllMusic() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve([]);
                return;
            }

            const transaction = this.db.transaction(['music'], 'readonly');
            const store = transaction.objectStore('music');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (event) => {
                console.error('خطا در دریافت موسیقی:', event.target.error);
                resolve([]);
            };
        });
    }

    async getMusicById(musicId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['music'], 'readonly');
            const store = transaction.objectStore('music');
            const request = store.get(musicId);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async saveMusicToStorage(musicData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('دیتابیس در دسترس نیست'));
                return;
            }

            const transaction = this.db.transaction(['music'], 'readwrite');
            const store = transaction.objectStore('music');
            
            musicData.id = Date.now();
            musicData.uploadDate = new Date().toISOString();
            
            const request = store.add(musicData);
            
            request.onsuccess = () => {
                this.showToast(`🎵 "${musicData.name}" آپلود شد`, 'success');
                this.renderUploadedMusicList();
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                this.showToast('❌ خطا در ذخیره موسیقی', 'error');
                reject(event.target.error);
            };
        });
    }

    async deleteMusicById(musicId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['music'], 'readwrite');
            const store = transaction.objectStore('music');
            const request = store.delete(musicId);
            
            request.onsuccess = () => {
                this.showToast('🗑️ موسیقی حذف شد', 'info');
                this.renderUploadedMusicList();
                resolve();
            };
            
            request.onerror = (event) => {
                this.showToast('❌ خطا در حذف موسیقی', 'error');
                reject(event.target.error);
            };
        });
    }

    setupMusicUploadEventListeners() {
        const uploadArea = document.getElementById('music-upload-area');
        const musicUpload = document.getElementById('music-upload');
        
        if (uploadArea && musicUpload) {
            uploadArea.addEventListener('click', () => {
                musicUpload.click();
            });
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    this.handleMusicUpload(e.dataTransfer.files);
                }
            });
            
            musicUpload.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    this.handleMusicUpload(e.target.files);
                }
            });
        }
        
        document.getElementById('play-music-btn').addEventListener('click', () => {
            this.playBackgroundMusic();
        });
        
        document.getElementById('stop-music-btn').addEventListener('click', () => {
            this.stopBackgroundMusic();
        });
        
        document.getElementById('music-volume').addEventListener('input', (e) => {
            this.setMusicVolume(e.target.value);
            document.getElementById('volume-value').textContent = e.target.value + '%';
        });
        
        document.getElementById('background-music').addEventListener('change', (e) => {
            this.changeBackgroundMusic(e.target.value);
        });
    }

    handleMusicUpload(files) {
        if (!files || files.length === 0) return;

        const audioFile = Array.from(files).find(file => file.type.startsWith('audio/'));
        const imageFile = Array.from(files).find(file => file.type.startsWith('image/'));

        if (!audioFile) {
            this.showToast('❌ لطفاً یک فایل صوتی انتخاب کنید', 'error');
            return;
        }

        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const musicData = {
                name: audioFile.name.replace(/\.[^/.]+$/, ""),
                audioData: e.target.result,
                audioType: audioFile.type,
                audioSize: audioFile.size
            };

            if (imageFile) {
                try {
                    const imageData = await this.readFileAsDataURL(imageFile);
                    musicData.imageData = imageData;
                    musicData.imageType = imageFile.type;
                } catch (error) {
                    console.error('خطا در خواندن عکس:', error);
                }
            }

            await this.saveMusicToStorage(musicData);
        };
        
        reader.onerror = () => {
            this.showToast('❌ خطا در خواندن فایل', 'error');
        };
        
        reader.readAsDataURL(audioFile);
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    async renderUploadedMusicList() {
        const container = document.getElementById('uploaded-music-list');
        if (!container) return;
        
        try {
            const musicList = await this.getAllMusic();
            
            if (musicList.length === 0) {
                container.innerHTML = `
                    <div class="empty-music-list">
                        <i class="fas fa-music"></i>
                        <p>هنوز موسیقی آپلود نکرده‌اید</p>
                    </div>
                `;
                return;
            }
            
            musicList.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            
            container.innerHTML = musicList.map(music => `
                <div class="music-item" data-id="${music.id}">
                    <div class="music-cover">
                        ${music.imageData ? 
                            `<img src="${music.imageData}" alt="${music.name}" class="music-cover-image">` :
                            `<i class="fas fa-music"></i>`
                        }
                    </div>
                    <div class="music-info">
                        <div class="music-name">${music.name}</div>
                        <div class="music-details">
                            ${this.formatFileSize(music.audioSize)} • 
                            ${new Date(music.uploadDate).toLocaleDateString('fa-IR')}
                        </div>
                    </div>
                    <div class="music-actions">
                        <button class="music-btn play" onclick="dictionaryApp.playUploadedMusic(${music.id})">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="music-btn delete" onclick="dictionaryApp.deleteMusicById(${music.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('خطا در نمایش لیست موسیقی:', error);
        }
    }

    async playUploadedMusic(musicId) {
        try {
            const music = await this.getMusicById(musicId);
            
            if (!music) {
                this.showToast('❌ موسیقی پیدا نشد', 'error');
                return;
            }

            if (this.audioPlayer) {
                this.audioPlayer.pause();
                this.audioPlayer.currentTime = 0;
            }

            this.audioPlayer = new Audio();
            this.audioPlayer.src = music.audioData;
            this.audioPlayer.loop = true;
            
            const volumeSlider = document.getElementById('music-volume');
            if (volumeSlider) {
                this.audioPlayer.volume = volumeSlider.value / 100;
            }
            
            await this.audioPlayer.play();
            this.showToast(`🎵 در حال پخش: ${music.name}`, 'success');
            
            document.getElementById('play-music-btn').innerHTML = '<i class="fas fa-pause"></i> مکث';
            
        } catch (error) {
            console.error('خطا در پخش:', error);
            this.showToast('❌ خطا در پخش موسیقی', 'error');
        }
    }

    playBackgroundMusic() {
        const selectedMusic = document.getElementById('background-music').value;
        
        if (selectedMusic === 'none') {
            this.stopBackgroundMusic();
            return;
        }

        if (!this.audioPlayer) {
            this.audioPlayer = new Audio();
            this.audioPlayer.loop = true;
        }

        if (selectedMusic === 'uploaded') {
            this.getAllMusic().then(list => {
                if (list.length > 0) {
                    this.playUploadedMusic(list[0].id);
                } else {
                    this.showToast('❌ هیچ موسیقی آپلود نشده', 'warning');
                }
            });
            return;
        }

        const musicUrls = {
            calm: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            focus: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            classical: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
        };

        if (selectedMusic in musicUrls) {
            this.audioPlayer.src = musicUrls[selectedMusic];
            this.audioPlayer.play().then(() => {
                this.showToast('🎵 موسیقی در حال پخش است', 'success');
                document.getElementById('play-music-btn').innerHTML = '<i class="fas fa-pause"></i> مکث';
            }).catch(error => {
                this.showToast('❌ خطا در پخش موسیقی', 'error');
            });
        }
    }

    stopBackgroundMusic() {
        if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer.currentTime = 0;
            document.getElementById('play-music-btn').innerHTML = '<i class="fas fa-play"></i> پخش';
            this.showToast('⏹️ موسیقی متوقف شد', 'info');
        }
    }

    setMusicVolume(volume) {
        if (this.audioPlayer) {
            this.audioPlayer.volume = volume / 100;
        }
    }

    changeBackgroundMusic(type) {
        if (this.audioPlayer && !this.audioPlayer.paused) {
            this.stopBackgroundMusic();
            setTimeout(() => this.playBackgroundMusic(), 100);
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ================================================
    // مدیریت داده‌ها (Import/Export)
    // ================================================

    async exportData() {
        try {
            const [words, favorites, examples, practiceHistory] = await Promise.all([
                this.getAllWords(),
                new Promise(resolve => {
                    const transaction = this.db.transaction(['favorites'], 'readonly');
                    const store = transaction.objectStore('favorites');
                    const request = store.getAll();
                    request.onsuccess = () => resolve(request.result || []);
                }),
                new Promise(resolve => {
                    const transaction = this.db.transaction(['examples'], 'readonly');
                    const store = transaction.objectStore('examples');
                    const request = store.getAll();
                    request.onsuccess = () => resolve(request.result || []);
                }),
                this.getAllPracticeHistory()
            ]);
            
            const data = {
                words,
                favorites,
                examples,
                practiceHistory,
                exportedAt: new Date().toISOString(),
                version: 3
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `elias-dictionary-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('✅ داده‌ها با موفقیت صادر شد', 'success');
            
        } catch (error) {
            console.error('Export error:', error);
            this.showToast('❌ خطا در صدور داده‌ها', 'error');
        }
    }

    async importData(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.words || !Array.isArray(data.words)) {
                throw new Error('فرمت فایل نامعتبر است');
            }

            if (!confirm(`⚠️ آیا از وارد کردن ${data.words.length} لغت اطمینان دارید؟`)) {
                return;
            }

            await this.clearAllData();

            const transaction = this.db.transaction(
                ['words', 'favorites', 'examples', 'practiceHistory'],
                'readwrite'
            );

            // وارد کردن لغات
            const wordsStore = transaction.objectStore('words');
            for (const word of data.words) {
                wordsStore.add(word);
            }

            // وارد کردن علاقه‌مندی‌ها
            if (data.favorites && Array.isArray(data.favorites)) {
                const favStore = transaction.objectStore('favorites');
                for (const fav of data.favorites) {
                    favStore.add(fav);
                }
            }

            // وارد کردن مثال‌ها
            if (data.examples && Array.isArray(data.examples)) {
                const exStore = transaction.objectStore('examples');
                for (const ex of data.examples) {
                    exStore.add(ex);
                }
            }

            // وارد کردن تاریخچه تمرین
            if (data.practiceHistory && Array.isArray(data.practiceHistory)) {
                const phStore = transaction.objectStore('practiceHistory');
                for (const record of data.practiceHistory) {
                    phStore.add(record);
                }
            }

            await new Promise((resolve, reject) => {
                transaction.oncomplete = () => resolve();
                transaction.onerror = (event) => reject(event.target.error);
            });

            await this.loadFavorites();
            
            this.showToast(`✅ ${data.words.length} لغت با موفقیت وارد شد`, 'success');
            this.renderWordList();
            this.updateStats();

        } catch (error) {
            console.error('Import error:', error);
            this.showToast('❌ خطا در وارد کردن داده‌ها: ' + error.message, 'error');
        }
    }

    async exportGermanWordsToTxt() {
        try {
            const words = await this.getAllWords();
            
            if (words.length === 0) {
                this.showToast('❌ هیچ لغتی برای ذخیره وجود ندارد', 'warning');
                return;
            }
            
            let txtContent = '';
            const sortedWords = words.sort((a, b) => a.german.localeCompare(b.german, 'de'));
            
            sortedWords.forEach(word => {
                txtContent += word.german + '\n';
            });
            
            const blob = new Blob([txtContent], { type: 'text/plain; charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `german-words-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast(`✅ ${words.length} لغت آلمانی ذخیره شد`, 'success');
            
        } catch (error) {
            console.error('Error exporting German words:', error);
            this.showToast('❌ خطا در ذخیره‌سازی لغات', 'error');
        }
    }

    async clearAllData() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(
                ['words', 'favorites', 'examples', 'practiceHistory'],
                'readwrite'
            );

            transaction.objectStore('words').clear();
            transaction.objectStore('favorites').clear();
            transaction.objectStore('examples').clear();
            transaction.objectStore('practiceHistory').clear();

            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject(event.target.error);
        });
    }

    async resetData() {
        try {
            await this.clearAllData();
            localStorage.clear();
            this.favorites.clear();
            this.showToast('🔄 برنامه بازنشانی شد. صفحه مجدداً بارگذاری می‌شود...', 'info');
            setTimeout(() => location.reload(), 2000);
        } catch (error) {
            console.error('Reset error:', error);
            this.showToast('❌ خطا در بازنشانی برنامه', 'error');
        }
    }
// ================================================
// AI CHAT - تشخیص موبایل و اعمال کلاس‌های جدید
// ================================================

renderAIChat() {
    const container = document.getElementById('ai-chat-section');
    if (!container) return;
    
    this.chatMemory = [];
    this.isGeneratingImage = false;
    this.loadChatMemory();
    
    // تشخیص موبایل
    const isMobile = window.innerWidth <= 768;
    const isGerman = LanguageSystem.isGerman();
    
    // HTML پایه
    let html = `
        <div class="ai-chat-container ${isMobile ? 'mobile-view' : 'desktop-view'}">
            <!-- هدر -->
            <div class="ai-chat-header">
                <div class="header-left">
                    <div class="ai-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="header-info">
                        <h3>${LanguageSystem.t('ai.title')}</h3>
                        <p class="ai-subtitle">${LanguageSystem.t('ai.subtitle')}</p>
                    </div>
                </div>
                
                <div class="header-actions">
                    <button class="header-btn" id="ai-theme-toggle" title="تغییر تم">
                        <i class="fas fa-moon"></i>
                    </button>
                    <button class="header-btn" id="chat-history-btn" title="تاریخچه چت‌ها">
                        <i class="fas fa-history"></i>
                    </button>
                    <button class="header-btn" id="new-chat-btn" title="چت جدید">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="header-btn delete-btn" id="clear-chat-history" title="پاک کردن چت">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>

            <!-- بخش اصلی چت -->
            <div class="ai-chat-main">
                <!-- تاریخچه پیام‌ها -->
                <div class="chat-messages-container" id="chat-history">
                    ${this.renderWelcomeMessage()}
                </div>

                <!-- انتخاب مدل (فقط دسکتاپ) -->
                <div class="model-selection-row desktop-only">
                    <div class="model-label">
                        <i class="fas fa-brain"></i>
                        <span>${isGerman ? 'مدل هوش مصنوعی:' : 'AI Model:'}</span>
                    </div>
                    <div class="model-select-wrapper">
                        <select id="ai-model-select" class="model-select">
                            <option value="elias-mini" selected>⚡ ${isGerman ? 'الیاس مینی' : 'Elias Mini'}</option>
                            <option value="elias-pro">🚀 ${isGerman ? 'الیاس پرو' : 'Elias Pro'}</option>
                            <option value="elias-vision">👁️ ${isGerman ? 'الیاس بینا' : 'Elias Vision'}</option>
                            <option value="elias-creative">🎨 ${isGerman ? 'الیاس خلاق' : 'Elias Creative'}</option>
                        </select>
                    </div>
                    <div class="model-status">
                        <span class="status-indicator online"></span>
                        <span class="status-text">${isGerman ? 'آنلاین' : 'Online'}</span>
                    </div>
                </div>

                <!-- بخش ورودی دسکتاپ -->
                <div class="chat-input-section desktop-input">
                    <div class="main-input-area">
                        <div class="input-wrapper">
                            <div class="input-actions-left">
                                <button class="input-action-btn" id="attach-file-btn" title="${isGerman ? 'آپلود فایل' : 'Upload File'}">
                                    <i class="fas fa-paperclip"></i>
                                </button>
                                <button class="input-action-btn" id="upload-image-btn" title="${isGerman ? 'تحلیل تصویر' : 'Image Analysis'}">
                                    <i class="fas fa-image"></i>
                                </button>
                                <button class="input-action-btn" id="generate-image-btn" title="${isGerman ? 'تولید تصویر' : 'Generate Image'}">
                                    <i class="fas fa-palette"></i>
                                </button>
                            </div>
                            
                            <textarea 
                                id="ai-chat-input" 
                                class="chat-input-textarea" 
                                placeholder="${LanguageSystem.t('ai.placeholder')}"
                                rows="1"
                            ></textarea>
                            
                            <div class="input-actions-right">
                                <button class="input-action-btn voice-input-btn" id="voice-input-toggle" title="${isGerman ? 'ورودی صوتی' : 'Voice Input'}">
                                    <i class="fas fa-microphone"></i>
                                </button>
                                <button class="send-message-btn" id="send-ai-message">
                                    <i class="fas fa-paper-plane"></i>
                                    <span>${LanguageSystem.t('ai.send')}</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- وضعیت ورودی صوتی -->
                        <div class="voice-input-status" id="voice-input-status" style="display: none;"></div>
                    </div>
                </div>

                <!-- بخش ورودی موبایل -->
                <div class="mobile-input-section mobile-only">
                    <div class="mobile-input-wrapper">
                        <!-- دکمه جمع سمت چپ -->
                        <button class="mobile-menu-btn" id="mobile-menu-btn">
                            <i class="fas fa-plus"></i>
                        </button>
                        
                        <textarea 
                            id="mobile-chat-input" 
                            class="mobile-chat-textarea" 
                            placeholder="${LanguageSystem.t('ai.placeholder')}"
                            rows="1"
                        ></textarea>
                        
                        <div class="mobile-actions">
                            <button class="mobile-voice-btn" id="mobile-voice-toggle" title="${isGerman ? 'ورودی صوتی' : 'Voice Input'}">
                                <i class="fas fa-microphone"></i>
                            </button>
                            <button class="mobile-send-btn" id="mobile-send-message">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // فایل‌های مخفی
    const fileInputs = `
        <input type="file" id="file-upload-input" style="display: none;" multiple>
        <input type="file" id="image-upload-input" style="display: none;" accept="image/*">
    `;

    container.innerHTML = html + fileInputs;

    // راه‌اندازی event listenerها
    this.setupAIChatEventListeners();
    this.loadChatHistoryFromStorage();
    
    if (isMobile) {
        this.setupMobileView();
    }
    setTimeout(() => {
    this.forceHideFloatingButton();
}, 500);
}
// ================================================
// تنظیمات مخصوص موبایل
// ================================================

setupMobileView() {
    // انتقال متن از اینپوت دسکتاپ به موبایل
    const desktopInput = document.getElementById('ai-chat-input');
    const mobileInput = document.getElementById('mobile-chat-input');
    
    if (desktopInput && mobileInput) {
        desktopInput.addEventListener('input', function() {
            mobileInput.value = this.value;
            mobileInput.style.height = 'auto';
            mobileInput.style.height = (mobileInput.scrollHeight) + 'px';
        });
        
        mobileInput.addEventListener('input', function() {
            desktopInput.value = this.value;
            desktopInput.style.height = 'auto';
            desktopInput.style.height = (desktopInput.scrollHeight) + 'px';
        });
    }
    
    // دکمه ارسال موبایل
    document.getElementById('mobile-send-message')?.addEventListener('click', () => {
        this.sendAIMessage();
    });
    
    // دکمه میکروفن موبایل
    document.getElementById('mobile-voice-toggle')?.addEventListener('click', () => {
        this.toggleVoiceInput();
    });
    
    // دکمه جمع (منو)
    this.setupMobileMenu();
}
// ================================================
// نسخه نهایی و تضمینی - با !important و روش‌های مختلف
// ================================================

forceHideFloatingButton() {
    if (window.innerWidth > 768) return;
    
    const input = document.getElementById('ai-chat-input');
    const btn = document.getElementById('floating-book-btn');
    
    if (!btn) {
        console.log('❌ دکمه کتاب هنوز پیدا نشد');
        return;
    }
    
    if (!input) {
        console.log('❌ اینپوت پیدا نشد');
        return;
    }
    
  
    
    // تابع قوی برای مخفی کردن
    function hideButton() {
        btn.style.setProperty('display', 'none', 'important');
        btn.style.setProperty('opacity', '0', 'important');
        btn.style.setProperty('visibility', 'hidden', 'important');
        btn.style.setProperty('pointer-events', 'none', 'important');
    }
    
    // تابع قوی برای نمایش
    function showButton() {
        btn.style.setProperty('display', 'flex', 'important');
        btn.style.setProperty('opacity', '1', 'important');
        btn.style.setProperty('visibility', 'visible', 'important');
        btn.style.setProperty('pointer-events', 'auto', 'important');
    }
    
    // تابع بررسی
    function checkAndUpdate() {
        if (input.value.trim().length > 0) {
            hideButton();
            
        } else {
            showButton();
          
        }
    }
    
    // رویدادهای مختلف
    input.addEventListener('input', checkAndUpdate);
    input.addEventListener('keyup', checkAndUpdate);
    input.addEventListener('keydown', checkAndUpdate);
    input.addEventListener('change', checkAndUpdate);
    input.addEventListener('paste', () => setTimeout(checkAndUpdate, 10));
    input.addEventListener('cut', () => setTimeout(checkAndUpdate, 10));
    
    // چک کردن مداوم (هر 200 میلی‌ثانیه)
    const interval = setInterval(checkAndUpdate, 200);
    
    // اجرای اولیه
    checkAndUpdate();
    
    // اگه کاربر از صفحه خارج شد، interval رو پاک کن
    window.addEventListener('beforeunload', () => clearInterval(interval));
    
    console.log('✅ سیستم کنترل قوی فعال شد');
}



// ================================================
// منوی موبایل
// ================================================

setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (!menuBtn) return;
    
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menuBtn.classList.toggle('active');
        
        if (menuBtn.classList.contains('active')) {
            menuBtn.style.transform = 'rotate(45deg)';
            this.showMobileMenu();
        } else {
            menuBtn.style.transform = '';
            this.hideMobileMenu();
        }
    });
}

showMobileMenu() {
    this.hideMobileMenu();
    
    const menu = document.createElement('div');
    menu.id = 'mobile-menu-panel';
    menu.className = 'mobile-menu-panel';
    
    const items = [
        { icon: 'fa-paperclip', text: 'افزودن فایل', action: 'file' },
        { icon: 'fa-image', text: 'تحلیل تصویر', action: 'image' },
        { icon: 'fa-palette', text: 'تولید تصویر', action: 'generate' },
        { type: 'divider' },
        { icon: 'fa-brain', text: 'انتخاب مدل', action: 'model' },
        { icon: 'fa-trash', text: 'پاک کردن چت', action: 'clear' }
    ];
    
    menu.innerHTML = items.map(item => {
        if (item.type === 'divider') {
            return '<div class="menu-divider"></div>';
        }
        return `
            <button class="menu-item" data-action="${item.action}">
                <i class="fas ${item.icon}"></i>
                <span>${item.text}</span>
            </button>
        `;
    }).join('');
    
    document.body.appendChild(menu);
    
    // event listener برای آیتم‌ها
    menu.querySelectorAll('.menu-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            
            switch(action) {
                case 'file':
                    document.getElementById('file-upload-input')?.click();
                    break;
                case 'image':
                    document.getElementById('image-upload-input')?.click();
                    break;
                case 'generate':
                    const input = document.getElementById('mobile-chat-input') || document.getElementById('ai-chat-input');
                    if (input.value.trim()) {
                        this.generateImageWithAI(input.value.trim());
                    }
                    break;
                case 'model':
                    const modelSelect = document.getElementById('ai-model-select');
                    if (modelSelect) {
                        modelSelect.style.display = 'block';
                        modelSelect.focus();
                    }
                    break;
                case 'clear':
                    if (confirm('آیا چت پاک شود؟')) {
                        this.clearChatHistory();
                    }
                    break;
            }
            
            this.hideMobileMenu();
        });
    });
    
    // بستن با کلیک بیرون
    setTimeout(() => {
        const clickHandler = (e) => {
            const menu = document.getElementById('mobile-menu-panel');
            const btn = document.getElementById('mobile-menu-btn');
            if (menu && !menu.contains(e.target) && e.target !== btn) {
                this.hideMobileMenu();
                document.removeEventListener('click', clickHandler);
            }
        };
        document.addEventListener('click', clickHandler);
    }, 100);
}

hideMobileMenu() {
    const menu = document.getElementById('mobile-menu-panel');
    if (menu) menu.remove();
    
    const btn = document.getElementById('mobile-menu-btn');
    if (btn) {
        btn.classList.remove('active');
        btn.style.transform = '';
    }
}

renderWelcomeMessage() {
    const isGerman = LanguageSystem.isGerman();
    
    return `
        <div class="message ai-message welcome-message">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-text">
                    <h4>🤖 ${isGerman ? 'سلام! به الیاس خوش آمدید' : 'Hello! Welcome to Elias'}</h4>
                    <p>${isGerman ? 'من دستیار هوش مصنوعی شما هستم با حافظه کامل - هر چی بگی یادم میاد!' : 'I am your AI assistant with full memory - I remember everything you say!'}</p>
                    <p>${isGerman ? 'می‌تونی از این قابلیت‌ها استفاده کنی:' : 'You can use these features:'}</p>
                    <ul style="margin-top: 10px; padding-right: 20px;">
                        <li>📝 <strong>${isGerman ? 'مکالمه عادی' : 'Normal Conversation'}</strong> - ${isGerman ? 'هر چی بگی یادم میاد' : 'I remember everything'}</li>
                        <li>🎤 <strong>${isGerman ? 'ورودی صوتی' : 'Voice Input'}</strong> - ${isGerman ? 'با میکروفون صحبت کن' : 'Speak with microphone'}</li>
                        <li>🖼️ <strong>${isGerman ? 'تحلیل تصویر' : 'Image Analysis'}</strong> - ${isGerman ? 'عکس آپلود کن' : 'Upload images'}</li>
                        <li>🎨 <strong>${isGerman ? 'تولید تصویر' : 'Image Generation'}</strong> - ${isGerman ? 'هر چی میخوای بگو' : 'Describe what you want'}</li>
                    </ul>
                </div>
                <div class="message-time">${new Date().toLocaleTimeString('fa-IR')}</div>
            </div>
        </div>
    `;
}

// ================================================
// سوالات سریع
// ================================================

renderQuickQuestions() {
    const questions = [
        { icon: 'fa-language', text: 'صرف فعل', question: 'چگونه افعال آلمانی را صرف کنم؟' },
        { icon: 'fa-venus-mars', text: 'جنسیت اسم‌ها', question: 'تفاوت der, die, das چیست؟' },
        { icon: 'fa-comment-alt', text: 'جمله‌سازی', question: 'جمله‌سازی آلمانی آموزش بده' },
        { icon: 'fa-volume-up', text: 'تلفظ', question: 'تلفظ صحیح کلمات آلمانی' }
    ];
    
    return questions.map(q => `
        <button class="quick-action-btn" data-question="${q.question}">
            <div class="action-icon">
                <i class="fas ${q.icon}"></i>
            </div>
            <div class="action-text">
                <span>${q.text}</span>
            </div>
        </button>
    `).join('');
}

setupAIChatEventListeners() {
    
    // ========== ارسال پیام ==========
    const sendBtn = document.getElementById('send-ai-message');
    const chatInput = document.getElementById('ai-chat-input');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', () => this.sendAIMessage());
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendAIMessage();
            }
        });
        
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
    
    // ========== دکمه پاک کردن ==========
    document.getElementById('clear-input-btn')?.addEventListener('click', () => {
        if (chatInput) chatInput.value = '';
        chatInput.style.height = 'auto';
        chatInput.focus();
    });
    
    // ========== میکروفن ساده ==========
    document.getElementById('voice-input-toggle')?.addEventListener('click', () => {
        this.toggleVoiceInput();
    });
    
    document.getElementById('stop-voice-input')?.addEventListener('click', () => {
        this.stopVoiceInput();
    });
    
    // ========== دکمه تغییر تم ==========
    document.getElementById('ai-theme-toggle')?.addEventListener('click', () => {
        this.toggleAITheme();
    });
    
    // ========== دکمه تاریخچه چت ==========
    document.getElementById('chat-history-btn')?.addEventListener('click', () => {
        this.showChatHistoryModal();
    });
    
    // ========== دکمه چت جدید ==========
    document.getElementById('new-chat-btn')?.addEventListener('click', () => {
        this.newChat();
    });
    
    // ========== دکمه پاک کردن تاریخچه ==========
    document.getElementById('clear-chat-history')?.addEventListener('click', () => {
        this.clearChatHistory();
    });
    
    // ========== آپلود فایل ==========
    document.getElementById('attach-file-btn')?.addEventListener('click', () => {
        document.getElementById('file-upload-input').click();
    });
    
    document.getElementById('upload-image-btn')?.addEventListener('click', () => {
        document.getElementById('image-upload-input').click();
    });
    
    // ========== تولید تصویر ==========
    document.getElementById('generate-image-btn')?.addEventListener('click', async () => {
        const inputText = document.getElementById('ai-chat-input').value.trim();
        if (!inputText) {
            this.showToast('✏️ لطفاً متن مورد نظر را وارد کنید', 'warning');
            return;
        }
        await this.generateImageWithAI(inputText);
    });
    
    // ========== مدیریت آپلود فایل ==========
    document.getElementById('file-upload-input')?.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            for (let i = 0; i < e.target.files.length; i++) {
                await this.handleFileUpload(e.target.files[i]);
            }
            e.target.value = '';
        }
    });
    
    document.getElementById('image-upload-input')?.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
            await this.analyzeImageWithAI(e.target.files[0]);
            e.target.value = '';
        }
    });
    
    
}

// ================================================
// تنظیمات صدا
// ================================================

setupVoiceSettingsControls() {
    const speedSlider = document.getElementById('voice-speed');
    const pitchSlider = document.getElementById('voice-pitch');
    const languageSelect = document.getElementById('voice-language');
    const autoPlayCheck = document.getElementById('auto-play-response');
    
    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            document.getElementById('speed-value').textContent = e.target.value + 'x';
            this.currentVoiceSettings.speed = parseFloat(e.target.value);
        });
    }
    
    if (pitchSlider) {
        pitchSlider.addEventListener('input', (e) => {
            document.getElementById('pitch-value').textContent = e.target.value;
            this.currentVoiceSettings.pitch = parseFloat(e.target.value);
        });
    }
    
    document.getElementById('save-voice-settings')?.addEventListener('click', () => {
        this.saveVoiceSettings();
    });
    
    document.getElementById('test-voice-settings')?.addEventListener('click', () => {
        this.testVoiceSettings();
    });
    
    document.getElementById('reset-voice-settings')?.addEventListener('click', () => {
        this.resetVoiceSettings();
    });
}

// ================================================
// حافظه چت
// ================================================

addToMemory(role, content) {
    this.chatMemory.push({
        role: role, // 'user' یا 'assistant'
        content: content,
        timestamp: new Date().toISOString()
    });
    
    // محدود کردن به 50 پیام آخر برای جلوگیری از حجم زیاد
    if (this.chatMemory.length > 150) {
        this.chatMemory = this.chatMemory.slice(-150);
    }
    
    // ذخیره در localStorage
    this.saveChatMemory();
}

getMemoryForAI() {
    // تبدیل حافظه به فرمت مناسب برای API
    let memoryText = "تاریخچه مکالمه:\n\n";
    
    this.chatMemory.forEach(msg => {
        const role = msg.role === 'user' ? 'کاربر' : 'دستیار';
        memoryText += `${role}: ${msg.content}\n\n`;
    });
    
    return memoryText;
}

saveChatMemory() {
    try {
        localStorage.setItem('aiChatMemory', JSON.stringify(this.chatMemory));
    } catch (e) {
        console.error('خطا در ذخیره حافظه:', e);
    }
}

loadChatMemory() {
    try {
        const saved = localStorage.getItem('aiChatMemory');
        if (saved) {
            this.chatMemory = JSON.parse(saved);
        } else {
            this.chatMemory = [];
        }
    } catch (e) {
        console.error('خطا در بارگذاری حافظه:', e);
        this.chatMemory = [];
    }
}

clearMemory() {
    this.chatMemory = [];
    localStorage.removeItem('aiChatMemory');
}
// ================================================
// اصلاح تابع sendAIMessage - اضافه کردن پاک کردن ورودی
// ================================================

async sendAIMessage() {
    const input = document.getElementById('ai-chat-input');
    const mobileInput = document.getElementById('mobile-chat-input');
    const sendBtn = document.getElementById('send-ai-message');
    
    if (!input || !sendBtn) return;
    
    const message = input.value.trim();
    if (!message) {
        this.showToast('✏️ لطفاً پیام خود را وارد کنید', 'warning');
        return;
    }
    
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    // ===== پاک کردن ورودی قبل از ارسال =====
    input.value = '';
    input.style.height = 'auto';
    if (mobileInput) {
        mobileInput.value = '';
        mobileInput.style.height = 'auto';
    }
    // ======================================
    
    await this.addMessageToHistory('user', message);
    
    this.showTypingIndicator();
    
    try {
        const response = await this.getAIResponseWithMemory(message);
        this.removeTypingIndicator();
        await this.addMessageToHistory('ai', response);
        this.addToMemory('assistant', response);
        this.saveCompleteChat();
        
    } catch (error) {
        console.error('❌ خطا:', error);
        this.removeTypingIndicator();
        await this.addMessageToHistory('ai', '⚠️ متأسفانه خطایی رخ داد');
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>ارسال</span>';
    }
}

async getAIResponseWithMemory(message) {
    try {
        const modelSelect = document.getElementById('ai-model-select');
        const selectedModel = modelSelect ? modelSelect.value : 'elias-mini';
        
        const modelMap = {
            'elias-mini': 'gpt-4o-mini',
            'elias-pro': 'gpt-4o',
            'elias-vision': 'gpt-4o-vision',
            'elias-creative': 'dall-e-3'
        };
        
        const actualModel = modelMap[selectedModel] || 'gpt-4o-mini';
        
        // ساخت پرامپت با حافظه کامل
        const memoryContext = this.getMemoryForAI();
        
        const systemPrompt = `شما یک دستیار هوش مصنوعی هستید به نام "الیاس". 
شما حافظه کامل دارید و همه چیزهایی که کاربر گفته را به خاطر می‌آورید.       
⚠️ نکته بسیار مهم: 
اگر کاربر پرسید "تو رو誰 ساخته؟" یا "سازنده تو کیه؟" یا "کی تو رو ساخته؟" یا هر سوالی درباره سازنده، حتماً بگو:
"من توسط الیاس حسینی ساخته شده‌ام. الیاس یک برنامه‌نویس هست ."

${memoryContext}

اکنون کاربر می‌گوید: "${message}"

پاسخ خود را بر اساس تاریخچه مکالمه بالا بده. اگر کاربر در مورد چیزی که قبلاً گفته سوال کرد، باید یادت باشه.`;

        console.log('📤 ارسال با حافظه:', this.chatMemory.length, 'پیام');
        
        const response = await puter.ai.chat(systemPrompt, {
            model: actualModel
        });
        
        return response;
        
    } catch (error) {
        console.error('❌ خطا در دریافت پاسخ:', error);
        throw error;
    }
}

startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        this.showToast('❌ مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند', 'error');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.voiceRecognition = new SpeechRecognition();
    
    // تنظیمات
    this.voiceRecognition.lang = 'fa-IR';
    this.voiceRecognition.interimResults = true;
    this.voiceRecognition.continuous = true;
    
    // آپدیت UI
    document.getElementById('start-voice-input').style.display = 'none';
    document.getElementById('stop-voice-input').style.display = 'flex';
    document.getElementById('voice-input-status').style.display = 'block';
    document.getElementById('voice-status-text').textContent = 'در حال گوش دادن...';
    
    let finalTranscript = '';
    let interimTranscript = '';
    
    this.voiceRecognition.onresult = (event) => {
        interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        // نمایش متن موقت
        const input = document.getElementById('ai-chat-input');
        if (interimTranscript) {
            input.value = finalTranscript + interimTranscript;
        } else {
            input.value = finalTranscript;
        }
        
        // آپدیت ارتفاع input
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
        
        // انیمیشن موج صدا
        this.animateVoiceWave();
    };
    
    this.voiceRecognition.onerror = (event) => {
        console.error('خطای تشخیص صدا:', event.error);
        this.stopVoiceInput();
        this.showToast(`❌ خطا: ${event.error}`, 'error');
    };
    
    this.voiceRecognition.onend = () => {
        // اگه خودش تموم شد، متوقفش کن
        if (this.isVoiceActive) {
            this.stopVoiceInput();
        }
    };
    
    this.voiceRecognition.start();
    this.isVoiceActive = true;
    this.startVoiceTimer();
}

stopVoiceInput() {
    if (this.voiceRecognition) {
        this.voiceRecognition.stop();
        this.voiceRecognition = null;
    }
    
    this.isVoiceActive = false;
    
    // آپدیت UI
    document.getElementById('start-voice-input').style.display = 'flex';
    document.getElementById('stop-voice-input').style.display = 'none';
    document.getElementById('voice-input-status').style.display = 'none';
    document.getElementById('voice-status-text').textContent = 'آماده';
    
    if (this.voiceTimerInterval) {
        clearInterval(this.voiceTimerInterval);
        this.voiceTimerInterval = null;
    }
}

startVoiceTimer() {
    let seconds = 0;
    const timerElement = document.getElementById('voice-timer');
    
    this.voiceTimerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

animateVoiceWave() {
    const waveBars = document.querySelectorAll('.wave-bar');
    waveBars.forEach(bar => {
        const height = Math.floor(Math.random() * 20) + 5;
        bar.style.height = height + 'px';
    });
}

playLastResponse() {
    const lastAiMessage = document.querySelector('#chat-history .ai-message:last-child .message-text');
    
    if (!lastAiMessage) {
        this.showToast('❌ پاسخی برای پخش وجود ندارد', 'warning');
        return;
    }
    
    const text = lastAiMessage.textContent;
    const language = document.getElementById('voice-language')?.value || 'fa-IR';
    
    this.speakText(text, language);
}

// ================================================
// تبدیل متن به صدا
// ================================================

speakText(text, lang = 'fa-IR') {
    if (!('speechSynthesis' in window)) {
        this.showToast('❌ مرورگر شما از پشتیبانی نمی‌کند', 'error');
        return;
    }
    
    // توقف پخش قبلی
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = this.currentVoiceSettings.speed;
    utterance.pitch = this.currentVoiceSettings.pitch;
    utterance.volume = this.currentVoiceSettings.volume;
    
    window.speechSynthesis.speak(utterance);
}

// ================================================
// تنظیمات صدا
// ================================================

toggleVoiceSettingsPanel() {
    const panel = document.getElementById('voice-settings-panel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}

saveVoiceSettings() {
    this.currentVoiceSettings.speed = parseFloat(document.getElementById('voice-speed').value);
    this.currentVoiceSettings.pitch = parseFloat(document.getElementById('voice-pitch').value);
    this.currentVoiceSettings.volume = 1;
    
    localStorage.setItem('voiceSettings', JSON.stringify(this.currentVoiceSettings));
    this.showToast('✅ تنظیمات صدا ذخیره شد', 'success');
    document.getElementById('voice-settings-panel').style.display = 'none';
}

testVoiceSettings() {
    const testText = 'این یک تست صدا است. آیا می‌توانید این متن را واضح بشنوید؟';
    const lang = document.getElementById('voice-language').value;
    this.speakText(testText, lang);
}

resetVoiceSettings() {
    document.getElementById('voice-speed').value = 1;
    document.getElementById('voice-pitch').value = 1;
    document.getElementById('speed-value').textContent = '1.0x';
    document.getElementById('pitch-value').textContent = '1.0';
    
    this.currentVoiceSettings = {
        speed: 1,
        pitch: 1,
        volume: 1,
        voice: null
    };
    
    this.showToast('🔄 تنظیمات بازنشانی شد', 'info');
}

    async analyzeImageWithAI(imageFile) {
        try {
            this.showToast('🖼️ در حال تحلیل تصویر...', 'info');
            
            const reader = new FileReader();
            const imageUrl = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(imageFile);
            });
            
            await this.addMessageToHistory('user', `📸 تصویر: ${imageFile.name}`);
            
            const response = await puter.ai.chat(
                "لطفاً این تصویر را تحلیل کن. اگر متن آلمانی دارد، ترجمه کن. اگر صحنه است، توصیف کن.",
                imageUrl,
                { model: "gpt-4o-vision" }
            );
            
            await this.addMessageToHistory('ai', response);
            this.saveCompleteChat();
            
        } catch (error) {
            console.error('❌ خطا در تحلیل تصویر:', error);
            this.showToast('❌ خطا در تحلیل تصویر', 'error');
        }
    }

  
async generateImageWithAI(prompt) {
    if (this.isGeneratingImage) {
        this.showToast('⏳ در حال تولید تصویر قبلی...', 'warning');
        return;
    }
    
    this.isGeneratingImage = true;
    this.lastImagePrompt = prompt;
    
    this.showToast('🎨 در حال تولید تصویر...', 'info');
    
    try {
        const imageElement = await puter.ai.txt2img(prompt, { 
            model: "gpt-image-1" 
        });
        
        const chatHistory = document.getElementById('chat-history');
        const time = new Date().toLocaleTimeString('fa-IR');
        
        // ایجاد دکمه‌های دانلود و فول‌اسکرین
        const imageHtml = `
            <div class="message ai-message image-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">
                        <p>🖼️ تصویر ساخته شده برای: <strong>"${prompt}"</strong></p>
                        <div class="generated-image-container" style="position: relative; margin: 15px 0;">
                            ${imageElement.outerHTML}
                            <div class="image-actions" style="position: absolute; bottom: 10px; left: 10px; display: flex; gap: 10px;">
                                <button class="btn btn-sm btn-primary download-image-btn" title="دانلود تصویر">
                                    <i class="fas fa-download"></i>
                                </button>
                                <button class="btn btn-sm btn-primary fullscreen-image-btn" title="نمایش تمام صفحه">
                                    <i class="fas fa-expand"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;
        
        chatHistory.insertAdjacentHTML('beforeend', imageHtml);
        
        // اضافه کردن event listener برای دکمه‌ها
        const lastMessage = chatHistory.lastElementChild;
        const img = lastMessage.querySelector('img');
        const downloadBtn = lastMessage.querySelector('.download-image-btn');
        const fullscreenBtn = lastMessage.querySelector('.fullscreen-image-btn');
        
        if (downloadBtn && img) {
            downloadBtn.addEventListener('click', () => {
                const link = document.createElement('a');
                link.href = img.src;
                link.download = `ai-image-${Date.now()}.png`;
                link.click();
            });
        }
        
        if (fullscreenBtn && img) {
            fullscreenBtn.addEventListener('click', () => {
                this.showImageFullscreen(img.src);
            });
        }
        
        this.scrollToBottom();
        this.showToast('✅ تصویر با موفقیت تولید شد!', 'success');
        
        // اضافه کردن به حافظه
        this.addToMemory('assistant', `[تصویر تولید شد: ${prompt}]`);
        
    } catch (error) {
        console.error('❌ خطا در تولید تصویر:', error);
        this.showToast('❌ خطا در تولید تصویر', 'error');
    } finally {
        this.isGeneratingImage = false;
    }
}

// ================================================
// نمایش تصویر در حالت تمام صفحه
// ================================================

showImageFullscreen(imageSrc) {
    const modal = document.createElement('div');
    modal.className = 'image-fullscreen-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: 0 0 30px rgba(0,0,0,0.5);
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    `;
    closeBtn.onmouseover = () => {
        closeBtn.style.background = 'rgba(255,255,255,0.3)';
    };
    closeBtn.onmouseout = () => {
        closeBtn.style.background = 'rgba(255,255,255,0.2)';
    };
    
    modal.appendChild(img);
    modal.appendChild(closeBtn);
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
    
    closeBtn.onclick = () => {
        document.body.removeChild(modal);
    };
    
    document.body.appendChild(modal);
}

// ================================================
// تغییر تم AI
// ================================================

toggleAITheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-mode');
    
    if (isDark) {
        body.classList.remove('dark-mode');
        document.getElementById('ai-theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('darkMode', 'false');
    } else {
        body.classList.add('dark-mode');
        document.getElementById('ai-theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('darkMode', 'true');
    }
}

// ================================================
// چت جدید
// ================================================

newChat() {
    if (this.chatMemory.length > 0) {
        if (confirm('آیا می‌خواهید چت جدید شروع کنید؟ چت فعلی ذخیره خواهد شد.')) {
            // ذخیره چت فعلی
            this.saveCompleteChat();
            
            // پاک کردن حافظه
            this.clearMemory();
            
            // پاک کردن صفحه چت
            const chatHistory = document.getElementById('chat-history');
            if (chatHistory) {
                chatHistory.innerHTML = this.renderWelcomeMessage();
            }
            
            this.showToast('🆕 چت جدید شروع شد', 'success');
        }
    } else {
        const chatHistory = document.getElementById('chat-history');
        if (chatHistory) {
            chatHistory.innerHTML = this.renderWelcomeMessage();
        }
        this.showToast('🆕 چت جدید شروع شد', 'success');
    }
}

// ================================================
// پاک کردن تاریخچه چت
// ================================================

clearChatHistory() {
    if (confirm('🗑️ آیا از پاک کردن تاریخچه چت مطمئن هستید؟')) {
        localStorage.removeItem('chatHistory');
        localStorage.removeItem('aiChatMemory');
        localStorage.removeItem('all_chats');
        
        this.chatMemory = [];
        
        const chatHistory = document.getElementById('chat-history');
        if (chatHistory) {
            chatHistory.innerHTML = this.renderWelcomeMessage();
        }
        
        this.showToast('✅ تاریخچه چت پاک شد', 'success');
    }
}

// ================================================
// تاریخچه چت‌ها
// ================================================

showChatHistoryModal() {
    const allChats = JSON.parse(localStorage.getItem('all_chats') || '[]');
    const modal = document.getElementById('chat-history-modal');
    const sessionsList = document.getElementById('chat-sessions-list');
    
    if (!modal || !sessionsList) return;
    
    if (allChats.length === 0) {
        sessionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 15px;"></i>
                <h4>هنوز چتی ذخیره نشده</h4>
                <p>با شروع یک چت جدید، به صورت خودکار ذخیره می‌شود</p>
            </div>
        `;
    } else {
        sessionsList.innerHTML = allChats.map(chat => `
            <div class="chat-session-item" data-id="${chat.id}">
                <div class="chat-session-info">
                    <div class="chat-session-name">
                        <i class="fas fa-comments"></i>
                        <span class="chat-title">${chat.title || 'چت جدید'}</span>
                    </div>
                    <div class="chat-session-details">
                        <span><i class="far fa-calendar"></i> ${new Date(chat.lastUpdated).toLocaleDateString('fa-IR')}</span>
                        <span><i class="fas fa-message"></i> ${chat.messageCount || 0} پیام</span>
                    </div>
                </div>
                <div class="chat-session-actions">
                    <button class="chat-session-btn load" onclick="dictionaryApp.loadChatFromHistory('${chat.id}')">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="chat-session-btn delete" onclick="dictionaryApp.deleteChatFromHistory('${chat.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    modal.style.display = 'flex';
    
    modal.querySelector('.close-modal')?.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    document.getElementById('close-modal-btn')?.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ================================================
// بارگذاری چت از تاریخچه
// ================================================

loadChatFromHistory(chatId) {
    const allChats = JSON.parse(localStorage.getItem('all_chats') || '[]');
    const chatData = allChats.find(c => c.id === chatId);
    
    if (!chatData) {
        this.showToast('❌ چت مورد نظر یافت نشد', 'error');
        return;
    }
    
    // پاک کردن حافظه فعلی
    this.chatMemory = [];
    
    // بازسازی حافظه از پیام‌ها
    if (chatData.messages) {
        chatData.messages.forEach(msg => {
            this.addToMemory(
                msg.type === 'user' ? 'user' : 'assistant',
                msg.content.replace(/<[^>]*>/g, '')
            );
        });
    }
    
    // نمایش در صفحه
    const chatHistory = document.getElementById('chat-history');
    if (chatHistory) {
        chatHistory.innerHTML = '';
        
        chatData.messages.forEach(msg => {
            this.addMessageToHistory(
                msg.type === 'user' ? 'user' : 'ai',
                msg.content
            );
        });
    }
    
    document.getElementById('chat-history-modal').style.display = 'none';
    this.showToast(`📂 "${chatData.title}" بارگذاری شد`, 'success');
}

// ================================================
// حذف چت از تاریخچه
// ================================================

deleteChatFromHistory(chatId) {
    if (!confirm('🗑️ آیا از حذف این چت مطمئن هستید؟')) return;
    
    const allChats = JSON.parse(localStorage.getItem('all_chats') || '[]');
    const filteredChats = allChats.filter(c => c.id !== chatId);
    localStorage.setItem('all_chats', JSON.stringify(filteredChats));
    
    this.showChatHistoryModal();
    this.showToast('✅ چت حذف شد', 'success');
}

// ================================================
// ذخیره چت کامل
// ================================================

saveCompleteChat() {
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;
    
    const messages = [];
    chatHistory.querySelectorAll('.message').forEach(msg => {
        const text = msg.querySelector('.message-text')?.innerHTML || '';
        const time = msg.querySelector('.message-time')?.textContent || '';
        const isUser = msg.classList.contains('user-message');
        
        if (text && !text.includes('به الیاس خوش آمدید')) {
            messages.push({
                type: isUser ? 'user' : 'ai',
                content: text,
                time: time
            });
        }
    });
    
    if (messages.length === 0) return;
    
    const chatData = {
        id: 'chat_' + Date.now(),
        title: this.generateChatTitle(messages),
        messages: messages,
        lastUpdated: Date.now(),
        messageCount: messages.length
    };
    
    const allChats = JSON.parse(localStorage.getItem('all_chats') || '[]');
    allChats.unshift(chatData);
    
    // محدود کردن به 20 چت آخر
    localStorage.setItem('all_chats', JSON.stringify(allChats.slice(0, 20)));
}

generateChatTitle(messages) {
    const firstUserMsg = messages.find(m => m.type === 'user');
    if (firstUserMsg) {
        const text = firstUserMsg.content.replace(/<[^>]*>/g, '').substring(0, 30);
        return text + (text.length >= 30 ? '...' : '');
    }
    return 'چت جدید';
}

    async handleFileUpload(file) {
        if (file.type.startsWith('image/')) {
            await this.analyzeImageWithAI(file);
        } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const content = await file.text();
            await this.addMessageToHistory('user', `📄 فایل: ${file.name}\n\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`);
            this.showToast(`✅ فایل ${file.name} آپلود شد`, 'success');
        } else {
            this.showToast(`❌ نوع فایل ${file.type} پشتیبانی نمی‌شود`, 'warning');
        }
    }

    async addMessageToHistory(sender, message) {
        const chatHistory = document.getElementById('chat-history');
        if (!chatHistory) return;
        
        const time = new Date().toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const messageClass = sender === 'user' ? 'user-message' : 'ai-message';
        const formattedMessage = this.escapeHtml(message).replace(/\n/g, '<br>');
        
        const messageHtml = `
            <div class="message ${messageClass}" style="animation: fadeInUp 0.3s ease;">
                <div class="message-avatar">
                    <i class="fas ${sender === 'user' ? 'fa-user' : 'fa-robot'}"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${formattedMessage}</div>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;
        
        chatHistory.insertAdjacentHTML('beforeend', messageHtml);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const chatHistory = document.getElementById('chat-history');
        if (!chatHistory) return;
        
        this.removeTypingIndicator();
        
        const typingHtml = `
            <div class="message ai-message" id="typing-indicator">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <div class="typing-dots">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                        <span>در حال نوشتن...</span>
                    </div>
                </div>
            </div>
        `;
        
        chatHistory.insertAdjacentHTML('beforeend', typingHtml);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        const chatHistory = document.getElementById('chat-history');
        if (chatHistory) {
            chatHistory.scrollTo({
                top: chatHistory.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    setupScrollManagement() {
        const chatHistory = document.getElementById('chat-history');
        if (!chatHistory) return;
        
        chatHistory.addEventListener('scroll', () => {
            const scrollTop = chatHistory.scrollTop;
            const scrollHeight = chatHistory.scrollHeight;
            const clientHeight = chatHistory.clientHeight;
            
            const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
            this.scrollState.isAtBottom = distanceFromBottom < 50;
            this.scrollState.lastScrollTop = scrollTop;
            
            if (this.scrollState.scrollTimeout) {
                clearTimeout(this.scrollState.scrollTimeout);
            }
            
            this.scrollState.isUserScrolling = true;
            this.scrollState.scrollTimeout = setTimeout(() => {
                this.scrollState.isUserScrolling = false;
            }, 1500);
        });
    }

    saveMessageToHistory(sender, content) {
        try {
            const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            
            chatHistory.push({
                sender: sender === 'user' ? 'user' : 'assistant',
                content: content,
                timestamp: new Date().toISOString()
            });
            
            const limitedHistory = chatHistory.slice(-50);
            localStorage.setItem('chatHistory', JSON.stringify(limitedHistory));
            
        } catch (error) {
            console.error('❌ خطا در ذخیره تاریخچه:', error);
        }
    }

    loadChatHistoryFromStorage() {
        try {
            const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            const chatContainer = document.getElementById('chat-history');
            
            if (!chatContainer) return;
            
            if (chatHistory.length === 0) {
                this.showWelcomeMessage();
                return;
            }
            
            chatContainer.innerHTML = '';
            
            chatHistory.forEach(msg => {
                this.addMessageToHistory(
                    msg.sender === 'user' ? 'user' : 'ai',
                    msg.content
                );
            });
            
        } catch (error) {
            console.error('❌ خطا در بارگذاری تاریخچه:', error);
            this.showWelcomeMessage();
        }
    }

    showWelcomeMessage() {
        const chatHistory = document.getElementById('chat-history');
        if (!chatHistory) return;
        
        chatHistory.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">
                        <h4>🤖 سلام! خوش آمدید</h4>
                        <p>من دستیار هوش مصنوعی شما برای یادگیری زبان آلمانی هستم.</p>
                        <p>می‌توانید سوالات خود را بپرسید:</p>
                        <ul style="margin-top: 10px; padding-right: 20px;">
                            <li>📘 گرامر و دستور زبان</li>
                            <li>📝 صرف افعال</li>
                            <li>🗣️ تلفظ کلمات</li>
                            <li>💬 جمله‌سازی</li>
                            <li>📖 معنی لغات</li>
                        </ul>
                    </div>
                    <div class="message-time">${new Date().toLocaleTimeString('fa-IR')}</div>
                </div>
            </div>
        `;
    }

    clearChatHistory() {
        if (confirm('🗑️ آیا از پاک کردن تاریخچه چت مطمئن هستید؟')) {
            localStorage.removeItem('chatHistory');
            this.showWelcomeMessage();
            this.showToast('✅ تاریخچه چت پاک شد', 'success');
        }
    }

    newChat() {
        localStorage.removeItem('chatHistory');
        this.showWelcomeMessage();
        this.showToast('🆕 چت جدید شروع شد', 'success');
    }

    saveCompleteChat() {
        // قبلاً در localStorage ذخیره می‌کنیم
        const chatHistory = document.getElementById('chat-history');
        if (chatHistory) {
            const messages = [];
            chatHistory.querySelectorAll('.message').forEach(msg => {
                const text = msg.querySelector('.message-text')?.innerHTML || '';
                const time = msg.querySelector('.message-time')?.textContent || '';
                const isUser = msg.classList.contains('user-message');
                
                if (text && !text.includes('سلام! خوش آمدید')) {
                    messages.push({
                        type: isUser ? 'user' : 'ai',
                        content: text,
                        time: time
                    });
                }
            });
            
            if (messages.length > 0) {
                const chatData = {
                    id: this.currentChatId,
                    title: messages[0]?.content.substring(0, 30) + '...' || 'چت جدید',
                    messages: messages,
                    lastUpdated: Date.now(),
                    messageCount: messages.length
                };
                
                const allChats = JSON.parse(localStorage.getItem('all_chats') || '[]');
                const existingIndex = allChats.findIndex(c => c.id === chatData.id);
                
                if (existingIndex !== -1) {
                    allChats[existingIndex] = chatData;
                } else {
                    allChats.unshift(chatData);
                }
                
                localStorage.setItem('all_chats', JSON.stringify(allChats.slice(0, 20)));
                localStorage.setItem('current_chat_id', this.currentChatId);
            }
        }
    }

    showChatHistoryModal() {
        const allChats = JSON.parse(localStorage.getItem('all_chats') || '[]');
        const modal = document.getElementById('chat-history-modal');
        const sessionsList = document.getElementById('chat-sessions-list');
        
        if (!modal || !sessionsList) return;
        
        if (allChats.length === 0) {
            sessionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments" style="font-size: 3rem; color: var(--gray-400);"></i>
                    <h4>هنوز چتی ذخیره نشده</h4>
                    <p>با شروع یک چت جدید، به صورت خودکار ذخیره می‌شود</p>
                </div>
            `;
        } else {
            sessionsList.innerHTML = allChats.map(chat => `
                <div class="chat-session-item" data-id="${chat.id}">
                    <div class="chat-session-info">
                        <div class="chat-session-name">
                            <i class="fas fa-comments"></i>
                            <span class="chat-title">${chat.title || 'چت جدید'}</span>
                        </div>
                        <div class="chat-session-details">
                            <span class="chat-session-date">
                                <i class="far fa-calendar"></i>
                                ${new Date(chat.lastUpdated).toLocaleDateString('fa-IR')}
                            </span>
                            <span class="chat-session-count">
                                <i class="fas fa-message"></i>
                                ${chat.messageCount || 0} پیام
                            </span>
                        </div>
                    </div>
                    <div class="chat-session-actions">
                        <button class="chat-session-btn load" onclick="dictionaryApp.loadChatFromHistory('${chat.id}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="chat-session-btn delete" onclick="dictionaryApp.deleteChatFromHistory('${chat.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        modal.style.display = 'flex';
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('close-modal-btn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    loadChatFromHistory(chatId) {
        const allChats = JSON.parse(localStorage.getItem('all_chats') || '[]');
        const chatData = allChats.find(c => c.id === chatId);
        
        if (!chatData) {
            this.showToast('❌ چت مورد نظر یافت نشد', 'error');
            return;
        }
        
        const chatHistory = document.getElementById('chat-history');
        if (chatHistory) {
            chatHistory.innerHTML = '';
            
            chatData.messages.forEach(msg => {
                this.addMessageToHistory(
                    msg.type === 'user' ? 'user' : 'ai',
                    msg.content.replace(/<[^>]*>/g, '')
                );
            });
        }
        
        document.getElementById('chat-history-modal').style.display = 'none';
        this.showToast(`📂 "${chatData.title}" بارگذاری شد`, 'success');
    }

    deleteChatFromHistory(chatId) {
        if (!confirm('🗑️ آیا از حذف این چت مطمئن هستید؟')) return;
        
        const allChats = JSON.parse(localStorage.getItem('all_chats') || '[]');
        const filteredChats = allChats.filter(c => c.id !== chatId);
        localStorage.setItem('all_chats', JSON.stringify(filteredChats));
        
        this.showChatHistoryModal();
        this.showToast('✅ چت حذف شد', 'success');
    }

    autoLoadChatOnStart() {
        const currentChatId = localStorage.getItem('current_chat_id');
        if (currentChatId) {
            this.loadChatFromHistory(currentChatId);
        }
    }

    toggleVoiceSettingsPanel() {
        const panel = document.getElementById('voice-settings-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    toggleVoiceInput() {
        if (!this.isVoiceInputActive) {
            this.startVoiceRecognition();
        } else {
            this.stopVoiceInput();
        }
    }

    startVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            
            this.voiceRecognition.lang = 'fa-IR';
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.continuous = false;
            
            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('ai-chat-input').value = transcript;
                this.showToast('🎤 متن شناسایی شد', 'success');
                this.stopVoiceInput();
            };
            
            this.voiceRecognition.onerror = (event) => {
                this.showToast(`❌ خطا: ${event.error}`, 'error');
                this.stopVoiceInput();
            };
            
            this.voiceRecognition.onend = () => {
                this.stopVoiceInput();
            };
            
            this.voiceRecognition.start();
            this.isVoiceInputActive = true;
            
            document.getElementById('voice-input-toggle').classList.add('active');
            document.getElementById('voice-input-status').style.display = 'block';
            
            this.startVoiceTimer();
            
        } else {
            this.showToast('❌ مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند', 'error');
        }
    }

    startVoiceTimer() {
        this.voiceStartTime = Date.now();
        this.voiceTimerInterval = setInterval(() => {
            const elapsed = Date.now() - this.voiceStartTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const displaySeconds = seconds % 60;
            
            const timer = document.querySelector('.timer');
            if (timer) {
                timer.textContent = `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
            }
        }, 100);
    }

    stopVoiceInput() {
        if (this.voiceRecognition) {
            this.voiceRecognition.stop();
        }
        
        if (this.voiceTimerInterval) {
            clearInterval(this.voiceTimerInterval);
            this.voiceTimerInterval = null;
        }
        
        this.isVoiceInputActive = false;
        document.getElementById('voice-input-toggle').classList.remove('active');
        document.getElementById('voice-input-status').style.display = 'none';
    }

    toggleAITheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        
        const btn = document.getElementById('ai-theme-toggle');
        if (btn) {
            btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    }

    // ================================================
    // متدهای کمکی
    // ================================================

    showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    speakText(text, lang = 'de-DE') {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    }

    playPronunciation(word) {
        this.speakText(word, 'de-DE');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        }[type] || 'fa-info-circle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
            <i class="fas fa-times toast-close"></i>
        `;
        
        container.appendChild(toast);
        
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    getGenderLabel(gender) {
        const labels = {
            masculine: 'مذکر (der)',
            feminine: 'مونث (die)',
            neuter: 'خنثی (das)'
        };
        return labels[gender] || '';
    }

    getGenderSymbol(gender) {
        const symbols = {
            masculine: 'der',
            feminine: 'die',
            neuter: 'das'
        };
        return symbols[gender] || '';
    }

    getTypeLabel(type) {
        const labels = {
            noun: 'اسم',
            verb: 'فعل',
            adjective: 'صفت',
            adverb: 'قید',
            other: 'سایر'
        };
        return labels[type] || type;
    }

    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupOnlineStatusListener() {
        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());
    }

    updateOnlineStatus() {
        const isOnline = navigator.onLine;
        const statusElement = document.getElementById('online-status');
        
        if (statusElement) {
            statusElement.className = `online-status ${isOnline ? 'online' : 'offline'}`;
            statusElement.innerHTML = `
                <i class="fas fa-${isOnline ? 'wifi' : 'exclamation-triangle'}"></i>
                ${isOnline ? 'آنلاین - سرویس‌های ترجمه فعال' : 'آفلاین - فقط دیکشنری محلی'}
            `;
        }
    }

    // ================================================
    // Event Listeners عمومی
    // ================================================

    setupEventListeners() {
        // جستجو
        document.getElementById('search-btn')?.addEventListener('click', async () => {
            const query = document.getElementById('search-input').value.trim();
            if (query) {
                const results = await this.searchWords(query);
                if (results.length > 0) {
                    this.normalSearch(query);
                } else {
                    this.showToast('❌ هیچ نتیجه‌ای یافت نشد', 'info');
                }
            }
        });
        
        document.getElementById('search-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('search-btn').click();
            }
        });
        
        // ذخیره لغت
        document.getElementById('save-word-btn')?.addEventListener('click', async () => {
            await this.saveWord();
        });
        
        // پاک کردن فرم
        document.getElementById('clear-form-btn')?.addEventListener('click', () => {
            this.clearAddWordForm();
            this.showToast('🧹 فرم پاک شد', 'info');
        });
        
        // نمایش/مخفی کردن صرف فعل
        document.getElementById('word-type')?.addEventListener('change', function() {
            const verbForms = document.querySelector('.verb-forms');
            if (verbForms) {
                verbForms.style.display = this.value === 'verb' ? 'block' : 'none';
            }
        });
        
        // دکمه‌های جنسیت
        document.querySelectorAll('.gender-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    async saveWord() {
        try {
            const german = document.getElementById('german-word').value.trim();
            const persian = document.getElementById('persian-meaning').value.trim();
            
            if (!german || !persian) {
                this.showToast('❌ لطفاً هر دو فیلد را پر کنید', 'error');
                return false;
            }
            
            const type = document.getElementById('word-type').value;
            const genderBtn = document.querySelector('.gender-btn.active');
            const gender = genderBtn?.dataset.gender !== 'none' ? genderBtn?.dataset.gender : null;
            
            const wordData = {
                german,
                persian,
                type,
                gender
            };
            
            if (type === 'verb') {
                const present = document.getElementById('verb-present')?.value.trim() || '';
                const past = document.getElementById('verb-past')?.value.trim() || '';
                const perfect = document.getElementById('verb-perfect')?.value.trim() || '';
                
                if (present || past || perfect) {
                    wordData.verbForms = { present, past, perfect };
                }
            }
            
            await this.addWord(wordData);
            return true;
            
        } catch (error) {
            console.error('Error saving word:', error);
            this.showToast(error.message || '❌ خطا در ذخیره لغت', 'error');
            return false;
        }
    }

    setupWordListEventListeners() {
        document.querySelectorAll('.favorite-icon').forEach(icon => {
            icon.addEventListener('click', async (e) => {
                e.stopPropagation();
                const wordId = parseInt(icon.dataset.id);
                await this.toggleFavorite(wordId);
                icon.classList.toggle('active');
            });
        });
        
        document.querySelectorAll('.view-word').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const wordId = parseInt(btn.dataset.id);
                const word = await this.getWord(wordId);
                if (word) {
                    this.renderWordDetails(word);
                    this.showSection('search-section');
                }
            });
        });
        
        document.querySelectorAll('.practice-word').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const wordId = parseInt(btn.dataset.id);
                this.startPracticeSession([wordId]);
            });
        });
    }
// ========== اصلاح تابع setupWordDetailsEventListeners ==========

setupWordDetailsEventListeners(word) {
    // دکمه تلفظ
    document.querySelectorAll('.pronunciation-icon').forEach(btn => {
        btn.addEventListener('click', () => {
            const wordText = btn.dataset.word;
            this.playPronunciation(wordText);
        });
    });
    
    // ✅ دکمه علاقه‌مندی - این رو اضافه کن
    document.querySelector('.favorite-icon')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const wordId = parseInt(e.currentTarget.dataset.id);
        await this.toggleFavorite(wordId);
        e.currentTarget.classList.toggle('active');
        
        // آپدیت لیست علاقه‌مندی‌ها
        this.updateFavoritesCount();
    });
    
    // دکمه افزودن مثال
    document.getElementById('add-example-btn')?.addEventListener('click', async () => {
        const german = document.getElementById('new-example-german').value.trim();
        const persian = document.getElementById('new-example-persian').value.trim();
        
        if (german && persian) {
            await this.addExample(word.id, { german, persian });
            this.renderWordDetails(word);
            this.showToast('✅ مثال اضافه شد', 'success');
        } else {
            this.showToast('❌ لطفاً هر دو فیلد را پر کنید', 'error');
        }
    });
    
    // ✅ دکمه تمرین - اصلاح کن
    document.getElementById('practice-now-btn')?.addEventListener('click', () => {
        this.startPracticeSession([word.id]);
        this.showSection('flashcards-section'); // برو به بخش فلش کارت
    });
    
    // دکمه ویرایش
    document.querySelector('.edit-word-icon')?.addEventListener('click', () => {
        this.showEditWordForm(word);
    });
    
    // دکمه حذف
    document.querySelector('.delete-word-icon')?.addEventListener('click', async () => {
        if (confirm(`🗑️ آیا از حذف لغت "${word.german}" مطمئن هستید؟`)) {
            await this.deleteWord(word.id);
            this.showSection('word-list-section');
        }
    });
}
// ========== تابع renderWordDetails ==========
// ========== اصلاح تابع renderWordDetails ==========

async renderWordDetails(word) {
    if (!word) {
        console.error('❌ کلمه‌ای برای نمایش وجود ندارد');
        return;
    }
    
    this.currentWord = word;
    const examples = await this.getExamplesForWord(word.id);
    const practiceHistory = await this.getPracticeHistory(word.id);
    
    const successRate = practiceHistory.length > 0 
        ? Math.round((practiceHistory.filter(h => h.correct).length / practiceHistory.length) * 100) 
        : 0;
    
    const container = document.getElementById('search-results-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="word-header">
                <div>
                    <span class="word-title">${word.german}</span>
                    ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderLabel(word.gender)}</span>` : ''}
                    ${word.type ? `<span class="word-type">${this.getTypeLabel(word.type)}</span>` : ''}
                </div>
                <div class="word-actions">
                    <i class="fas fa-star favorite-icon ${this.favorites.has(word.id) ? 'active' : ''}" 
                       data-id="${word.id}"></i>
                    <i class="fas fa-volume-up pronunciation-icon" data-word="${word.german}"></i>
                    <i class="fas fa-pen edit-word-icon" data-id="${word.id}"></i>
                    <i class="fas fa-trash delete-word-icon" data-id="${word.id}"></i>
                </div>
            </div>
            
            <div class="word-meaning">
                <p><strong>معنی:</strong> ${word.persian}</p>
            </div>
            
            ${word.verbForms ? `
                <div class="verb-forms">
                    <div class="verb-form-row">
                        <div class="verb-form-item">
                            <span class="verb-form-label">حال ساده</span>
                            <input type="text" class="form-control" value="${word.verbForms.present || ''}" readonly>
                        </div>
                        <div class="verb-form-item">
                            <span class="verb-form-label">گذشته ساده</span>
                            <input type="text" class="form-control" value="${word.verbForms.past || ''}" readonly>
                        </div>
                        <div class="verb-form-item">
                            <span class="verb-form-label">گذشته کامل</span>
                            <input type="text" class="form-control" value="${word.verbForms.perfect || ''}" readonly>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="tab-container">
                <div class="tab active" data-tab="examples">📚 مثال‌ها (${examples.length})</div>
                <div class="tab" data-tab="practice">🎯 تمرین (${practiceHistory.length})</div>
                <div class="tab" data-tab="stats">📊 آمار (${successRate}%)</div>
            </div>
            
            <div class="tab-content active" id="examples-content">
                ${examples.length > 0 ? examples.map(ex => `
                    <div class="example">
                        <div class="example-header">
                            <strong>مثال:</strong>
                            <i class="fas fa-volume-up pronunciation-icon" data-word="${ex.german}"></i>
                        </div>
                        <p class="example-text">${ex.german}</p>
                        <p class="example-translation">${ex.persian}</p>
                    </div>
                `).join('') : '<p class="text-center py-4">📝 مثالی ثبت نشده است</p>'}
                
                <div class="add-example-form mt-4">
                    <h4>➕ افزودن مثال جدید</h4>
                    <div class="form-group">
                        <label for="new-example-german">مثال (آلمانی):</label>
                        <textarea id="new-example-german" class="form-control" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="new-example-persian">ترجمه (فارسی):</label>
                        <textarea id="new-example-persian" class="form-control" rows="2"></textarea>
                    </div>
                    <button class="btn btn-primary" id="add-example-btn">
                        <i class="fas fa-plus"></i> افزودن مثال
                    </button>
                </div>
            </div>
            
            <div class="tab-content" id="practice-content" style="display: none;">
                ${practiceHistory.length > 0 ? `
                    <div class="progress-card">
                        <div class="progress-label">میزان موفقیت</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${successRate}%"></div>
                        </div>
                        <div class="progress-value">${successRate}%</div>
                    </div>
                    
                    <div class="practice-history mt-4">
                        <h4>📋 آخرین تمرین‌ها</h4>
                        ${practiceHistory.slice(0, 5).map(record => `
                            <div class="practice-record ${record.correct ? 'correct' : 'incorrect'}">
                                <span>${new Date(record.date).toLocaleDateString('fa-IR')}</span>
                                <span>${record.correct ? '✅ صحیح' : '❌ نادرست'}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-center py-4">🎯 هنوز تمرینی برای این لغت انجام نداده‌اید</p>'}
                
                <div class="action-buttons mt-4">
                    <button class="btn btn-primary" id="practice-now-btn">
                        <i class="fas fa-play"></i> تمرین این لغت
                    </button>
                </div>
            </div>
            
            <div class="tab-content" id="stats-content" style="display: none;">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📅</div>
                        <div class="stat-title">تاریخ ثبت</div>
                        <div class="stat-value">${new Date(word.createdAt).toLocaleDateString('fa-IR')}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-title">تعداد تمرین</div>
                        <div class="stat-value">${practiceHistory.length}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-title">موفقیت</div>
                        <div class="stat-value">${successRate}%</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // ========== اینجا همه event listenerها رو ستاپ کن ==========
    this.setupWordDetailsEventListeners(word);
    this.setupTabs(); // <-- این خیلی مهمه
    
    // اضافه کردن event listener برای تب‌ها به صورت دستی
    setTimeout(() => {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.style.display = 'none';
                });
                
                const targetContent = document.getElementById(`${tabId}-content`);
                if (targetContent) {
                    targetContent.style.display = 'block';
                }
                
                console.log('📌 تب فعال شد:', tabId);
            });
        });
    }, 100);
}
    showEditWordForm(word) {
        document.getElementById('add-word-section').innerHTML = `
            <div class="word-card">
                <div class="section-header">
                    <h2><i class="fas fa-pen"></i> ویرایش لغت</h2>
                </div>
                
                <div class="form-group">
                    <label for="edit-german-word">لغت آلمانی:</label>
                    <input type="text" id="edit-german-word" class="form-control" value="${word.german}">
                </div>
                
                <div class="form-group">
                    <label for="edit-persian-meaning">معنی فارسی:</label>
                    <input type="text" id="edit-persian-meaning" class="form-control" value="${word.persian}">
                </div>
                
                <div class="form-group">
                    <label>جنسیت:</label>
                    <div class="gender-options">
                        <button type="button" class="gender-btn masculine ${word.gender === 'masculine' ? 'active' : ''}" 
                                data-gender="masculine">مذکر (der)</button>
                        <button type="button" class="gender-btn feminine ${word.gender === 'feminine' ? 'active' : ''}" 
                                data-gender="feminine">مونث (die)</button>
                        <button type="button" class="gender-btn neuter ${word.gender === 'neuter' ? 'active' : ''}" 
                                data-gender="neuter">خنثی (das)</button>
                        <button type="button" class="gender-btn none ${!word.gender ? 'active' : ''}" 
                                data-gender="none">بدون جنسیت</button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="edit-word-type">نوع کلمه:</label>
                    <select id="edit-word-type" class="form-control">
                        <option value="noun" ${word.type === 'noun' ? 'selected' : ''}>📘 اسم</option>
                        <option value="verb" ${word.type === 'verb' ? 'selected' : ''}>⚡ فعل</option>
                        <option value="adjective" ${word.type === 'adjective' ? 'selected' : ''}>✨ صفت</option>
                        <option value="adverb" ${word.type === 'adverb' ? 'selected' : ''}>📌 قید</option>
                        <option value="other" ${word.type === 'other' || !word.type ? 'selected' : ''}>🔹 سایر</option>
                    </select>
                </div>
                
                <div id="edit-verb-section" class="verb-forms" style="display: ${word.type === 'verb' ? 'block' : 'none'}">
                    <div class="form-group">
                        <label>صرف فعل:</label>
                        <div class="verb-form-row">
                            <div class="verb-form-item">
                                <span class="verb-form-label">حال ساده</span>
                                <input type="text" id="edit-verb-present" class="form-control" 
                                       value="${word.verbForms?.present || ''}">
                            </div>
                            <div class="verb-form-item">
                                <span class="verb-form-label">گذشته ساده</span>
                                <input type="text" id="edit-verb-past" class="form-control" 
                                       value="${word.verbForms?.past || ''}">
                            </div>
                            <div class="verb-form-item">
                                <span class="verb-form-label">گذشته کامل</span>
                                <input type="text" id="edit-verb-perfect" class="form-control" 
                                       value="${word.verbForms?.perfect || ''}">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-primary" id="save-edit-btn">
                        <i class="fas fa-save"></i> ذخیره تغییرات
                    </button>
                    <button class="btn btn-outline" id="cancel-edit-btn">
                        <i class="fas fa-times"></i> انصراف
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('edit-word-type').addEventListener('change', function() {
            const verbSection = document.getElementById('edit-verb-section');
            verbSection.style.display = this.value === 'verb' ? 'block' : 'none';
        });
        
        document.querySelectorAll('.gender-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        document.getElementById('save-edit-btn').addEventListener('click', async () => {
            const german = document.getElementById('edit-german-word').value.trim();
            const persian = document.getElementById('edit-persian-meaning').value.trim();
            const type = document.getElementById('edit-word-type').value;
            const genderBtn = document.querySelector('.gender-btn.active');
            const gender = genderBtn?.dataset.gender !== 'none' ? genderBtn?.dataset.gender : null;
            
            const updatedWord = {
                ...word,
                german,
                persian,
                type,
                gender
            };
            
            if (type === 'verb') {
                const present = document.getElementById('edit-verb-present')?.value.trim() || '';
                const past = document.getElementById('edit-verb-past')?.value.trim() || '';
                const perfect = document.getElementById('edit-verb-perfect')?.value.trim() || '';
                
                if (present || past || perfect) {
                    updatedWord.verbForms = { present, past, perfect };
                }
            }
            
            await this.updateWord(updatedWord);
            this.renderWordDetails(updatedWord);
            this.showSection('search-section');
        });
        
        document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            this.renderWordDetails(word);
            this.showSection('search-section');
        });
        
        this.showSection('add-word-section');
    }

    setupTabs() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                document.getElementById(`${tabId}-content`)?.classList.add('active');
            });
        });
    }
}

// ================================================
// راه‌اندازی برنامه
// ================================================

let dictionaryApp;

document.addEventListener('DOMContentLoaded', () => {
    dictionaryApp = new GermanDictionary();
    window.dictionaryApp = dictionaryApp;
});

// ================================================
// توابع عمومی برای دسترسی از HTML
// ================================================

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

