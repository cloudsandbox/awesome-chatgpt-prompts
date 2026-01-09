import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Volue demo users with realistic Norwegian names
const VOLUE_USERS = [
  { username: "erik.hansen", name: "Erik Hansen", email: "erik.hansen@volue.com" },
  { username: "ingrid.berg", name: "Ingrid Berg", email: "ingrid.berg@volue.com" },
  { username: "magnus.larsen", name: "Magnus Larsen", email: "magnus.larsen@volue.com" },
  { username: "sofie.andersen", name: "Sofie Andersen", email: "sofie.andersen@volue.com" },
  { username: "ole.nilsen", name: "Ole Nilsen", email: "ole.nilsen@volue.com" },
  { username: "kari.johansen", name: "Kari Johansen", email: "kari.johansen@volue.com" },
];

// Demo prompts with varied content
const DEMO_PROMPTS = [
  {
    title: "Energy Market Analysis Assistant",
    slug: "energy-market-analysis-assistant",
    description: "A comprehensive prompt for analyzing energy market trends and forecasting",
    content: `You are an expert energy market analyst specializing in Nordic power markets. Your role is to:

1. Analyze current market conditions including spot prices, forward curves, and trading volumes
2. Identify key drivers affecting energy prices (weather, demand, supply constraints)
3. Provide forecasts based on historical patterns and current indicators
4. Explain complex market dynamics in accessible terms

When given market data, provide structured analysis with:
- Executive summary
- Key findings
- Risk factors
- Recommendations

Always cite relevant market indicators and explain your reasoning.`,
    authorIndex: 0, // erik.hansen
    daysAgo: 45,
  },
  {
    title: "Code Review Helper for Python",
    slug: "code-review-helper-python",
    description: "Assists with thorough Python code reviews focusing on best practices",
    content: `You are a senior Python developer conducting code reviews. Analyze the provided code for:

**Code Quality:**
- PEP 8 compliance
- Type hints usage
- Docstring completeness
- Variable naming conventions

**Architecture:**
- SOLID principles adherence
- Design pattern appropriateness
- Module organization

**Performance:**
- Algorithm efficiency
- Memory usage
- Potential bottlenecks

**Security:**
- Input validation
- SQL injection risks
- Sensitive data handling

Provide feedback in a constructive, educational manner. Suggest specific improvements with code examples.`,
    authorIndex: 1, // ingrid.berg
    daysAgo: 38,
  },
  {
    title: "Technical Documentation Writer",
    slug: "technical-documentation-writer",
    description: "Creates clear and comprehensive technical documentation",
    content: `You are a technical writer specializing in software documentation. Create documentation that is:

**Clear:** Use simple language, avoid jargon unless necessary (define it when used)
**Complete:** Cover all aspects including setup, usage, troubleshooting
**Structured:** Use consistent headings, numbered steps, and bullet points
**Practical:** Include real-world examples and code snippets

Documentation should follow this structure:
1. Overview/Introduction
2. Prerequisites
3. Installation/Setup
4. Configuration
5. Usage Guide
6. API Reference (if applicable)
7. Troubleshooting
8. FAQ

Always consider the target audience's technical level.`,
    authorIndex: 2, // magnus.larsen
    daysAgo: 32,
  },
  {
    title: "SQL Query Optimizer",
    slug: "sql-query-optimizer",
    description: "Analyzes and optimizes SQL queries for better performance",
    content: `You are a database performance expert. When given SQL queries, analyze them for:

**Performance Issues:**
- Missing indexes
- Full table scans
- Inefficient JOINs
- Suboptimal WHERE clauses

**Optimization Strategies:**
- Index recommendations
- Query rewriting suggestions
- Execution plan analysis
- Partitioning advice

Provide the optimized query with explanations of:
- What was changed and why
- Expected performance improvement
- Trade-offs to consider
- Index creation statements if needed

Support PostgreSQL, MySQL, and SQL Server syntax.`,
    authorIndex: 3, // sofie.andersen
    daysAgo: 28,
  },
  {
    title: "API Design Consultant",
    slug: "api-design-consultant",
    description: "Helps design RESTful APIs following best practices",
    content: `You are an API architect helping design RESTful APIs. Guide users through:

**Design Principles:**
- Resource-oriented design
- Proper HTTP method usage
- Consistent naming conventions
- Versioning strategies

**Best Practices:**
- Pagination for collections
- Filtering and sorting
- Error response format
- Authentication/Authorization patterns

**Documentation:**
- OpenAPI/Swagger spec generation
- Example requests/responses
- Error code documentation

When reviewing API designs, provide specific recommendations with examples. Consider backward compatibility and scalability.`,
    authorIndex: 4, // ole.nilsen
    daysAgo: 21,
  },
  {
    title: "Git Workflow Assistant",
    slug: "git-workflow-assistant",
    description: "Helps with Git commands, branching strategies, and resolving conflicts",
    content: `You are a Git expert helping developers with version control. Assist with:

**Common Operations:**
- Branch creation and management
- Merging and rebasing strategies
- Conflict resolution
- Stashing and cherry-picking

**Workflows:**
- GitFlow explanation and setup
- Trunk-based development
- Feature branch workflows
- Release management

**Troubleshooting:**
- Recovering lost commits
- Fixing bad merges
- Cleaning up history
- Undoing changes safely

Provide exact Git commands with explanations. Warn about potentially destructive operations.`,
    authorIndex: 5, // kari.johansen
    daysAgo: 14,
  },
  {
    title: "Unit Test Generator",
    slug: "unit-test-generator",
    description: "Generates comprehensive unit tests for given code",
    content: `You are a testing specialist. Generate unit tests that:

**Coverage:**
- Happy path scenarios
- Edge cases and boundary conditions
- Error handling paths
- Null/undefined inputs

**Quality:**
- Descriptive test names
- Arrange-Act-Assert pattern
- Isolated tests (no dependencies)
- Appropriate mocking

**Frameworks:**
- Jest/Vitest for JavaScript/TypeScript
- pytest for Python
- JUnit for Java
- Adapt to project conventions

Include setup/teardown when needed. Explain testing strategy and any assumptions made.`,
    authorIndex: 0, // erik.hansen (second prompt)
    daysAgo: 10,
  },
  {
    title: "Meeting Notes Summarizer",
    slug: "meeting-notes-summarizer",
    description: "Transforms meeting transcripts into structured summaries",
    content: `You are an executive assistant specializing in meeting documentation. Transform meeting transcripts into:

**Summary Structure:**
1. **Meeting Overview:** Date, attendees, duration, purpose
2. **Key Discussion Points:** Main topics covered (3-5 bullets)
3. **Decisions Made:** Clear list of decisions with context
4. **Action Items:** Tasks with owners and deadlines
5. **Open Questions:** Unresolved items needing follow-up
6. **Next Steps:** Scheduled follow-ups or future meetings

**Guidelines:**
- Be concise but complete
- Use active voice
- Attribute decisions and action items to specific people
- Flag any conflicting information
- Note any items that need clarification`,
    authorIndex: 1, // ingrid.berg (second prompt)
    daysAgo: 7,
  },
  {
    title: "Data Pipeline Debugger",
    slug: "data-pipeline-debugger",
    description: "Helps troubleshoot data pipeline issues and ETL problems",
    content: `You are a data engineer specializing in pipeline troubleshooting. Help debug:

**Common Issues:**
- Data type mismatches
- Schema evolution problems
- Missing or null values
- Duplicate records
- Performance bottlenecks

**Analysis Approach:**
1. Identify the failure point
2. Examine input data samples
3. Check transformation logic
4. Validate output expectations
5. Review error logs

**Solutions:**
- Provide specific fixes with code examples
- Suggest data validation checks
- Recommend monitoring points
- Propose retry/recovery strategies

Support Spark, Airflow, dbt, and similar tools.`,
    authorIndex: 2, // magnus.larsen (second prompt)
    daysAgo: 3,
  },
];

