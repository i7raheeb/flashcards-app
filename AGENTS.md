# Project Memory: FlashMind Core (رمز المشروع: FLASHMIND-CORE / نبراس)

## 📌 Project Identity & Codename
- **Project Name:** FlashMind (اختبار تحليلي | منصة البطاقات الذكية)
- **Codename / الاسم الرمزي في الذاكرة:** `FLASHMIND-CORE` (أو **نبراس / NEBRAS**)
- **Owner:** raheebnour1@gmail.com
- **Core Mission:** منصة تفاعلية متطورة وفخمة للمذاكرة والبطاقات التعليمية (Flashcards) تدعم المعادلات الرياضية (MathJax)، التقييم الذاتي، وتخصيص البطاقات وإدارتها.

---

## 🚀 Architectural Roadmap & Future Integrations
- **Next Planned Milestone (المرحلة القادمة المطلوبة):**
  - **AI PDF Summarizer & Cards Generator Agent (وكيل تلخيص ملفات الـ PDF بالذكاء الاصطناعي):**
    - تمكين المستخدم من رفع ملفات PDF أو مستندات دراسية.
    - استدعاء API الذكاء الاصطناعي (Gemini API) لتحليل النص وتلخيصه تلقائياً إلى حزم بطاقات ذكية (أسئلة وأجوبة ومعادلات).
    - تغذية البطاقات المولدة مباشرة في محرك التطبيق وحفظها محلياً وسحابياً.

---

## 🛠️ Tech Stack & Key Conventions
- **Frontend:** Vanilla HTML5, Modern CSS3 with high-end glassmorphism & deep slate theme, Vanilla JS with modular structure.
- **Formulas Engine:** MathJax v3 (TeX / LaTeX / MathML) for discrete math and scientific equations.
- **Persistence:** LocalStorage with instant sync, JSON export/import capability.
- **Server:** Node.js Express static server on port 3000 (`0.0.0.0:3000`).
- **Interactive Features:** Web Audio API sound synthesis (flip / mastery sounds), keyboard shortcuts, Spaced Repetition (Mastered vs Needs Review), Search & Filter, Shuffle, Auto-play, Fullscreen.
