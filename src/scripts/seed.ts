import bcrypt from "bcryptjs";
import { connectDb, disconnectDb } from "../config/db";
import { env } from "../config/env";
import { AdminUser } from "../models/AdminUser";
import { Settings } from "../models/Settings";
import { Service } from "../models/Service";
import { Solution } from "../models/Solution";
import { Faq } from "../models/Faq";
import { DocCategory } from "../models/DocCategory";
import { DocArticle } from "../models/DocArticle";
import { Partner } from "../models/Partner";
import { ContactSubmission } from "../models/ContactSubmission";
import { BookingRequest } from "../models/BookingRequest";
import { Ticket } from "../models/Ticket";

const servicesSeed = [
  {
    title: "Cloud Computing",
    slug: "cloud-computing",
    iconKey: "cloud-computing",
    order: 1,
    published: true,
    summary:
      "Design and operate scalable compute on Azure and AWS — landing zones, workloads, and cost-aware architecture.",
    bodyHtml:
      "<p>We engineer cloud compute foundations that scale with your product, from first production deploy to multi-account estates.</p><ul><li>Landing zones</li><li>Workload placement</li><li>Cost guardrails</li></ul>",
  },
  {
    title: "Storage",
    slug: "storage",
    iconKey: "storage",
    order: 2,
    published: true,
    summary: "Durable object, block, and file storage patterns with backup and lifecycle policies.",
    bodyHtml:
      "<p>Storage architectures tuned for performance, retention, and recovery — without surprise bills.</p>",
  },
  {
    title: "Networking",
    slug: "networking",
    iconKey: "networking",
    order: 3,
    published: true,
    summary: "Secure connectivity, segmentation, and hybrid networking for production estates.",
    bodyHtml:
      "<p>From hub-and-spoke landing zones to private connectivity, we design networks that stay auditable.</p>",
  },
  {
    title: "Database",
    slug: "database",
    iconKey: "database",
    order: 4,
    published: true,
    summary: "Managed database platforms, migration, and high-availability data tiers.",
    bodyHtml:
      "<p>Relational and managed data services with migration plans that minimize downtime.</p>",
  },
  {
    title: "Analytics",
    slug: "analytics",
    iconKey: "analytics",
    order: 5,
    published: true,
    summary: "Pipelines and platforms that turn operational data into decision-ready insight.",
    bodyHtml:
      "<p>Analytics foundations that integrate cleanly with your cloud estate and observability stack.</p>",
  },
  {
    title: "AI",
    slug: "ai",
    iconKey: "ai",
    order: 6,
    published: true,
    summary: "Practical AI infrastructure on Azure and AWS with secure access and cost controls.",
    bodyHtml:
      "<p>We help teams stand up AI-ready platforms without sacrificing governance or security.</p>",
  },
  {
    title: "Integration",
    slug: "integration",
    iconKey: "integration",
    order: 7,
    published: true,
    summary: "APIs, eventing, and system integration that keep products and platforms in sync.",
    bodyHtml:
      "<p>Reliable integration patterns for cloud-native and hybrid environments.</p>",
  },
  {
    title: "Disaster Recovery",
    slug: "disaster-recovery",
    iconKey: "disaster-recovery",
    order: 8,
    published: true,
    summary: "Backup, failover, and recovery runbooks designed for real incidents.",
    bodyHtml:
      "<p>DR strategies with clear RPO/RTO targets and tested recovery paths.</p>",
  },
];

const solutionsSeed = [
  {
    title: "For Startups",
    slug: "startups",
    pillar: "general" as const,
    audiences: ["startup"] as const,
    order: 1,
    published: true,
    summary:
      "Launch fast without accumulating infrastructure debt — secure by default, automated from day one.",
    highlights: [
      "Fast guided cloud setup and landing zone deployment",
      "Startup-friendly engagement models and pilot programs",
      "Scalable foundations that grow with you",
    ],
    bodyHtml:
      "<p>We help early-stage teams stand up production-ready environments so you can focus on product, not platform.</p>",
  },
  {
    title: "For Enterprises",
    slug: "enterprises",
    pillar: "general" as const,
    audiences: ["enterprise"] as const,
    order: 2,
    published: true,
    summary:
      "Modernize legacy estates, standardize DevOps, and bring governance to teams operating at scale.",
    highlights: [
      "Cloud migration from on-prem or legacy providers",
      "Kubernetes-based application modernization",
      "Multi-team CI/CD standardization",
      "Compliance-ready governance and cost control",
    ],
    bodyHtml:
      "<p>Enterprise engagements focused on migration, modernization, and operational discipline.</p>",
  },
  {
    title: "Cloud Migration",
    slug: "cloud-migration",
    pillar: "migration" as const,
    audiences: ["startup", "enterprise"] as const,
    order: 3,
    published: true,
    summary:
      "End-to-end migration planning and execution — assessment, mapping, phased cutover, and optimization.",
    highlights: ["AWS Migration", "Azure Migration", "Database Migration", "Post-Migration Support"],
    bodyHtml:
      "<p>Phased migrations that minimize downtime and risk while landing you on a maintainable cloud foundation.</p>",
  },
  {
    title: "DevOps Transformation",
    slug: "devops-transformation",
    pillar: "devops" as const,
    audiences: ["startup", "enterprise"] as const,
    order: 4,
    published: true,
    summary:
      "Adopt GitOps, trunk-based development, and automated pipelines that increase release frequency safely.",
    highlights: ["CI/CD", "Docker", "Kubernetes (K8s)", "IaC & Monitoring"],
    bodyHtml:
      "<p>We help engineering teams reduce deployment friction with repeatable, auditable delivery workflows.</p>",
  },
  {
    title: "Security & Compliance",
    slug: "security-compliance",
    pillar: "security" as const,
    audiences: ["startup", "enterprise"] as const,
    order: 5,
    published: true,
    summary:
      "Landing zones and clusters designed with segmentation, least privilege, and audit-ready controls.",
    highlights: ["IAM", "WAF", "Security Assessment", "Compliance"],
    bodyHtml:
      "<p>Security by design — not retrofitted after an audit or a surprise bill.</p>",
  },
];