// Demo comments to add engagement
const DEMO_COMMENTS = [
  { promptIndex: 0, authorIndex: 1, content: "This is incredibly useful for our daily market analysis. I've been using it for the Nordic spot market reviews.", daysAgo: 40 },
  { promptIndex: 0, authorIndex: 3, content: "Great prompt! Would love to see a version specifically for intraday trading analysis.", daysAgo: 35 },
  { promptIndex: 0, authorIndex: 4, content: "The structured output format makes it easy to integrate into our reporting workflow.", daysAgo: 30 },
  { promptIndex: 1, authorIndex: 0, content: "Really comprehensive. I added this to our team's code review checklist.", daysAgo: 33 },
  { promptIndex: 1, authorIndex: 2, content: "The security section has already helped us catch a few potential issues. Thanks Ingrid!", daysAgo: 28 },
  { promptIndex: 2, authorIndex: 4, content: "Finally, a documentation prompt that actually produces readable docs!", daysAgo: 25 },
  { promptIndex: 2, authorIndex: 5, content: "Used this for our API docs. The structure is perfect.", daysAgo: 20 },
  { promptIndex: 3, authorIndex: 0, content: "Saved us hours of manual query optimization. The index suggestions are spot-on.", daysAgo: 22 },
  { promptIndex: 3, authorIndex: 1, content: "Would be great to add support for time-series database optimizations too.", daysAgo: 18 },
  { promptIndex: 4, authorIndex: 2, content: "This helped standardize our API design across teams. Excellent work!", daysAgo: 15 },
  { promptIndex: 4, authorIndex: 3, content: "The versioning strategy section is particularly helpful for our migration planning.", daysAgo: 12 },
  { promptIndex: 5, authorIndex: 0, content: "The conflict resolution guidance is crystal clear. Shared with my team.", daysAgo: 10 },
  { promptIndex: 6, authorIndex: 3, content: "Generated tests caught bugs our manual tests missed. Impressive coverage!", daysAgo: 8 },
  { promptIndex: 6, authorIndex: 5, content: "Love the edge case handling. Really thorough approach.", daysAgo: 6 },
  { promptIndex: 7, authorIndex: 4, content: "Our project managers love the action item format. Very clear ownership.", daysAgo: 5 },
  { promptIndex: 8, authorIndex: 1, content: "Just used this to debug a tricky Spark job. Worked like a charm!", daysAgo: 2 },
];

function daysAgoToDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  // Add some random hours to make it more realistic
  date.setHours(Math.floor(Math.random() * 10) + 8); // 8am-6pm
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

async function main() {
  console.log("🌱 Seeding Volue demo data...\n");

  const password = await bcrypt.hash("demo123", 12);

  // Create Volue users
  console.log("👤 Creating Volue users...");
  const users: { id: string; username: string }[] = [];

  for (const userData of VOLUE_USERS) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { name: userData.name },
      create: {
        email: userData.email,
        username: userData.username,
        name: userData.name,
        password: password,
        role: "USER",
        locale: "en",
        verified: true,
        createdAt: daysAgoToDate(60 + Math.floor(Math.random() * 30)), // Created 60-90 days ago
      },
    });
    users.push({ id: user.id, username: user.username });
    console.log(`   ✅ ${userData.name} (${userData.email})`);
  }

  // Get or create a default category
  let category = await prisma.category.findFirst({
    where: { slug: "productivity" },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: "Productivity",
        slug: "productivity",
        icon: "zap",
        order: 1,
      },
    });
  }

  // Create prompts
  console.log("\n📝 Creating demo prompts...");
  const prompts: { id: string; authorId: string; title: string }[] = [];

  for (const promptData of DEMO_PROMPTS) {
    const author = users[promptData.authorIndex];
    const createdAt = daysAgoToDate(promptData.daysAgo);

    const existingPrompt = await prisma.prompt.findFirst({
      where: { slug: promptData.slug },
    });

    if (existingPrompt) {
      prompts.push({ id: existingPrompt.id, authorId: existingPrompt.authorId, title: existingPrompt.title });
      console.log(`   ⏭️  "${promptData.title}" (already exists)`);
      continue;
    }

    const prompt = await prisma.prompt.create({
      data: {
        title: promptData.title,
        slug: promptData.slug,
        description: promptData.description,
        content: promptData.content,
        type: "TEXT",
        authorId: author.id,
        categoryId: category.id,
        viewCount: Math.floor(Math.random() * 500) + 50,
        createdAt: createdAt,
        updatedAt: createdAt,
      },
    });

    // Create initial version
    await prisma.promptVersion.create({
      data: {
        promptId: prompt.id,
        version: 1,
        content: promptData.content,
        changeNote: "Initial version",
        createdBy: author.id,
        createdAt: createdAt,
      },
    });

    prompts.push({ id: prompt.id, authorId: author.id, title: prompt.title });
    console.log(`   ✅ "${promptData.title}" by ${author.username}`);
  }

  // Add votes (users vote on each other's prompts)
  console.log("\n👍 Adding votes...");
  let voteCount = 0;

  for (const prompt of prompts) {
    // Each prompt gets votes from 2-5 random users (not the author)
    const numVotes = Math.floor(Math.random() * 4) + 2;
    const eligibleVoters = users.filter(u => u.id !== prompt.authorId);
    const shuffledVoters = eligibleVoters.sort(() => Math.random() - 0.5);
    const voters = shuffledVoters.slice(0, numVotes);

    for (const voter of voters) {
      try {
        await prisma.promptVote.upsert({
          where: {
            userId_promptId: {
              userId: voter.id,
              promptId: prompt.id,
            },
          },
          update: {},
          create: {
            userId: voter.id,
            promptId: prompt.id,
            createdAt: daysAgoToDate(Math.floor(Math.random() * 30)),
          },
        });
        voteCount++;
      } catch {
        // Vote already exists, skip
      }
    }
  }
  console.log(`   ✅ Added ${voteCount} votes`);

  // Add comments
  console.log("\n💬 Adding comments...");
  let commentCount = 0;

  for (const commentData of DEMO_COMMENTS) {
    const prompt = prompts[commentData.promptIndex];
    const author = users[commentData.authorIndex];

    if (!prompt || !author) continue;

    // Check if similar comment already exists
    const existingComment = await prisma.comment.findFirst({
      where: {
        promptId: prompt.id,
        authorId: author.id,
        content: commentData.content,
      },
    });

    if (existingComment) continue;

    const comment = await prisma.comment.create({
      data: {
        content: commentData.content,
        promptId: prompt.id,
        authorId: author.id,
        createdAt: daysAgoToDate(commentData.daysAgo),
        updatedAt: daysAgoToDate(commentData.daysAgo),
      },
    });

    // Add some upvotes to comments
    const numUpvotes = Math.floor(Math.random() * 3) + 1;
    const eligibleVoters = users.filter(u => u.id !== author.id);
    const voters = eligibleVoters.sort(() => Math.random() - 0.5).slice(0, numUpvotes);

    for (const voter of voters) {
      try {
        await prisma.commentVote.create({
          data: {
            userId: voter.id,
            commentId: comment.id,
            value: 1,
            createdAt: daysAgoToDate(Math.max(0, commentData.daysAgo - 1)),
          },
        });

        // Update comment score
        await prisma.comment.update({
          where: { id: comment.id },
          data: { score: { increment: 1 } },
        });
      } catch {
        // Vote already exists
      }
    }

    commentCount++;
  }
  console.log(`   ✅ Added ${commentCount} comments`);

  console.log("\n🎉 Demo data seeding complete!");
  console.log("\n📋 Test credentials (password: demo):");
  for (const user of VOLUE_USERS) {
    console.log(`   ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
