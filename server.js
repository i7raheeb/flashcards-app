import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Support large PDF payloads up to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const staticDir = path.join(__dirname, 'flashcards-app');

// Lazy initialization of Gemini Client
let aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('مفتاح GEMINI_API_KEY غير متوفر في متغيرات البيئة. يرجى التأكد من إضافته في إعدادات المنصة.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// قائمة النماذج المرشحة مع تقديم النماذج الخفيفة والمستقرة لتفادي 503
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash'
];

// دالة مساعدة لتوليد المحتوى مع محاولة متكررة ونماذج بديلة عند حدوث 503 High Demand
async function generateWithFallback(ai, requestConfig) {
  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      console.log(`[FLASHMIND-CORE AI] جاري محاولة التحليل عبر النموذج: ${model}`);
      const response = await ai.models.generateContent({
        ...requestConfig,
        model
      });
      console.log(`[FLASHMIND-CORE AI] نجح التحليل بالنموذج: ${model}`);
      return { response, usedModel: model };
    } catch (err) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[FLASHMIND-CORE AI] تعذر الاستجابة مع ${model}: ${errMsg}`);
      // الانتقال فوراً وبسرعة للنموذج التالي في القائمة دون إبطاء تجربة المستخدم
    }
  }

  throw lastError;
}

// نقطة فحص حالة وكيل الذكاء الاصطناعي والمعمارية
app.get('/api/agent-status', (req, res) => {
  res.json({
    codename: 'FLASHMIND-CORE',
    arabicAlias: 'نبراس',
    version: '3.1.0',
    status: 'active',
    features: [
      'flashcards-interactive-3d',
      'mathjax-discrete-mathematics',
      'spaced-repetition-mastery',
      'dynamic-crud-management',
      'json-import-export',
      'web-audio-synthesis',
      'ai-pdf-summarizer-active',
      'multi-model-fallback-resilience'
    ],
    aiModule: {
      primaryModel: 'gemini-3.1-flash-lite',
      fallbackModels: CANDIDATE_MODELS,
      capabilities: 'Direct PDF parsing, executive summarization, resilient fallback against 503 spikes, and strict grounding flashcards generator'
    }
  });
});

// نقطة تحليل ملف الـ PDF وتوليد البطاقات والملخص حصرياً من الملف
app.post('/api/summarize-pdf', async (req, res) => {
  try {
    const { pdfBase64, fileName, cardCount = 10, difficulty = 'academic', customNotes = '' } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ 
        success: false, 
        error: 'لم يتم استلام محتوى ملف الـ PDF. يرجى اختيار ملف صالح.' 
      });
    }

    // تنظيف بادئة base64 إن وجدت
    const cleanBase64 = pdfBase64.replace(/^data:[^;]+;base64,/, '');

    const ai = getGeminiClient();

    const targetCards = Math.min(Math.max(parseInt(cardCount, 10) || 10, 5), 35);

    const difficultyInstruction = {
      academic: 'صغ الأسئلة والأجوبة بمستوى أكاديمي تحليلي دقيق، مع التركيز على المفاهيم الجوهرية، والتعريفات، وآليات العمل، مع إبراز أي مصطلحات تقنية أو أوامر أو معادلات علمية إذا وردت في الملف فقط.',
      simplified: 'صغ الأسئلة والأجوبة بأسلوب مبسط ومباشر يسهل حفظه واستيعابه سريعاً مع الحفاظ على الدقة العلمية للملف.',
      qa: 'ركز على نمط أسئلة الاختبارات الذكية والمباشرة (مفاهيم، سيناريوهات، مقارنات) مع إجابات نموذجية حاسمة وشاملة.'
    }[difficulty] || 'صغ الأسئلة والأجوبة بمستوى أكاديمي تحليلي متقن ومفصل مستنداً للملف.';

    const systemPrompt = `أنت خبير أكاديمي وباحث متخصص في تحليل وتلخيص المستندات التعليمية والتقنية (علوم حاسب، أمن سيبراني، شبكات، برمجة، ذكاء اصطناعي، وغيرها من التخصصات الجامعية والمهنية)، وتحويلها إلى حزم بطاقات ذكية (Flashcards) فائقة الدقة.

المهمة المطلوبة:
حلل ملف الـ PDF المرفق بدقة متناهية، ولخصه، ثم استخرج منه حصرياً ومباشرة مجموعة مكونة من حوالي ${targetCards} بطاقة تعليمية (سؤال وإجابة نموذجية).