const faqsSeed = [
  {
    question: "What does Intelligent-Cloud do?",
    questionAr: "ماذا تفعل Intelligent-Cloud؟",
    answerHtmlAr:
      "<p>تقدم Intelligent-Cloud استشارات سحابية وخدمات مُدارة، بما في ذلك هندسة Azure/AWS وهندسة منصات Kubernetes وأتمتة خطوط DevOps ودعم البنية التحتية على مدار الساعة للشركات الناشئة والمؤسسات.</p>",
    category: "general",
    order: 1,
    published: true,
    answerHtml:
      "<p>Intelligent-Cloud provides cloud consulting and managed services, including Azure/AWS architecture, Kubernetes platform engineering, DevOps pipeline automation, and 24x7 infrastructure support for startups and enterprises.</p>",
  },
  {
    question: "Which cloud platforms does Intelligent-Cloud support?",
    questionAr: "ما منصات السحابة التي تدعمها Intelligent-Cloud؟",
    answerHtmlAr:
      "<p>Microsoft Azure وAmazon Web Services (AWS)، مع تخصص في عمليات النشر المعتمدة على Kubernetes (AKS وEKS).</p>",
    category: "general",
    order: 2,
    published: true,
    answerHtml:
      "<p>Microsoft Azure and Amazon Web Services (AWS), with a specialization in Kubernetes-based deployments (AKS and EKS).</p>",
  },
  {
    question: "Who is Intelligent-Cloud for?",
    questionAr: "لمن تتوجه Intelligent-Cloud؟",
    answerHtmlAr:
      "<p>الشركات الناشئة التي تحتاج للإطلاق بسرعة والتوسع بأمان، والمؤسسات التي تحتاج لتحديث أو ترحيل أو تحسين بيئات السحابة الحالية.</p>",
    category: "general",
    order: 3,
    published: true,
    answerHtml:
      "<p>Startups needing to launch fast and scale safely, and enterprises needing to modernize, migrate, or optimize existing cloud estates.</p>",
  },
  {
    question:
      "What's the difference between Intelligent-Cloud and hiring an in-house DevOps engineer?",
    questionAr: "ما الفرق بين Intelligent-Cloud وتوظيف مهندس DevOps داخلي؟",
    answerHtmlAr:
      "<p>التوظيف الداخلي يمنحك طاقة شخص واحد. Intelligent-Cloud تمنحك خبرة فريق متخصص — هندسة المعمارية وKubernetes وCI/CD والمراقبة والأمن — غالبًا بتكلفة إجمالية أقل مع تغطية على مدار الساعة.</p>",
    category: "services",
    order: 4,
    published: true,
    answerHtml:
      "<p>An in-house hire gives you one person's bandwidth. Intelligent-Cloud gives you a full team's worth of specialized expertise — architecture, Kubernetes, CI/CD, observability, and security — often at a lower total cost, with 24x7 coverage.</p>",
  },
  {
    question: "Do you work with startups or only enterprises?",
    questionAr: "هل تعملون مع الشركات الناشئة أم المؤسسات فقط؟",
    answerHtmlAr:
      "<p>كلاهما. لدينا نماذج مشاركة للشركات الناشئة مبكرًا (إعداد سريع وبرامج تجريبية) وللمؤسسات (الترحيل والتحديث وتوحيد الفرق المتعددة).</p>",
    category: "general",
    order: 5,
    published: true,
    answerHtml:
      "<p>Both. We have engagement models for early-stage startups (fast setup, pilot programs) and enterprises (migration, modernization, multi-team standardization).</p>",
  },
  {
    question: "How long does a typical cloud migration take?",
    questionAr: "كم يستغرق ترحيل سحابي نموذجي؟",
    answerHtmlAr:
      "<p>يعتمد على تعقيد أحمال العمل، لكن معظم عمليات الترحيل تستغرق من 4 إلى 12 أسبوعًا بما في ذلك التقييم والتنفيذ والتحسين بعد الترحيل.</p>",
    category: "migration",
    order: 6,
    published: true,
    answerHtml:
      "<p>It depends on workload complexity, but most migrations range from 4–12 weeks, including assessment, execution, and post-migration optimization.</p>",
  },
  {
    question: "Do you offer ongoing support after initial setup?",
    questionAr: "هل تقدمون دعمًا مستمرًا بعد الإعداد الأولي؟",
    answerHtmlAr:
      "<p>نعم — توفر خدمة العمليات المُدارة مراقبة على مدار الساعة واستجابة للحوادث وتحسينًا بشكل مستمر.</p>",
    category: "services",
    order: 7,
    published: true,
    answerHtml:
      "<p>Yes — our Managed Operations service provides 24x7 monitoring, incident response, and optimization on an ongoing basis.</p>",
  },
  {
    question: "Can you help us reduce our cloud bill?",
    questionAr: "هل يمكنكم مساعدتنا في تقليل فاتورة السحابة؟",
    answerHtmlAr:
      "<p>نعم، تحسين تكلفة السحابة من خدماتنا الأساسية — ندقق الإنفاق ونعيد الهندسة للكفاءة دون التضحية بالأداء.</p>",
    category: "services",
    order: 8,
    published: true,
    answerHtml:
      "<p>Yes, cloud cost optimization is one of our core services — we audit spend and re-architect for efficiency without sacrificing performance.</p>",
  },
  {
    question: "How do we get started?",
    questionAr: "كيف نبدأ؟",
    answerHtmlAr:
      "<p>احجز مكالمة تقييم سحابي مجانية — سنراجع إعدادك الحالي ونوصي بالخطوات التالية دون التزام.</p>",
    category: "getting-started",
    order: 9,
    published: true,
    answerHtml:
      "<p>Book a free cloud assessment call — we'll review your current setup and recommend next steps, no obligation.</p>",
  },
  {
    question: "Do you support hybrid or multi-cloud estates?",
    questionAr: "هل تدعمون البيئات الهجينة أو متعددة السحابة؟",
    answerHtmlAr:
      "<p>نعم. نصمم أنماط الاتصال والهوية والمراقبة التي تعمل عبر Azure وAWS والامتدادات المحلية عند الحاجة.</p>",
    category: "architecture",
    order: 10,
    published: true,
    answerHtml:
      "<p>Yes. We design connectivity, identity, and observability patterns that work across Azure, AWS, and on-prem extensions when required.</p>",
  },
  {
    question: "What does a free assessment include?",
    questionAr: "ماذا يتضمن التقييم المجاني؟",
    answerHtmlAr:
      "<p>جلسة مدتها 30 دقيقة يقودها مهندس تغطي مخاطر البيئة الحالية وجاهزية الترحيل والتوصية بالمشاركة التالية.</p>",
    category: "getting-started",
    order: 11,
    published: true,
    answerHtml:
      "<p>A 30-minute engineer-led session covering current estate risks, migration readiness, and a recommended next engagement (pilot or assessment SOW).</p>",
  },
  {
    question: "How are support tickets prioritized?",
    questionAr: "كيف تُرتَّب أولوية تذاكر الدعم؟",
    answerHtmlAr:
      "<p>تُصنَّف التذاكر حسب التأثير والمستوى التعاقدي — القياسي أو العمليات المُدارة (على مدار الساعة) أو استجابة المؤسسات ذات الأولوية.</p>",
    category: "support",
    order: 12,
    published: true,
    answerHtml:
      "<p>Tickets are triaged by impact and contracted tier — Standard, Managed Operations (24×7), or Priority enterprise response.</p>",
  },
  {
    question: "Can you work under our existing NDA and security review?",
    questionAr: "هل يمكنكم العمل بموجب اتفاقية عدم الإفشاء ومراجعة الأمن الحالية لدينا؟",
    answerHtmlAr:
      "<p>نعم. يسير العمل التجاري بموجب SOW/MSA وعملية مراجعة الأمن لديكم. تغطي شروط الخصوصية على الموقع بيانات الاستفسار فقط.</p>",
    category: "services",
    order: 13,
    published: true,
    answerHtml:
      "<p>Yes. Commercial work proceeds under SOW/MSA and your security review process. Website privacy terms cover inquiry data only.</p>",
  },
  {
    question: "Do you provide GitOps and IaC as defaults?",
    questionAr: "هل تقدمون GitOps والبنية كرمز كإعداد افتراضي؟",
    answerHtmlAr:
      "<p>نعم. Terraform/Bicep وHelm وGitOps (مثل Argo CD) هي مسار التسليم الافتراضي لدينا ما لم تتطلب بيئتكم نهجًا انتقاليًا.</p>",
    category: "devops",
    order: 14,
    published: true,
    answerHtml:
      "<p>Yes. Terraform/Bicep, Helm, and GitOps (for example Argo CD) are our default delivery path unless your estate requires a transitional approach.</p>",
  },
  {
    question: "Where do you deliver from?",
    questionAr: "من أين تقدمون الخدمة؟",
    answerHtmlAr:
      "<p>نحن عن بُعد أولاً بمعايير هندسية عالمية، وتعاون عبر المناطق الزمنية، وورش عمل ميدانية عند التعاقد.</p>",
    category: "general",
    order: 15,
    published: true,
    answerHtml:
      "<p>We are remote-first with global engineering standards, collaboration across time zones, and on-site workshops when contracted.</p>",
  },
];

