const fs = require("fs");
const path = "d:/JPR Workspace/Intelligent-Cloud/intelligent-cloud-api/src/scripts/seed.ts";
let s = fs.readFileSync(path, "utf8");

const translations = {
  "What does Intelligent-Cloud do?": {
    questionAr: "ماذا تفعل Intelligent-Cloud؟",
    answerHtmlAr:
      "<p>تقدم Intelligent-Cloud استشارات سحابية وخدمات مُدارة، بما في ذلك هندسة Azure/AWS وهندسة منصات Kubernetes وأتمتة خطوط DevOps ودعم البنية التحتية على مدار الساعة للشركات الناشئة والمؤسسات.</p>",
  },
  "Which cloud platforms does Intelligent-Cloud support?": {
    questionAr: "ما منصات السحابة التي تدعمها Intelligent-Cloud؟",
    answerHtmlAr:
      "<p>Microsoft Azure وAmazon Web Services (AWS)، مع تخصص في عمليات النشر المعتمدة على Kubernetes (AKS وEKS).</p>",
  },
  "Who is Intelligent-Cloud for?": {
    questionAr: "لمن تتوجه Intelligent-Cloud؟",
    answerHtmlAr:
      "<p>الشركات الناشئة التي تحتاج للإطلاق بسرعة والتوسع بأمان، والمؤسسات التي تحتاج لتحديث أو ترحيل أو تحسين بيئات السحابة الحالية.</p>",
  },
  "What's the difference between Intelligent-Cloud and hiring an in-house DevOps engineer?": {
    questionAr: "ما الفرق بين Intelligent-Cloud وتوظيف مهندس DevOps داخلي؟",
    answerHtmlAr:
      "<p>التوظيف الداخلي يمنحك طاقة شخص واحد. Intelligent-Cloud تمنحك خبرة فريق متخصص — هندسة المعمارية وKubernetes وCI/CD والمراقبة والأمن — غالبًا بتكلفة إجمالية أقل مع تغطية على مدار الساعة.</p>",
  },
  "Do you work with startups or only enterprises?": {
    questionAr: "هل تعملون مع الشركات الناشئة أم المؤسسات فقط؟",
    answerHtmlAr:
      "<p>كلاهما. لدينا نماذج مشاركة للشركات الناشئة مبكرًا (إعداد سريع وبرامج تجريبية) وللمؤسسات (الترحيل والتحديث وتوحيد الفرق المتعددة).</p>",
  },
  "How long does a typical cloud migration take?": {
    questionAr: "كم يستغرق ترحيل سحابي نموذجي؟",
    answerHtmlAr:
      "<p>يعتمد على تعقيد أحمال العمل، لكن معظم عمليات الترحيل تستغرق من 4 إلى 12 أسبوعًا بما في ذلك التقييم والتنفيذ والتحسين بعد الترحيل.</p>",
  },
  "Do you offer ongoing support after initial setup?": {
    questionAr: "هل تقدمون دعمًا مستمرًا بعد الإعداد الأولي؟",
    answerHtmlAr:
      "<p>نعم — توفر خدمة العمليات المُدارة مراقبة على مدار الساعة واستجابة للحوادث وتحسينًا بشكل مستمر.</p>",
  },
  "Can you help us reduce our cloud bill?": {
    questionAr: "هل يمكنكم مساعدتنا في تقليل فاتورة السحابة؟",
    answerHtmlAr:
      "<p>نعم، تحسين تكلفة السحابة من خدماتنا الأساسية — ندقق الإنفاق ونعيد الهندسة للكفاءة دون التضحية بالأداء.</p>",
  },
  "How do we get started?": {
    questionAr: "كيف نبدأ؟",
    answerHtmlAr:
      "<p>احجز مكالمة تقييم سحابي مجانية — سنراجع إعدادك الحالي ونوصي بالخطوات التالية دون التزام.</p>",
  },
  "Do you support hybrid or multi-cloud estates?": {
    questionAr: "هل تدعمون البيئات الهجينة أو متعددة السحابة؟",
    answerHtmlAr:
      "<p>نعم. نصمم أنماط الاتصال والهوية والمراقبة التي تعمل عبر Azure وAWS والامتدادات المحلية عند الحاجة.</p>",
  },
  "What does a free assessment include?": {
    questionAr: "ماذا يتضمن التقييم المجاني؟",
    answerHtmlAr:
      "<p>جلسة مدتها 30 دقيقة يقودها مهندس تغطي مخاطر البيئة الحالية وجاهزية الترحيل والتوصية بالمشاركة التالية.</p>",
  },
  "How are support tickets prioritized?": {
    questionAr: "كيف تُرتَّب أولوية تذاكر الدعم؟",
    answerHtmlAr:
      "<p>تُصنَّف التذاكر حسب التأثير والمستوى التعاقدي — القياسي أو العمليات المُدارة (على مدار الساعة) أو استجابة المؤسسات ذات الأولوية.</p>",
  },
  "Can you work under our existing NDA and security review?": {
    questionAr: "هل يمكنكم العمل بموجب اتفاقية عدم الإفشاء ومراجعة الأمن الحالية لدينا؟",
    answerHtmlAr:
      "<p>نعم. يسير العمل التجاري بموجب SOW/MSA وعملية مراجعة الأمن لديكم. تغطي شروط الخصوصية على الموقع بيانات الاستفسار فقط.</p>",
  },
  "Do you provide GitOps and IaC as defaults?": {
    questionAr: "هل تقدمون GitOps والبنية كرمز كإعداد افتراضي؟",
    answerHtmlAr:
      "<p>نعم. Terraform/Bicep وHelm وGitOps (مثل Argo CD) هي مسار التسليم الافتراضي لدينا ما لم تتطلب بيئتكم نهجًا انتقاليًا.</p>",
  },
  "Where do you deliver from?": {
    questionAr: "من أين تقدمون الخدمة؟",
    answerHtmlAr:
      "<p>نحن عن بُعد أولاً بمعايير هندسية عالمية، وتعاون عبر المناطق الزمنية، وورش عمل ميدانية عند التعاقد.</p>",
  },
};

for (const [question, ar] of Object.entries(translations)) {
  const needle = `question: "${question.replace(/"/g, '\\"')}",`;
  const altNeedle = question.includes("'")
    ? `question:\n      "${question.replace(/"/g, '\\"')}",`
    : null;
  let idx = s.indexOf(`question: "${question}"`);
  if (idx < 0) idx = s.indexOf(`question:\n      "${question}"`);
  if (idx < 0) {
    // try with escaped apostrophe in source as What's
    const q2 = question.replace("What's", "What's");
    idx = s.indexOf(`question:\n      "${q2}"`);
  }
  if (idx < 0) {
    console.warn("MISS", question.slice(0, 40));
    continue;
  }
  // Find start of this object: go back to nearest "{\n"
  const objStart = s.lastIndexOf("{", idx);
  const afterQuestionLine = s.indexOf("\n", idx);
  // Insert after question line
  const insertAt = afterQuestionLine + 1;
  const already = s.slice(insertAt, insertAt + 20).includes("questionAr");
  if (already) {
    console.log("SKIP already", question.slice(0, 30));
    continue;
  }
  const insert = `    questionAr: ${JSON.stringify(ar.questionAr)},\n    answerHtmlAr:\n      ${JSON.stringify(ar.answerHtmlAr)},\n`;
  s = s.slice(0, insertAt) + insert + s.slice(insertAt);
  console.log("OK", question.slice(0, 40));
}

fs.writeFileSync(path, s);
console.log("done");