الضوابط والقيود الصارمة (Grounding & Zero Hallucination):
1. **الاستناد الحصري الصارم للملف فقط**: كل سؤال، وكل معلومة، وكل إجابة يجب أن تكون مستخرجة نصاً أو مفهوماً حصرياً من ملف الـ PDF المرفق. يُمنع منعاً باتاً استدعاء أي معلومات خارجية أو افتراضات أو أمثلة لم ترد صراحة في هذا المستند.
2. **عدم فرض الرياضيات أو أي تخصص محدد**: يتعامل النظام مع كافة التخصصات والعلوم (أمن سيبراني، علوم كمبيوتر، شبكات، نظم تشغيل، ذكاء اصطناعي، قواعد بيانات، إلخ). لا تفرض أي معادلات أو مواضيع رياضية إلا إذا كان محتوى الملف الأصلي نفسه يتناول ذلك.
3. **اللغة والأسلوب**: اكتب باللغة العربية الفصحى الواضحة والدقيقة، مع الحفاظ على المصطلحات التقنية والإنجليزية كما هي بين قوسين أو كما وردت في المستند (مثال: Ransomware, Encryption, Buffer Overflow, SQL Injection, إلخ).
4. **التنسيق الرياضي والعلمي إن وجد في الملف**: إذا صادفت معادلات رياضية أو منطقية في الملف فقط، صغها بصيغة LaTeX القياسية ($...$ أو $$...$$)، أما الشروحات التقنية والنصوص العادية فصغها بأسلوب نصوص وتعداد نقطي واضح.
5. **مستوى التخصيص**: ${difficultyInstruction}
6. **تنسيق كل بطاقة**:
   - category: اسم المحور أو الفصل أو المفهوم الدقيق المستخرج مباشرة من الملف (مثال: أمن الشبكات، التشفير، هندسة البرمجيات، إلخ).
   - question: سؤال امتحاني أو استذكاري ذكي ومحدد ومصاغ باحترافية من صلب الملف.
   - answer: إجابة نموذجية شاملة ومفصلة تشرح المفهوم بوضوح وفق ما ورد في الملف دون زيادة أو نقصان.
${customNotes ? `7. متطلبات إضافية من المستخدم: ${customNotes}` : ''}`;

    const requestConfig = {
      contents: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: cleanBase64
          }
        },
        `حلل ملف الـ PDF المرفق بعناية، ولخص محتواه، واستخرج منه حصرياً ${targetCards} بطاقة تعليمية ذكية بصيغة JSON وفقاً للتعليمات.`
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'ملخص تحليلي وتنفيذي وافٍ وشامل لمحتوى ملف الـ PDF المرفق'
            },
            topicsCovered: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'قائمة بأهم المحاور والمفاهيم الرئيسية التي يتناولها الملف'
            },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: {
                    type: Type.STRING,
                    description: 'الموضوع أو التصنيف الفرعي المأخوذ من الملف'
                  },
                  question: {
                    type: Type.STRING,
                    description: 'سؤال محكم ومستخلص حصرياً من الملف'
                  },
                  answer: {
                    type: Type.STRING,
                    description: 'إجابة نموذجية مفصلة وموثوقة حصرياً من محتوى الملف'
                  }
                },
                required: ['category', 'question', 'answer']
              },
              description: `مجموعة البطاقات الذكية المستخلصة حصرياً من الملف (حوالي ${targetCards} بطاقة)`
            }
          },
          required: ['summary', 'topicsCovered', 'cards']
        }
      }
    };

    // استدعاء النموذج مع آلية التراجع التلقائي عند الضغط العالي (503 Fallback Engine)
    const { response, usedModel } = await generateWithFallback(ai, requestConfig);

    const responseText = response.text ? response.text.trim() : '';
    if (!responseText) {
      throw new Error('لم يقدم نموذج الذكاء الاصطناعي استجابة لمحتوى الملف.');
    }

    const parsedData = JSON.parse(responseText);

    if (!parsedData.cards || !Array.isArray(parsedData.cards) || parsedData.cards.length === 0) {
      throw new Error('لم يتمكن الوكيل من استخراج بطاقات من الملف. تأكد أن الملف يحتوي على نصوص ومحتوى دراسي قابل للقراءة.');
    }

    return res.json({
      success: true,
      fileName: fileName || 'document.pdf',
      usedModel,
      summary: parsedData.summary,
      topicsCovered: parsedData.topicsCovered || [],
      cards: parsedData.cards
    });

  } catch (error) {
    console.error('Error analyzing PDF with Gemini:', error);
    let errorMessage = error?.message || 'حدث خطأ غير متوقع أثناء معالجة ملف الـ PDF بواسطة الذكاء الاصطناعي.';
    
    // توفير رسالة عربية إرشادية وواضحة في حال استمرار الضغط المؤقت على خوادم الذكاء الاصطناعي
    if (errorMessage.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('UNAVAILABLE')) {
      errorMessage = 'خوادم الذكاء الاصطناعي تشهد طلباً وتدفّقاً مرتفعاً ومؤقتاً في هذه اللحظة (High Demand). تم توفير إعادة محاولة تلقائية؛ يرجى النقر على زر "المحاولة مرة أخرى" بعد بضع ثوانٍ وسيقوم النظام فوراً بالتحويل إلى خادم بديل.';
    }

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

app.use(express.static(staticDir));
app.use('/flashcards-app', express.static(staticDir));

app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