const docCategoriesSeed = [
  {
    title: "Getting Started",
    slug: "getting-started",
    order: 1,
    description: "Onboarding, initial assessment process, and engagement models.",
  },
  {
    title: "Architecture Guides",
    slug: "architecture",
    order: 2,
    description: "Landing zone design principles and network topology references.",
  },
  {
    title: "Kubernetes & AKS",
    slug: "kubernetes-aks",
    order: 3,
    description: "Cluster setup, Helm chart standards, and ArgoCD GitOps workflows.",
  },
  {
    title: "CI/CD Pipelines",
    slug: "cicd-pipelines",
    order: 4,
    description: "Pipeline templates, trunk-based branching, and deployment approval flows.",
  },
  {
    title: "Observability",
    slug: "observability",
    order: 5,
    description: "Dashboards, alerting standards, and log retention policies.",
  },
  {
    title: "Security & Compliance",
    slug: "security-compliance",
    order: 6,
    description: "Access control policies and the shared responsibility model.",
  },
  {
    title: "API Reference",
    slug: "api-reference",
    order: 7,
    description: "General company and platform reference information.",
  },
  {
    title: "Managed Operations",
    slug: "managed-operations",
    order: 8,
    description: "SLOs, runbooks, escalation paths, and day-2 operations.",
  },
  {
    title: "Cost Optimization",
    slug: "cost-optimization",
    order: 9,
    description: "FinOps practices, rightsizing, and waste reduction.",
  },
];

type DocArticleSeed = {
  title: string;
  slug: string;
  summary: string;
  bodyHtml: string;
  order: number;
};

function docArticle(
  order: number,
  title: string,
  slug: string,
  summary: string,
  sections: Array<{
    h: string;
    p: string;
    list?: string[];
    why?: string;
    steps?: string[];
    doList?: string[];
    dontList?: string[];
    code?: string;
    note?: string;
  }>,
): DocArticleSeed {
  const parts: string[] = [];
  parts.push(
    `<p><strong>At a glance.</strong> ${summary}</p>`,
  );
  parts.push(
    `<blockquote><p>Use this guide as a working baseline. Adapt it to your constraints, then capture decisions in an ADR or ticket — not only in chat.</p></blockquote>`,
  );
  parts.push(
    `<h2>Purpose</h2><p>This guide covers <em>${title}</em> for production cloud work. It is meant for discovery, delivery planning, and day-2 operations — not slideware.</p>`,
  );
  parts.push(
    `<h2>Who this is for</h2><ul><li><strong>Platform engineers</strong> implementing the change</li><li><strong>Engineering managers</strong> prioritizing the backlog</li><li><strong>Security reviewers</strong> validating controls</li><li><strong>On-call owners</strong> who need clear runbooks</li></ul>`,
  );

  for (const s of sections) {
    parts.push(`<h2>${s.h}</h2>`);
    parts.push(`<p>${s.p}</p>`);
    if (s.why) {
      parts.push(`<p><strong>Why it matters.</strong> ${s.why}</p>`);
    }
    if (s.note) {
      parts.push(`<blockquote><p><strong>Note.</strong> ${s.note}</p></blockquote>`);
    }
    if (s.list?.length) {
      parts.push(`<ul>${s.list.map((li) => `<li>${li}</li>`).join("")}</ul>`);
    }
    if (s.steps?.length) {
      parts.push(
        `<h3>Suggested steps</h3><ol>${s.steps.map((li) => `<li>${li}</li>`).join("")}</ol>`,
      );
    }
    if (s.doList?.length) {
      parts.push(`<h3>Do</h3><ul>${s.doList.map((li) => `<li>${li}</li>`).join("")}</ul>`);
    }
    if (s.dontList?.length) {
      parts.push(`<h3>Don't</h3><ul>${s.dontList.map((li) => `<li>${li}</li>`).join("")}</ul>`);
    }
    if (s.code) {
      parts.push(`<pre><code>${s.code}</code></pre>`);
    }
  }

  parts.push(`<hr />`);
  parts.push(
    `<h2>How to apply this</h2><ol><li>Review with platform, security, and product owners in one short working session.</li><li>Capture gaps and decisions in your engagement backlog (ticket or ADR).</li><li>Agree owners, change windows, and success checks before touching production.</li><li>Validate in non-production, then promote with your normal pipeline gates.</li><li>Update runbooks and dashboards so on-call sees the new reality.</li></ol>`,
  );
  parts.push(
    `<h2>Acceptance checks</h2><ul><li>Decisions are written down and linked from the relevant repo or wiki.</li><li>Access paths and change windows are explicit.</li><li>Observability, alerts, and rollback paths exist for related changes.</li><li>Owners know who to escalate to when something fails.</li><li>Non-prod has already proven the pattern at least once.</li></ul>`,
  );
  parts.push(
    `<h2>Common pitfalls</h2><ul><li>Skipping non-prod validation because “it’s a small change.”</li><li>Leaving long-lived credentials or console-only configuration.</li><li>No owner for follow-up when an exception is granted.</li><li>Documenting the happy path only — missing rollback and escalation.</li></ul>`,
  );
  parts.push(
    `<p>Need help applying this? <a href="/contact">Contact Intelligent Cloud</a> or <a href="/book-demo">book an assessment</a>.</p>`,
  );

  return { title, slug, summary, order, bodyHtml: parts.join("") };
}

