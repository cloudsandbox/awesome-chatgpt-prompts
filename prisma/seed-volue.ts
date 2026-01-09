import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// =============================================================================
// TEST DATA CONFIGURATION (matches TESTING_GUIDE.md)
// =============================================================================

// Admin users
const adminUsers = [
  {
    email: "admin@prompts.chat",
    username: "admin",
    name: "Admin User",
    password: "password123",
    role: "ADMIN" as const,
  },
  {
    email: "demo@volue.com",
    username: "volue-demo",
    name: "Volue Demo",
    password: "demo123",
    role: "ADMIN" as const,
  },
];

// Regular Volue users (all use demo123 password)
const regularUsers = [
  { email: "erik.hansen@volue.com", username: "erik.hansen", name: "Erik Hansen" },
  { email: "ingrid.berg@volue.com", username: "ingrid.berg", name: "Ingrid Berg" },
  { email: "magnus.larsen@volue.com", username: "magnus.larsen", name: "Magnus Larsen" },
  { email: "sofie.andersen@volue.com", username: "sofie.andersen", name: "Sofie Andersen" },
  { email: "ole.nilsen@volue.com", username: "ole.nilsen", name: "Ole Nilsen" },
  { email: "kari.johansen@volue.com", username: "kari.johansen", name: "Kari Johansen" },
];

// Tags for filtering
const tags = [
  { name: "AI", slug: "ai", color: "#3B82F6" },
  { name: "Productivity", slug: "productivity", color: "#10B981" },
  { name: "Writing", slug: "writing", color: "#8B5CF6" },
  { name: "Code", slug: "code", color: "#F59E0B" },
  { name: "Email", slug: "email", color: "#EF4444" },
  { name: "Analysis", slug: "analysis", color: "#06B6D4" },
  { name: "Documentation", slug: "documentation", color: "#84CC16" },
  { name: "Templates", slug: "templates", color: "#EC4899" },
];

// Department categories for Volue
// Icon names must match LordIcon names (see src/components/categories/category-icon.tsx)
const departments = [
  { name: "Sales", slug: "sales", icon: "sales", description: "Prompts for customer outreach, proposals, and sales communication", order: 1, pinned: true },
  { name: "Marketing", slug: "marketing", icon: "marketing", description: "Content creation, campaigns, and brand messaging", order: 2, pinned: true },
  { name: "Engineering", slug: "engineering", icon: "engineering", description: "Code assistance, debugging, documentation, and technical writing", order: 3, pinned: true },
  { name: "Product Management", slug: "product-management", icon: "product", description: "Product specs, user stories, roadmaps, and feature planning", order: 4, pinned: true },
  { name: "Customer Support", slug: "customer-support", icon: "support", description: "Customer responses, troubleshooting guides, and support documentation", order: 5, pinned: false },
  { name: "Human Resources", slug: "human-resources", icon: "hr", description: "Job descriptions, policies, onboarding, and employee communication", order: 6, pinned: false },
  { name: "Finance", slug: "finance", icon: "finance", description: "Financial reports, analysis, and business documentation", order: 7, pinned: false },
  { name: "Operations", slug: "operations", icon: "operations", description: "Process documentation, workflows, and operational efficiency", order: 8, pinned: false },
];

