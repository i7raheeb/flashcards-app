/**
 * FLASHMIND-CORE: نظام إدارة البطاقات الذكية
 * تبدأ البطاقات فارغة بانتظار رفع ملف PDF وتلخيصه بالذكاء الاصطناعي
 */

const DEFAULT_CARDS = [];

// وحدة إدارة البطاقات مع التخزين
window.CardStore = {
    STORAGE_KEY: 'flashmind_cards_v2',

    getAllCards: function() {
        try {
            // تنظيف أي بطاقات قديمة تجريبية من الإصدار السابق إذا وُجدت
            if (localStorage.getItem('flashmind_cards_v1')) {
                localStorage.removeItem('flashmind_cards_v1');
            }
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved !== null) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Error loading cards from storage', e);
        }
        // فارغة افتراضياً حتى يضيف المستخدم ملف PDF ويتم تلخيصه
        return [];
    },

    saveCards: function(cardsList) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cardsList));
        } catch (e) {
            console.error('Error saving cards', e);
        }
    },

    addCard: function(cardData) {
        const list = this.getAllCards();
        const newCard = {
            id: 'c-' + Date.now(),
            category: cardData.category || 'عام',
            question: cardData.question.trim(),
            answer: cardData.answer.trim(),
            mastered: false,
            favorite: false
        };
        list.push(newCard);
        this.saveCards(list);
        return newCard;
    },

    updateCard: function(id, updatedData) {
        const list = this.getAllCards();
        const index = list.findIndex(c => c.id === id);
        if (index !== -1) {
            list[index] = {
                ...list[index],
                question: updatedData.question.trim(),
                answer: updatedData.answer.trim(),
                category: updatedData.category ? updatedData.category.trim() : list[index].category
            };
            this.saveCards(list);
            return list[index];
        }
        return null;
    },

    deleteCard: function(id) {
        let list = this.getAllCards();
        list = list.filter(c => c.id !== id);
        this.saveCards(list);
        return list;
    },

    toggleMastery: function(id) {
        const list = this.getAllCards();
        const card = list.find(c => c.id === id);
        if (card) {
            card.mastered = !card.mastered;
            this.saveCards(list);
            return card.mastered;
        }
        return false;
    },

    toggleFavorite: function(id) {
        const list = this.getAllCards();
        const card = list.find(c => c.id === id);
        if (card) {
            card.favorite = !card.favorite;
            this.saveCards(list);
            return card.favorite;
        }
        return false;
    },

    resetToDefault: function() {
        this.saveCards(DEFAULT_CARDS);
        return [...DEFAULT_CARDS];
    },

    importCards: function(newCardsArray) {
        if (!Array.isArray(newCardsArray)) return false;
        const formatted = newCardsArray.map((c, i) => ({
            id: 'c-' + Date.now() + '-' + i,
            category: c.category || 'مستورد',
            question: c.question || c.front || '',
            answer: c.answer || c.back || '',
            mastered: false,
            favorite: false
        })).filter(c => c.question && c.answer);

        if (formatted.length === 0) return false;

        const current = this.getAllCards();
        const merged = [...current, ...formatted];
        this.saveCards(merged);
        return merged;
    },

    replaceCards: function(newCardsArray) {
        if (!Array.isArray(newCardsArray)) return false;
        const formatted = newCardsArray.map((c, i) => ({
            id: 'c-' + Date.now() + '-' + i,
            category: c.category || 'ملخص PDF',
            question: c.question || c.front || '',
            answer: c.answer || c.back || '',
            mastered: false,
            favorite: false
        })).filter(c => c.question && c.answer);

        if (formatted.length === 0) return false;

        this.saveCards(formatted);
        return formatted;
    }
};

// للتوافق مع الملفات القديمة إن وجدت
window.cards = window.CardStore.getAllCards();