function overviewHtml(title: string, description: string) {
  return [
    `<p><strong>At a glance.</strong> ${description}</p>`,
    `<blockquote><p>Start here, then open the deeper guides in this category. Treat each article as a checklist you can adapt — not a rigid standard.</p></blockquote>`,
    `<h2>What you will find here</h2>`,
    `<p>This category collects production-ready guidance for <em>${title}</em>. Articles are ordered for progressive reading.</p>`,
    `<ul>`,
    `<li><strong>Overview</strong> — context and how to navigate the topic</li>`,
    `<li><strong>Deep dives</strong> — concrete patterns, checklists, and pitfalls</li>`,
    `<li><strong>Operating notes</strong> — what to verify before and after go-live</li>`,
    `</ul>`,
    `<h2>How to use these docs</h2>`,
    `<ol>`,
    `<li>Skim the article list in the left sidebar.</li>`,
    `<li>Open the guide that matches your current decision.</li>`,
    `<li>Capture gaps and owners in your engagement backlog.</li>`,
    `<li>Validate changes in non-prod before promoting.</li>`,
    `</ol>`,
    `<h2>Working agreements</h2>`,
    `<ul>`,
    `<li>Prefer written decisions over hallway agreements.</li>`,
    `<li>Keep secrets out of tickets and chat — use your secret store.</li>`,
    `<li>Link runbooks from alerts and change records.</li>`,
    `<li>Revisit this category after major platform changes.</li>`,
    `</ul>`,
    `<h3>Quick reference</h3>`,
    `<table><thead><tr><th>Need</th><th>Where to look</th></tr></thead><tbody>`,
    `<tr><td>First engagement</td><td>Getting Started guides</td></tr>`,
    `<tr><td>Landing zone / network</td><td>Architecture Guides</td></tr>`,
    `<tr><td>Clusters &amp; GitOps</td><td>Kubernetes &amp; AKS</td></tr>`,
    `<tr><td>Build &amp; release</td><td>CI/CD Pipelines</td></tr>`,
    `</tbody></table>`,
    `<h2>Next step</h2>`,
    `<p>Pick the first deep-dive article in this category and review it with your platform owner. You can edit content anytime from the Intelligent Cloud admin console.</p>`,
    `<p><a href="/contact">Talk to sales</a> · <a href="/support">Open support</a> · <a href="/book-demo">Book a demo</a></p>`,
  ].join("");
}

