export interface RolePhraseCategory {
  role: string;
  category: string;
  summaryExamples: string[];
  bulletPoints: string[];
  suggestedSkills: string[];
}

export const PHRASES_LIBRARY: RolePhraseCategory[] = [
  {
    role: "Software Engineer / Developer",
    category: "Technology",
    summaryExamples: [
      "Results-oriented Software Engineer with 5+ years of experience designing, architecting, and scaling enterprise web applications in modern React, Node.js, and cloud ecosystems.",
      "Detail-driven Full Stack Developer skilled at building robust REST & GraphQL APIs, microservices, and high-performance user interfaces with 99.9% uptime track records.",
      "Proactive Software Engineer passionate about clean code, test-driven development (TDD), and continuous delivery, reducing deployment cycles by 40%."
    ],
    bulletPoints: [
      "Architected and deployed microservices architecture handling over 2.5M daily active users with sub-100ms latency.",
      "Spearheaded the migration of legacy monolith to React and TypeScript, resulting in a 35% improvement in page load speed and 20% higher user retention.",
      "Implemented comprehensive CI/CD pipelines using GitHub Actions, cutting release turnaround times from 3 days to under 45 minutes.",
      "Mentored 6 junior engineers, conducted regular code reviews, and championed best security and testing practices across the team.",
      "Optimized PostgreSQL database queries and introduced Redis caching layer, reducing server compute costs by $18,000 annually.",
      "Collaborated with cross-functional product, UX, and QA teams in fast-paced 2-week Agile sprint cycles."
    ],
    suggestedSkills: ["TypeScript", "React", "Node.js", "Next.js", "Docker", "AWS", "PostgreSQL", "GraphQL", "CI/CD", "Tailwind CSS", "Redis", "Unit Testing"]
  },
  {
    role: "Product Manager",
    category: "Management",
    summaryExamples: [
      "Data-led Senior Product Manager with an established history of launching 0-to-1 SaaS products that achieved $4M+ ARR within the first 18 months of launch.",
      "Strategic Product Manager specializing in user discovery, product-market fit, and sprint execution across high-growth B2B & B2C platforms."
    ],
    bulletPoints: [
      "Owned end-to-end product roadmap from initial customer discovery interviews through to launch and post-launch iteration.",
      "Increased user onboarding completion rate by 28% through A/B testing user journeys and streamlining account activation steps.",
      "Partnered with engineering and design leads to prioritize high-value epics, maintaining a 94% on-time sprint velocity.",
      "Conducted 50+ qualitative user interviews and analyzed telemetry in Mixpanel to prioritize product roadmap initiatives.",
      "Pioneered self-serve monetization tier that contributed £650K in net-new recurring revenue within two quarters."
    ],
    suggestedSkills: ["Roadmapping", "User Research", "Agile / Scrum", "A/B Testing", "Data Analytics", "Mixpanel", "Jira", "Go-To-Market Strategy", "Stakeholder Management"]
  },
  {
    role: "Marketing Manager / Specialist",
    category: "Marketing",
    summaryExamples: [
      "Growth-driven Marketing Manager with 6+ years driving multi-channel digital acquisition, brand awareness, and inbound demand generation.",
      "Creative Digital Marketer skilled in SEO, paid performance marketing, lifecycle CRM campaigns, and ROI optimization across global markets."
    ],
    bulletPoints: [
      "Managed an annual paid marketing budget of £240,000 across Google Ads and LinkedIn, delivering an average 4.2x ROAS.",
      "Engineered an organic SEO strategy that tripled monthly organic website visitors from 45,000 to over 160,000 within 12 months.",
      "Designed and automated multi-touch email nurture sequences, boosting lead-to-opportunity conversion by 34%.",
      "Revamped brand messaging and marketing collateral across 4 product lines, resulting in a 22% increase in sales pipeline velocity.",
      "Produced comprehensive monthly KPI dashboards evaluating CAC, LTV, conversion funnels, and marketing attribution."
    ],
    suggestedSkills: ["SEO & SEM", "Google Ads", "Content Strategy", "Email Marketing", "HubSpot", "Google Analytics 4", "Copywriting", "Social Media Advertising"]
  },
  {
    role: "Project Manager / Scrum Master",
    category: "Management",
    summaryExamples: [
      "Certified Project Manager (PMP) with proven expertise delivering complex multi-million pound IT and digital transformation projects on time and within budget.",
      "Adaptable Project Manager experienced in cross-functional governance, stakeholder alignment, risk mitigation, and agile delivery frameworks."
    ],
    bulletPoints: [
      "Delivered 14 enterprise software release milestones on time and under budget with an average stakeholder satisfaction score of 96%.",
      "Identified and mitigated high-risk project bottlenecks early, preventing an estimated £80,000 in potential scope creep overrun.",
      "Standardized Agile sprint ceremonies, backlog grooming, and sprint retrospectives across 4 distributed engineering squads.",
      "Managed weekly governance meetings and clear executive steering committees with C-level stakeholders.",
      "Implemented automated resource allocation tracking in Asana and Jira, boosting billable utilization by 18%."
    ],
    suggestedSkills: ["Agile & Scrum", "Risk Management", "Budgeting", "Jira", "Asana", "Stakeholder Management", "PMP", "Resource Planning", "Change Management"]
  },
  {
    role: "Sales Executive / Account Manager",
    category: "Sales",
    summaryExamples: [
      "Top-performing Account Executive with 4+ years of consistently exceeding annual quotas (130%+ quota attainment) in B2B enterprise software sales.",
      "Customer-centric Sales Professional skilled at complex deal negotiation, consultative selling, and establishing long-term executive partnerships."
    ],
    bulletPoints: [
      "Surpassed annual revenue target by 138%, closing £1.2M in new software contract value in FY2025.",
      "Cultivated strategic partnerships with Fortune 500 accounts, expanding existing account annual contract value (ACV) by 45%.",
      "Prospected and qualified 80+ enterprise leads quarterly through personalized cold outreach, social selling, and industry events.",
      "Delivered compelling tailored software demonstrations to VP and C-level decision-makers, maintaining a 32% demo-to-close ratio.",
      "Maintained meticulous sales hygiene in Salesforce CRM, ensuring accurate 90-day pipeline forecasting within 5% variance."
    ],
    suggestedSkills: ["B2B Sales", "Enterprise SaaS", "Salesforce", "Cold Outreach", "Negotiation", "Pipeline Management", "Consultative Selling", "Account Growth"]
  },
  {
    role: "Customer Support & Success",
    category: "Support",
    summaryExamples: [
      "Dedicated Customer Success Specialist passionate about delivering exceptional client onboarding, proactive retention, and resolving technical queries with empathy.",
      "Support Lead with proven experience scaling help center knowledge bases, reducing ticket volumes, and elevating CSAT ratings to 98%."
    ],
    bulletPoints: [
      "Maintained a 98.4% customer satisfaction (CSAT) rating across 2,400+ resolved tickets via Zendesk, email, and live chat.",
      "Reduced average first-response time from 4 hours to under 15 minutes by creating structured ticket routing workflows and canned responses.",
      "Authored 65+ technical articles for internal knowledge base and public help center, deflecting 25% of incoming tier-1 tickets.",
      "Partnered with churn-risk accounts to resolve systemic issues, successfully retaining £180K in recurring ARR.",
      "Conducted weekly product feedback roundtables with engineering to champion user pain points and feature requests."
    ],
    suggestedSkills: ["Zendesk", "Intercom", "Customer Empathy", "Problem Solving", "SLA Adherence", "Churn Reduction", "Ticketing Systems", "Onboarding"]
  },
  {
    role: "Financial Analyst / Accountant",
    category: "Finance",
    summaryExamples: [
      "Analytical Finance Professional with 5 years experience in financial modeling, variance analysis, budgeting, and corporate reporting.",
      "Detail-oriented Financial Analyst adept at forecasting, cash flow management, and translating complex financial data into actionable insights for leadership."
    ],
    bulletPoints: [
      "Built dynamic 3-statement financial models and scenario forecasts used by the CFO for quarterly board presentations.",
      "Conducted monthly budget vs. actual variance analysis across 8 departmental cost centers, identifying £95,000 in annual recurring savings.",
      "Streamlined month-end financial close workflows, reducing reconciliation turnaround time by 3 working days.",
      "Audited vendor contracts and billing discrepancies, securing £42,000 in refunds and vendor credit adjustments."
    ],
    suggestedSkills: ["Financial Modeling", "Excel (VBA/Macros)", "Variance Analysis", "Budgeting & Forecasting", "QuickBooks", "Power BI", "Corporate Tax", "GAAP / IFRS"]
  },
  {
    role: "Administrative Assistant / Office Manager",
    category: "Administration",
    summaryExamples: [
      "Highly organized Administrative Professional with 6+ years orchestrating executive calendars, travel logistics, and seamless office operations.",
      "Resourceful Office Manager skilled in vendor management, document preparation, and building productive workplace cultures."
    ],
    bulletPoints: [
      "Coordinated complex domestic and international travel itineraries, accommodations, and expense reports for 4 senior executives.",
      "Managed annual office operations budget of £120,000, negotiating preferred rates with key suppliers to reduce costs by 15%.",
      "Organized company-wide quarterly all-hands meetings, team retreats, and vendor exhibitions for over 150 attendees.",
      "Modernized filing system from paper archives to secure cloud storage, accelerating cross-departmental file retrieval by 70%."
    ],
    suggestedSkills: ["Calendar Management", "Travel Coordination", "Office Logistics", "Microsoft 365", "Google Workspace", "Event Planning", "Discretion & Confidentiality"]
  }
];
