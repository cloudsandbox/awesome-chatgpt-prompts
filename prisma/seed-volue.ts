import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Department categories for Volue
const departments = [
  {
    name: "Sales",
    slug: "sales",
    icon: "💼",
    description: "Prompts for customer outreach, proposals, and sales communication",
    order: 1,
  },
  {
    name: "Marketing",
    slug: "marketing",
    icon: "📢",
    description: "Content creation, campaigns, and brand messaging",
    order: 2,
  },
  {
    name: "Engineering",
    slug: "engineering",
    icon: "💻",
    description: "Code assistance, debugging, documentation, and technical writing",
    order: 3,
  },
  {
    name: "Product Management",
    slug: "product-management",
    icon: "📋",
    description: "Product specs, user stories, roadmaps, and feature planning",
    order: 4,
  },
  {
    name: "Customer Support",
    slug: "customer-support",
    icon: "🎧",
    description: "Customer responses, troubleshooting guides, and support documentation",
    order: 5,
  },
  {
    name: "Human Resources",
    slug: "human-resources",
    icon: "👥",
    description: "Job descriptions, policies, onboarding, and employee communication",
    order: 6,
  },
  {
    name: "Finance",
    slug: "finance",
    icon: "📊",
    description: "Financial reports, analysis, and business documentation",
    order: 7,
  },
  {
    name: "Operations",
    slug: "operations",
    icon: "⚙️",
    description: "Process documentation, workflows, and operational efficiency",
    order: 8,
  },
];

// Sample prompts for each department
const samplePrompts: Record<string, Array<{ title: string; description: string; content: string }>> = {
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
    },
  ],
};

async function main() {
  console.log("🌱 Seeding Volue demo data...\n");

  // Create demo user
  const password = await bcrypt.hash("demo123", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@volue.com" },
    update: {},
    create: {
      email: "demo@volue.com",
      username: "volue-demo",
      name: "Volue Demo User",
      password: password,
      role: "ADMIN",
      locale: "en",
    },
  });

  console.log("✅ Created demo user (demo@volue.com / demo123)\n");

  // Create departments
  console.log("📁 Creating departments...");
  const categoryMap = new Map<string, string>();

  for (const dept of departments) {
    const category = await prisma.category.upsert({
      where: { slug: dept.slug },
      update: {
        name: dept.name,
        icon: dept.icon,
        description: dept.description,
        order: dept.order,
      },
      create: {
        name: dept.name,
        slug: dept.slug,
        icon: dept.icon,
        description: dept.description,
        order: dept.order,
      },
    });
    categoryMap.set(dept.slug, category.id);
    console.log(`   ✓ ${dept.icon} ${dept.name}`);
  }

  console.log(`\n✅ Created ${departments.length} departments\n`);

  // Create sample prompts
  console.log("📝 Creating sample prompts...");
  let totalPrompts = 0;

  for (const [slug, prompts] of Object.entries(samplePrompts)) {
    const categoryId = categoryMap.get(slug);
    if (!categoryId) continue;

    for (const prompt of prompts) {
      const promptSlug = prompt.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if prompt already exists
      const existing = await prisma.prompt.findFirst({
        where: { slug: promptSlug },
      });

      if (existing) {
        // Update existing
        await prisma.prompt.update({
          where: { id: existing.id },
          data: {
            title: prompt.title,
            description: prompt.description,
            content: prompt.content,
            categoryId: categoryId,
          },
        });
      } else {
        // Create new
        await prisma.prompt.create({
          data: {
            title: prompt.title,
            slug: promptSlug,
            description: prompt.description,
            content: prompt.content,
            authorId: demoUser.id,
            categoryId: categoryId,
          },
        });
      }
      totalPrompts++;
    }

    const deptName = departments.find((d) => d.slug === slug)?.name || slug;
    console.log(`   ✓ ${deptName}: ${prompts.length} prompts`);
  }

  console.log(`\n✅ Created ${totalPrompts} sample prompts\n`);

  console.log("🎉 Volue demo data seeding complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Email: demo@volue.com");
  console.log("   Password: demo123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