const extraArticlesByCategory: Record<string, DocArticleSeed[]> = {
  "getting-started": [
    docArticle(2, "Engagement checklist", "engagement-checklist", "What to prepare before your first assessment call.", [
      {
        h: "Before the call",
        p: "Bring context so we can spend time on decisions, not discovery. A short prep pack beats a long slide deck.",
        why: "Missing context forces another workshop and delays the first actionable backlog.",
        note: "Share materials in your approved collaboration space — never paste secrets into tickets.",
        list: ["Current cloud accounts and regions", "Critical apps and SLOs", "Access constraints and change windows", "Known incidents or audit deadlines"],
        steps: ["Nominate a single customer owner for the call", "Share read-only architecture notes 48 hours ahead", "List top three outcomes you want from the engagement"],
      },
      {
        h: "Outputs you should expect",
        p: "A short findings memo, prioritized backlog, and proposed engagement shape — not a 80-page binder.",
        doList: ["Ask for owners and dates on each priority item", "Confirm what is in vs out of scope"],
        dontList: ["Treat the memo as a contract without review", "Leave access open after the assessment ends"],
      },
    ]),
    docArticle(3, "How assessments work", "how-assessments-work", "Discovery workshops, scorecards, and delivery options.", [
      {
        h: "Format",
        p: "We run a structured assessment across architecture, delivery, security, and operations. Sessions are evidence-based and time-boxed.",
        why: "A consistent scorecard lets leadership compare options without relying on anecdotes.",
        steps: ["Kickoff and access setup", "Evidence collection and interviews", "Scorecard draft and playback", "Engagement recommendation"],
      },
      {
        h: "Scorecard",
        p: "Each domain is scored with evidence, risks, and recommended next steps.",
        list: ["Platform maturity", "Delivery throughput", "Reliability & cost", "Security posture"],
      },
    ]),
    docArticle(4, "Access & onboarding", "access-and-onboarding", "Accounts, roles, and safe read-only access for kickoff.", [
      {
        h: "Least-privilege start",
        p: "Prefer read-only or auditor roles until a change window is agreed. Expand only when work requires it.",
        why: "Over-provisioned kickoff access is a common audit finding and a real blast-radius risk.",
        doList: ["Use named groups in your IdP", "Log and time-box elevated access"],
        dontList: ["Share personal cloud logins", "Leave break-glass credentials in chat"],
      },
      {
        h: "Checklist",
        p: "Prepare identity, networking, and repo access before the first technical session.",
        list: ["Cloud tenant / subscription IDs", "IdP groups for engineers", "Repo + CI system access", "Named change owners"],
      },
    ]),
    docArticle(5, "Engagement models", "engagement-models", "Project, retainer, and managed operations options.", [
      {
        h: "Project",
        p: "Fixed-scope migrations, platform builds, or hardening programs with clear exit criteria.",
        why: "Projects work best when outcomes and decision rights are explicit up front.",
      },
      {
        h: "Retainer",
        p: "Ongoing architecture and delivery coaching with a shared backlog and weekly steering.",
      },
      {
        h: "Managed operations",
        p: "Follow-the-sun ops with SLOs, runbooks, and escalation paths — not ticket ping-pong.",
        list: ["Defined SLOs and response times", "Runbook ownership", "Change and freeze calendars"],
      },
    ]),
    docArticle(6, "Working with your team", "working-with-your-team", "RACI, ceremonies, and communication norms.", [
      {
        h: "RACI",
        p: "We define who decides, who builds, and who approves production changes. Ambiguity here is the #1 delivery drag.",
        why: "Without clear decision rights, teams re-litigate the same topics every week.",
        list: ["Responsible: does the work", "Accountable: final decision on go/no-go", "Consulted: must be heard before change", "Informed: needs outcomes, not debates"],
        steps: ["Map RACI for platform, app, security, and ops", "Publish it in the engagement channel", "Revisit after the first production change"],
      },
      {
        h: "Cadence",
        p: "Weekly steering, async updates in your tools, and clear escalation contacts. Prefer written decisions over long meetings.",
        doList: ["Keep a single source of truth for decisions", "Escalate blockers within 24 hours"],
        dontList: ["Run parallel Slack threads for the same incident", "Change production without the agreed approver"],
      },
      {
        h: "Tools & channels",
        p: "We work in your repos, ticketing, and chat. Status lives where your team already looks — not in a private side channel.",
        list: ["Backlog in your tracker", "Architecture decisions as ADRs or tickets", "Incidents in a dedicated channel with an IC"],
      },
    ]),
    docArticle(7, "Success criteria", "success-criteria", "How we measure outcomes beyond ticket closure.", [
      {
        h: "Examples",
        p: "Pick a few measurable outcomes up front. Ticket closure alone does not prove the platform is healthier.",
        list: ["Deploy frequency / lead time", "Change failure rate", "Mean time to recover", "Cost per environment"],
        why: "Shared metrics keep both sides honest about progress and trade-offs.",
        steps: ["Baseline current metrics", "Set a 90-day target range", "Review monthly in steering"],
      },
    ]),
  ],
  architecture: [
    docArticle(2, "Landing zone principles", "landing-zone-principles", "Segmentation, identity, and shared services patterns.", [
      { h: "Principles", p: "Prefer hub-and-spoke, centralized identity, and explicit network egress controls." },
      { h: "Shared services", p: "DNS, logging, security tooling, and connectivity should be platform-owned." },
    ]),
    docArticle(3, "Subscription & account strategy", "subscription-strategy", "How to isolate prod, non-prod, and shared platforms.", [
      { h: "Isolation", p: "Separate production from non-production. Keep shared networking and identity in dedicated accounts." },
      { h: "Naming", p: "Use consistent naming for subscriptions, resource groups, and tags from day one." },
    ]),
    docArticle(4, "Network topology patterns", "network-topology", "Hub-spoke, private endpoints, and egress control.", [
      { h: "Hub and spoke", p: "Centralize firewalls, VPN/ExpressRoute, and DNS while spokes host workloads." },
      { h: "Private access", p: "Prefer private endpoints for PaaS; document required public exceptions." },
    ]),
    docArticle(5, "Identity & access patterns", "identity-access-patterns", "Entra ID, RBAC, and workload identities.", [
      { h: "Human access", p: "SSO + MFA, JIT elevation, and time-bound privileged roles." },
      { h: "Workloads", p: "Use managed identities / IRSA-style bindings instead of long-lived secrets." },
    ]),
    docArticle(6, "Environment promotion", "environment-promotion", "Dev → test → prod with parity and guardrails.", [
      { h: "Parity", p: "Keep topology similar across environments; scale and data differ, patterns should not." },
      { h: "Promotion", p: "Promote immutable artifacts and infrastructure plans — not manual console drift." },
    ]),
    docArticle(7, "Cost & tagging standards", "cost-and-tagging", "Required tags, budgets, and chargeback basics.", [
      { h: "Required tags", p: "owner, environment, cost-center, and application id on every billable resource." },
      { h: "Budgets", p: "Alert early on anomalies; review monthly with product owners." },
    ]),
    docArticle(8, "Reference architectures", "reference-architectures", "Common patterns we reuse across engagements.", [
      { h: "Web + API + data", p: "Front door / WAF, private APIs, managed data services, and central observability." },
      { h: "Event-driven", p: "Queues/topics with idempotent consumers and dead-letter policies." },
    ]),
  ],
  "kubernetes-aks": [
    docArticle(2, "GitOps baseline", "gitops-baseline", "Argo CD application sets and environment promotion.", [
      {
        h: "GitOps",
        p: "Declare desired state in Git and promote via PRs — not <code>kubectl</code> from laptops.",
        why: "Git history becomes the audit trail for every production change.",
        note: "Break-glass kubectl is allowed only with a recorded incident and a follow-up PR.",
        code: "# Promote staging → prod via Git, not kubectl\ngit checkout -b promote/payments-api\n# bump image digest in apps/prod/payments-api.yaml\ngit commit -am \"promote payments-api to sha-abc123\"\ngit push -u origin HEAD",
      },
      {
        h: "App of apps",
        p: "Use ApplicationSets or app-of-apps to bootstrap environments consistently.",
        list: ["One repo (or clear mono-repo path) per platform desired state", "Environment overlays via directories or ApplicationSets", "PR required for prod; protected branches enforced"],
      },
    ]),
    docArticle(3, "AKS cluster bootstrap", "aks-cluster-bootstrap", "Node pools, networking, and add-ons we standardize.", [
      { h: "Baseline", p: "System + user node pools, Azure CNI / overlay as agreed, and locked kube versions." },
      { h: "Add-ons", p: "Ingress, cert management, policy, and metrics agents as code." },
    ]),
    docArticle(4, "Helm chart standards", "helm-chart-standards", "Chart layout, values hierarchy, and review checklist.", [
      { h: "Structure", p: "Keep charts thin; push environment differences into values layers." },
      { h: "Checklist", p: "Resource requests/limits, probes, PDB, and non-root containers required." },
    ]),
    docArticle(5, "Workload identity on AKS", "workload-identity-aks", "Bind pods to Azure identities safely.", [
      { h: "Prefer", p: "Workload identity over secrets in Key Vault CSI when possible." },
      { h: "Rotate", p: "If secrets remain, automate rotation and audit mounts." },
    ]),
    docArticle(6, "Namespace & tenancy model", "namespace-tenancy", "How teams share a cluster without stepping on each other.", [
      { h: "Boundaries", p: "Namespaces per team/app, NetworkPolicies, and ResourceQuotas." },
      { h: "Admin paths", p: "Platform admins only; developers use GitOps and self-service templates." },
    ]),
    docArticle(7, "Upgrades & node pools", "upgrades-and-node-pools", "Safe version skew and rolling upgrades.", [
      { h: "Plan", p: "Test upgrades in non-prod, watch deprecated APIs, and stage node image updates." },
      { h: "Pools", p: "Separate critical workloads; use surge settings that fit capacity." },
    ]),
    docArticle(8, "Ingress & TLS", "ingress-and-tls", "Controllers, certificates, and external DNS.", [
      { h: "TLS", p: "Automate certificates; never copy private keys into tickets." },
      { h: "Routing", p: "Document hostnames, paths, and WAF integration points." },
    ]),
  ],
  "cicd-pipelines": [
    docArticle(2, "Pipeline stages", "pipeline-stages", "Build, test, security scan, and deploy gates.", [
      { h: "Stages", p: "Keep pipelines boring and repeatable.", list: ["Build", "Unit + integration tests", "Security scan", "Deploy with approval"] },
    ]),
    docArticle(3, "Trunk-based development", "trunk-based-development", "Short-lived branches and continuous integration.", [
      { h: "Defaults", p: "Main stays releasable. Feature flags over long-lived branches." },
      { h: "Reviews", p: "Small PRs with required checks; protect main from force-push." },
    ]),
    docArticle(4, "Artifact versioning", "artifact-versioning", "Immutable images, SBOM, and provenance.", [
      { h: "Images", p: "Tag by commit SHA; promote digests, not mutable latest." },
      { h: "Provenance", p: "Attach SBOM and scan results to the artifact metadata." },
    ]),
    docArticle(5, "Environment approvals", "environment-approvals", "Who can promote to staging and production.", [
      { h: "Gates", p: "Automated checks first; human approval for production when risk warrants it." },
      { h: "Audit", p: "Record who approved, when, and which artifact moved." },
    ]),
    docArticle(6, "Secrets in CI", "secrets-in-ci", "OIDC federations and short-lived credentials.", [
      { h: "Prefer OIDC", p: "Exchange cloud roles from the CI identity — avoid static cloud keys in runners." },
      { h: "Scope", p: "Separate credentials per environment and repository." },
    ]),
    docArticle(7, "Pipeline templates", "pipeline-templates", "Reusable workflows for services and infra.", [
      { h: "Service template", p: "Build, test, scan, publish image, open GitOps PR." },
      { h: "Infra template", p: "Plan, policy check, apply with environment protection." },
    ]),
    docArticle(8, "Rollback playbook", "rollback-playbook", "Fast recovery when a deploy goes wrong.", [
      { h: "App rollback", p: "Redeploy previous digest via GitOps; avoid hotfixes from laptops." },
      { h: "Infra rollback", p: "Keep previous plans; know which changes are not safely reversible." },
    ]),
  ],
  observability: [
    docArticle(2, "Alert hygiene", "alert-hygiene", "Reduce noise and keep paging actionable.", [
      { h: "Alerting", p: "Page on customer impact. Ticket everything else. Review noisy alerts weekly." },
    ]),
    docArticle(3, "Golden signals", "golden-signals", "Latency, traffic, errors, and saturation baselines.", [
      { h: "Per service", p: "Instrument RED/USE (or golden signals) before inventing custom pages." },
      { h: "SLOs", p: "Define user-facing SLOs and error budgets that drive prioritization." },
    ]),
    docArticle(4, "Logging standards", "logging-standards", "Structured logs, correlation IDs, and retention.", [
      { h: "Structure", p: "JSON logs with request id, service, and environment fields." },
      { h: "Retention", p: "Hot retention for ops; colder tiers for compliance as required." },
    ]),
    docArticle(5, "Dashboards that matter", "dashboards-that-matter", "What to show on-call vs leadership.", [
      { h: "On-call", p: "Service health, recent deploys, saturation, and top errors." },
      { h: "Leadership", p: "SLO burn, incident trends, and cost anomalies — not raw CPU charts." },
    ]),
    docArticle(6, "Tracing & correlation", "tracing-and-correlation", "OpenTelemetry baselines across services.", [
      { h: "Propagate", p: "Carry trace/context across HTTP, queues, and jobs." },
      { h: "Sample", p: "Tune sampling so prod is affordable without losing rare failures." },
    ]),
    docArticle(7, "On-call runbooks", "on-call-runbooks", "What every alert should link to.", [
      { h: "Minimum", p: "Impact, checks, mitigation, escalation, and post-incident notes." },
      { h: "Ownership", p: "Runbooks live next to services and are reviewed after incidents." },
    ]),
    docArticle(8, "Incident response basics", "incident-response-basics", "Roles, comms, and severity levels.", [
      { h: "Roles", p: "Incident commander, ops lead, and communications owner." },
      { h: "After", p: "Blameless review with actions that actually land in the backlog." },
    ]),
  ],
  "security-compliance": [
    docArticle(2, "Least privilege checklist", "least-privilege", "IAM and workload identity defaults.", [
      { h: "Access", p: "Prefer workload identities over long-lived keys. Break-glass accounts must be monitored." },
    ]),
    docArticle(3, "Shared responsibility model", "shared-responsibility", "What the cloud provider covers vs what you own.", [
      { h: "Clarify", p: "Identity, data, app config, and network policy remain customer responsibilities." },
      { h: "Document", p: "Map controls to owners so audits do not stall." },
    ]),
    docArticle(4, "Secret management", "secret-management", "Vault / Key Vault patterns and rotation.", [
      { h: "Store", p: "Central secret store; never commit secrets to Git." },
      { h: "Rotate", p: "Automate rotation and revoke on offboarding." },
    ]),
    docArticle(5, "Network security baseline", "network-security-baseline", "NSGs, private endpoints, and egress allowlists.", [
      { h: "Default deny", p: "Start closed; open only documented paths." },
      { h: "Egress", p: "Control outbound internet from workloads; log denied attempts." },
    ]),
    docArticle(6, "Vulnerability management", "vulnerability-management", "Image scanning, patch SLAs, and exceptions.", [
      { h: "Scan", p: "Block critical issues in CI; track remaining risk with owners." },
      { h: "Exceptions", p: "Time-bound exceptions with compensating controls." },
    ]),
    docArticle(7, "Audit logging", "audit-logging", "What to retain for investigations and compliance.", [
      { h: "Sources", p: "Cloud activity logs, IdP sign-ins, Kubernetes audit, and CI admin events." },
      { h: "Integrity", p: "Send to immutable / restricted storage where required." },
    ]),
    docArticle(8, "Change & break-glass", "change-and-break-glass", "Emergency access without losing accountability.", [
      { h: "Break-glass", p: "Monitored emergency roles with short TTL and mandatory review." },
      { h: "Changes", p: "Prefer GitOps and tickets; console changes need follow-up PRs." },
    ]),
  ],
  "api-reference": [
    docArticle(2, "Public endpoints overview", "public-endpoints", "Contact, bookings, support, and content APIs.", [
      { h: "APIs", p: "Public forms post to <code>/contact</code>, <code>/bookings</code>, and <code>/support/tickets</code>." },
    ]),
    docArticle(3, "Contact API", "contact-api", "Submit sales and general inquiries.", [
      { h: "POST /contact", p: "Accepts name, email, company, need, and message. Returns a confirmation payload." },
      { h: "Validation", p: "Required fields and email format are enforced server-side." },
    ]),
    docArticle(4, "Bookings API", "bookings-api", "Schedule a demo or discovery call.", [
      { h: "POST /bookings", p: "Includes preferred date/time, need, and optional notes." },
      { h: "Status", p: "Admin workflows move bookings through new → confirmed → completed." },
    ]),
    docArticle(5, "Support tickets API", "support-tickets-api", "Open and track support requests.", [
      { h: "POST /support/tickets", p: "Subject, body, and tier. Managed customers may use elevated tiers." },
      { h: "Lifecycle", p: "new → in_progress → resolved → closed." },
    ]),
    docArticle(6, "Docs content API", "docs-content-api", "Published categories and articles for the marketing site.", [
      { h: "GET /docs", p: "Returns published categories with nested article summaries." },
      { h: "GET /docs/:category/:slug", p: "Returns a single published article with HTML body." },
    ]),
    docArticle(7, "Partners API", "partners-api", "Published partner logos for the site.", [
      { h: "GET /partners", p: "Ordered list of published partners with optional logo paths." },
    ]),
    docArticle(8, "Rate limits & errors", "rate-limits-and-errors", "How public APIs respond under load.", [
      { h: "Errors", p: "JSON errors include a message and HTTP status. Validation failures return 400." },
      { h: "Abuse", p: "Public form endpoints may be rate-limited; retry with backoff if you receive 429." },
    ]),
  ],
  "managed-operations": [
    docArticle(2, "SLO & SLA basics", "slo-sla-basics", "How we define reliability targets with customers.", [
      { h: "SLOs", p: "User-facing targets with error budgets — not vanity uptime percentages alone." },
      { h: "SLAs", p: "Contractual commitments map to measurable SLOs and response times." },
    ]),
    docArticle(3, "Escalation matrix", "escalation-matrix", "Who to call and when during incidents.", [
      { h: "Levels", p: "L1 triage → L2 platform → L3 vendor / engineering owners." },
      { h: "Comms", p: "Keep a single incident channel and a named communications owner." },
    ]),
    docArticle(4, "Day-2 checklist", "day-2-checklist", "What we operate after go-live.", [
      { h: "Routine", p: "Patch windows, certificate renewals, capacity reviews, and backup drills." },
      { h: "Evidence", p: "Keep change history and restore test results for audits." },
    ]),
    docArticle(5, "Handover package", "handover-package", "What customers receive at engagement end.", [
      { h: "Contents", p: "Architecture diagram, runbooks, access inventory, and open risks." },
      { h: "Training", p: "Short walkthroughs for on-call and platform owners." },
    ]),
    docArticle(6, "Change windows", "change-windows", "Safe production change practices.", [
      { h: "Defaults", p: "Prefer off-peak windows for risky changes; document freeze periods." },
      { h: "Emergency", p: "Emergency changes still need post-facto tickets and reviews." },
    ]),
  ],
  "cost-optimization": [
    docArticle(2, "FinOps starter kit", "finops-starter-kit", "Visibility, ownership, and first wins.", [
      { h: "Visibility", p: "Dashboards by team/app using required tags." },
      { h: "Ownership", p: "Every large spend line has a named owner." },
    ]),
    docArticle(3, "Rightsizing compute", "rightsizing-compute", "VMs, containers, and reserved capacity.", [
      { h: "Signals", p: "CPU/memory saturation over time beats one-hour snapshots." },
      { h: "Actions", p: "Downsize idle, schedule non-prod, and consider reservations for steady load." },
    ]),
    docArticle(4, "Storage & egress waste", "storage-and-egress", "Lifecycle policies and data transfer surprises.", [
      { h: "Storage", p: "Lifecycle hot → cool → archive; delete orphaned disks and snapshots." },
      { h: "Egress", p: "Watch cross-region and internet egress; prefer private peering when viable." },
    ]),
    docArticle(5, "Kubernetes cost controls", "kubernetes-cost-controls", "Requests, limits, and idle namespaces.", [
      { h: "Requests", p: "Accurate requests prevent both waste and noisy-neighbor failures." },
      { h: "Idle", p: "Detect unused namespaces and oversized node pools monthly." },
    ]),
    docArticle(6, "Monthly cost review", "monthly-cost-review", "A lightweight ritual that sticks.", [
      { h: "Agenda", p: "Top movers, anomalies, savings shipped, and decisions needed." },
      { h: "Follow-up", p: "Track actions with owners — reviews without actions are theater." },
    ]),
  ],
};

