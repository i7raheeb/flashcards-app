/**
 * FLASHMIND-CORE (نبراس - البطاقات الذكية)
 * المحرك التفاعلي المتطور لإدارة البطاقات، الرياضيات، والمحاكاة الذكية
 */

(function() {
    'use strict';

    // الحالة العامة للتطبيق
    let activeFilter = 'all'; // 'all' | 'needs_review' | 'mastered' | 'favorites'
    let currentDeck = [];
    let currentIndex = 0;
    let isFlipped = false;
    let autoPlayInterval = null;
    let soundEnabled = true;

    // عناصر واجهة المستخدم الرئيسية
    const cardElement = document.getElementById('card');
    const counterElement = document.getElementById('counter');
    const progressBar = document.getElementById('progressBar');
    const masteryPercentEl = document.getElementById('masteryPercent');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const flipBtn = document.getElementById('flipBtn');
    const frontText = document.getElementById('frontText');
    const backText = document.getElementById('backText');
    const frontCategory = document.getElementById('frontCategory');
    const backCategory = document.getElementById('backCategory');
    const favToggleBtn = document.getElementById('favToggleBtn');
    const favIcon = document.getElementById('favIcon');

    // أزرار التقييم الذاتي
    const markMasterBtn = document.getElementById('markMasterBtn');
    const markReviewBtn = document.getElementById('markReviewBtn');

    // أدوات الهيدر والقوائم
    const filterTabs = document.querySelectorAll('.filter-tab');
    const countAll = document.getElementById('countAll');
    const countReview = document.getElementById('countReview');
    const countMastered = document.getElementById('countMastered');
    const countFavorites = document.getElementById('countFavorites');
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const soundIcon = document.getElementById('soundIcon');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    // أزرار الوظائف الإضافية
    const shuffleBtn = document.getElementById('shuffleBtn');
    const autoPlayBtn = document.getElementById('autoPlayBtn');
    const autoPlayIcon = document.getElementById('autoPlayIcon');
    const autoPlayText = document.getElementById('autoPlayText');
    const deleteCardBtn = document.getElementById('deleteCardBtn');

    // نوافذ المودال
    const cardModal = document.getElementById('cardModal');
    const modalTitle = document.getElementById('modalTitle');
    const cardForm = document.getElementById('cardForm');
    const editCardId = document.getElementById('editCardId');
    const cardCategoryInput = document.getElementById('cardCategoryInput');
    const cardQuestionInput = document.getElementById('cardQuestionInput');
    const cardAnswerInput = document.getElementById('cardAnswerInput');
    const openAddCardBtn = document.getElementById('openAddCardBtn');
    const openEditCardBtn = document.getElementById('openEditCardBtn');
    const closeCardModalBtn = document.getElementById('closeCardModalBtn');
    const cancelCardModalBtn = document.getElementById('cancelCardModalBtn');
    const liveMathPreview = document.getElementById('liveMathPreview');
    const refreshMathPreview = document.getElementById('refreshMathPreview');

    // نافذة إدارة الحزمة
    const deckModal = document.getElementById('deckModal');
    const manageDeckBtn = document.getElementById('manageDeckBtn');
    const closeDeckModalBtn = document.getElementById('closeDeckModalBtn');
    const exportCardsBtn = document.getElementById('exportCardsBtn');
    const importJsonInput = document.getElementById('importJsonInput');
    const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
    const dTotalCount = document.getElementById('dTotalCount');
    const dMasteredCount = document.getElementById('dMasteredCount');
    const dReviewCount = document.getElementById('dReviewCount');

    // نافذة الذكاء الاصطناعي (PDF)
    const aiModal = document.getElementById('aiModal');
    const openAiModalBtn = document.getElementById('openAiModalBtn');
    const closeAiModalBtn = document.getElementById('closeAiModalBtn');
    const aiDropzone = document.getElementById('aiDropzone');
    const pdfFileInput = document.getElementById('pdfFileInput');
    const selectedPdfInfo = document.getElementById('selectedPdfInfo');
    const selectedPdfName = document.getElementById('selectedPdfName');
    const selectedPdfSize = document.getElementById('selectedPdfSize');
    const removePdfBtn = document.getElementById('removePdfBtn');
    const aiCardCount = document.getElementById('aiCardCount');
    const aiDifficulty = document.getElementById('aiDifficulty');
    const aiCustomNotes = document.getElementById('aiCustomNotes');
    const startAiAnalysisBtn = document.getElementById('startAiAnalysisBtn');

    // أقسام واجهة الذكاء الاصطناعي
    const aiUploadView = document.getElementById('aiUploadView');
    const aiLoadingView = document.getElementById('aiLoadingView');
    const aiResultsView = document.getElementById('aiResultsView');
    const aiErrorView = document.getElementById('aiErrorView');

    // عناصر شريط التقدم والنتائج
    const stepRead = document.getElementById('stepRead');
    const stepAgent = document.getElementById('stepAgent');
    const stepExtract = document.getElementById('stepExtract');
    const stepRender = document.getElementById('stepRender');
    const aiElapsedTimer = document.getElementById('aiElapsedTimer');
    const resultsDocTitle = document.getElementById('resultsDocTitle');
    const resultsSummaryText = document.getElementById('resultsSummaryText');
    const resultsTopicsList = document.getElementById('resultsTopicsList');
    const resultsCardsCountBadge = document.getElementById('resultsCardsCountBadge');
    const generatedCardsList = document.getElementById('generatedCardsList');

    // أزرار إجراءات النتائج
    const applyAndStudyBtn = document.getElementById('applyAndStudyBtn');
    const replaceAndStudyBtn = document.getElementById('replaceAndStudyBtn');
    const exportAiCardsJsonBtn = document.getElementById('exportAiCardsJsonBtn');
    const analyzeAnotherPdfBtn = document.getElementById('analyzeAnotherPdfBtn');
    const aiErrorTitle = document.getElementById('aiErrorTitle');
    const aiErrorMessage = document.getElementById('aiErrorMessage');
    const aiRetryBtn = document.getElementById('aiRetryBtn');

    // التنبيهات
    const toast = document.getElementById('toast');

    // عناصر السلايد الفارغ التفاعلي
    const emptySlideContainer = document.getElementById('emptySlideContainer');
    const emptySlideCard = document.getElementById('emptySlideCard');
    const emptySlidePdfBtn = document.getElementById('emptySlidePdfBtn');
    const emptySlideIconTrigger = document.getElementById('emptySlideIconTrigger');
    const emptySlideTitle = document.getElementById('emptySlideTitle');
    const emptySlideDesc = document.getElementById('emptySlideDesc');
    const emptySlideBadgeText = document.getElementById('emptySlideBadgeText');
    const sceneContainer = document.getElementById('sceneContainer');

    // =========================================================================
    // مولد الصوت التفاعلي عبر Web Audio API (بدون ملفات خارجية)
    // =========================================================================
    let audioCtx = null;
    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playFlipSound() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const now = ctx.currentTime;
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {}
    }

    const playSuccessSound = function() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            [523.25, 659.25, 783.99].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + i * 0.07);
                gain.gain.setValueAtTime(0.08, now + i * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.07);
                osc.stop(now + i * 0.07 + 0.3);
            });
        } catch (e) {}
    };
    const playMasterySound = playSuccessSound;

    // =========================================================================
    // إدارة تدفق البطاقات والتصفية
    // =========================================================================
    function refreshDeck(keepIndex = false) {
        const allCards = window.CardStore.getAllCards();

        // تحديث إحصائيات الهيدر
        const masteredCards = allCards.filter(c => c.mastered);
        const reviewCards = allCards.filter(c => !c.mastered);
        const favCards = allCards.filter(c => c.favorite);

        countAll.textContent = allCards.length;
        countMastered.textContent = masteredCards.length;
        countReview.textContent = reviewCards.length;
        countFavorites.textContent = favCards.length;

        const masteryRate = allCards.length > 0 
            ? Math.round((masteredCards.length / allCards.length) * 100) 
            : 0;
        masteryPercentEl.textContent = `${masteryRate}%`;

        // تطبيق الفلتر النشط
        if (activeFilter === 'mastered') {
            currentDeck = masteredCards;
        } else if (activeFilter === 'needs_review') {
            currentDeck = reviewCards;
        } else if (activeFilter === 'favorites') {
            currentDeck = favCards;
        } else {
            currentDeck = [...allCards];
        }

        if (!keepIndex || currentIndex >= currentDeck.length) {
            currentIndex = 0;
        }

        displayCurrentCard();
    }

    function displayCurrentCard() {
        // إعادة ضبط حالة القلب
        isFlipped = false;
        cardElement.classList.remove('flipped');

        const allCards = window.CardStore.getAllCards();

        if (currentDeck.length === 0) {
            // إظهار واجهة السلايد الفارغ التفاعلي وإخفاء مشهد البطاقة
            if (emptySlideContainer) emptySlideContainer.style.display = 'flex';
            if (sceneContainer) sceneContainer.style.display = 'none';

            if (allCards.length === 0) {
                if (emptySlideBadgeText) emptySlideBadgeText.textContent = 'بانتظار مستندك الدراسي';
                if (emptySlideTitle) emptySlideTitle.textContent = 'السلايد فارغ بانتظار ملفك';
                if (emptySlideDesc) emptySlideDesc.innerHTML = 'ارفع أي ملف دراسي أو تقني بصيغة <code>.PDF</code> (أمن سيبراني، علوم حاسب، شبكات، أو أي مادة)، وسيقوم وكيل الذكاء الاصطناعي بتحليله وتلخيصه وصناعة حزمة البطاقات الذكية لك فوراً.';
            } else {
                if (emptySlideBadgeText) emptySlideBadgeText.textContent = 'تصفية البطاقات';
                if (emptySlideTitle) emptySlideTitle.textContent = 'لا توجد بطاقات في هذا التصنيف حالياً';
                if (emptySlideDesc) emptySlideDesc.innerHTML = 'يمكنك اختيار تبويب (الكل) لعرض كافة البطاقات أو رفع ملف PDF جديد لإعادة بناء الحزمة.';
            }

            counterElement.textContent = '0 / 0';
            progressBar.style.width = '0%';
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            flipBtn.disabled = true;
            if (shuffleBtn) shuffleBtn.disabled = true;
            if (autoPlayBtn) autoPlayBtn.disabled = true;
            if (deleteCardBtn) deleteCardBtn.disabled = true;
            favIcon.textContent = '☆';
            return;
        }

        // إظهار مشهد البطاقة وإخفاء واجهة السلايد الفارغ
        if (emptySlideContainer) emptySlideContainer.style.display = 'none';
        if (sceneContainer) sceneContainer.style.display = 'block';

        prevBtn.disabled = false;
        nextBtn.disabled = false;
        flipBtn.disabled = false;
        if (shuffleBtn) shuffleBtn.disabled = false;
        if (autoPlayBtn) autoPlayBtn.disabled = false;
        if (deleteCardBtn) deleteCardBtn.disabled = false;

        const card = currentDeck[currentIndex];
        frontCategory.textContent = card.category || 'عام';
        backCategory.textContent = card.category || 'عام';
        frontText.textContent = card.question;
        backText.textContent = card.answer;

        favIcon.textContent = card.favorite ? '★' : '☆';
        favIcon.style.color = card.favorite ? '#f59e0b' : '#94a3b8';

        counterElement.textContent = `${currentIndex + 1} / ${currentDeck.length}`;
        const progressVal = ((currentIndex + 1) / currentDeck.length) * 100;
        progressBar.style.width = `${progressVal}%`;

        // رندر معادلات MathJax
        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([frontText, backText]).catch(() => {});
        }
    }

    function toggleFlip() {
        if (currentDeck.length === 0) return;
        isFlipped = !isFlipped;
        cardElement.classList.toggle('flipped', isFlipped);
        playFlipSound();
    }

    function goToNextCard() {
        if (currentDeck.length === 0) return;
        currentIndex = (currentIndex + 1) % currentDeck.length;
        playFlipSound();
        displayCurrentCard();
    }

    function goToPrevCard() {
        if (currentDeck.length === 0) return;
        currentIndex = (currentIndex - 1 + currentDeck.length) % currentDeck.length;
        playFlipSound();
        displayCurrentCard();
    }

    // =========================================================================
    // التفاعل مع لوحة المفاتيح والأزرار
    // =========================================================================
    cardElement.addEventListener('click', (e) => {
        // منع القلب عند الضغط على أزرار التقييم أو النجمة
        if (e.target.closest('.assess-btn') || e.target.closest('.fav-toggle-btn')) {
            return;
        }
        toggleFlip();
    });

    flipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFlip();
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToNextCard();
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToPrevCard();
    });

    favToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentDeck.length === 0) return;
        const card = currentDeck[currentIndex];
        const isFav = window.CardStore.toggleFavorite(card.id);
        card.favorite = isFav;
        favIcon.textContent = isFav ? '★' : '☆';
        favIcon.style.color = isFav ? '#f59e0b' : '#94a3b8';
        showToast(isFav ? 'تمت الإضافة للمفضلة ⭐' : 'تمت الإزالة من المفضلة');
        refreshDeck(true);
    });

    markMasterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentDeck.length === 0) return;
        const card = currentDeck[currentIndex];
        window.CardStore.updateCard(card.id, {
            question: card.question,
            answer: card.answer,
            category: card.category
        });
        const allCards = window.CardStore.getAllCards();
        const target = allCards.find(c => c.id === card.id);
        if (target) {
            target.mastered = true;
            window.CardStore.saveCards(allCards);
        }
        playSuccessSound();
        showToast('رائع! تم تحديد البطاقة كـ "متقنة" ✅');
        refreshDeck(true);
        setTimeout(() => goToNextCard(), 350);
    });

    markReviewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentDeck.length === 0) return;
        const card = currentDeck[currentIndex];
        const allCards = window.CardStore.getAllCards();
        const target = allCards.find(c => c.id === card.id);
        if (target) {
            target.mastered = false;
            window.CardStore.saveCards(allCards);
        }
        showToast('تم إدراج البطاقة في قائمة المراجعة 🔄');
        refreshDeck(true);
        setTimeout(() => goToNextCard(), 350);
    });

    // تبديل التبويبات (الفلترة)
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeFilter = tab.dataset.filter;
            currentIndex = 0;
            refreshDeck();
        });
    });

    // خلط عشوائي (Shuffle)
    shuffleBtn.addEventListener('click', () => {
        if (currentDeck.length <= 1) return;
        // خوارزمية Fisher-Yates
        for (let i = currentDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
        }
        currentIndex = 0;
        playFlipSound();
        displayCurrentCard();
        showToast('تم خلط ترتيب البطاقات عشوائياً 🔀');
    });

    // العرض التلقائي (Auto-play)
    autoPlayBtn.addEventListener('click', () => {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
            autoPlayIcon.textContent = '▶️';
            autoPlayText.textContent = 'عرض تلقائي';
            autoPlayBtn.style.color = '';
            showToast('تم إيقاف العرض التلقائي');
        } else {
            autoPlayIcon.textContent = '⏸️';
            autoPlayText.textContent = 'إيقاف';
            autoPlayBtn.style.color = '#60a5fa';
            showToast('تم تفعيل العرض التلقائي (كل 6 ثوانٍ)');
            autoPlayInterval = setInterval(() => {
                if (!isFlipped) {
                    toggleFlip();
                } else {
                    goToNextCard();
                }
            }, 6000);
        }
    });

    // تبديل الصوت
    soundToggleBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
        showToast(soundEnabled ? 'تم تشغيل المؤثرات الصوتية' : 'تم كتم الصوت');
    });

    // وضع ملء الشاشة
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    });

    // حذف البطاقة الحالية
    deleteCardBtn.addEventListener('click', () => {
        if (currentDeck.length === 0) return;
        const card = currentDeck[currentIndex];
        const confirmDelete = window.confirm(`هل أنت متأكد من رغبتك في حذف بطاقة:\n"${card.question.slice(0, 40)}..."؟`);
        if (confirmDelete) {
            window.CardStore.deleteCard(card.id);
            showToast('تم حذف البطاقة بنجاح 🗑️');
            refreshDeck();
        }
    });

    // اختصارات لوحة المفاتيح
    document.addEventListener('keydown', (e) => {
        // تجاهل الاختصارات داخل حقول الإدخال
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
            return;
        }

        if (e.code === 'Space') {
            e.preventDefault();
            toggleFlip();
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            goToNextCard();
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            goToPrevCard();
        } else if (e.key === 'm' || e.key === 'M' || e.key === 'ة') {
            markMasterBtn.click();
        } else if (e.key === 's' || e.key === 'S' || e.key === 'س') {
            shuffleBtn.click();
        } else if (e.key === 'f' || e.key === 'F' || e.key === 'ب') {
            fullscreenBtn.click();
        }
    });

    // =========================================================================
    // إدارة نافذة إضافة وتعديل البطاقات
    // =========================================================================
    function openModalForAdd() {
        modalTitle.textContent = '➕ إضافة بطاقة جديدة';
        editCardId.value = '';
        cardCategoryInput.value = 'علوم حاسب / أمن سيبراني';
        cardQuestionInput.value = '';
        cardAnswerInput.value = '';
        liveMathPreview.textContent = 'اكتب بالصندوق لمشاهدة المعاينة...';
        cardModal.classList.add('active');
        cardQuestionInput.focus();
    }

    function openModalForEdit() {
        if (currentDeck.length === 0) {
            showToast('لا توجد بطاقة محددة للتعديل');
            return;
        }
        const card = currentDeck[currentIndex];
        modalTitle.textContent = '✏️ تعديل البطاقة الحالية';
        editCardId.value = card.id;
        cardCategoryInput.value = card.category || 'رياضيات متقطعة';
        cardQuestionInput.value = card.question;
        cardAnswerInput.value = card.answer;
        updateLiveMathPreview();
        cardModal.classList.add('active');
        cardQuestionInput.focus();
    }

    function updateLiveMathPreview() {
        const q = cardQuestionInput.value.trim();
        const a = cardAnswerInput.value.trim();
        if (!q && !a) {
            liveMathPreview.textContent = 'اكتب بالصندوق لمشاهدة المعاينة...';
            return;
        }
        liveMathPreview.innerHTML = `<strong>السؤال:</strong> ${escapeHtml(q)}<br><br><strong>الإجابة:</strong> ${escapeHtml(a)}`;
        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([liveMathPreview]).catch(() => {});
        }
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    openAddCardBtn.addEventListener('click', openModalForAdd);
    openEditCardBtn.addEventListener('click', openModalForEdit);

    [closeCardModalBtn, cancelCardModalBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            cardModal.classList.remove('active');
        });
    });

    cardQuestionInput.addEventListener('input', updateLiveMathPreview);
    cardAnswerInput.addEventListener('input', updateLiveMathPreview);
    refreshMathPreview.addEventListener('click', updateLiveMathPreview);

    cardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = editCardId.value;
        const category = cardCategoryInput.value.trim();
        const question = cardQuestionInput.value.trim();
        const answer = cardAnswerInput.value.trim();

        if (!question || !answer) {
            showToast('يرجى ملء حقلي السؤال والإجابة');
            return;
        }

        if (id) {
            window.CardStore.updateCard(id, { category, question, answer });
            showToast('تم حفظ التعديلات بنجاح ✨');
        } else {
            const newCard = window.CardStore.addCard({ category, question, answer });
            showToast('تمت إضافة البطاقة الجديدة بنجاح ➕');
        }

        cardModal.classList.remove('active');
        refreshDeck(true);
    });

    // =========================================================================
    // إدارة الحزمة: تصدير واستيراد وضبط المصنع
    // =========================================================================
    manageDeckBtn.addEventListener('click', () => {
        const all = window.CardStore.getAllCards();
        dTotalCount.textContent = all.length;
        dMasteredCount.textContent = all.filter(c => c.mastered).length;
        dReviewCount.textContent = all.filter(c => !c.mastered).length;
        deckModal.classList.add('active');
    });

    closeDeckModalBtn.addEventListener('click', () => {
        deckModal.classList.remove('active');
    });

    exportCardsBtn.addEventListener('click', () => {
        const all = window.CardStore.getAllCards();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(all, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `flashmind-cards-${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('تم تصدير ملف البطاقات بنجاح 📥');
    });

    importJsonInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const parsed = JSON.parse(evt.target.result);
                const res = window.CardStore.importCards(parsed);
                if (res) {
                    showToast('تم استيراد البطاقات ودمجها بنجاح 📤');
                    deckModal.classList.remove('active');
                    refreshDeck();
                } else {
                    showToast('الملف غير متوافق أو لا يحتوي بطاقات صحيحة');
                }
            } catch (err) {
                showToast('خطأ في قراءة ملف JSON');
            }
        };
        reader.readAsText(file);
    });

    resetDefaultsBtn.addEventListener('click', () => {
        if (window.confirm('هل تريد بالتأكيد استعادة الحزمة الافتراضية النموذجية (علوم حاسب وأمن سيبراني)؟')) {
            window.CardStore.resetToDefault();
            showToast('تمت استعادة البطاقات الافتراضية بنجاح 🔄');
            deckModal.classList.remove('active');
            refreshDeck();
        }
    });

    // =========================================================================
    // نافذة وكيل الذكاء الاصطناعي لتحليل وتلخيص الـ PDF (FLASHMIND-CORE Agent)
    // =========================================================================
    let selectedPdfFile = null;
    let currentAiResult = null;
    let timerInterval = null;
    let timerSeconds = 0;

    function resetAiWorkflow() {
        selectedPdfFile = null;
        currentAiResult = null;
        if (timerInterval) clearInterval(timerInterval);
        timerSeconds = 0;
        pdfFileInput.value = '';
        selectedPdfInfo.style.display = 'none';
        aiDropzone.querySelector('.dropzone-text').style.display = 'block';
        aiDropzone.classList.remove('dragover');
        switchAiView('upload');
        resetStepper();
    }

    function switchAiView(viewName) {
        aiUploadView.style.display = viewName === 'upload' ? 'flex' : 'none';
        aiLoadingView.style.display = viewName === 'loading' ? 'flex' : 'none';
        aiResultsView.style.display = viewName === 'results' ? 'flex' : 'none';
        aiErrorView.style.display = viewName === 'error' ? 'flex' : 'none';
    }

    function resetStepper() {
        [stepRead, stepAgent, stepExtract, stepRender].forEach(step => {
            if (step) {
                step.classList.remove('active', 'done');
                const status = step.querySelector('.step-status');
                if (status) status.textContent = '⏳';
            }
        });
        if (aiElapsedTimer) {
            aiElapsedTimer.textContent = '⏱️ الوقت المنقضي: 00:00';
        }
    }

    function setStepState(stepElement, state) {
        if (!stepElement) return;
        stepElement.classList.remove('active', 'done');
        const status = stepElement.querySelector('.step-status');
        if (state === 'active') {
            stepElement.classList.add('active');
            if (status) status.textContent = '⚡';
        } else if (state === 'done') {
            stepElement.classList.add('done');
            if (status) status.textContent = '✅';
        } else {
            if (status) status.textContent = '⏳';
        }
    }

    function handleSelectedPdf(file) {
        if (!file) return;
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            showToast('يرجى اختيار ملف بصيغة PDF فقط (.pdf)');
            return;
        }

        selectedPdfFile = file;
        selectedPdfName.textContent = file.name;
        selectedPdfSize.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        selectedPdfInfo.style.display = 'inline-flex';
        aiDropzone.querySelector('.dropzone-text').style.display = 'none';
        showToast(`تم اختيار الملف: ${file.name}`);
    }

    function clearSelectedPdf() {
        selectedPdfFile = null;
        pdfFileInput.value = '';
        selectedPdfInfo.style.display = 'none';
        aiDropzone.querySelector('.dropzone-text').style.display = 'block';
    }

    function openPdfModal() {
        aiModal.classList.add('active');
        if (!selectedPdfFile && !currentAiResult) {
            switchAiView('upload');
        }
    }

    if (openAiModalBtn) {
        openAiModalBtn.addEventListener('click', openPdfModal);
    }
    if (emptySlidePdfBtn) {
        emptySlidePdfBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openPdfModal();
        });
    }
    if (emptySlideIconTrigger) {
        emptySlideIconTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            openPdfModal();
        });
    }
    if (emptySlideCard) {
        emptySlideCard.addEventListener('click', (e) => {
            if (e.target.closest('#emptySlidePdfBtn') || e.target.closest('#emptySlideIconTrigger')) return;
            openPdfModal();
        });
    }

    closeAiModalBtn.addEventListener('click', () => {
        aiModal.classList.remove('active');
    });

    aiDropzone.addEventListener('click', (e) => {
        if (e.target.closest('#removePdfBtn')) return;
        pdfFileInput.click();
    });

    removePdfBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearSelectedPdf();
    });

    aiDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        aiDropzone.classList.add('dragover');
    });

    aiDropzone.addEventListener('dragleave', () => {
        aiDropzone.classList.remove('dragover');
    });

    aiDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        aiDropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleSelectedPdf(e.dataTransfer.files[0]);
        }
    });

    pdfFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleSelectedPdf(e.target.files[0]);
        }
    });

    // بدء التحليل والاستخراج الفعلي من الملف عبر الذكاء الاصطناعي
    startAiAnalysisBtn.addEventListener('click', async () => {
        if (!selectedPdfFile) {
            showToast('يرجى اختيار ملف PDF أولاً لبدء التحليل');
            return;
        }

        switchAiView('loading');
        resetStepper();
        setStepState(stepRead, 'active');

        // مؤقت الوقت المنقضي
        timerSeconds = 0;
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timerSeconds++;
            const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
            const secs = String(timerSeconds % 60).padStart(2, '0');
            if (aiElapsedTimer) {
                aiElapsedTimer.textContent = `⏱️ الوقت المنقضي: ${mins}:${secs}`;
            }

            // محاكاة بصرية لتدرج الخطوات أثناء انتظار استجابة الخادم
            if (timerSeconds === 3) {
                setStepState(stepRead, 'done');
                setStepState(stepAgent, 'active');
            } else if (timerSeconds === 7) {
                setStepState(stepAgent, 'done');
                setStepState(stepExtract, 'active');
            }
        }, 1000);

        try {
            // قراءة الملف بصيغة Base64
            const reader = new FileReader();
            const fileDataPromise = new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('تعذر قراءة ملف الـ PDF من جهازك.'));
            });
            reader.readAsDataURL(selectedPdfFile);

            const base64Data = await fileDataPromise;

            setStepState(stepRead, 'done');
            setStepState(stepAgent, 'active');

            const payload = {
                pdfBase64: base64Data,
                fileName: selectedPdfFile.name,
                cardCount: parseInt(aiCardCount.value, 10) || 10,
                difficulty: aiDifficulty.value || 'academic',
                customNotes: aiCustomNotes ? aiCustomNotes.value.trim() : ''
            };

            const response = await fetch('/api/summarize-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (timerInterval) clearInterval(timerInterval);

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'حدث خطأ غير متوقع أثناء معالجة المستند عبر الخادم.');
            }

            setStepState(stepExtract, 'done');
            setStepState(stepRender, 'active');

            currentAiResult = result;
            renderAiResults(result);

            setStepState(stepRender, 'done');
            switchAiView('results');
            playMasterySound();
            showToast(`تم استخراج ${result.cards.length} بطاقة وملخص تنفيذي بنجاح! ✨`);

        } catch (err) {
            console.error('AI PDF Processing Error:', err);
            if (timerInterval) clearInterval(timerInterval);
            aiErrorTitle.textContent = 'تعذر استكمال تحليل الـ PDF';
            aiErrorMessage.textContent = err.message || 'حدث خطأ أثناء التواصل مع نموذج الذكاء الاصطناعي.';
            switchAiView('error');
        }
    });

    function renderAiResults(data) {
        resultsDocTitle.textContent = `الملخص التنفيذي لمستند: ${data.fileName || 'ملف PDF'}`;
        resultsSummaryText.textContent = data.summary || 'تم تحليل المستند واستخراج المفاهيم والأسئلة بنجاح.';
        resultsCardsCountBadge.textContent = `${data.cards ? data.cards.length : 0} بطاقة مستخلصة`;

        // عرض المحاور والوسوم
        resultsTopicsList.innerHTML = '';
        if (data.topicsCovered && Array.isArray(data.topicsCovered) && data.topicsCovered.length > 0) {
            data.topicsCovered.forEach(topic => {
                const pill = document.createElement('span');
                pill.className = 'doc-topic-pill';
                pill.textContent = `🏷️ ${topic}`;
                resultsTopicsList.appendChild(pill);
            });
            resultsTopicsList.parentElement.style.display = 'flex';
        } else {
            resultsTopicsList.parentElement.style.display = 'none';
        }

        // عرض قائمة البطاقات الناتجة
        generatedCardsList.innerHTML = '';
        if (data.cards && Array.isArray(data.cards)) {
            data.cards.forEach((card, index) => {
                const cardEl = document.createElement('div');
                cardEl.className = 'gen-card-item';
                cardEl.innerHTML = `
                    <div class="gen-card-meta">
                        <span class="gen-card-cat">${escapeHtml(card.category || 'عام')}</span>
                        <span class="gen-card-idx">بطاقة #${index + 1}</span>
                    </div>
                    <div class="gen-card-q">${escapeHtml(card.question)}</div>
                    <div class="gen-card-a">${escapeHtml(card.answer)}</div>
                `;
                generatedCardsList.appendChild(cardEl);
            });
        }

        // تصيير معادلات MathJax
        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([resultsSummaryText, generatedCardsList]).catch(() => {});
        }
    }

    // إجراء أساسي: اعتماد بطاقات هذا الملف فقط، حذف البطاقات السابقة والبدء فوراً
    applyAndStudyBtn.addEventListener('click', () => {
        if (!currentAiResult || !currentAiResult.cards || currentAiResult.cards.length === 0) {
            showToast('لا توجد بطاقات لإضافتها');
            return;
        }

        // استبدال البطاقات السابقة بالكامل ببطاقات الملف الجديد فقط
        window.CardStore.replaceCards(currentAiResult.cards);
        
        activeFilter = 'all';
        filterTabs.forEach(t => {
            t.classList.toggle('active', t.dataset.filter === 'all');
        });

        currentIndex = 0;
        refreshDeck(true);
        displayCurrentCard();

        aiModal.classList.remove('active');
        playMasterySound();
        showToast(`تم حذف البطاقات السابقة واعتماد ${currentAiResult.cards.length} بطاقة من هذا الملف فقط! 🎯`);
    });

    // إجراء اختياري: دمج بطاقات الملف مع البطاقات السابقة
    replaceAndStudyBtn.addEventListener('click', () => {
        if (!currentAiResult || !currentAiResult.cards || currentAiResult.cards.length === 0) {
            showToast('لا توجد بطاقات لدمجها');
            return;
        }

        const countBefore = window.CardStore.getAllCards().length;
        window.CardStore.importCards(currentAiResult.cards);
        activeFilter = 'all';
        filterTabs.forEach(t => {
            t.classList.toggle('active', t.dataset.filter === 'all');
        });
        currentIndex = Math.min(countBefore, window.CardStore.getAllCards().length - 1);
        refreshDeck(true);
        aiModal.classList.remove('active');
        playMasterySound();
        showToast(`تم دمج بطاقات الملف مع مجموعتك السابقة بنجاح! ➕`);
    });

    // إجراء: تصدير حزمة الـ PDF بصيغة JSON
    exportAiCardsJsonBtn.addEventListener('click', () => {
        if (!currentAiResult || !currentAiResult.cards) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentAiResult.cards, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `flashmind-pdf-cards-${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('تم حفظ حزمة البطاقات كملف JSON 📥');
    });

    // تحليل ملف آخر
    analyzeAnotherPdfBtn.addEventListener('click', () => {
        resetAiWorkflow();
    });

    aiRetryBtn.addEventListener('click', () => {
        if (selectedPdfFile) {
            startAiAnalysisBtn.click();
        } else {
            switchAiView('upload');
        }
    });

    // إغلاق المودال عند النقر على الخلفية
    [cardModal, deckModal, aiModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // =========================================================================
    // إدارة تثبيت التطبيق على الهاتف (PWA Engine)
    // =========================================================================
    let deferredPwaPrompt = null;
    const pwaInstallBtn = document.getElementById('pwaInstallBtn');
    const pwaModal = document.getElementById('pwaModal');
    const closePwaModalBtn = document.getElementById('closePwaModalBtn');
    const dismissPwaModalBtn = document.getElementById('dismissPwaModalBtn');
    const pwaTriggerInstallBtn = document.getElementById('pwaTriggerInstallBtn');
    const pwaDirectInstallBox = document.getElementById('pwaDirectInstallBox');
    const pwaIosGuide = document.getElementById('pwaIosGuide');

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator.standalone === true);

    const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

    // إذا كان التطبيق مثبتاً بالفعل ويعمل كـ Standalone يتم إخفاء زر التثبيت
    if (isStandalone && pwaInstallBtn) {
        pwaInstallBtn.style.display = 'none';
    }

    // التقاط حدث التثبيت التلقائي من المتصفح (Chrome / Android)
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPwaPrompt = e;
        if (pwaInstallBtn && !isStandalone) {
            pwaInstallBtn.style.display = 'inline-flex';
        }
    });

    window.addEventListener('appinstalled', () => {
        deferredPwaPrompt = null;
        if (pwaInstallBtn) pwaInstallBtn.style.display = 'none';
        if (pwaModal) pwaModal.classList.remove('active');
        showToast('🎉 رائع! تم تثبيت تطبيق فلاش مايند على جهازك بنجاح.');
    });

    function openPwaModal() {
        if (!pwaModal) return;

        // مواءمة الواجهة حسب نوع الجهاز
        if (isIos) {
            if (pwaDirectInstallBox) pwaDirectInstallBox.style.display = 'none';
            if (pwaIosGuide) pwaIosGuide.style.display = 'block';
        } else {
            if (pwaDirectInstallBox) pwaDirectInstallBox.style.display = 'block';
            if (pwaIosGuide) pwaIosGuide.style.display = 'none';
        }

        pwaModal.classList.add('active');
    }

    if (pwaInstallBtn) {
        pwaInstallBtn.addEventListener('click', () => {
            if (deferredPwaPrompt && !isIos) {
                // تفعيل التثبيت المباشر
                triggerNativeInstall();
            } else {
                // فتح نافذة الإرشادات والتثبيت
                openPwaModal();
            }
        });
    }

    async function triggerNativeInstall() {
        if (!deferredPwaPrompt) {
            openPwaModal();
            return;
        }
        deferredPwaPrompt.prompt();
        const choice = await deferredPwaPrompt.userChoice;
        if (choice.outcome === 'accepted') {
            if (pwaModal) pwaModal.classList.remove('active');
            if (pwaInstallBtn) pwaInstallBtn.style.display = 'none';
            showToast('جاري تثبيت التطبيق على جهازك...');
        }
        deferredPwaPrompt = null;
    }

    if (pwaTriggerInstallBtn) {
        pwaTriggerInstallBtn.addEventListener('click', triggerNativeInstall);
    }

    if (closePwaModalBtn) {
        closePwaModalBtn.addEventListener('click', () => {
            pwaModal.classList.remove('active');
        });
    }

    if (dismissPwaModalBtn) {
        dismissPwaModalBtn.addEventListener('click', () => {
            pwaModal.classList.remove('active');
        });
    }

    // =========================================================================
    // إشعار Toast
    // =========================================================================
    let toastTimeout = null;
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2600);
    }

    // تشغيل التطبيق في البداية
    refreshDeck();

})();