// Sample prompts for each department with author assignment
const samplePrompts: Record<string, Array<{ title: string; description: string; content: string; authorIndex: number; tagSlugs: string[] }>> = {
  sales: [
    {
      title: "Cold Email Generator",
      description: "Generate personalized cold outreach emails for potential clients",
      content: `You are a sales expert at Volue. Write a personalized cold email to a potential client.

Context:
- Company: {{company_name}}
- Industry: {{industry}}
- Pain point: {{pain_point}}

The email should:
1. Have a compelling subject line
2. Open with something specific about their company
3. Briefly explain how Volue's energy solutions can help
4. Include a clear call-to-action
5. Be concise (under 150 words)

Write the email now.`,
      authorIndex: 0, // Erik
      tagSlugs: ["email", "ai", "productivity"],
    },
    {
      title: "Proposal Executive Summary",
      description: "Create executive summaries for client proposals",
      content: `Write an executive summary for a proposal to {{client_name}}.

Project details:
- Solution: {{solution_type}}
- Timeline: {{timeline}}
- Key benefits: {{benefits}}

The summary should:
1. Address the client's specific challenges
2. Highlight 3 key benefits of our solution
3. Include projected ROI or efficiency gains
4. Be professional and concise (200-300 words)
5. End with next steps`,
      authorIndex: 1, // Ingrid
      tagSlugs: ["writing", "templates"],
    },
    {
      title: "Objection Handler",
      description: "Generate responses to common sales objections",
      content: `You are an experienced sales professional at Volue. A prospect has raised the following objection:

"{{objection}}"

Provide a thoughtful response that:
1. Acknowledges their concern
2. Reframes the objection positively
3. Provides evidence or examples from the energy sector
4. Guides back to the value proposition
5. Ends with a question to continue the conversation

Keep the tone consultative, not pushy.`,
      authorIndex: 0, // Erik
      tagSlugs: ["ai", "productivity"],
    },
    {
      title: "Sales Call Summary",
      description: "Summarize sales calls and identify next steps",
      content: `Summarize the following sales call notes and identify actionable next steps:

**Call Notes:**
{{call_notes}}

Please provide:
1. **Key Discussion Points**: Main topics covered
2. **Client Pain Points**: Issues or challenges mentioned
3. **Interest Level**: Rate 1-5 with reasoning
4. **Objections Raised**: Any concerns mentioned
5. **Next Steps**: Specific follow-up actions with deadlines
6. **Recommended Approach**: Strategy for next interaction`,
      authorIndex: 2, // Magnus
      tagSlugs: ["ai", "productivity", "analysis"],
    },
  ],
  marketing: [
    {
      title: "LinkedIn Post Generator",
      description: "Create engaging LinkedIn posts for company updates",
      content: `Write a LinkedIn post for Volue about: {{topic}}

Requirements:
- Hook readers in the first line
- Include relevant energy industry insights
- Use appropriate emojis sparingly
- End with a question or call-to-action
- Suggest 3-5 relevant hashtags
- Keep it under 200 words

Tone: Professional but approachable`,
      authorIndex: 3, // Sofie
      tagSlugs: ["writing", "ai"],
    },
    {
      title: "Case Study Outline",
      description: "Structure case studies for customer success stories",
      content: `Create a case study outline for {{customer_name}}.

Information:
- Challenge: {{challenge}}
- Solution implemented: {{solution}}
- Results: {{results}}

Structure the case study with:
1. Compelling headline
2. Customer background (2-3 sentences)
3. The challenge (what problem they faced)
4. The solution (how Volue helped)
5. Results with specific metrics
6. Customer quote placeholder
7. Call-to-action

Keep each section concise and focused on measurable outcomes.`,
      authorIndex: 3, // Sofie
      tagSlugs: ["writing", "templates", "documentation"],
    },
    {
      title: "Email Newsletter Section",
      description: "Write newsletter content for monthly updates",
      content: `Write a newsletter section about: {{topic}}

Context: This is for Volue's monthly customer newsletter.

Requirements:
- Attention-grabbing headline
- 100-150 words of body content
- Focus on value to the reader
- Include one clear CTA
- Maintain Volue's professional yet innovative voice

Topic details: {{details}}`,
      authorIndex: 1, // Ingrid
      tagSlugs: ["email", "writing"],
    },
  ],
  engineering: [
    {
      title: "Code Review Assistant",
      description: "Get structured feedback on code changes",
      content: `Review the following code and provide feedback:

\`\`\`{{language}}
{{code}}
\`\`\`

Please analyze for:
1. **Correctness**: Are there any bugs or logic errors?
2. **Performance**: Any inefficiencies or potential bottlenecks?
3. **Security**: Any vulnerabilities or unsafe practices?
4. **Readability**: Is the code clear and well-structured?
5. **Best Practices**: Does it follow {{language}} conventions?

For each issue found, suggest a specific fix with code examples.`,
      authorIndex: 2, // Magnus
      tagSlugs: ["code", "ai", "productivity"],
    },
    {
      title: "Technical Documentation Writer",
      description: "Generate documentation for APIs and services",
      content: `Write technical documentation for the following:

Component/API: {{component_name}}
Purpose: {{purpose}}
Key functionality: {{functionality}}

Generate:
1. Overview section (2-3 sentences)
2. Prerequisites
3. Installation/Setup steps
4. Usage examples with code
5. Configuration options (as a table)
6. Common issues and solutions
7. Related resources

Use clear, concise technical writing. Include code blocks where appropriate.`,
      authorIndex: 4, // Ole
      tagSlugs: ["documentation", "code", "templates"],
    },
    {
      title: "Debug Assistant",
      description: "Help diagnose and fix technical issues",
      content: `Help me debug this issue:

**Error message:**
{{error_message}}

**Context:**
- Language/Framework: {{framework}}
- What I was trying to do: {{action}}
- What I expected: {{expected}}
- What happened: {{actual}}

Please:
1. Explain what this error typically means
2. List the most likely causes (ranked by probability)
3. Provide step-by-step debugging approach
4. Suggest specific fixes with code examples
5. Recommend how to prevent this in the future`,
      authorIndex: 2, // Magnus
      tagSlugs: ["code", "ai", "analysis"],
    },
    {
      title: "Git Commit Message Generator",
      description: "Generate clear, conventional commit messages",
      content: `Generate a git commit message for the following changes:

**Files changed:**
{{files}}

**Summary of changes:**
{{summary}}

Requirements:
- Follow conventional commits format (type: description)
- First line under 72 characters
- Include body if changes are complex
- Reference any related issues

Types: feat, fix, docs, style, refactor, test, chore`,
      authorIndex: 4, // Ole
      tagSlugs: ["code", "productivity"],
    },
  ],
  "product-management": [
    {
      title: "User Story Generator",
      description: "Create well-formatted user stories with acceptance criteria",
      content: `Create a user story for the following feature:

Feature: {{feature_description}}
User type: {{user_type}}

Generate:
1. User story in standard format: "As a [user], I want [goal] so that [benefit]"
2. Acceptance criteria (Given/When/Then format)
3. Edge cases to consider
4. Dependencies or prerequisites
5. Suggested story points (1-13 scale)

Keep acceptance criteria specific and testable.`,
      authorIndex: 5, // Kari
      tagSlugs: ["templates", "productivity"],
    },
    {
      title: "PRD Section Writer",
      description: "Generate sections for Product Requirements Documents",
      content: `Write a PRD section for: {{feature_name}}

Context: {{context}}
Target users: {{users}}
Business goal: {{goal}}

Generate the following sections:
1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: High-level approach
3. **User Requirements**: What users need to accomplish
4. **Functional Requirements**: Specific functionality needed
5. **Non-functional Requirements**: Performance, security, etc.
6. **Success Metrics**: How we'll measure success
7. **Out of Scope**: What this doesn't include

Be specific and actionable.`,
      authorIndex: 5, // Kari
      tagSlugs: ["documentation", "templates", "writing"],
    },
    {
      title: "Feature Prioritization Framework",
      description: "Evaluate and prioritize feature requests",
      content: `Analyze this feature request using the RICE framework:

Feature: {{feature_name}}
Description: {{description}}
Requested by: {{requestor}}

Evaluate:
1. **Reach**: How many users will this impact? (estimate per quarter)
2. **Impact**: How much will it impact each user? (3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal)
3. **Confidence**: How confident are we in estimates? (100%/80%/50%)
4. **Effort**: Person-months required

Calculate RICE score and provide:
- Recommendation (prioritize/defer/decline)
- Key considerations
- Alternative approaches if applicable`,
      authorIndex: 1, // Ingrid
      tagSlugs: ["analysis", "productivity"],
    },
  ],
  "customer-support": [
    {
      title: "Support Response Generator",
      description: "Create professional customer support responses",
      content: `Write a support response for the following ticket:

**Customer issue:** {{issue}}
**Product/Service:** {{product}}
**Customer sentiment:** {{sentiment}}

Requirements:
1. Acknowledge their issue with empathy
2. Provide a clear explanation or solution
3. Include step-by-step instructions if applicable
4. Offer additional help or resources
5. Professional closing

Tone: Helpful, patient, and solution-oriented
Length: Concise but thorough`,
      authorIndex: 3, // Sofie
      tagSlugs: ["email", "ai", "templates"],
    },
    {
      title: "Knowledge Base Article",
      description: "Create self-service help documentation",
      content: `Write a knowledge base article for: {{topic}}

Target audience: {{audience}}
Common questions about this: {{questions}}

Structure:
1. **Title**: Clear and searchable
2. **Overview**: Brief explanation (2-3 sentences)
3. **Prerequisites**: What users need before starting
4. **Step-by-step instructions**: Numbered, clear steps
5. **Screenshots/visuals**: [Describe what screenshots to include]
6. **Troubleshooting**: Common issues and solutions
7. **Related articles**: Suggest 2-3 related topics

Write in simple, clear language. Avoid jargon.`,
      authorIndex: 0, // Erik
      tagSlugs: ["documentation", "writing", "templates"],
    },
  ],
  "human-resources": [
    {
      title: "Job Description Generator",
      description: "Create comprehensive job postings",
      content: `Write a job description for: {{job_title}}

Department: {{department}}
Level: {{level}}
Location: {{location}}

Include:
1. **About Volue**: Brief company intro (2-3 sentences)
2. **Role Overview**: What this person will do
3. **Key Responsibilities**: 5-7 bullet points
4. **Required Qualifications**: Must-haves
5. **Preferred Qualifications**: Nice-to-haves
6. **What We Offer**: Benefits and perks
7. **Application Instructions**

Tone: Professional, inclusive, and engaging
Make it appealing while being accurate about requirements.`,
      authorIndex: 5, // Kari
      tagSlugs: ["writing", "templates"],
    },
    {
      title: "Performance Review Framework",
      description: "Structure performance feedback conversations",
      content: `Create a performance review framework for: {{employee_role}}

Review period: {{period}}

Generate:
1. **Key Performance Areas**: 4-5 areas to evaluate
2. **Rating Scale**: Clear definitions for each level
3. **Discussion Questions**: Open-ended questions for each area
4. **Goal-Setting Framework**: Structure for next period's goals
5. **Development Plan Template**: Skills to develop

Keep it constructive and growth-oriented.`,
      authorIndex: 5, // Kari
      tagSlugs: ["templates", "documentation"],
    },
  ],
  finance: [
    {
      title: "Financial Report Summary",
      description: "Summarize financial data for stakeholders",
      content: `Create an executive summary for the following financial data:

Period: {{period}}
Key metrics:
{{metrics}}

Generate:
1. **Headline**: One sentence capturing the key story
2. **Performance Summary**: 3-4 key takeaways
3. **Comparison**: vs. previous period and targets
4. **Highlights**: What went well
5. **Areas of Concern**: What needs attention
6. **Outlook**: Brief forward-looking statement

Keep it clear for non-financial readers while being accurate.`,
      authorIndex: 4, // Ole
      tagSlugs: ["analysis", "writing"],
    },
    {
      title: "Budget Justification",
      description: "Write business cases for budget requests",
      content: `Write a budget justification for: {{request}}

Amount requested: {{amount}}
Department: {{department}}
Purpose: {{purpose}}

Include:
1. **Executive Summary**: One paragraph overview
2. **Business Need**: Why this investment is needed
3. **Expected Benefits**: Quantified where possible
4. **ROI Analysis**: Expected return or cost savings
5. **Alternatives Considered**: Other options and why rejected
6. **Risk Assessment**: Potential risks and mitigation
7. **Timeline**: When funds are needed and for how long

Be specific with numbers and timelines.`,
      authorIndex: 1, // Ingrid
      tagSlugs: ["writing", "templates", "analysis"],
    },
  ],
  operations: [
    {
      title: "Process Documentation Template",
      description: "Document standard operating procedures",
      content: `Create an SOP for: {{process_name}}

Department: {{department}}
Process owner: {{owner}}

Document:
1. **Purpose**: Why this process exists
2. **Scope**: What it covers and doesn't cover
3. **Roles & Responsibilities**: Who does what
4. **Prerequisites**: What's needed before starting
5. **Step-by-Step Procedure**: Detailed numbered steps
6. **Decision Points**: Where choices need to be made
7. **Quality Checks**: How to verify correct completion
8. **Troubleshooting**: Common issues and solutions
9. **Related Documents**: Links to forms, templates, etc.

Use clear, action-oriented language.`,
      authorIndex: 4, // Ole
      tagSlugs: ["documentation", "templates"],
    },
    {
      title: "Meeting Agenda Generator",
      description: "Create structured meeting agendas",
      content: `Create a meeting agenda for: {{meeting_type}}

Attendees: {{attendees}}
Duration: {{duration}}
Objective: {{objective}}

Generate:
1. **Meeting title and logistics**
2. **Objective statement**: What we need to accomplish
3. **Agenda items** with:
   - Topic
   - Owner
   - Time allocation
   - Expected outcome (decision/discussion/update)
4. **Pre-work**: What attendees should prepare
5. **Parking lot**: Space for off-topic items

Ensure time allocations are realistic for the duration.`,
      authorIndex: 2, // Magnus
      tagSlugs: ["productivity", "templates"],
    },
  ],
};