const partnersSeed = [
  { name: "Microsoft Azure", url: "https://azure.microsoft.com", order: 1, published: true, logoPath: "" },
  { name: "Amazon Web Services", url: "https://aws.amazon.com", order: 2, published: true, logoPath: "" },
  { name: "HashiCorp", url: "https://www.hashicorp.com", order: 3, published: true, logoPath: "" },
  { name: "CNCF", url: "https://www.cncf.io", order: 4, published: true, logoPath: "" },
  { name: "GitLab", url: "https://about.gitlab.com", order: 5, published: true, logoPath: "" },
  { name: "Datadog", url: "https://www.datadoghq.com", order: 6, published: false, logoPath: "" },
];

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const contactsSeed = [
  {
    name: "Sara AlHarbi",
    email: "sara.alharbi@example.com",
    company: "Nomad Retail",
    phone: "+966501112233",
    need: "Cloud Migration",
    message: "We need a phased Azure migration plan for three production apps.",
    status: "new" as const,
  },
  {
    name: "Omar Farouk",
    email: "omar@northwind.sa",
    company: "Northwind Logistics",
    phone: "+966559998877",
    need: "Kubernetes",
    message: "Looking for AKS hardening and GitOps rollout for our delivery team.",
    status: "new" as const,
  },
  {
    name: "Lina Rahman",
    email: "lina@brightpay.io",
    company: "BrightPay",
    phone: "+971501234567",
    need: "Managed Services",
    message: "Interested in 24x7 managed operations for our staging and prod clusters.",
    status: "reviewed" as const,
  },
  {
    name: "James Okonkwo",
    email: "james@orbitlabs.dev",
    company: "Orbit Labs",
    phone: "+447700900123",
    need: "DevOps Consulting",
    message: "Need CI/CD standardization across five product teams.",
    status: "reviewed" as const,
  },
  {
    name: "Fatima Nasser",
    email: "fatima@citybank.example",
    company: "City Bank Digital",
    phone: "+966531112244",
    need: "Other",
    message: "Security assessment for our landing zone before audit.",
    status: "archived" as const,
  },
  {
    name: "Hassan Qureshi",
    email: "hassan@pulsehealth.sa",
    company: "Pulse Health",
    phone: "+966561234567",
    need: "Cloud Migration",
    message: "Database migration from on-prem SQL to Azure SQL.",
    status: "new" as const,
  },
  {
    name: "Elena Petrova",
    email: "elena@skynetworks.io",
    company: "Sky Networks",
    phone: "+971521112233",
    need: "Kubernetes",
    message: "Multi-cluster observability and alerting redesign.",
    status: "new" as const,
  },
  {
    name: "Yousef Alami",
    email: "yousef@desertsoft.com",
    company: "DesertSoft",
    phone: "+966501234999",
    need: "Managed Services",
    message: "Partnership inquiry for reseller model.",
    status: "reviewed" as const,
  },
];

