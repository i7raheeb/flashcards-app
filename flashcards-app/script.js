let currentIndex = 0;

const cardElement = document.getElementById('card');
const counterElement = document.getElementById('counter');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const frontText = document.getElementById('frontText');
const backText = document.getElementById('backText');

function displayCard() {
    if (!cards || cards.length === 0) return;

    // إلغاء الفلب أولاً عند الانتقال
    cardElement.classList.remove('flipped');

    setTimeout(() => {
        const card = cards[currentIndex];
        frontText.innerText = card.question;
        backText.innerText = card.answer;
        counterElement.textContent = `${currentIndex + 1} / ${cards.length}`;

        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([frontText, backText]).catch(() => {});
        }
    }, 150);
}

// قلب البطاقة عند الضغط عليها
cardElement.addEventListener('click', (e) => {
    e.preventDefault();
    cardElement.classList.toggle('flipped');
});

// الأزرار
prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    displayCard();
});

nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % cards.length;
    displayCard();
});

// اختصارات الكيبورد
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        cardElement.classList.toggle('flipped');
    } else if (e.code === 'ArrowLeft') {
        nextBtn.click();
    } else if (e.code === 'ArrowRight') {
        prevBtn.click();
    }
});

displayCard();