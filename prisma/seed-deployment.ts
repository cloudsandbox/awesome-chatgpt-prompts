/**
 * Deployment Seed Script for prompts.chat
 *
 * This script creates all necessary seed data for a fresh deployment:
 * - Admin users
 * - Demo users (Volue team)
 * - Categories
 * - Tags
 * - Sample prompts with tags
 * - Votes and comments for engagement
 *
 * Safe to run multiple times - uses upsert operations.
 *
 * Usage:
 *   npx tsx prisma/seed-deployment.ts
 *
 * Test Credentials:
 *   Admin: admin@prompts.chat / password123
 *   Demo Admin: demo@volue.com / demo123
 *   Regular Users: erik.hansen@volue.com / demo123 (and others)
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ============================================================================
// CONFIGURATION
// ============================================================================

const ADMIN_PASSWORD = "password123";
const DEMO_PASSWORD = "demo123";

// Categories with icons (using icon names from src/lib/icons.ts)
const CATEGORIES = [
  { name: "Sales", slug: "sales", icon: "sales", description: "Prompts for customer outreach, proposals, and sales communication", order: 1 },
  { name: "Marketing", slug: "marketing", icon: "marketing", description: "Content creation, campaigns, and brand messaging", order: 2 },
  { name: "Engineering", slug: "engineering", icon: "engineering", description: "Code assistance, debugging, documentation, and technical writing", order: 3 },
  { name: "Product Management", slug: "product-management", icon: "product", description: "PRDs, user stories, and feature prioritization", order: 4 },
  { name: "Customer Support", slug: "customer-support", icon: "support", description: "Support responses, knowledge base articles, and customer communication", order: 5 },
  { name: "Human Resources", slug: "human-resources", icon: "hr", description: "Job descriptions, performance reviews, and HR documentation", order: 6 },
  { name: "Finance", slug: "finance", icon: "finance", description: "Financial reports, budget justifications, and analysis", order: 7 },
  { name: "Operations", slug: "operations", icon: "operations", description: "Process documentation, SOPs, and operational workflows", order: 8 },
  { name: "Productivity", slug: "productivity", icon: "productivity", description: "General productivity, meeting notes, and personal workflows", order: 9 },
];

// Tags with colors
const TAGS = [
  // Use case tags
  { name: "Writing", slug: "writing", color: "#3b82f6" },
  { name: "Analysis", slug: "analysis", color: "#8b5cf6" },
  { name: "Code", slug: "code", color: "#10b981" },
  { name: "Data", slug: "data", color: "#f59e0b" },
  { name: "Communication", slug: "communication", color: "#ec4899" },
  { name: "Planning", slug: "planning", color: "#6366f1" },
  { name: "Research", slug: "research", color: "#14b8a6" },
  { name: "Creative", slug: "creative", color: "#f97316" },

  // Complexity tags
  { name: "Beginner", slug: "beginner", color: "#22c55e" },
  { name: "Advanced", slug: "advanced", color: "#ef4444" },

  // Format tags
  { name: "Template", slug: "template", color: "#64748b" },
  { name: "Framework", slug: "framework", color: "#0ea5e9" },
  { name: "Checklist", slug: "checklist", color: "#a855f7" },

  // Domain tags
  { name: "Energy", slug: "energy", color: "#eab308" },
  { name: "Tech", slug: "tech", color: "#06b6d4" },
  { name: "Business", slug: "business", color: "#84cc16" },
];

// Admin users
const ADMIN_USERS = [
  { email: "admin@prompts.chat", username: "admin", name: "Admin User", password: ADMIN_PASSWORD, role: "ADMIN" as const },
  { email: "demo@volue.com", username: "volue-demo", name: "Volue Demo User", password: DEMO_PASSWORD, role: "ADMIN" as const },
];

// Demo users (Volue team)
const DEMO_USERS = [
  { email: "erik.hansen@volue.com", username: "erik.hansen", name: "Erik Hansen" },
  { email: "ingrid.berg@volue.com", username: "ingrid.berg", name: "Ingrid Berg" },
  { email: "magnus.larsen@volue.com", username: "magnus.larsen", name: "Magnus Larsen" },
  { email: "sofie.andersen@volue.com", username: "sofie.andersen", name: "Sofie Andersen" },
  { email: "ole.nilsen@volue.com", username: "ole.nilsen", name: "Ole Nilsen" },
  { email: "kari.johansen@volue.com", username: "kari.johansen", name: "Kari Johansen" },
];

// Sample prompts with category and tags
const SAMPLE_PROMPTS = [
  // Sales prompts
  {
    title: "Cold Email Generator",
    slug: "cold-email-generator",
    description: "Generate personalized cold outreach emails for potential clients",
    content: `You are a sales expert at Volue. Write a personalized cold email to a potential client.

Context:
- Company: {{company_name}}
- Industry: {{industry}}
- Pain point: {{pain_point}}

Requirements:
- Keep it under 150 words
- Personalize the opening line
- Focus on value, not features
- Include a clear call-to-action
- Professional but conversational tone`,
    category: "sales",
    tags: ["writing", "communication", "template", "business"],
    author: "volue-demo",
    daysAgo: 30,
  },
  {
    title: "Proposal Executive Summary",
    slug: "proposal-executive-summary",
    description: "Create executive summaries for client proposals",
    content: `Write an executive summary for a proposal to {{client_name}}.

Project details:
- Solution: {{solution_type}}
- Timeline: {{timeline}}
- Investment: {{budget_range}}

The summary should:
1. Open with the client's key challenge
2. Present our solution approach
3. Highlight 3 key benefits
4. Include expected ROI or outcomes
5. End with next steps

Keep it to one page maximum.`,
    category: "sales",
    tags: ["writing", "business", "template"],
    author: "erik.hansen",
    daysAgo: 25,
  },

  // Engineering prompts
  {
    title: "Code Review Assistant",
    slug: "code-review-assistant",
    description: "Get structured feedback on code changes",
    content: `You are a senior software engineer conducting a code review. Analyze the provided code for:

**Code Quality:**
- Readability and naming conventions
- Code organization and structure
- DRY principle adherence

**Best Practices:**
- Error handling
- Input validation
- Security considerations

**Performance:**
- Algorithm efficiency
- Memory usage
- Potential bottlenecks

**Testing:**
- Test coverage suggestions
- Edge cases to consider

Provide feedback in a constructive manner with specific suggestions and code examples where helpful.

Code to review:
\`\`\`{{language}}
{{code}}
\`\`\``,
    category: "engineering",
    tags: ["code", "analysis", "framework", "tech"],
    author: "ingrid.berg",
    daysAgo: 28,
  },
  {
    title: "Debug Assistant",
    slug: "debug-assistant",
    description: "Help diagnose and fix technical issues",
    content: `Help me debug this issue:

**Error message:**
{{error_message}}

**Context:**
- Language/Framework: {{tech_stack}}
- What I was trying to do: {{action}}
- What I expected: {{expected}}
- What happened: {{actual}}

Please:
1. Explain what the error means
2. Identify likely causes
3. Suggest debugging steps
4. Provide potential solutions with code examples`,
    category: "engineering",
    tags: ["code", "analysis", "tech", "beginner"],
    author: "magnus.larsen",
    daysAgo: 20,
  },
  {
    title: "Technical Documentation Writer",
    slug: "technical-documentation-writer",
    description: "Generate documentation for APIs and services",
    content: `Write technical documentation for the following:

Component/API: {{component_name}}
Purpose: {{purpose}}
Key functionality: {{functionality}}

Include:
1. **Overview** - What it does and why it exists
2. **Prerequisites** - Required setup or dependencies
3. **Installation/Setup** - Step-by-step instructions
4. **Usage Examples** - Common use cases with code
5. **API Reference** - Parameters, returns, errors
6. **Troubleshooting** - Common issues and solutions

Use clear headings, code blocks, and bullet points. Target audience: {{audience}}`,
    category: "engineering",
    tags: ["writing", "code", "template", "tech"],
    author: "volue-demo",
    daysAgo: 15,
  },

  // Product Management prompts
  {
    title: "User Story Generator",
    slug: "user-story-generator",
    description: "Create well-formatted user stories with acceptance criteria",
    content: `Create a user story for the following feature:

Feature: {{feature_description}}
User type: {{user_type}}
Business goal: {{goal}}

Format:
**User Story:**
As a [user type], I want to [action] so that [benefit].

**Acceptance Criteria:**
- Given [context], when [action], then [outcome]
- (Include 3-5 criteria)

**Technical Notes:**
- Dependencies
- Edge cases to consider
- Estimated complexity (S/M/L/XL)`,
    category: "product-management",
    tags: ["planning", "template", "business"],
    author: "sofie.andersen",
    daysAgo: 22,
  },
  {
    title: "Feature Prioritization Framework",
    slug: "feature-prioritization-framework",
    description: "Evaluate and prioritize feature requests using RICE framework",
    content: `Analyze this feature request using the RICE framework:

Feature: {{feature_name}}
Description: {{description}}

Evaluate:
**Reach** - How many users will this impact per quarter?
**Impact** - What's the expected impact? (3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal)
**Confidence** - How confident are we? (100%=high, 80%=medium, 50%=low)
**Effort** - Person-months required

Calculate RICE score: (Reach × Impact × Confidence) / Effort

Provide:
1. Score breakdown with reasoning
2. Comparison context (what score is good?)
3. Recommendation (prioritize/defer/needs more info)
4. Key risks or dependencies`,
    category: "product-management",
    tags: ["analysis", "framework", "planning", "business"],
    author: "ole.nilsen",
    daysAgo: 18,
  },

  // Marketing prompts
  {
    title: "LinkedIn Post Generator",
    slug: "linkedin-post-generator",
    description: "Create engaging LinkedIn posts for company updates",
    content: `Write a LinkedIn post for Volue about: {{topic}}

Requirements:
- Hook readers in the first line
- Include relevant energy industry insights
- Add a call-to-action or question for engagement
- Keep it between 150-300 words
- Suggest 3-5 relevant hashtags

Tone: Professional but approachable, thought leadership focused

Context about Volue: Leading provider of technology and services for energy markets, helping customers in power, renewables, and energy trading.`,
    category: "marketing",
    tags: ["writing", "communication", "creative", "energy"],
    author: "kari.johansen",
    daysAgo: 12,
  },
  {
    title: "Case Study Outline",
    slug: "case-study-outline",
    description: "Structure customer success stories",
    content: `Create a case study outline for:

Customer: {{customer_name}}
Industry: {{industry}}
Solution used: {{solution}}
Key results: {{results}}

Structure:
1. **Executive Summary** (2-3 sentences)
2. **Customer Background** - Who they are, their business
3. **Challenge** - What problem they faced
4. **Solution** - How our product helped
5. **Implementation** - Key steps and timeline
6. **Results** - Quantified outcomes with metrics
7. **Customer Quote** - Suggested testimonial
8. **Next Steps** - CTA for readers

Include suggested visuals or data points to include.`,
    category: "marketing",
    tags: ["writing", "template", "business"],
    author: "volue-demo",
    daysAgo: 10,
  },

  // Customer Support prompts
  {
    title: "Support Response Generator",
    slug: "support-response-generator",
    description: "Create professional customer support responses",
    content: `Write a support response for the following ticket:

**Customer issue:** {{issue}}
**Product/Service:** {{product}}
**Customer sentiment:** {{sentiment}}

Guidelines:
- Acknowledge their frustration (if applicable)
- Provide clear, step-by-step solution
- Use simple language, avoid jargon
- Include relevant documentation links
- Offer additional help if needed
- Professional but empathetic tone

Response should be concise but complete.`,
    category: "customer-support",
    tags: ["writing", "communication", "template"],
    author: "ingrid.berg",
    daysAgo: 8,
  },
  {
    title: "Knowledge Base Article",
    slug: "knowledge-base-article",
    description: "Create self-service help documentation",
    content: `Write a knowledge base article for: {{topic}}

Target audience: {{audience}}
Common questions about this: {{questions}}

Structure:
1. **Title** - Clear, searchable title
2. **Summary** - One paragraph overview
3. **Prerequisites** - What users need before starting
4. **Step-by-step Instructions** - Numbered steps with screenshots noted
5. **FAQ** - 3-5 common questions
6. **Related Articles** - Suggested links
7. **Contact Support** - When to reach out

Keep instructions clear and scannable. Use bullet points and short paragraphs.`,
    category: "customer-support",
    tags: ["writing", "template", "beginner"],
    author: "erik.hansen",
    daysAgo: 6,
  },

  // HR prompts
  {
    title: "Job Description Generator",
    slug: "job-description-generator",
    description: "Create comprehensive job postings",
    content: `Write a job description for: {{job_title}}

Department: {{department}}
Level: {{level}}
Location: {{location}}

Include:
1. **About Volue** - Brief company intro
2. **Role Overview** - What this person will do
3. **Key Responsibilities** - 5-7 bullet points
4. **Requirements** - Must-have qualifications
5. **Nice to Have** - Preferred qualifications
6. **What We Offer** - Benefits and culture
7. **How to Apply** - Next steps

Tone: Inclusive, engaging, authentic to Volue culture.`,
    category: "human-resources",
    tags: ["writing", "template", "business"],
    author: "volue-demo",
    daysAgo: 14,
  },
  {
    title: "Performance Review Framework",
    slug: "performance-review-framework",
    description: "Structure performance feedback conversations",
    content: `Create a performance review framework for: {{employee_role}}

Review period: {{period}}

Structure the review:
1. **Accomplishments** - Key achievements this period
2. **Strengths** - What they do well
3. **Growth Areas** - Where they can improve
4. **Goals Review** - Progress on previous goals
5. **New Goals** - 3-5 SMART goals for next period
6. **Development Plan** - Skills to develop, resources needed
7. **Manager Feedback** - Overall assessment
8. **Employee Input** - Questions for the employee

Keep feedback specific, actionable, and balanced.`,
    category: "human-resources",
    tags: ["framework", "planning", "communication"],
    author: "sofie.andersen",
    daysAgo: 16,
  },

  // Finance prompts
  {
    title: "Financial Report Summary",
    slug: "financial-report-summary",
    description: "Summarize financial data for stakeholders",
    content: `Create an executive summary for the following financial data:

Period: {{period}}
Key metrics: {{metrics}}

Include:
1. **Executive Summary** - 3-4 sentence overview
2. **Revenue Highlights** - Key figures and trends
3. **Cost Analysis** - Major expense categories
4. **Profitability** - Margins and comparisons
5. **Cash Flow** - Key movements
6. **YoY Comparison** - Changes from previous period
7. **Outlook** - Forward-looking statements
8. **Action Items** - Recommendations

Keep it concise and focused on insights, not just numbers.`,
    category: "finance",
    tags: ["analysis", "data", "template", "business"],
    author: "magnus.larsen",
    daysAgo: 11,
  },
  {
    title: "Budget Justification",
    slug: "budget-justification",
    description: "Write business cases for budget requests",
    content: `Write a budget justification for: {{request}}

Amount requested: {{amount}}
Department: {{department}}
Purpose: {{purpose}}

Structure:
1. **Executive Summary** - One paragraph overview
2. **Business Need** - Why this is necessary
3. **Proposed Solution** - What we're requesting
4. **Cost Breakdown** - Itemized costs
5. **Expected ROI** - Quantified benefits
6. **Risk of Not Proceeding** - What happens if denied
7. **Timeline** - When funds are needed
8. **Alternatives Considered** - Other options evaluated

Make a compelling case with clear metrics.`,
    category: "finance",
    tags: ["writing", "business", "template"],
    author: "ole.nilsen",
    daysAgo: 9,
  },

  // Operations prompts
  {
    title: "Process Documentation Template",
    slug: "process-documentation-template",
    description: "Document standard operating procedures",
    content: `Create an SOP for: {{process_name}}

Department: {{department}}
Process owner: {{owner}}

Document structure:
1. **Purpose** - Why this process exists
2. **Scope** - What it covers and doesn't cover
3. **Roles & Responsibilities** - Who does what
4. **Prerequisites** - What's needed before starting
5. **Process Steps** - Detailed, numbered steps
6. **Decision Points** - Where choices are made
7. **Exceptions** - How to handle edge cases
8. **Metrics** - How to measure success
9. **Revision History** - Version tracking

Include flowchart suggestions where helpful.`,
    category: "operations",
    tags: ["template", "planning", "checklist"],
    author: "kari.johansen",
    daysAgo: 7,
  },
  {
    title: "Meeting Agenda Generator",
    slug: "meeting-agenda-generator",
    description: "Create structured meeting agendas",
    content: `Create a meeting agenda for: {{meeting_type}}

Attendees: {{attendees}}
Duration: {{duration}}
Objectives: {{objectives}}

Agenda format:
1. **Meeting Details** - Date, time, location/link
2. **Attendees** - Required and optional
3. **Objectives** - What we want to achieve
4. **Agenda Items** - Topic, owner, time allocation
5. **Pre-work** - What attendees should prepare
6. **Notes Section** - Space for minutes
7. **Action Items** - Template for follow-ups
8. **Next Meeting** - Scheduling placeholder

Keep the meeting focused and time-boxed.`,
    category: "operations",
    tags: ["template", "planning", "communication"],
    author: "volue-demo",
    daysAgo: 5,
  },

  // Productivity prompts
  {
    title: "Meeting Notes Summarizer",
    slug: "meeting-notes-summarizer",
    description: "Transform meeting transcripts into structured summaries",
    content: `Summarize the following meeting transcript:

{{transcript}}

Output format:
1. **Meeting Overview**
   - Date, attendees, duration
   - Purpose of meeting

2. **Key Discussion Points**
   - Main topics covered (3-5 bullets)

3. **Decisions Made**
   - Clear list with context

4. **Action Items**
   | Action | Owner | Due Date |

5. **Open Questions**
   - Items needing follow-up

6. **Next Steps**
   - Scheduled follow-ups

Be concise but complete. Attribute decisions and actions to specific people.`,
    category: "productivity",
    tags: ["analysis", "template", "communication"],
    author: "ingrid.berg",
    daysAgo: 4,
  },
  {
    title: "Energy Market Analysis Assistant",
    slug: "energy-market-analysis-assistant",
    description: "Analyze energy market trends and forecasting",
    content: `You are an expert energy market analyst specializing in Nordic power markets.

Analyze the following market data:
{{market_data}}

Provide:
1. **Executive Summary** - Key takeaways in 3-4 sentences
2. **Market Conditions** - Current spot prices, forward curves, volumes
3. **Key Drivers** - Weather, demand, supply constraints
4. **Price Forecast** - Short and medium-term outlook
5. **Risk Factors** - What could change the outlook
6. **Recommendations** - Actionable insights

Support your analysis with specific data points and explain your reasoning.`,
    category: "productivity",
    tags: ["analysis", "data", "energy", "advanced"],
    author: "erik.hansen",
    daysAgo: 45,
  },
  {
    title: "SQL Query Optimizer",
    slug: "sql-query-optimizer",
    description: "Analyze and optimize SQL queries for better performance",
    content: `Analyze this SQL query for performance:

\`\`\`sql
{{query}}
\`\`\`

Database: {{database_type}}
Table sizes: {{table_info}}

Provide:
1. **Current Issues** - What's slow and why
2. **Optimization Suggestions**
   - Query rewrites
   - Index recommendations
   - Join optimizations
3. **Optimized Query** - Rewritten version
4. **Index Creation** - DDL statements if needed
5. **Expected Improvement** - Estimated performance gain
6. **Trade-offs** - Any considerations

Explain each change and why it helps.`,
    category: "productivity",
    tags: ["code", "data", "analysis", "advanced", "tech"],
    author: "sofie.andersen",
    daysAgo: 28,
  },
];

// Sample comments for engagement
const SAMPLE_COMMENTS = [
  { promptSlug: "cold-email-generator", authorUsername: "erik.hansen", content: "This has significantly improved our outreach response rates. Great template!", daysAgo: 25 },
  { promptSlug: "cold-email-generator", authorUsername: "sofie.andersen", content: "Would love to see a version for follow-up emails too.", daysAgo: 20 },
  { promptSlug: "code-review-assistant", authorUsername: "magnus.larsen", content: "Added this to our team's PR checklist. The security section is particularly useful.", daysAgo: 22 },
  { promptSlug: "debug-assistant", authorUsername: "ingrid.berg", content: "Saved me hours debugging a tricky async issue. The step-by-step approach is excellent.", daysAgo: 15 },
  { promptSlug: "user-story-generator", authorUsername: "ole.nilsen", content: "Finally, consistent user stories across the team. Thanks Sofie!", daysAgo: 18 },
  { promptSlug: "linkedin-post-generator", authorUsername: "volue-demo", content: "Our engagement has gone up 40% since using this. The hook suggestions are on point.", daysAgo: 10 },
  { promptSlug: "support-response-generator", authorUsername: "kari.johansen", content: "Customer satisfaction scores improved after implementing this template.", daysAgo: 6 },
  { promptSlug: "sql-query-optimizer", authorUsername: "erik.hansen", content: "Reduced our report query time from 30s to 2s. Incredible!", daysAgo: 20 },
  { promptSlug: "meeting-notes-summarizer", authorUsername: "magnus.larsen", content: "No more missed action items. This is now mandatory for all our meetings.", daysAgo: 3 },
  { promptSlug: "energy-market-analysis-assistant", authorUsername: "ole.nilsen", content: "Essential for our daily market briefings. The Nordic market focus is perfect.", daysAgo: 40 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function daysAgoToDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(Math.floor(Math.random() * 10) + 8, Math.floor(Math.random() * 60), 0, 0);
  return date;
}

function log(message: string) {
  console.log(message);
}

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedCategories() {
  log("\n📁 Seeding categories...");

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, description: cat.description, order: cat.order },
      create: cat,
    });
    log(`   ✅ ${cat.name}`);
  }
}

async function seedTags() {
  log("\n🏷️  Seeding tags...");

  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name, color: tag.color },
      create: tag,
    });
    log(`   ✅ ${tag.name} (${tag.color})`);
  }
}

async function seedUsers() {
  log("\n👤 Seeding users...");

  // Admin users
  for (const user of ADMIN_USERS) {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, password: hashedPassword, role: user.role },
      create: {
        ...user,
        password: hashedPassword,
        verified: true,
        createdAt: daysAgoToDate(90),
      },
    });
    log(`   ✅ ${user.name} (${user.role})`);
  }

  // Demo users
  const demoPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  for (const user of DEMO_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, password: demoPasswordHash },
      create: {
        ...user,
        password: demoPasswordHash,
        role: "USER",
        verified: true,
        createdAt: daysAgoToDate(60 + Math.floor(Math.random() * 30)),
      },
    });
    log(`   ✅ ${user.name}`);
  }
}

async function seedPrompts() {
  log("\n📝 Seeding prompts...");

  // Get category and tag maps
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

  const tags = await prisma.tag.findMany();
  const tagMap = new Map(tags.map(t => [t.slug, t.id]));

  const users = await prisma.user.findMany();
  const userMap = new Map(users.map(u => [u.username, u.id]));

  for (const prompt of SAMPLE_PROMPTS) {
    const authorId = userMap.get(prompt.author);
    const categoryId = categoryMap.get(prompt.category);

    if (!authorId || !categoryId) {
      log(`   ⚠️  Skipping "${prompt.title}" - author or category not found`);
      continue;
    }

    const existingPrompt = await prisma.prompt.findFirst({ where: { slug: prompt.slug } });

    if (existingPrompt) {
      // Update tags on existing prompt
      await prisma.promptTag.deleteMany({ where: { promptId: existingPrompt.id } });
      for (const tagSlug of prompt.tags) {
        const tagId = tagMap.get(tagSlug);
        if (tagId) {
          await prisma.promptTag.create({
            data: { promptId: existingPrompt.id, tagId },
          });
        }
      }
      log(`   🔄 Updated tags for "${prompt.title}"`);
    } else {
      const createdAt = daysAgoToDate(prompt.daysAgo);

      const newPrompt = await prisma.prompt.create({
        data: {
          title: prompt.title,
          slug: prompt.slug,
          description: prompt.description,
          content: prompt.content,
          type: "TEXT",
          authorId,
          categoryId,
          viewCount: Math.floor(Math.random() * 500) + 50,
          createdAt,
          updatedAt: createdAt,
        },
      });

      // Add tags
      for (const tagSlug of prompt.tags) {
        const tagId = tagMap.get(tagSlug);
        if (tagId) {
          await prisma.promptTag.create({
            data: { promptId: newPrompt.id, tagId },
          });
        }
      }

      // Create initial version
      await prisma.promptVersion.create({
        data: {
          promptId: newPrompt.id,
          version: 1,
          content: prompt.content,
          changeNote: "Initial version",
          createdBy: authorId,
          createdAt,
        },
      });

      log(`   ✅ "${prompt.title}" by @${prompt.author}`);
    }
  }
}

async function seedVotes() {
  log("\n👍 Seeding votes...");

  const prompts = await prisma.prompt.findMany({ select: { id: true, authorId: true } });
  const users = await prisma.user.findMany({ select: { id: true } });

  let voteCount = 0;

  for (const prompt of prompts) {
    const eligibleVoters = users.filter(u => u.id !== prompt.authorId);
    const numVotes = Math.floor(Math.random() * 4) + 2; // 2-5 votes per prompt
    const voters = eligibleVoters.sort(() => Math.random() - 0.5).slice(0, numVotes);

    for (const voter of voters) {
      const existing = await prisma.promptVote.findUnique({
        where: { userId_promptId: { userId: voter.id, promptId: prompt.id } },
      });

      if (!existing) {
        await prisma.promptVote.create({
          data: {
            userId: voter.id,
            promptId: prompt.id,
            createdAt: daysAgoToDate(Math.floor(Math.random() * 30)),
          },
        });
        voteCount++;
      }
    }
  }

  log(`   ✅ Added ${voteCount} votes`);
}

async function seedComments() {
  log("\n💬 Seeding comments...");

  const users = await prisma.user.findMany();
  const userMap = new Map(users.map(u => [u.username, u.id]));

  let commentCount = 0;

  for (const comment of SAMPLE_COMMENTS) {
    const authorId = userMap.get(comment.authorUsername);
    const prompt = await prisma.prompt.findFirst({ where: { slug: comment.promptSlug } });

    if (!authorId || !prompt) continue;

    const existing = await prisma.comment.findFirst({
      where: { promptId: prompt.id, authorId, content: comment.content },
    });

    if (!existing) {
      const newComment = await prisma.comment.create({
        data: {
          content: comment.content,
          promptId: prompt.id,
          authorId,
          createdAt: daysAgoToDate(comment.daysAgo),
          updatedAt: daysAgoToDate(comment.daysAgo),
        },
      });

      // Add some upvotes
      const otherUsers = users.filter(u => u.id !== authorId);
      const numUpvotes = Math.floor(Math.random() * 3) + 1;
      const voters = otherUsers.sort(() => Math.random() - 0.5).slice(0, numUpvotes);

      for (const voter of voters) {
        await prisma.commentVote.create({
          data: { userId: voter.id, commentId: newComment.id, value: 1 },
        });
      }

      await prisma.comment.update({
        where: { id: newComment.id },
        data: { score: numUpvotes },
      });

      commentCount++;
    }
  }

  log(`   ✅ Added ${commentCount} comments`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("🌱 Starting deployment seed...\n");
  console.log("=".repeat(50));

  await seedCategories();
  await seedTags();
  await seedUsers();
  await seedPrompts();
  await seedVotes();
  await seedComments();

  console.log("\n" + "=".repeat(50));
  console.log("\n🎉 Deployment seed complete!\n");

  console.log("📋 Test Credentials:");
  console.log("   Admin: admin@prompts.chat / password123");
  console.log("   Demo Admin: demo@volue.com / demo123");
  console.log("   Regular User: erik.hansen@volue.com / demo123");
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