const bookingsSeed = [
  {
    need: "Cloud Migration",
    name: "Nadia Saleh",
    email: "nadia@vertex.sa",
    company: "Vertex Manufacturing",
    phone: "+966551112200",
    preferredDate: daysFromNow(5),
    preferredTime: "10:00",
    notes: "Prefer morning slot. Focus on ERP migration risks.",
    status: "new" as const,
  },
  {
    need: "Kubernetes",
    name: "Chris Dalton",
    email: "chris@apexpay.io",
    company: "ApexPay",
    phone: "+971501119988",
    preferredDate: daysFromNow(8),
    preferredTime: "14:30",
    notes: "Want AKS vs EKS comparison for their platform.",
    status: "confirmed" as const,
  },
  {
    need: "Managed Cloud",
    name: "Rania Haddad",
    email: "rania@medora.health",
    company: "Medora Health",
    phone: "+966531110022",
    preferredDate: daysFromNow(3),
    preferredTime: "11:00",
    notes: "Discuss managed ops SLAs.",
    status: "new" as const,
  },
  {
    need: "DevOps",
    name: "Tom Nguyen",
    email: "tom@buildkite.example",
    company: "Buildkite Labs",
    phone: "+61400111222",
    preferredDate: daysFromNow(12),
    preferredTime: "09:30",
    notes: "CI/CD and trunk-based adoption.",
    status: "completed" as const,
  },
  {
    need: "Security",
    name: "Aisha Khan",
    email: "aisha@securebank.sa",
    company: "SecureBank",
    phone: "+966501223344",
    preferredDate: daysFromNow(7),
    preferredTime: "16:00",
    notes: "Landing zone security review before audit.",
    status: "confirmed" as const,
  },
  {
    need: "Other",
    name: "Mark Ellis",
    email: "mark@partnerco.com",
    company: "PartnerCo",
    phone: "+966559991100",
    preferredDate: daysFromNow(15),
    preferredTime: "13:00",
    notes: "Solution partner discussion.",
    status: "cancelled" as const,
  },
];