// Sample comments for testing
const sampleComments = [
  { text: "This prompt has been incredibly useful for our sales team. We've seen a 30% increase in response rates!", userIndex: 1 },
  { text: "I modified this slightly to include industry-specific terminology and it works even better.", userIndex: 2 },
  { text: "Would love to see a version optimized for cold calling scripts too.", userIndex: 3 },
  { text: "Great starting point! I added a section for handling pricing objections.", userIndex: 4 },
  { text: "This saved me hours of work. Highly recommend!", userIndex: 5 },
  { text: "The structure is perfect for our use case. Thanks for sharing!", userIndex: 0 },
];

// Sample replies for nested comments
const sampleReplies = [
  { text: "Thanks for the feedback! I'll work on a cold calling version.", userIndex: 0 },
  { text: "Could you share your modified version? Would love to see it.", userIndex: 3 },
  { text: "Agreed! The ROI has been significant for our team as well.", userIndex: 5 },
];

async function main() {
  console.log("🌱 Seeding Volue test data (matching TESTING_GUIDE.md)...\n");

  // Hash passwords
  const password123Hash = await bcrypt.hash("password123", 12);
  const demo123Hash = await bcrypt.hash("demo123", 12);

  // ==========================================================================
  // 1. CREATE ADMIN USERS
  // ==========================================================================
  console.log("👤 Creating admin users...");
  const createdAdmins: { id: string; username: string }[] = [];

  for (const admin of adminUsers) {
    const passwordHash = admin.password === "password123" ? password123Hash : demo123Hash;
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        username: admin.username,
        name: admin.name,
        password: passwordHash,
        role: admin.role,
        locale: "en",
      },
    });
    createdAdmins.push({ id: user.id, username: user.username });
    console.log(`   ✓ ${admin.name} (${admin.email})`);
  }

  // ==========================================================================
  // 2. CREATE REGULAR USERS
  // ==========================================================================
  console.log("\n👥 Creating regular users...");
  const createdUsers: { id: string; username: string }[] = [];

  for (const user of regularUsers) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        username: user.username,
        name: user.name,
        password: demo123Hash,
        role: "USER",
        locale: "en",
      },
    });
    createdUsers.push({ id: created.id, username: created.username });
    console.log(`   ✓ ${user.name} (${user.email})`);
  }

  // ==========================================================================
  // 3. CREATE TAGS
  // ==========================================================================
  console.log("\n🏷️  Creating tags...");
  const tagMap = new Map<string, string>();

  for (const tag of tags) {
    const created = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name, color: tag.color },
      create: { name: tag.name, slug: tag.slug, color: tag.color },
    });
    tagMap.set(tag.slug, created.id);
    console.log(`   ✓ ${tag.name}`);
  }

  // ==========================================================================
  // 4. CREATE DEPARTMENTS (CATEGORIES)
  // ==========================================================================
  console.log("\n📁 Creating departments...");
  const categoryMap = new Map<string, string>();

  for (const dept of departments) {
    const category = await prisma.category.upsert({
      where: { slug: dept.slug },
      update: { name: dept.name, icon: dept.icon, description: dept.description, order: dept.order, pinned: dept.pinned },
      create: { name: dept.name, slug: dept.slug, icon: dept.icon, description: dept.description, order: dept.order, pinned: dept.pinned },
    });
    categoryMap.set(dept.slug, category.id);
    console.log(`   ✓ ${dept.name}${dept.pinned ? " (pinned)" : ""}`);
  }

  // ==========================================================================
  // 5. CREATE PROMPTS
  // ==========================================================================
  console.log("\n📝 Creating prompts...");
  const createdPrompts: { id: string; title: string; authorId: string }[] = [];
  let totalPrompts = 0;

  for (const [slug, prompts] of Object.entries(samplePrompts)) {
    const categoryId = categoryMap.get(slug);
    if (!categoryId) continue;

    for (const prompt of prompts) {
      const author = createdUsers[prompt.authorIndex];
      const promptSlug = prompt.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Get tag IDs
      const promptTagIds = prompt.tagSlugs
        .map((s) => tagMap.get(s))
        .filter((id): id is string => id !== undefined);

      // Check if prompt already exists
      const existing = await prisma.prompt.findFirst({ where: { slug: promptSlug } });

      let promptId: string;
      if (existing) {
        await prisma.prompt.update({
          where: { id: existing.id },
          data: { title: prompt.title, description: prompt.description, content: prompt.content, categoryId },
        });
        promptId = existing.id;
      } else {
        const created = await prisma.prompt.create({
          data: {
            title: prompt.title,
            slug: promptSlug,
            description: prompt.description,
            content: prompt.content,
            authorId: author.id,
            categoryId,
          },
        });
        promptId = created.id;

        // Create initial version
        await prisma.promptVersion.create({
          data: {
            promptId,
            version: 1,
            content: prompt.content,
            changeNote: "Initial version",
            createdBy: author.id,
          },
        });
      }

      // Add tags
      for (const tagId of promptTagIds) {
        await prisma.promptTag.upsert({
          where: { promptId_tagId: { promptId, tagId } },
          update: {},
          create: { promptId, tagId },
        });
      }

      createdPrompts.push({ id: promptId, title: prompt.title, authorId: author.id });
      totalPrompts++;
    }

    const deptName = departments.find((d) => d.slug === slug)?.name || slug;
    console.log(`   ✓ ${deptName}: ${prompts.length} prompts`);
  }

  // ==========================================================================
  // 6. ADD UPVOTES ON PROMPTS
  // ==========================================================================
  console.log("\n👍 Adding upvotes...");
  let voteCount = 0;

  // Add votes from different users to various prompts
  for (let i = 0; i < createdPrompts.length; i++) {
    const prompt = createdPrompts[i];
    // Each prompt gets votes from 2-4 random users (not the author)
    const numVotes = 2 + (i % 3);
    const voters = createdUsers.filter((u) => u.id !== prompt.authorId).slice(0, numVotes);

    for (const voter of voters) {
      await prisma.promptVote.upsert({
        where: { userId_promptId: { promptId: prompt.id, userId: voter.id } },
        update: {},
        create: { promptId: prompt.id, userId: voter.id },
      });
      voteCount++;
    }
  }
  console.log(`   ✓ ${voteCount} upvotes added`);

  // ==========================================================================
  // 7. ADD COMMENTS
  // ==========================================================================
  console.log("\n💬 Adding comments...");
  const createdCommentIds: string[] = [];

  // Add comments to the first 6 prompts
  for (let i = 0; i < Math.min(6, createdPrompts.length); i++) {
    const prompt = createdPrompts[i];
    const comment = sampleComments[i];
    const commenter = createdUsers[comment.userIndex];

    const created = await prisma.comment.create({
      data: {
        content: comment.text,
        promptId: prompt.id,
        authorId: commenter.id,
      },
    });
    createdCommentIds.push(created.id);
  }
  console.log(`   ✓ ${createdCommentIds.length} comments added`);

  // ==========================================================================
  // 8. ADD COMMENT REPLIES (nested threads)
  // ==========================================================================
  console.log("\n↩️  Adding comment replies...");
  let replyCount = 0;

  // Add replies to first 3 comments
  for (let i = 0; i < Math.min(3, createdCommentIds.length); i++) {
    const parentId = createdCommentIds[i];
    const reply = sampleReplies[i];
    const replier = createdUsers[reply.userIndex];

    // Get the parent comment to find the promptId
    const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
    if (parentComment) {
      await prisma.comment.create({
        data: {
          content: reply.text,
          promptId: parentComment.promptId,
          authorId: replier.id,
          parentId: parentId,
        },
      });
      replyCount++;
    }
  }
  console.log(`   ✓ ${replyCount} replies added`);

  // ==========================================================================
  // 9. ADD COMMENT VOTES
  // ==========================================================================
  console.log("\n⬆️  Adding comment votes...");
  let commentVoteCount = 0;

  // Add upvotes to comments from random users
  for (const commentId of createdCommentIds.slice(0, 4)) {
    const voters = createdUsers.slice(0, 3);
    for (const voter of voters) {
      await prisma.commentVote.upsert({
        where: { userId_commentId: { commentId, userId: voter.id } },
        update: {},
        create: { commentId, userId: voter.id, value: 1 },
      });
      commentVoteCount++;
    }
  }
  console.log(`   ✓ ${commentVoteCount} comment votes added`);

  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  console.log("\n" + "=".repeat(60));
  console.log("🎉 Volue test data seeding complete!");
  console.log("=".repeat(60));
  console.log(`
📊 Summary:
   • ${adminUsers.length} admin users
   • ${regularUsers.length} regular users
   • ${tags.length} tags
   • ${departments.length} departments
   • ${totalPrompts} prompts
   • ${voteCount} upvotes
   • ${createdCommentIds.length} comments
   • ${replyCount} comment replies
   • ${commentVoteCount} comment votes

📋 Login credentials:
   Admin:    admin@prompts.chat / password123
   Demo:     demo@volue.com / demo123
   Users:    [name]@volue.com / demo123
             (erik.hansen, ingrid.berg, magnus.larsen,
              sofie.andersen, ole.nilsen, kari.johansen)
`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