const ticketsSeed = [
  {
    name: "Ops Desk",
    email: "ops@nomadretail.sa",
    subject: "AKS node pool scaling alerts",
    body: "Prod cluster is paging on node NotReady every night around 02:00 UTC. Need triage and runbook update.",
    tier: "managed-operations" as const,
    status: "new" as const,
    adminNotes: "",
  },
  {
    name: "Lina Rahman",
    email: "lina@brightpay.io",
    subject: "Staging pipeline failing image pull",
    body: "CI can build but AKS staging cannot pull from ACR. Suspect network policy or identity binding.",
    tier: "standard" as const,
    status: "in_progress" as const,
    adminNotes: "Checking ACR private endpoint and kubelet identity.",
  },
  {
    name: "James Okonkwo",
    email: "james@orbitlabs.dev",
    subject: "Request: add Prometheus recording rules",
    body: "Need SLO recording rules for API latency p95 across three services.",
    tier: "standard" as const,
    status: "resolved" as const,
    adminNotes: "Rules merged; dashboard updated.",
  },
  {
    name: "SecureBank NOC",
    email: "noc@securebank.sa",
    subject: "Priority: WAF false positives on checkout",
    body: "Checkout path blocked intermittently after WAF rule push. Customer impact high.",
    tier: "priority" as const,
    status: "in_progress" as const,
    adminNotes: "Temporary exception applied; reviewing rule set.",
  },
  {
    name: "Pulse Health",
    email: "platform@pulsehealth.sa",
    subject: "Backup restore drill for Azure SQL",
    body: "Schedule and execute quarterly restore drill for patient DB replica.",
    tier: "managed-operations" as const,
    status: "new" as const,
    adminNotes: "",
  },
  {
    name: "DesertSoft IT",
    email: "it@desertsoft.com",
    subject: "VPN gateway failover test",
    body: "Need coordinated change window for hybrid VPN failover test next week.",
    tier: "standard" as const,
    status: "closed" as const,
    adminNotes: "Test completed successfully.",
  },
  {
    name: "Sky Networks",
    email: "platform@skynetworks.io",
    subject: "Argo CD app out of sync after helm bump",
    body: "payments-api out of sync in prod. Diff shows unexpected ConfigMap change.",
    tier: "priority" as const,
    status: "new" as const,
    adminNotes: "",
  },
  {
    name: "City Bank Digital",
    email: "cloud@citybank.example",
    subject: "Cost anomaly on storage account",
    body: "Storage egress cost spiked 3x this week. Need investigation and lifecycle policy review.",
    tier: "standard" as const,
    status: "resolved" as const,
    adminNotes: "Hot tier transition fixed; lifecycle policy applied.",
  },
];

async function seed() {
  await connectDb();

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  await AdminUser.findOneAndUpdate(
    { email: env.ADMIN_EMAIL.toLowerCase() },
    {
      email: env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      name: "Intelligent-Cloud Admin",
    },
    { upsert: true, new: true },
  );
  console.log(`[seed] Admin ready: ${env.ADMIN_EMAIL}`);

  await Settings.findOneAndUpdate(
    { key: "site" },
    {
      key: "site",
      email: "sales@intelligent-cloud.com",
      supportEmail: "support@intelligent-cloud.com",
      whatsapp: "+966596264058",
      phone: "+966596264058",
      address: "Remote-first, serving clients globally",
      addressAr: "عن بُعد أولاً، نخدم العملاء عالميًا",
      social: {
        linkedin: "https://www.linkedin.com/company/intelligent-cloud",
        twitter: "",
        instagram: "",
        youtube: "",
      },
      seo: {
        defaultTitle: "Cloud Services | Intelligent Cloud",
        defaultDescription:
          "Intelligent Cloud provides Cloud Migration, Managed Cloud, AI Solutions, Cybersecurity, DevOps, and Data Analytics services for startups and enterprises.",
        defaultTitleAr: "خدمات السحابة | Intelligent Cloud",
        defaultDescriptionAr:
          "توفر Intelligent Cloud خدمات ترحيل السحابة والسحابة المُدارة وحلول الذكاء الاصطناعي والأمن السيبراني وDevOps وتحليلات البيانات للشركات الناشئة والمؤسسات.",
        ogImageUrl: "",
      },
    },
    { upsert: true, new: true },
  );
  console.log("[seed] Settings ready");

  for (const service of servicesSeed) {
    await Service.findOneAndUpdate({ slug: service.slug }, service, {
      upsert: true,
      new: true,
    });
  }
  console.log(`[seed] Services: ${servicesSeed.length}`);

  for (const solution of solutionsSeed) {
    await Solution.findOneAndUpdate({ slug: solution.slug }, solution, {
      upsert: true,
      new: true,
    });
  }
  console.log(`[seed] Solutions: ${solutionsSeed.length}`);

  for (const faq of faqsSeed) {
    await Faq.findOneAndUpdate({ question: faq.question }, faq, {
      upsert: true,
      new: true,
    });
  }
  console.log(`[seed] FAQs: ${faqsSeed.length}`);

  let articleCount = 0;
  for (const category of docCategoriesSeed) {
    const saved = await DocCategory.findOneAndUpdate({ slug: category.slug }, category, {
      upsert: true,
      new: true,
    });

    await DocArticle.findOneAndUpdate(
      { category: saved!._id, slug: "overview" },
      {
        title: `${category.title} Overview`,
        slug: "overview",
        category: saved!._id,
        summary: category.description,
        order: 1,
        published: true,
        bodyHtml: overviewHtml(category.title, category.description),
      },
      { upsert: true, new: true },
    );
    articleCount += 1;

    for (const article of extraArticlesByCategory[category.slug] ?? []) {
      await DocArticle.findOneAndUpdate(
        { category: saved!._id, slug: article.slug },
        {
          ...article,
          category: saved!._id,
          published: true,
        },
        { upsert: true, new: true },
      );
      articleCount += 1;
    }
  }
  console.log(`[seed] Doc categories: ${docCategoriesSeed.length}, articles: ${articleCount}`);

  for (const partner of partnersSeed) {
    await Partner.findOneAndUpdate({ name: partner.name }, partner, {
      upsert: true,
      new: true,
    });
  }
  console.log(`[seed] Partners: ${partnersSeed.length}`);

  // Demo leads/tickets — insert only when collection is empty to avoid duplicates on re-seed
  const contactCount = await ContactSubmission.countDocuments();
  if (contactCount === 0) {
    await ContactSubmission.insertMany(contactsSeed);
    console.log(`[seed] Contacts inserted: ${contactsSeed.length}`);
  } else {
    console.log(`[seed] Contacts skipped (already ${contactCount})`);
  }

  const bookingCount = await BookingRequest.countDocuments();
  if (bookingCount === 0) {
    await BookingRequest.insertMany(bookingsSeed);
    console.log(`[seed] Bookings inserted: ${bookingsSeed.length}`);
  } else {
    console.log(`[seed] Bookings skipped (already ${bookingCount})`);
  }

  const ticketCount = await Ticket.countDocuments();
  if (ticketCount === 0) {
    await Ticket.insertMany(ticketsSeed);
    console.log(`[seed] Tickets inserted: ${ticketsSeed.length}`);
  } else {
    console.log(`[seed] Tickets skipped (already ${ticketCount})`);
  }

  await disconnectDb();
  console.log("[seed] Done");
}

seed().catch(async (err) => {
  console.error("[seed] Failed:", err);
  await disconnectDb().catch(() => undefined);
  process.exit(1);
});
